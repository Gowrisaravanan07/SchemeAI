"""
SchemeWise AI - Scheme Search Agent
Performs semantic vector search over official scheme knowledge base with metadata filtering.
"""

import time
from typing import Dict, Any, List
from app.agents.state import SchemeWiseAgentState
from app.rag.vector_store import vector_store
from app.rag.scheme_knowledge_base import get_scheme_by_id

def search_agent_node(state: SchemeWiseAgentState) -> SchemeWiseAgentState:
    """LangGraph node for Scheme Search Agent."""
    start_time = time.time()
    query = state.get("user_query", "")
    profile = state.get("user_profile", {})
    extracted = state.get("extracted_entities", {})

    target_scheme_id = extracted.get("target_scheme")
    retrieved_results = []
    citations = []

    # If user explicitly specified a scheme ID
    if target_scheme_id:
        direct_scheme = get_scheme_by_id(target_scheme_id)
        if direct_scheme:
            retrieved_results.append({
                "scheme": direct_scheme,
                "score": 1.0,
                "citation": {
                    "scheme_name": direct_scheme["name"],
                    "official_source": direct_scheme["official_source"],
                    "ministry": direct_scheme["ministry"],
                    "last_updated": direct_scheme["last_updated"]
                }
            })

    # Perform semantic & metadata filtered search
    state_filter = profile.get("state") or extracted.get("state")
    occupation_filter = profile.get("occupation") or extracted.get("occupation")
    income_val = profile.get("income") or extracted.get("income")

    search_hits = vector_store.search(
        query=query,
        top_k=4,
        state_filter=state_filter,
        occupation_filter=occupation_filter,
        max_income=income_val
    )

    # Combine hits avoiding duplicates
    seen_ids = set([r["scheme"]["id"] for r in retrieved_results])
    for hit in search_hits:
        if hit["scheme"]["id"] not in seen_ids:
            retrieved_results.append(hit)
            seen_ids.add(hit["scheme"]["id"])

    # Extract citations
    for res in retrieved_results:
        citations.append(res["citation"])

    latency = round((time.time() - start_time) * 1000, 2)

    schemes_retrieved = [r["scheme"] for r in retrieved_results]
    scheme_names = [s["short_name"] for s in schemes_retrieved]

    trace_entry = {
        "agent": "Scheme Search Agent",
        "action": f"Retrieved {len(schemes_retrieved)} relevant scheme(s): {', '.join(scheme_names)}",
        "state_filter": state_filter,
        "occupation_filter": occupation_filter,
        "latency_ms": latency
    }

    return {
        **state,
        "retrieved_schemes": schemes_retrieved,
        "citations": citations,
        "agent_trace": state.get("agent_trace", []) + [trace_entry],
        "execution_latency_ms": {**state.get("execution_latency_ms", {}), "search_agent": latency}
    }
