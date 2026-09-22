"""
SchemeWise AI - LangGraph Multi-Agent Orchestrator
Builds and compiles the stateful multi-agent workflow graph.
Flow:
User Query -> Intent Router -> Scheme Search (RAG) -> Eligibility Agent -> Document Agent -> Verification Agent -> Explanation Agent -> Human Confirmation Ready
"""

import time
from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, START, END

from app.agents.state import SchemeWiseAgentState
from app.agents.router_agent import router_agent_node
from app.agents.search_agent import search_agent_node
from app.agents.eligibility_agent import eligibility_agent_node
from app.agents.document_agent import document_agent_node
from app.agents.verification_agent import verification_agent_node
from app.agents.explanation_agent import explanation_agent_node

def create_schemewise_graph():
    """Builds and compiles the LangGraph Multi-Agent StateGraph."""
    workflow = StateGraph(SchemeWiseAgentState)

    # 1. Add Agent Nodes
    workflow.add_node("router", router_agent_node)
    workflow.add_node("search", search_agent_node)
    workflow.add_node("eligibility", eligibility_agent_node)
    workflow.add_node("document", document_agent_node)
    workflow.add_node("verification", verification_agent_node)
    workflow.add_node("explanation", explanation_agent_node)

    # 2. Add Sequential & Conditional Edges
    
    def router_condition(state: SchemeWiseAgentState):
        if state.get("intent") == "missing_information":
            return "explanation"
        return "search"
        
    workflow.add_conditional_edges(
        "router",
        router_condition,
        {
            "search": "search",
            "explanation": "explanation"
        }
    )
    workflow.add_edge(START, "router")
    workflow.add_edge("search", "eligibility")
    workflow.add_edge("eligibility", "document")
    workflow.add_edge("document", "verification")
    workflow.add_edge("verification", "explanation")
    workflow.add_edge("explanation", END)

    # 3. Compile Graph
    return workflow.compile()

# Global compiled graph instance
schemewise_graph = create_schemewise_graph()

async def run_schemewise_workflow(
    user_query: str,
    user_profile: Optional[Dict[str, Any]] = None,
    uploaded_documents: Optional[List[Dict[str, Any]]] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the full multi-agent pipeline and returns the updated state
    with structured explanations, timeline traces, and metrics.
    """
    start_total = time.time()
    
    initial_state: SchemeWiseAgentState = {
        "user_id": user_id,
        "user_query": user_query,
        "conversation_history": conversation_history or [],
        "user_profile": user_profile or {},
        "uploaded_documents": uploaded_documents or [],
        "agent_trace": [],
        "execution_latency_ms": {},
        "errors": []
    }

    try:
        # Run state graph synchronously or via ainvoke
        final_state = schemewise_graph.invoke(initial_state)
        total_latency = round((time.time() - start_total) * 1000, 2)
        final_state["execution_latency_ms"]["total_workflow"] = total_latency
        return final_state
    except Exception as e:
        print(f"[Orchestrator Error] {e}")
        # Fallback graceful execution
        return {
            "final_response": f"An error occurred while executing the multi-agent workflow: {str(e)}",
            "structured_explanation": {},
            "agent_trace": [
                {"agent": "Orchestrator", "action": "Workflow failed with exception", "error": str(e)}
            ],
            "execution_latency_ms": {"total_workflow": round((time.time() - start_total) * 1000, 2)},
            "errors": [str(e)]
        }
