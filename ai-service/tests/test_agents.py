"""
SchemeWise AI - Multi-Agent & RAG Test Suite
Tests:
- Vector store retrieval & BM25 fallback
- Multi-agent LangGraph workflow execution
- Zero-hallucination eligibility rules
- Document checklist generator
- Verification agent inconsistency detector
- n8n Automation webhook trigger
- AI Evaluation benchmark runner
"""

import pytest
import asyncio
from app.rag.scheme_knowledge_base import get_all_schemes, get_scheme_by_id
from app.rag.vector_store import vector_store
from app.agents.graph_orchestrator import run_schemewise_workflow
from app.agents.eligibility_agent import evaluate_scheme_eligibility
from app.automation.n8n_service import n8n_service
from app.evaluation.eval_harness import run_ai_evaluation_suite

def test_scheme_knowledge_base():
    """Verify official schemes are loaded properly."""
    schemes = get_all_schemes()
    assert len(schemes) >= 10
    vidyalaxmi = get_scheme_by_id("pm-vidyalaxmi")
    assert vidyalaxmi is not None
    assert vidyalaxmi["short_name"] == "PM Vidyalaxmi"
    assert "required_documents" in vidyalaxmi
    assert vidyalaxmi["official_source"].startswith("http")

def test_vector_store_search():
    """Verify semantic vector search finds relevant schemes with citations."""
    results = vector_store.search("education loan student higher study", top_k=3)
    assert len(results) > 0
    top_scheme = results[0]["scheme"]
    assert top_scheme["id"] in ["pm-vidyalaxmi", "national-scholarship-csss", "tn-post-matric-scholarship"]
    assert "citation" in results[0]
    assert results[0]["citation"]["official_source"].startswith("http")

def test_tamil_nadu_student_eligibility():
    """Verify strict eligibility evaluation for Tamil Nadu student with 2.5L income."""
    profile = {
        "state": "Tamil Nadu",
        "occupation": "Student",
        "income": 250000,
        "age": 19,
        "gender": "Female",
        "education": "Undergraduate"
    }

    pudhumai_penn = get_scheme_by_id("tn-pudhumai-penn")
    eval_pudhumai = evaluate_scheme_eligibility(pudhumai_penn, profile)
    # Potentially eligible or Eligible pending govt schooling verification
    assert eval_pudhumai["status"] in ["Eligible", "Potentially eligible"]

    # High income test: Income > 8 LPA should be Not Eligible for PM Vidyalaxmi interest subvention
    high_income_profile = {**profile, "income": 1200000}
    vidyalaxmi = get_scheme_by_id("pm-vidyalaxmi")
    eval_high = evaluate_scheme_eligibility(vidyalaxmi, high_income_profile)
    assert eval_high["status"] == "Not eligible"
    assert "income" in eval_high["reason"].lower()

@pytest.mark.asyncio
async def test_full_langgraph_workflow():
    """Verify full multi-agent graph execution with timeline traces."""
    query = "I'm a student from Tamil Nadu and my family income is ₹2.5 lakh. What government schemes might I qualify for?"
    state = await run_schemewise_workflow(
        user_query=query,
        user_profile={"state": "Tamil Nadu", "income": 250000, "occupation": "Student"}
    )

    assert state is not None
    assert "final_response" in state
    assert len(state["retrieved_schemes"]) > 0
    assert len(state["agent_trace"]) >= 5
    
    # Check trace has Router, Search, Eligibility, Document, Verification, Explanation
    agents = [t["agent"] for t in state["agent_trace"]]
    assert any("Router" in a for a in agents)
    assert any("Search" in a for a in agents)
    assert any("Eligibility" in a for a in agents)
    assert any("Document" in a for a in agents)
    assert any("Verification" in a for a in agents)
    assert any("Explanation" in a for a in agents)

@pytest.mark.asyncio
async def test_n8n_automation_dispatch():
    """Verify n8n automation webhook event payload."""
    event = await n8n_service.trigger_application_workflow(
        application_id="APP-TEST-999",
        user_id="user-test-123",
        scheme_id="pm-vidyalaxmi",
        scheme_name="PM Vidyalaxmi Scheme",
        user_profile={"name": "Test Student", "state": "Tamil Nadu", "income": 250000},
        document_checklist={"total_required": 5, "provided_count": 4, "missing_count": 1, "missing_documents": [{"document_name": "Income Certificate"}]}
    )
    assert event is not None
    assert event["status"] == "SUCCESS"
    assert event["payload"]["application"]["scheme_id"] == "pm-vidyalaxmi"
    assert len(event["payload"]["workflow_steps"]) == 5

@pytest.mark.asyncio
async def test_ai_evaluation_suite():
    """Verify automated AI evaluation benchmark suite."""
    report = await run_ai_evaluation_suite()
    assert report is not None
    assert report["total_test_cases"] >= 5
    assert report["metrics"]["retrieval_precision"] >= 0.7
    assert report["metrics"]["eligibility_accuracy"] >= 0.8
    assert report["metrics"]["citation_correctness"] == 1.0
