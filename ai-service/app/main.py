"""
SchemeWise AI - Multi-Agent Government Scheme Eligibility & Assistance Service
Core FastAPI Backend and Orchestrator
"""

import os
import uuid
import time
import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Internal Modules
from app.rag.scheme_knowledge_base import get_all_schemes, get_scheme_by_id
from app.rag.vector_store import vector_store
from app.agents.graph_orchestrator import run_schemewise_workflow
from app.agents.eligibility_agent import evaluate_scheme_eligibility
from app.automation.n8n_service import n8n_service
from app.evaluation.eval_harness import run_ai_evaluation_suite, get_latest_evaluation_metrics
from app.routes.extraction_routes import router as extraction_router
from app.voice_agent.routes import router as voice_router

app = FastAPI(
    title="SchemeWise AI Service",
    description="Multi-Agent Government Scheme Eligibility, RAG Retrieval, Document Verification & n8n Automation Engine",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Existing OCR & Voice Routers
app.include_router(extraction_router)
app.include_router(voice_router)

# In-Memory Database Stores (with Supabase sync fallback)
APPLICATIONS_STORE: List[Dict[str, Any]] = [
    {
        "id": "app-demo-001",
        "user_id": "demo-user-123",
        "scheme_id": "pm-vidyalaxmi",
        "scheme_name": "PM Vidyalaxmi Scheme",
        "status": "In Review - Document Verification",
        "benefit_amount": "₹7,50,000",
        "created_at": "2025-01-20T10:30:00Z",
        "citizen_name": "Ravi Kumar",
        "n8n_dispatched": True,
        "document_checklist": {
            "total_required": 6,
            "provided_count": 5,
            "missing_count": 1,
            "missing_documents": ["Income Certificate"]
        }
    }
]

DOCUMENTS_STORE: List[Dict[str, Any]] = []
USERS_STORE: Dict[str, Dict[str, Any]] = {
    "demo-user-123": {
        "id": "demo-user-123",
        "name": "Ravi Kumar",
        "email": "ravi.kumar@example.gov.in",
        "phone": "+91 98765 43210",
        "age": 19,
        "occupation": "Student",
        "income": 250000,
        "state": "Tamil Nadu",
        "education": "Undergraduate",
        "caste": "General",
        "gender": "Male"
    }
}

# ----------------- PYDANTIC REQUEST SCHEMAS -----------------

class AgentChatRequest(BaseModel):
    user_id: Optional[str] = "demo-user-123"
    message: str
    user_profile: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = []

class DirectEligibilityRequest(BaseModel):
    user_id: Optional[str] = None
    profile: Dict[str, Any]

class SchemeSearchRequest(BaseModel):
    query: str = ""
    state: Optional[str] = None
    category: Optional[str] = None
    occupation: Optional[str] = None
    max_income: Optional[float] = None
    top_k: int = 6

class ApplicationConfirmRequest(BaseModel):
    user_id: str
    scheme_id: str
    user_profile: Dict[str, Any]
    document_checklist: Optional[Dict[str, Any]] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None

class AdminSchemeCreateRequest(BaseModel):
    id: str
    name: str
    short_name: str
    ministry: str
    state: str = "All India"
    category: str
    target_audience: List[str]
    description: str
    benefits: str
    benefit_amount: int
    eligibility: Dict[str, Any]
    required_documents: List[str]
    application_procedure: List[str]
    official_source: str
    last_updated: str = datetime.date.today().isoformat()
    tags: List[str] = []

class AuthRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

# ----------------- CORE API ENDPOINTS -----------------

@app.get("/")
async def health_check():
    return {
        "service": "SchemeWise AI Multi-Agent Platform",
        "status": "online",
        "timestamp": datetime.datetime.now().isoformat(),
        "agents": [
            "Intent Router Agent",
            "Scheme Search Agent",
            "RAG Vector Retrieval Layer",
            "Eligibility Agent",
            "Document Agent",
            "Verification Agent",
            "Explanation Agent",
            "Human Confirmation Node",
            "n8n Automation Webhook"
        ],
        "version": "2.0.0"
    }

# 1. Multi-Agent Orchestrator Chat Endpoint
@app.post("/api/chat/agent")
async def chat_with_agent(req: AgentChatRequest):
    """
    Executes the stateful LangGraph Multi-Agent workflow:
    Intent Router -> Scheme Search -> RAG -> Eligibility -> Document -> Verification -> Explanation.
    """
    try:
        # Resolve user profile
        profile = req.user_profile or {}
        if req.user_id and req.user_id in USERS_STORE:
            stored_profile = USERS_STORE[req.user_id]
            profile = {**stored_profile, **profile}

        # Retrieve user uploaded documents
        user_docs = [d for d in DOCUMENTS_STORE if d.get("user_id") == req.user_id]

        # Run multi-agent graph
        agent_state = await run_schemewise_workflow(
            user_query=req.message,
            user_profile=profile,
            uploaded_documents=user_docs,
            conversation_history=req.conversation_history,
            user_id=req.user_id
        )

        return {
            "success": True,
            "response": agent_state.get("final_response", ""),
            "structured_explanation": agent_state.get("structured_explanation", {}),
            "intent": agent_state.get("intent", "scheme_discovery"),
            "extracted_entities": agent_state.get("extracted_entities", {}),
            "user_profile": agent_state.get("user_profile", {}),
            "retrieved_schemes": agent_state.get("retrieved_schemes", []),
            "eligibility_evaluations": agent_state.get("eligibility_evaluations", []),
            "document_checklists": agent_state.get("document_checklists", []),
            "verification_report": agent_state.get("verification_report", {}),
            "human_confirmation_required": agent_state.get("human_confirmation_required", True),
            "citations": agent_state.get("citations", []),
            "agent_trace": agent_state.get("agent_trace", []),
            "execution_latency_ms": agent_state.get("execution_latency_ms", {})
        }
    except Exception as e:
        print(f"[Chat Error] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 2. Scheme Search & Discovery Endpoint
@app.post("/api/schemes/search")
async def search_schemes(req: SchemeSearchRequest):
    """Performs semantic vector search with metadata filters."""
    try:
        results = vector_store.search(
            query=req.query,
            top_k=req.top_k,
            state_filter=req.state,
            category_filter=req.category,
            occupation_filter=req.occupation,
            max_income=req.max_income
        )
        return {
            "success": True,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Direct Scheme Catalog & CRUD
@app.get("/api/schemes")
@app.get("/schemes")
async def list_all_schemes():
    """Returns all official schemes."""
    schemes = get_all_schemes()
    return {"data": schemes, "count": len(schemes)}

@app.get("/api/schemes/{scheme_id}")
async def get_scheme_details(scheme_id: str):
    """Retrieves full details for a single scheme."""
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"data": scheme}

@app.post("/api/admin/schemes")
async def create_or_update_scheme(scheme_data: AdminSchemeCreateRequest):
    """Admin endpoint to add or modify a government scheme and update vector index."""
    s_dict = scheme_data.model_dump()
    vector_store.add_or_update_scheme(s_dict)
    return {"success": True, "message": f"Scheme '{s_dict['name']}' saved and indexed successfully.", "scheme": s_dict}

# 4. Direct Eligibility Evaluation Endpoint
@app.post("/api/eligibility/evaluate")
@app.post("/ai/eligibility")
async def evaluate_eligibility(req: DirectEligibilityRequest):
    """Evaluates all schemes against citizen profile."""
    try:
        profile = req.profile
        if req.user_id and req.user_id in USERS_STORE:
            profile = {**USERS_STORE[req.user_id], **profile}

        schemes = get_all_schemes()
        evaluations = []
        eligible_schemes = []
        total_benefit = 0

        for s in schemes:
            eval_res = evaluate_scheme_eligibility(s, profile)
            evaluations.append(eval_res)
            if eval_res["eligibility_status"] in ["Eligible", "Potentially eligible"]:
                eligible_schemes.append({
                    **s,
                    "eligibility_status": eval_res["eligibility_status"],
                    "matched_criteria": eval_res["matched_criteria"],
                    "unverified_criteria": eval_res["unverified_criteria"],
                    "missing_fields": eval_res["missing_information"]
                })
                total_benefit += s.get("benefit_amount", 0)

        return {
            "success": True,
            "citizen_profile": profile,
            "eligible_schemes": eligible_schemes,
            "all_evaluations": evaluations,
            "total_benefits": total_benefit,
            "formatted_benefit": f"₹{total_benefit:,}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Human-in-the-Loop Confirmation & n8n Automation Trigger
@app.post("/api/applications/confirm")
async def confirm_and_submit_application(req: ApplicationConfirmRequest):
    """
    Human-in-the-loop checkpoint:
    Receives explicit citizen confirmation, creates application record,
    and dispatches automated n8n webhook workflow.
    """
    try:
        scheme = get_scheme_by_id(req.scheme_id)
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")

        app_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.datetime.now().isoformat()

        # Build document checklist if not provided
        checklist = req.document_checklist
        if not checklist:
            checklist = {
                "total_required": len(scheme.get("required_documents", [])),
                "provided_count": 0,
                "missing_count": len(scheme.get("required_documents", [])),
                "missing_documents": [{"document_name": d} for d in scheme.get("required_documents", [])]
            }

        # 1. Dispatch n8n Automation
        n8n_event = await n8n_service.trigger_application_workflow(
            application_id=app_id,
            user_id=req.user_id,
            scheme_id=req.scheme_id,
            scheme_name=scheme["name"],
            user_profile=req.user_profile,
            document_checklist=checklist,
            user_email=req.user_email,
            user_phone=req.user_phone
        )

        # 2. Save Application in store
        app_record = {
            "id": app_id,
            "user_id": req.user_id,
            "scheme_id": req.scheme_id,
            "scheme_name": scheme["name"],
            "short_name": scheme["short_name"],
            "ministry": scheme["ministry"],
            "status": "In Review - Document Verification",
            "benefit_amount": f"₹{scheme.get('benefit_amount', 0):,}",
            "citizen_name": req.user_profile.get("name", "Applicant"),
            "citizen_phone": req.user_phone or req.user_profile.get("phone", ""),
            "created_at": timestamp,
            "document_checklist": checklist,
            "n8n_event_id": n8n_event["event_id"],
            "official_source": scheme["official_source"]
        }
        APPLICATIONS_STORE.insert(0, app_record)

        return {
            "success": True,
            "message": "Application confirmed and dispatched to n8n automation workflow.",
            "application": app_record,
            "n8n_workflow": n8n_event
        }
    except Exception as e:
        print(f"[Application Confirmation Error] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 6. Applications Listing
@app.get("/api/applications")
@app.get("/applications")
async def get_applications(user_id: Optional[str] = None):
    """Retrieves applications, optionally filtered by user_id."""
    if user_id:
        apps = [a for a in APPLICATIONS_STORE if a.get("user_id") == user_id]
    else:
        apps = APPLICATIONS_STORE
    return {"data": apps, "count": len(apps)}

# 7. Document Upload & OCR Analyzer
# 7. Advanced Document Intelligence Agent Pipeline
@app.post("/api/documents/upload")
@app.post("/documents/upload")
async def upload_citizen_document(
    user_id: str = Form("demo-user-123"),
    document_type: str = Form("id_proof"),
    file: UploadFile = File(...)
):
    """
    Advanced Document Verification Pipeline:
    Upload -> Validation -> OCR Extraction -> Cross-Check -> Status Tagging
    """
    try:
        from app.services.profile_extraction_service import process_profile_extraction
        file_bytes = await file.read()
        
        # Simulate advanced OCR extraction & field validation
        # In a real system, this would call Tesseract + LLM Parser
        extracted_data = await process_profile_extraction(
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type,
            user_id=user_id
        )

        # Enhance with Advanced Intelligence Tags
        is_expired = False
        is_mismatch = False
        status = "VERIFIED"
        
        user_profile = USERS_STORE.get(user_id, {})
        extracted_fields = extracted_data.get("extracted_fields", {})
        
        # Simulated Cross-Verification (Name Mismatch Detection)
        if "name" in extracted_fields and user_profile.get("name"):
            if extracted_fields["name"].lower() != user_profile["name"].lower():
                status = "MISMATCH"
                is_mismatch = True
        
        doc_record = {
            "id": f"doc-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "filename": file.filename,
            "document_type": document_type,
            "status": status,
            "extracted_data": {
                **extracted_data,
                "document_classification": document_type.upper(),
                "confidence_score": 0.94 if not is_mismatch else 0.65,
                "warnings": ["Name mismatch detected"] if is_mismatch else [],
            },
            "uploaded_at": datetime.datetime.now().isoformat()
        }
        DOCUMENTS_STORE.append(doc_record)

        return doc_record
    except Exception as e:
        print(f"[Document Pipeline Error] {str(e)}")
        # Graceful fallback for mock demo with Advanced Tags
        fallback_doc = {
            "id": f"doc-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "filename": file.filename,
            "document_type": document_type,
            "status": "NEEDS_REVIEW",
            "extracted_data": {
                "document_name": file.filename,
                "document_classification": "UNKNOWN",
                "extracted_fields": {"filename": file.filename},
                "confidence_score": 0.40,
                "warnings": ["OCR processing failed, manual review required"]
            },
            "uploaded_at": datetime.datetime.now().isoformat()
        }
        DOCUMENTS_STORE.append(fallback_doc)
        return fallback_doc

@app.get("/api/documents")
@app.get("/documents")
async def get_user_documents(user_id: str = "demo-user-123"):
    """Lists uploaded citizen documents."""
    docs = [d for d in DOCUMENTS_STORE if d.get("user_id") == user_id]
    return {"data": docs, "count": len(docs)}

# 8. n8n Automation Webhook & Event Log Endpoints
@app.post("/api/n8n/webhook")
async def receive_n8n_webhook_callback(payload: Dict[str, Any]):
    """Receives asynchronous updates from external n8n workflows."""
    app_id = payload.get("application_id")
    new_status = payload.get("status")
    if app_id and new_status:
        for app_rec in APPLICATIONS_STORE:
            if app_rec["id"] == app_id:
                app_rec["status"] = new_status
                break
    return {"status": "received", "timestamp": datetime.datetime.now().isoformat()}

@app.get("/api/n8n/events")
async def get_n8n_event_logs():
    """Returns recent n8n event dispatch history."""
    logs = n8n_service.get_event_logs()
    return {"data": logs, "count": len(logs)}

# 9. AI Evaluation & Benchmark Suite Endpoints
@app.get("/api/evaluation/metrics")
async def get_eval_metrics():
    """Retrieves current AI evaluation metrics."""
    metrics = get_latest_evaluation_metrics()
    return {"data": metrics}

@app.post("/api/evaluation/run")
async def trigger_eval_run():
    """Triggers an automated benchmark evaluation run across test cases."""
    report = await run_ai_evaluation_suite()
    return {"success": True, "report": report}

# 10. User Profile & Demo Endpoints
@app.get("/api/users/{user_id}")
async def get_user_profile(user_id: str):
    user = USERS_STORE.get(user_id)
    if not user:
        # Return default citizen
        user = USERS_STORE["demo-user-123"]
    return {"data": user}

@app.put("/api/users/{user_id}")
async def update_user_profile(user_id: str, profile_data: Dict[str, Any]):
    if user_id in USERS_STORE:
        USERS_STORE[user_id].update(profile_data)
    else:
        USERS_STORE[user_id] = {"id": user_id, **profile_data}
    return {"data": USERS_STORE[user_id]}

@app.get("/api/demo-citizen")
async def demo_citizen():
    """Returns demo Tamil Nadu student profile and matched schemes."""
    demo_user = USERS_STORE["demo-user-123"]
    schemes = get_all_schemes()
    eligible = []
    total_benefit = 0

    for s in schemes:
        eval_res = evaluate_scheme_eligibility(s, demo_user)
        if eval_res["status"] in ["Eligible", "Potentially eligible"]:
            eligible.append({
                **s,
                "eligibility_status": eval_res["status"],
                "matched_criteria": eval_res["matched_criteria"],
                "unverified_criteria": eval_res["unverified_criteria"]
            })
            total_benefit += s.get("benefit_amount", 0)

    return {
        "citizen_profile": demo_user,
        "eligible_schemes": eligible,
        "total_benefit_amount": f"₹{total_benefit:,}"
    }

# 11. Authentication (JWT Simulation / Supabase Compatible)
@app.post("/api/auth/login")
async def auth_login(req: AuthRequest):
    token = f"jwt-token-{uuid.uuid4().hex}"
    user = USERS_STORE.get("demo-user-123", {
        "id": "demo-user-123",
        "email": req.email,
        "name": "Citizen Applicant"
    })
    return {
        "success": True,
        "token": token,
        "user": user
    }

@app.post("/api/auth/register")
async def auth_register(req: AuthRequest):
    uid = f"user-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": uid,
        "email": req.email,
        "name": req.name or req.email.split("@")[0].capitalize(),
        "state": "All India",
        "occupation": "Citizen",
        "income": 0,
        "age": 25
    }
    USERS_STORE[uid] = new_user
    token = f"jwt-token-{uuid.uuid4().hex}"
    return {
        "success": True,
        "token": token,
        "user": new_user
    }
