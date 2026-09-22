"""
SchemeWise AI - Eligibility Agent
Strictly analyzes citizen profile against retrieved scheme criteria.
Evaluates:
- Eligible: All criteria explicitly satisfied
- Potentially eligible: Primary criteria match, but specific conditions/documents need verification
- Not eligible: Explicit violation of a strict condition (e.g., income over limit, wrong state, age mismatch)
- Insufficient information: Core profile attributes are missing to make a decision
Guaranteed zero hallucination: Never assumes missing parameters without flagging them.
"""

import time
from typing import Dict, Any, List, Tuple
from app.agents.state import SchemeWiseAgentState

def evaluate_scheme_eligibility(scheme: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Advanced Deterministic Eligibility Evaluator
    Returns structured JSON with condition-by-condition breakdown.
    """
    elig = scheme.get("eligibility", {})
    conditions = []
    passed_conditions = []
    failed_conditions = []
    missing_information = []
    evidence = []

    user_income = profile.get("income")
    user_age = profile.get("age")
    user_state = profile.get("state")
    user_occ = profile.get("occupation")
    user_gender = profile.get("gender")
    user_caste = profile.get("caste")

    def add_condition(name: str, status: str, detail: str, source: str = None):
        if not source:
            source = scheme.get("official_source", "Official Scheme Guidelines")
        conditions.append({"requirement": name, "status": status, "detail": detail, "source": source})
        if status == "Passed": passed_conditions.append(name)
        elif status == "Failed": failed_conditions.append(name)
        elif status == "Missing": missing_information.append(name)

    # 1. State Verification
    scheme_state = scheme.get("state", "All India")
    if scheme_state not in ["All India", "All", "National"]:
        if not user_state:
            add_condition("State Requirement", "Missing", f"Required: {scheme_state}")
        elif scheme_state.lower() not in user_state.lower() and user_state.lower() not in scheme_state.lower():
            add_condition("State Requirement", "Failed", f"Required: {scheme_state}, Found: {user_state}")
            evidence.append(f"User state {user_state} does not match {scheme_state}")
        else:
            add_condition("State Requirement", "Passed", f"Matches {scheme_state}")
            evidence.append(f"Verified resident of {user_state}")
    else:
        add_condition("State Requirement", "Passed", "Central scheme open to all states")

    # 2. Occupation Verification
    allowed_occ = elig.get("occupation", [])
    if allowed_occ:
        if not user_occ:
            add_condition("Occupation Requirement", "Missing", f"Required: {', '.join(allowed_occ)}")
        else:
            occ_match = any(user_occ.lower() in o.lower() or o.lower() in user_occ.lower() for o in allowed_occ)
            if occ_match:
                add_condition("Occupation Requirement", "Passed", f"Matches {user_occ}")
                evidence.append(f"Occupation {user_occ} is eligible")
            else:
                add_condition("Occupation Requirement", "Failed", f"Required: {', '.join(allowed_occ)}")
                evidence.append(f"Occupation {user_occ} not in eligible list")

    # 3. Income Verification
    max_income = elig.get("max_income")
    if max_income is not None:
        if user_income is None:
            add_condition("Income Requirement", "Missing", f"Must be <= ₹{max_income:,}")
        elif user_income > max_income:
            add_condition("Income Requirement", "Failed", f"₹{user_income:,} exceeds limit of ₹{max_income:,}")
            evidence.append(f"Income ₹{user_income:,} is over the maximum limit")
        else:
            add_condition("Income Requirement", "Passed", f"₹{user_income:,} is within limit")
            evidence.append(f"Income ₹{user_income:,} verified under limit")

    # 4. Age Verification
    min_age = elig.get("min_age")
    max_age = elig.get("max_age")
    if min_age is not None or max_age is not None:
        if user_age is None:
            add_condition("Age Requirement", "Missing", f"Limits: {min_age or 0} - {max_age or 100}")
        else:
            if min_age is not None and user_age < min_age:
                add_condition("Age Requirement", "Failed", f"Age {user_age} below minimum {min_age}")
            elif max_age is not None and user_age > max_age:
                add_condition("Age Requirement", "Failed", f"Age {user_age} above maximum {max_age}")
            else:
                add_condition("Age Requirement", "Passed", f"Age {user_age} is within limits")
                evidence.append(f"Age {user_age} verified")

    # 5. Gender Verification
    scheme_gender = elig.get("gender")
    if scheme_gender and scheme_gender.lower() not in ["all", "any"]:
        if not user_gender:
            add_condition("Gender Requirement", "Missing", f"Required: {scheme_gender}")
        elif user_gender.lower() != scheme_gender.lower():
            add_condition("Gender Requirement", "Failed", f"Required {scheme_gender}, User is {user_gender}")
        else:
            add_condition("Gender Requirement", "Passed", f"Matches {user_gender}")

    # 6. Caste Verification
    scheme_caste = elig.get("caste")
    if scheme_caste and scheme_caste not in ["All", "all", "Any"]:
        allowed_castes = [scheme_caste] if isinstance(scheme_caste, str) else scheme_caste
        if not user_caste:
            add_condition("Community Requirement", "Missing", f"Required: {', '.join(allowed_castes)}")
        else:
            if any(user_caste.lower() == c.lower() for c in allowed_castes):
                add_condition("Community Requirement", "Passed", f"Matches {user_caste}")
            else:
                add_condition("Community Requirement", "Failed", f"Required {', '.join(allowed_castes)}")

    # Calculate overall status
    confidence = 1.0
    if len(failed_conditions) > 0:
        status = "Not Eligible"
        explanation = f"Failed mandatory requirements: {', '.join(failed_conditions)}"
        confidence = 0.99
    elif len(missing_information) > 0 and len(passed_conditions) == 0:
        status = "Insufficient Information"
        explanation = "Please provide your profile details to determine eligibility."
        confidence = 0.5
    elif len(missing_information) > 0:
        status = "Potentially Eligible"
        explanation = f"Some conditions passed, but we need more info: {', '.join(missing_information)}"
        confidence = 0.7
    else:
        status = "Eligible"
        explanation = "All mandatory eligibility conditions have been verified."
        confidence = 0.95

    return {
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "short_name": scheme["short_name"],
        "eligibility_status": status,
        "conditions": conditions,
        "passed_conditions": passed_conditions,
        "failed_conditions": failed_conditions,
        "missing_information": missing_information,
        "evidence": evidence,
        "confidence": confidence,
        "explanation": explanation
    }

def eligibility_agent_node(state: SchemeWiseAgentState) -> SchemeWiseAgentState:
    """LangGraph node for Eligibility Agent."""
    start_time = time.time()
    profile = state.get("user_profile", {})
    retrieved_schemes = state.get("retrieved_schemes", [])

    evaluations = []
    all_missing_fields = set()

    for scheme in retrieved_schemes:
        result = evaluate_scheme_eligibility(scheme, profile)
        evaluations.append(result)
        for f in result["missing_information"]:
            all_missing_fields.add(f)

    latency = round((time.time() - start_time) * 1000, 2)

    status_summary = [f"{e['short_name']}: {e['eligibility_status']}" for e in evaluations]

    trace_entry = {
        "agent": "Eligibility Agent",
        "action": f"Evaluated {len(evaluations)} scheme(s)",
        "evaluations": status_summary,
        "missing_profile_fields": list(all_missing_fields),
        "latency_ms": latency
    }

    return {
        **state,
        "eligibility_evaluations": evaluations,
        "missing_profile_fields": list(all_missing_fields),
        "agent_trace": state.get("agent_trace", []) + [trace_entry],
        "execution_latency_ms": {**state.get("execution_latency_ms", {}), "eligibility_agent": latency}
    }
