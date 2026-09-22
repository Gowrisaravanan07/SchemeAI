"""
SchemeWise AI - Vector Store & RAG Retrieval Engine
Provides semantic vector search, BM25 keyword matching, metadata filtering,
and official source citation retrieval for government schemes.
"""

import math
import re
from typing import List, Dict, Any, Optional
from app.rag.scheme_knowledge_base import get_all_schemes, get_scheme_by_id

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    _MODEL_AVAILABLE = True
except Exception:
    _MODEL_AVAILABLE = False
    np = None

class SchemeVectorStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SchemeVectorStore, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.schemes = get_all_schemes()
        self.model = None
        self.embeddings = None
        self.documents = []
        self._initialize_index()
        self._initialized = True

    def _initialize_index(self):
        """Prepare text representations of all schemes and calculate embeddings."""
        self.documents = []
        for s in self.schemes:
            text = (
                f"{s['name']} ({s['short_name']}). "
                f"Ministry: {s['ministry']}. "
                f"State: {s['state']}. "
                f"Category: {s['category']}. "
                f"Target Audience: {', '.join(s['target_audience'])}. "
                f"Description: {s['description']}. "
                f"Benefits: {s['benefits']}. "
                f"Eligibility: {s['eligibility']}. "
                f"Required Documents: {', '.join(s['required_documents'])}. "
                f"Tags: {', '.join(s.get('tags', []))}."
            )
            self.documents.append({
                "id": s["id"],
                "text": text,
                "scheme": s
            })

        if _MODEL_AVAILABLE:
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                texts = [doc["text"] for doc in self.documents]
                self.embeddings = self.model.encode(texts, normalize_embeddings=True)
                print(f"[VectorStore] Indexed {len(self.documents)} schemes with SentenceTransformer.")
            except Exception as e:
                print(f"[VectorStore] Failed to load SentenceTransformer: {e}. Falling back to TF-IDF BM25.")
                self.model = None
                self.embeddings = None

    def _fallback_bm25_score(self, query: str, doc_text: str, tags: List[str]) -> float:
        """Token-level BM25-like relevance scoring fallback."""
        query_tokens = set(re.findall(r'\w+', query.lower()))
        if not query_tokens:
            return 0.0
        
        doc_tokens = re.findall(r'\w+', doc_text.lower())
        doc_token_set = set(doc_tokens)
        doc_len = len(doc_tokens)
        
        score = 0.0
        for token in query_tokens:
            if token in doc_token_set:
                tf = doc_tokens.count(token) / max(doc_len, 1)
                score += tf * 10.0
            for tag in tags:
                if token in tag.lower():
                    score += 0.3
                    
        return score

    def search(
        self,
        query: str,
        top_k: int = 5,
        state_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        occupation_filter: Optional[str] = None,
        max_income: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs hybrid semantic and metadata-filtered retrieval.
        Returns top_k scheme matches with relevance scores and citations.
        """
        results = []

        if not query.strip():
            # If empty query, return top schemes matching metadata filters
            for doc in self.documents:
                s = doc["scheme"]
                if self._matches_filters(s, state_filter, category_filter, occupation_filter, max_income):
                    results.append({
                        "scheme": s,
                        "score": 0.8,
                        "citation": {
                            "scheme_name": s["name"],
                            "official_source": s["official_source"],
                            "ministry": s["ministry"],
                            "last_updated": s["last_updated"]
                        }
                    })
            return results[:top_k]

        if self.model is not None and self.embeddings is not None and np is not None:
            query_embedding = self.model.encode([query], normalize_embeddings=True)[0]
            scores = np.dot(self.embeddings, query_embedding)
            
            for idx, doc in enumerate(self.documents):
                s = doc["scheme"]
                if not self._matches_filters(s, state_filter, category_filter, occupation_filter, max_income):
                    continue
                score = float(scores[idx])
                results.append({
                    "scheme": s,
                    "score": round(score, 4),
                    "citation": {
                        "scheme_name": s["name"],
                        "official_source": s["official_source"],
                        "ministry": s["ministry"],
                        "last_updated": s["last_updated"]
                    }
                })
        else:
            for doc in self.documents:
                s = doc["scheme"]
                if not self._matches_filters(s, state_filter, category_filter, occupation_filter, max_income):
                    continue
                score = self._fallback_bm25_score(query, doc["text"], s.get("tags", []))
                results.append({
                    "scheme": s,
                    "score": round(min(score, 1.0), 4),
                    "citation": {
                        "scheme_name": s["name"],
                        "official_source": s["official_source"],
                        "ministry": s["ministry"],
                        "last_updated": s["last_updated"]
                    }
                })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def _matches_filters(
        self,
        scheme: Dict[str, Any],
        state_filter: Optional[str],
        category_filter: Optional[str],
        occupation_filter: Optional[str],
        max_income: Optional[float]
    ) -> bool:
        """Applies hard constraints for state, category, occupation and income."""
        # State Filter
        if state_filter and state_filter.lower() not in ["all", "all india", "national"]:
            scheme_state = scheme.get("state", "All India").lower()
            if scheme_state not in ["all", "all india", "national"] and state_filter.lower() not in scheme_state:
                return False

        # Category Filter
        if category_filter and category_filter.lower() != "all":
            if category_filter.lower() not in scheme.get("category", "").lower():
                return False

        # Occupation Filter
        if occupation_filter:
            target_aud = [t.lower() for t in scheme.get("target_audience", [])]
            elig_occ = [o.lower() for o in scheme.get("eligibility", {}).get("occupation", [])]
            occ_l = occupation_filter.lower()
            if elig_occ and not any(occ_l in o or o in occ_l for o in elig_occ + target_aud):
                return False

        # Income Limit Filter
        if max_income is not None:
            scheme_limit = scheme.get("eligibility", {}).get("max_income")
            if scheme_limit is not None and max_income > scheme_limit:
                return False

        return True

    def add_or_update_scheme(self, scheme_dict: Dict[str, Any]):
        """Allows Admin interface to dynamically add or update schemes in the vector index."""
        # Check if scheme already exists
        existing_idx = None
        for i, s in enumerate(self.schemes):
            if s["id"] == scheme_dict["id"]:
                existing_idx = i
                break
        
        if existing_idx is not None:
            self.schemes[existing_idx] = scheme_dict
        else:
            self.schemes.append(scheme_dict)
            
        self._initialize_index()

# Global Singleton instance
vector_store = SchemeVectorStore()
