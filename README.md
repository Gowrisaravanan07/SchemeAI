# SchemeWise AI — Multi-Agent Government Scheme Eligibility & Assistance Platform

[![Tests](https://img.shields.io/badge/pytest-6%20passed-emerald)](ai-service/tests/test_agents.py)
[![LangGraph](https://img.shields.io/badge/LangGraph-v2.0-blue)](https://langchain-ai.github.io/langgraph/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.141-teal)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![n8n](https://img.shields.io/badge/n8n-Automation-orange)](https://n8n.io/)

---

## 1. Project Objective

**SchemeWise AI** is a multi-agent citizen service platform that helps citizens discover government schemes, determine eligibility with zero hallucination, understand required documents, and track the application workflow with Human-in-the-Loop approval and automated **n8n** integrations.

The core system is implemented as a stateful multi-agent workflow using **LangGraph + Vector RAG + Tool Calling + Human-in-the-Loop Guardrails + n8n Automation**.

---

## 2. Core Multi-Agent Workflow

```text
Citizen Query
      │
      ▼
┌─────────────────────────────────┐
│     Intent / Router Agent       │ ➔ Categorizes intent & extracts demographic entities
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Scheme Search Agent       │ ➔ Hybrid Vector Search + Metadata Filtering
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        RAG Retrieval Layer      │ ➔ 25+ Official Central & State Government Schemes
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Eligibility Agent        │ ➔ Evaluates: Eligible / Potentially eligible / Not eligible
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│         Document Agent          │ ➔ Generates personalized checklist (Provided vs Missing)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Verification Agent        │ ➔ Inconsistency checks & Human Confirmation enforcement
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Explanation Agent        │ ➔ Structured citizen breakdown with official .gov.in links
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Human Confirmation Node     │ ➔ Explicit Citizen Review & Approval
└────────────────┬────────────────┘
                 │ (Confirmed)
                 ▼
┌─────────────────────────────────┐
│    n8n Workflow Automation      │ ➔ Application Ledger + SMS/Email Alerts + Checklist Sync
└─────────────────────────────────┘
```

---

## 3. Agent Responsibilities & Guardrails

| Agent | Responsibility | Key Output / Guardrail |
|---|---|---|
| **Intent / Router Agent** | Classifies user intent (`scheme_discovery`, `eligibility_check`, `document_requirements`, `application_guidance`, `application_status`) and extracts profile entities. | Structured entity dictionary (`state`, `income`, `occupation`, `age`, `education`, `caste`, `gender`). |
| **Scheme Search Agent** | Executes hybrid semantic vector retrieval and BM25 token matching across official scheme databases. | Ranked scheme candidates with relevance scores and official citations. |
| **RAG Retrieval Layer** | Official vector knowledge base containing verified income limits, age rules, state constraints, benefits, required documents, and government portals. | Zero fabricated criteria; 100% grounded in verified scheme metadata. |
| **Eligibility Agent** | Evaluates citizen profile against retrieved criteria. Returns `Eligible`, `Potentially eligible`, `Not eligible`, or `Insufficient information`. | Never invents missing conditions; explicitly asks user for unverified parameters. |
| **Document Agent** | Matches scheme documentation requirements against uploaded documents/OCR extractions. | Builds personalized checklist flagging provided vs missing documents. |
| **Verification Agent** | Detects data discrepancies (e.g. age vs occupation, income mismatch between OCR and profile). | Enforces Human-in-the-Loop confirmation guardrail before any workflow triggers. |
| **Explanation Agent** | Formats transparent, structured reports with satisfied conditions, unverified conditions, missing info, next steps, and clickable `.gov.in` citations. | Citations tied directly to verified official sources. |
| **Human-in-the-Loop** | Explicit confirmation card displayed to user. | Prohibits AI from auto-submitting government applications without citizen authorization. |
| **n8n Automation** | Webhook dispatcher triggering application creation, multi-channel citizen notifications, and document reminders. | Real-time webhook logs and automated status tracking. |

---

## 4. AI Evaluation Suite & Dashboard

SchemeWise AI features an automated **AI Evaluation & Benchmark Suite** measuring:
- **Retrieval Precision@R & Recall@k**: Semantic relevance against diverse ground-truth citizen personas.
- **Answer Faithfulness**: Zero-hallucination metric measuring factual grounding in knowledge base.
- **Citation & Source Correctness**: 100% validation of official government portal URLs.
- **Eligibility Decision Accuracy**: Strict rule verification across income, age, state, and demographic constraints.
- **Missing Information Detection**: Precision of identifying unverified applicant parameters.
- **Latency Breakdown**: Sub-200ms node execution time across the LangGraph pipeline.

Access the live evaluation dashboard at **`/evaluation`** in the frontend or trigger runs via `POST /api/evaluation/run`.

---

## 5. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend Orchestrator**: FastAPI, LangGraph, Python 3.11+, Pydantic.
- **RAG & Vector Retrieval**: SentenceTransformers, FAISS/NumPy Cosine Similarity, BM25 fallback.
- **OCR & Document Processing**: PyTesseract, PDFPlumber, Pillow.
- **Automation**: n8n Webhook Service with event logger and simulator.
- **Testing**: Pytest & Pytest-asyncio.
- **Containerization**: Docker & Docker Compose.

---

## 6. Quickstart & Setup Guide

### Option 1: Docker Compose (Recommended)

1. Clone the repository and navigate to root:
   ```bash
   git clone https://github.com/your-repo/schemewise-ai.git
   cd schemewise-ai
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Start all services (FastAPI AI service, React frontend, n8n):
   ```bash
   docker-compose up --build
   ```

4. Open the services:
   - **Frontend App:** [http://localhost:3000](http://localhost:3000)
   - **FastAPI AI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **n8n Workflow Engine:** [http://localhost:5678](http://localhost:5678)

---

### Option 2: Local Development Setup

#### 1. Backend AI Service (FastAPI + LangGraph)
```bash
cd ai-service
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 7. Running Automated Tests

Run the full pytest suite to validate all multi-agent nodes, RAG retrieval accuracy, and the AI evaluation benchmark:
```bash
cd ai-service
py -m pytest tests/test_agents.py -v
```

---

## 8. API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat/agent` | `POST` | Primary LangGraph Multi-Agent conversational endpoint with live execution trace. |
| `/api/schemes/search` | `POST` | Hybrid semantic vector search with metadata filters (state, occupation, category, income). |
| `/api/schemes` | `GET` | List all official schemes from knowledge base. |
| `/api/schemes/{id}` | `GET` | Retrieve full criteria, documents, and application steps for a single scheme. |
| `/api/admin/schemes` | `POST` | Admin portal to add or update schemes and dynamically re-index vector store. |
| `/api/eligibility/evaluate` | `POST` | Direct profile eligibility analyzer. |
| `/api/applications/confirm` | `POST` | Human-in-the-Loop confirmation endpoint that registers application and dispatches n8n webhook. |
| `/api/documents/upload` | `POST` | Upload citizen identity/income proof for OCR extraction and document vault storage. |
| `/api/evaluation/metrics` | `GET` | Fetch latest AI evaluation scorecard. |
| `/api/evaluation/run` | `POST` | Trigger fresh AI benchmark evaluation run across test cases. |
| `/api/n8n/events` | `GET` | Retrieve n8n webhook dispatch history. |
