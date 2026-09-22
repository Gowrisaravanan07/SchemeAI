"""
SchemeWise AI - Explanation Agent
Synthesizes a structured, citizen-friendly explanation with traceable source citations.
Follows the official structure:
- Scheme Name & Benefit
- Why it applies
- Eligibility conditions satisfied
- Conditions not verified / missing information
- Required documents & personalized checklist
- Next steps & application procedure
- Official source citation & links
"""

import time
from typing import Dict, Any, List
from app.agents.state import SchemeWiseAgentState

def explanation_agent_node(state: SchemeWiseAgentState) -> SchemeWiseAgentState:
    """LangGraph node for Explanation Agent."""
    start_time = time.time()
    user_query = state.get("user_query", "")
    profile = state.get("user_profile", {})
    retrieved_schemes = state.get("retrieved_schemes", [])
    evaluations = {e["scheme_id"]: e for e in state.get("eligibility_evaluations", [])}
    checklists = {c["scheme_id"]: c for c in state.get("document_checklists", [])}
    verification = state.get("verification_report", {})
    citations = state.get("citations", [])

    structured_schemes = []
    markdown_sections = []
    
    # Smart Intake: Handle Dynamic Missing Information
    intent = state.get("intent", "")
    if intent == "missing_information" and state.get("follow_up_question"):
        latency = round((time.time() - start_time) * 1000, 2)
        trace_entry = {
            "agent": "Explanation Agent",
            "action": "Output follow-up question for missing information",
            "latency_ms": latency
        }
        return {
            **state,
            "final_response": state.get("follow_up_question"),
            "structured_explanation": {"is_follow_up": True},
            "agent_trace": state.get("agent_trace", []) + [trace_entry],
            "execution_latency_ms": {**state.get("execution_latency_ms", {}), "explanation_agent": latency}
        }

    # Greeting / Context
    intro_lines = []
    if profile.get("occupation") or profile.get("state"):
        occ_str = profile.get("occupation", "Citizen")
        state_str = f" from {profile.get('state')}" if profile.get("state") else ""
        income_str = f" with annual income ₹{profile.get('income'):,}" if profile.get("income") else ""
        intro_lines.append(f"Based on your profile as a **{occ_str}{state_str}**{income_str}, here is your personalized scheme analysis:")
    else:
        intro_lines.append("Here is the analysis of the government schemes matching your inquiry:")

    markdown_sections.append("\n".join(intro_lines))

    for scheme in retrieved_schemes:
        scheme_id = scheme["id"]
        eval_data = evaluations.get(scheme_id, {})
        checklist = checklists.get(scheme_id, {})
        status = eval_data.get("status", "Potentially eligible")
        
        # Build structured scheme detail
        scheme_expl = {
            "id": scheme_id,
            "name": scheme["name"],
            "short_name": scheme["short_name"],
            "ministry": scheme["ministry"],
            "status": status,
            "benefit_description": scheme["benefits"],
            "why_it_applies": f"Designed for {', '.join(scheme.get('target_audience', []))} under {scheme.get('category')}.",
            "conditions_satisfied": eval_data.get("matched_criteria", []),
            "conditions_unverified": eval_data.get("unverified_criteria", []),
            "missing_information": eval_data.get("missing_fields", []),
            "required_documents": checklist.get("all_documents", []),
            "application_steps": scheme.get("application_procedure", []),
            "official_source": scheme["official_source"],
            "last_updated": scheme["last_updated"]
        }
        structured_schemes.append(scheme_expl)

        # Markdown representation
        status_badge = "🟢 Eligible" if status == "Eligible" else "🟡 Potentially Eligible" if status == "Potentially eligible" else "🔴 Not Eligible" if status == "Not Eligible" else "⚪ Insufficient Information"
        
        sec = []
        sec.append(f"### 🏛️ {scheme['name']} ({scheme['short_name']})")
        sec.append(f"**Status:** {status_badge} | **Ministry:** {scheme['ministry']}")
        sec.append(f"**💰 Benefit:** {scheme['benefits']}\n")
        sec.append(f"**🎯 Why it applies:** {scheme_expl['why_it_applies']}\n")

        if eval_data.get("conditions"):
            passed = [c for c in eval_data["conditions"] if c["status"] == "Passed"]
            failed = [c for c in eval_data["conditions"] if c["status"] == "Failed"]
            missing = [c for c in eval_data["conditions"] if c["status"] == "Missing"]

            if passed:
                sec.append("**✅ Conditions Satisfied:**")
                for c in passed:
                    sec.append(f"- {c['requirement']} Passed. (Source: [{c['source']}]({scheme['official_source']}))")
            
            if failed:
                sec.append("\n**❌ Failed Conditions:**")
                for c in failed:
                    sec.append(f"- {c['requirement']} Failed: {c['detail']}. (Source: [{c['source']}]({scheme['official_source']}))")

            if missing:
                sec.append("\n**❓ Missing Information needed from you:**")
                for c in missing:
                    sec.append(f"- Please confirm your **{c['requirement']}** to finalize eligibility. (Source: [{c['source']}]({scheme['official_source']}))")

        if checklist.get("all_documents"):
            sec.append("\n**📋 Required Documents Checklist:**")
            for doc in checklist["all_documents"]:
                icon = "✅" if doc["status"] == "Provided" else "📄"
                sec.append(f"- {icon} **{doc['document_name']}** ({doc['status']})")

        if scheme.get("application_procedure"):
            sec.append("\n**🚀 Next Steps / How to Apply:**")
            for step_num, step in enumerate(scheme["application_procedure"], 1):
                sec.append(f"{step_num}. {step}")

        sec.append(f"\n🔗 **Official Portal:** [{scheme['official_source']}]({scheme['official_source']}) *(Updated: {scheme['last_updated']})*")
        sec.append("---\n")
        markdown_sections.append("\n".join(sec))

    # Inconsistency warning if verification flagged any
    if verification.get("inconsistencies"):
        warn_sec = ["\n> **⚠️ Data Discrepancy Flagged by Verification Agent:**"]
        for inc in verification["inconsistencies"]:
            warn_sec.append(f"> - {inc}")
        markdown_sections.append("\n".join(warn_sec))

    # Human Confirmation reminder
    markdown_sections.append(
        "\n> **🛡️ Next Action Required:** Review the details above. Click **Confirm & Start Application** below to draft your application and dispatch the automated n8n workflow."
    )

    final_markdown = "\n\n".join(markdown_sections)

    structured_explanation = {
        "schemes": structured_schemes,
        "verification_summary": verification,
        "citations": citations,
        "human_confirmation_prompt": "Please review and confirm to proceed with application drafting."
    }

    latency = round((time.time() - start_time) * 1000, 2)

    trace_entry = {
        "agent": "Explanation Agent",
        "action": f"Generated structured explanation for {len(structured_schemes)} scheme(s)",
        "citations_attached": len(citations),
        "latency_ms": latency
    }

    return {
        **state,
        "final_response": final_markdown,
        "structured_explanation": structured_explanation,
        "agent_trace": state.get("agent_trace", []) + [trace_entry],
        "execution_latency_ms": {**state.get("execution_latency_ms", {}), "explanation_agent": latency}
    }
