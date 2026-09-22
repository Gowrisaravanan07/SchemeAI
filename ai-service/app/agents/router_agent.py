"""
SchemeWise AI - Intent / Router Agent
Identifies user intent and extracts structured profile entities from natural language.
Supported Intents:
- scheme_discovery: Find matching or popular schemes
- eligibility_check: Check if citizen qualifies for specific or general schemes
- document_requirements: Ask what documents are required
- application_guidance: Ask how to apply / next steps
- application_status: Inquire about existing application status
"""

import os
import re
import json
import time
from typing import Dict, Any
from app.agents.state import SchemeWiseAgentState

try:
    import google.generativeai as genai
    _GENAI_AVAILABLE = True
except Exception:
    _GENAI_AVAILABLE = False

ROUTER_PROMPT = """
You are the Intent and Entity Extraction Agent for SchemeWise AI, a Government Scheme Assistant.
Analyze the user's message and determine their primary intent and any demographic/profile entities mentioned.

Allowed Intents:
- "scheme_discovery": Searching for schemes (e.g. "What schemes are there for farmers?", "Tell me about education loans")
- "eligibility_check": Evaluating qualifications (e.g. "I'm a student from Tamil Nadu with income 2.5L, do I qualify?")
- "document_requirements": Inquiring about documents (e.g. "What documents do I need for Pudhumai Penn?")
- "application_guidance": Inquiring about how to apply (e.g. "How do I apply for PM Kisan?")
- "application_status": Inquiring about tracking an application (e.g. "What is my application status?")

Extract the following entities if present:
- state (e.g., "Tamil Nadu", "Uttar Pradesh", "Maharashtra", etc.)
- income (Annual income in INR integer, e.g., 250000)
- age (Integer age)
- occupation (e.g., "Student", "Farmer", "Business Owner", "Artisan", "Street Vendor", "Unemployed")
- education (e.g., "12th Pass", "Undergraduate", "Postgraduate", "BTech", "Diploma")
- gender (e.g., "Male", "Female", "Other")
- caste (e.g., "General", "OBC", "SC", "ST", "SCC", "EWS")
- target_scheme (Name or keyword of specific scheme mentioned)

Output strictly valid JSON with keys: "intent", "entities", "reasoning".
"""

def extract_entities_regex(query: str) -> Dict[str, Any]:
    """Robust fallback rule-based entity extraction."""
    entities: Dict[str, Any] = {}
    q_lower = query.lower()

    # Intent detection
    intent = "scheme_discovery"
    if any(w in q_lower for w in ["eligible", "qualify", "qualifies", "criteria", "can i get", "am i eligible"]):
        intent = "eligibility_check"
    elif any(w in q_lower for w in ["document", "documents", "papers", "id proof", "certificate"]):
        intent = "document_requirements"
    elif any(w in q_lower for w in ["how to apply", "procedure", "steps", "portal", "link", "process"]):
        intent = "application_guidance"
    elif any(w in q_lower for w in ["status", "track", "application id", "applied"]):
        intent = "application_status"

    # State extraction
    states = ["tamil nadu", "uttar pradesh", "karnataka", "maharashtra", "kerala", "andhra pradesh", "telangana", "delhi", "bihar", "gujarat", "rajasthan", "punjab", "haryana", "west bengal", "madhya pradesh", "odisha"]
    for s in states:
        if s in q_lower:
            entities["state"] = s.title()
            break

    # Occupation extraction
    if any(w in q_lower for w in ["student", "studying", "college", "university", "school", "btech", "degree", "diploma"]):
        entities["occupation"] = "Student"
    elif any(w in q_lower for w in ["farmer", "farming", "agriculture", "kisan", "cultivator"]):
        entities["occupation"] = "Farmer"
    elif any(w in q_lower for w in ["artisan", "carpenter", "blacksmith", "potter", "craftsman", "tailor", "barber"]):
        entities["occupation"] = "Artisan"
    elif any(w in q_lower for w in ["street vendor", "vendor", "hawker", "thela"]):
        entities["occupation"] = "Street Vendor"
    elif any(w in q_lower for w in ["business", "shopkeeper", "entrepreneur", "startup", "msme", "self-employed", "self employed"]):
        entities["occupation"] = "Business Owner"

    # Gender extraction
    if any(w in q_lower for w in ["female", "woman", "women", "girl", "daughter", "mother"]):
        entities["gender"] = "Female"
    elif any(w in q_lower for w in ["male", "man", "boy", "son", "father"]):
        entities["gender"] = "Male"

    # Caste / Category
    if "sc/st" in q_lower or "sc st" in q_lower:
        entities["caste"] = "SC/ST"
    elif re.search(r'\bsc\b', q_lower):
        entities["caste"] = "SC"
    elif re.search(r'\bst\b', q_lower):
        entities["caste"] = "ST"
    elif re.search(r'\bobc\b', q_lower):
        entities["caste"] = "OBC"
    elif re.search(r'\bews\b', q_lower):
        entities["caste"] = "EWS"

    # Income extraction (e.g. ₹2.5 lakh, 2.5L, 250000, 2 lakh, 80k)
    income_lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac|lpa|l\b)', q_lower)
    if income_lakh_match:
        entities["income"] = int(float(income_lakh_match.group(1)) * 100000)
    else:
        income_num_match = re.search(r'(?:₹|rs\.?|inr)?\s*([0-9]{5,8})', q_lower)
        if income_num_match:
            entities["income"] = int(income_num_match.group(1))

    # Age extraction
    age_match = re.search(r'([0-9]{1,2})\s*(?:years old|year old|yo\b|age)', q_lower)
    if age_match:
        entities["age"] = int(age_match.group(1))

    # Education extraction
    if "btech" in q_lower or "b.tech" in q_lower or "engineering" in q_lower:
        entities["education"] = "Undergraduate"
    elif "12th" in q_lower or "hsc" in q_lower or "inter" in q_lower:
        entities["education"] = "12th Pass"
    elif "postgraduate" in q_lower or "mtech" in q_lower or "mba" in q_lower:
        entities["education"] = "Postgraduate"

    # Specific scheme names
    if "vidyalaxmi" in q_lower or "vidya lakshmi" in q_lower:
        entities["target_scheme"] = "pm-vidyalaxmi"
    elif "pudhumai penn" in q_lower or "moovalur" in q_lower:
        entities["target_scheme"] = "tn-pudhumai-penn"
    elif "kisan" in q_lower:
        entities["target_scheme"] = "pm-kisan"
    elif "mudra" in q_lower:
        entities["target_scheme"] = "pm-mudra-yojana"
    elif "ayushman" in q_lower or "pmjay" in q_lower:
        entities["target_scheme"] = "ayushman-bharat-pmjay"
    elif "vishwakarma" in q_lower:
        entities["target_scheme"] = "pm-vishwakarma"

    return {"intent": intent, "entities": entities, "reasoning": "Rule-based regex entity matcher"}

