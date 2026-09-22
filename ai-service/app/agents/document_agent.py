"""
SchemeWise AI - Document Agent
Builds a personalized document checklist for eligible and potentially eligible schemes.
Cross-references required documents against user uploaded files and OCR extractions.
"""

import time
from typing import Dict, Any, List
from app.agents.state import SchemeWiseAgentState

def document_agent_node(state: SchemeWiseAgentState) -> SchemeWiseAgentState:
    """LangGraph node for Document Agent."""
    start_time = time.time()
    retrieved_schemes = state.get("retrieved_schemes", [])
    evaluations = {e["scheme_id"]: e for e in state.get("eligibility_evaluations", [])}
    uploaded_docs = state.get("uploaded_documents", [])

    # Map uploaded document names/types
    uploaded_types = set()
    for doc in uploaded_docs:
        doc_type = doc.get("document_type", "").lower()
        filename = doc.get("filename", "").lower()
        uploaded_types.add(doc_type)
        if "aadhaar" in filename or "aadhar" in filename:
            uploaded_types.add("aadhaar")
        if "income" in filename:
            uploaded_types.add("income")
        if "marksheet" in filename or "mark" in filename:
            uploaded_types.add("marksheet")
        if "caste" in filename or "community" in filename:
            uploaded_types.add("caste")

    checklists = []

    for scheme in retrieved_schemes:
        scheme_id = scheme["id"]
        eval_info = evaluations.get(scheme_id, {})
        status = eval_info.get("status", "Not eligible")

        # Skip document generation for explicitly not eligible schemes unless requested
        if status == "Not eligible":
            continue

        required_docs = scheme.get("required_documents", [])
        provided_docs = []
        missing_docs = []

        for req in required_docs:
            req_lower = req.lower()
            is_provided = False
            
            # Match against uploaded doc types
            if "aadhaar" in req_lower and ("aadhaar" in uploaded_types or "id_proof" in uploaded_types):
                is_provided = True
            elif "income" in req_lower and "income" in uploaded_types:
                is_provided = True
            elif ("marksheet" in req_lower or "10th" in req_lower or "12th" in req_lower) and "marksheet" in uploaded_types:
                is_provided = True
            elif ("community" in req_lower or "caste" in req_lower) and "caste" in uploaded_types:
                is_provided = True

            doc_item = {
                "document_name": req,
                "is_mandatory": True,
                "status": "Provided" if is_provided else "Missing",
                "notes": "Verified from document vault" if is_provided else "Must be uploaded before application submission"
            }

            if is_provided:
                provided_docs.append(doc_item)
            else:
                missing_docs.append(doc_item)

        checklist = {
            "scheme_id": scheme_id,
            "scheme_name": scheme["name"],
            "short_name": scheme["short_name"],
            "total_required": len(required_docs),
            "provided_count": len(provided_docs),
            "missing_count": len(missing_docs),
            "is_complete": len(missing_docs) == 0,
            "provided_documents": provided_docs,
            "missing_documents": missing_docs,
            "all_documents": provided_docs + missing_docs
        }
        checklists.append(checklist)

    latency = round((time.time() - start_time) * 1000, 2)

    total_missing = sum(c["missing_count"] for c in checklists)
    trace_entry = {
        "agent": "Document Agent",
        "action": f"Generated personalized checklist for {len(checklists)} scheme(s)",
        "missing_documents_count": total_missing,
        "latency_ms": latency
    }

    return {
        **state,
        "document_checklists": checklists,
        "agent_trace": state.get("agent_trace", []) + [trace_entry],
        "execution_latency_ms": {**state.get("execution_latency_ms", {}), "document_agent": latency}
    }
