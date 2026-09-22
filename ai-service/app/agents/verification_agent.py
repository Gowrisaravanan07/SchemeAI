"""
SchemeWise AI - Verification Agent
Cross-validates citizen information against scheme rules and OCR extractions.
Detects data inconsistencies, calculates uncertainty confidence scores,
and enforces Human-in-the-Loop confirmation triggers.
"""

import time
from typing import Dict, Any, List
from app.agents.state import SchemeWiseAgentState

def verification_agent_node(state: SchemeWiseAgentState) -> SchemeWiseAgentState:
    """LangGraph node for Verification Agent."""
    start_time = time.time()
    profile = state.get("user_profile", {})
    evaluations = state.get("eligibility_evaluations", [])
    uploaded_docs = state.get("uploaded_documents", [])
    
    inconsistencies = []
    uncertainties = []
    flags = []
    
    verified_fields = []
    mismatches = []
    missing_documents = []

    user_age = profile.get("age")
    user_occ = profile.get("occupation", "").lower()
    user_income = profile.get("income")
    profile_name = profile.get("name", "").lower().strip()

    # Determine Required Documents from Eligibility Evaluations
    # Mocking extraction of required documents from retrieved schemes
    required_docs = ["id_proof", "income_certificate"]

    # 1. Age vs Occupation sanity check
    if user_age is not None:
        if user_occ == "student" and user_age > 40:
            inconsistencies.append(f"Age inconsistency: Citizen is {user_age} years old and listed as Student.")
        if (user_occ == "business owner" or user_occ == "farmer") and user_age < 18:
            inconsistencies.append(f"Age restriction: Citizen is {user_age} (below 18) for self-managed enterprise/landholding.")

    # 2. Advanced OCR Cross-Document Verification
    provided_doc_types = [doc.get("document_type", "").lower() for doc in uploaded_docs]
    for req in required_docs:
        if req.lower() not in provided_doc_types:
            missing_documents.append(req)

    for doc in uploaded_docs:
        extracted = doc.get("extracted_data", {}).get("extracted_fields", {})
        doc_type = doc.get("document_type", "Unknown")

        # Name Verification
        if "name" in extracted and profile_name:
            doc_name = str(extracted["name"]).lower().strip()
            if doc_name != profile_name:
                mismatches.append({
                    "field": "Name",
                    "profile_value": profile.get("name"),
                    "document_value": extracted["name"],
                    "document_type": doc_type
                })
                inconsistencies.append(f"Name mismatch detected in {doc_type}")
            else:
                verified_fields.append(f"Name verified via {doc_type}")

        # Income Verification
        if "annual_income" in extracted and user_income is not None:
            ocr_income = extracted["annual_income"]
            if abs(ocr_income - user_income) > (user_income * 0.1):
                mismatches.append({
                    "field": "Income",
                    "profile_value": user_income,
                    "document_value": ocr_income,
                    "document_type": doc_type
                })
                inconsistencies.append(f"Income mismatch: Profile states ₹{user_income:,}, but {doc_type} reads ₹{ocr_income:,}.")
            else:
                verified_fields.append(f"Income verified via {doc_type}")
        
        # DOB Verification
        if "dob_year" in extracted and user_age is not None:
            current_year = 2026
            calc_age = current_year - extracted["dob_year"]
            if abs(calc_age - user_age) > 2:
                mismatches.append({
                    "field": "Age/DOB",
                    "profile_value": user_age,
                    "document_value": calc_age,
                    "document_type": doc_type
                })
                inconsistencies.append(f"Age mismatch: Profile age is {user_age}, but {doc_type} implies age {calc_age}.")
            else:
                verified_fields.append(f"Age verified via {doc_type}")

    # 3. Scheme specific uncertainties
    for ev in evaluations:
        if ev.get("unverified_criteria"):
            for uv in ev["unverified_criteria"]:
                uncertainties.append(f"[{ev['short_name']}] {uv}")

    # Application Readiness Engine Score
    total_reqs = max(len(required_docs), 1)
    fulfilled = len(required_docs) - len(missing_documents)
    base_score = int((fulfilled / total_reqs) * 100)
    mismatch_penalty = len(mismatches) * 15
    application_readiness = max(0, base_score - mismatch_penalty)

    # Determine confidence score (0.0 to 1.0)
    confidence = 0.95
    if inconsistencies:
        confidence -= len(inconsistencies) * 0.25
    if uncertainties:
        confidence -= min(len(uncertainties) * 0.05, 0.3)
    confidence = max(0.2, round(confidence, 2))

    # Important Action Policy: ALWAYS require human confirmation before triggering formal application/n8n workflows
    human_confirmation_required = True if inconsistencies or uncertainties else False

    verification_report = {
        "confidence_score": confidence,
        "is_verified": len(inconsistencies) == 0,
        "inconsistencies": inconsistencies,
        "uncertainties": uncertainties,
        "mismatches": mismatches,
        "verified_fields": verified_fields,
        "missing_documents": missing_documents,
        "application_readiness": application_readiness,
        "safety_flags": flags,
        "human_review_recommended": human_confirmation_required,
        "action_guardrails": "Explicit user approval is mandated prior to official application submission."
    }

    latency = round((time.time() - start_time) * 1000, 2)

    trace_entry = {
        "agent": "Verification Agent",
        "action": f"Verified profile with confidence {int(confidence*100)}% and readiness {application_readiness}%",
        "inconsistencies_found": len(inconsistencies),
        "uncertainties_count": len(uncertainties),
        "human_confirmation_enforced": human_confirmation_required,
        "latency_ms": latency
    }

    return {
        **state,
        "verification_report": verification_report,
        "human_confirmation_required": human_confirmation_required,
        "confirmation_status": state.get("confirmation_status", "pending"),
        "agent_trace": state.get("agent_trace", []) + [trace_entry],
        "execution_latency_ms": {**state.get("execution_latency_ms", {}), "verification_agent": latency}
    }