def router_agent_node(state: SchemeWiseAgentState) -> SchemeWiseAgentState:
    """LangGraph node for Intent / Router Agent."""
    start_time = time.time()
    query = state.get("user_query", "")
    current_profile = state.get("user_profile", {}).copy()
    
    intent = "scheme_discovery"
    extracted_entities = {}
    reasoning = ""

    # Attempt LLM Intent classification if API key is configured
    api_key = os.getenv("GEMINI_API_KEY")
    if _GENAI_AVAILABLE and api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"{ROUTER_PROMPT}\n\nUser Message: \"{query}\""
            response = model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_text)
            intent = data.get("intent", "scheme_discovery")
            extracted_entities = data.get("entities", {})
            reasoning = data.get("reasoning", "LLM router parsed intent and entities")
        except Exception as e:
            fallback = extract_entities_regex(query)
            intent = fallback["intent"]
            extracted_entities = fallback["entities"]
            reasoning = f"LLM error ({str(e)}), used rule-based fallback"
    else:
        fallback = extract_entities_regex(query)
        intent = fallback["intent"]
        extracted_entities = fallback["entities"]
        reasoning = "Rule-based entity extraction"

    # Merge extracted entities into user_profile without overwriting verified values with None
    for k, v in extracted_entities.items():
        if v is not None and k != "target_scheme":
            current_profile[k] = v

    # Smart Intake: Detect Missing Information dynamically
    follow_up_question = None
    if intent in ["scheme_discovery", "eligibility_check"]:
        missing = []
        if not current_profile.get("state"): missing.append("state")
        if not current_profile.get("income"): missing.append("approximate annual family income")
        if not current_profile.get("occupation"): missing.append("current occupation (e.g., student, farmer, business owner)")
        
        # Only ask one question at a time to keep conversation natural
        if missing:
            intent = "missing_information"
            follow_up_question = f"To help find the best schemes for you, could you please tell me your {missing[0]}?"
            reasoning = f"Missing core profile attribute: {missing[0]}. Triggered follow-up."

    latency = round((time.time() - start_time) * 1000, 2)

    # Trace log
    trace_entry = {
        "agent": "Intent / Router Agent",
        "action": f"Classified intent as '{intent}'",
        "extracted_entities": extracted_entities,
        "reasoning": reasoning,
        "latency_ms": latency
    }

    state_update = {
        **state,
        "intent": intent,
        "extracted_entities": extracted_entities,
        "user_profile": current_profile,
        "follow_up_question": follow_up_question,
        "agent_trace": state.get("agent_trace", []) + [trace_entry],
        "execution_latency_ms": {**state.get("execution_latency_ms", {}), "router_agent": latency}
    }
    return state_update
