"""
SchemeWise AI - Multi-Agent State Definition
Typed state schema for the LangGraph multi-agent orchestrator.
"""

from typing import TypedDict, List, Dict, Any, Optional

class SchemeWiseAgentState(TypedDict, total=False):
    # User Input & Context
    user_id: Optional[str]
    user_query: str
    conversation_history: List[Dict[str, str]]
    
    # User Profile (Extracted or loaded from DB)
    user_profile: Dict[str, Any]
    uploaded_documents: List[Dict[str, Any]]
    
    # 1. Router Agent Outputs
    intent: str # 'scheme_discovery', 'eligibility_check', 'document_requirements', 'application_guidance', 'application_status', 'missing_information'
    extracted_entities: Dict[str, Any]
    follow_up_question: Optional[str]
    
    # 2. Scheme Search & RAG Outputs
    retrieved_schemes: List[Dict[str, Any]]
    citations: List[Dict[str, Any]]
    
    # 3. Eligibility Agent Outputs
    eligibility_evaluations: List[Dict[str, Any]] # Scheme-wise evaluation
    missing_profile_fields: List[str]
    
    # 4. Document Agent Outputs
    document_checklists: List[Dict[str, Any]]
    
    # 5. Verification Agent Outputs
    verification_report: Dict[str, Any]
    human_confirmation_required: bool
    confirmation_status: str # 'pending', 'confirmed', 'rejected'
    
    # 6. Explanation Agent Outputs
    final_response: str
    structured_explanation: Dict[str, Any]
    
    # 7. n8n & Application Trigger
    application_payload: Optional[Dict[str, Any]]
    n8n_result: Optional[Dict[str, Any]]
    
    # Multi-Agent Execution Audit Trace
    agent_trace: List[Dict[str, Any]]
    execution_latency_ms: Dict[str, float]
    errors: List[str]
