# Akashvaani-AI / SchemeWise AI — Project State Checkpoint
**Saved Date:** September 22, 2026

---

## 1. Project Overview & Status
- **Frontend**: React + Vite + TailwindCSS running on `http://localhost:5173`.
- **Backend (Python)**: FastAPI Multi-Agent Service with LangGraph, RAG Vector Store, and Document OCR running on `http://localhost:8000`.
- **Backend (Node.js)**: Auxiliary services running on `http://localhost:5000`.

---

## 2. Key Features Implemented & Verified
1. **Left Sidebar Filters (`AllSchemesView.jsx`)**:
   - Matches the official `myScheme` design (Image 1).
   - Accordions for: State/UT, Scheme Category, Gender, Age, Caste, Residence, Benefit Type, Marital Status, Disability %, Employment Status, Occupation.
   - Quick Checkboxes with live counts (Minority, Differently Abled, DBT Scheme, Below Poverty Line, Economic Distress, Government Employee, Student).
   - Fully scrollable sticky sidebar container (`max-h-[calc(100vh-6rem)] overflow-y-auto`).
2. **Dedicated Scheme Detail View (`SchemeDetailPage.jsx`)**:
   - Matches `https://www.myscheme.gov.in/schemes/pcardbpt` (Image 2).
   - Sticky navigation menu: Details, Benefits, Eligibility, Application Process, Documents Required, FAQ, Sources, Feedback.
   - Right cards: News & Updates, Social Share buttons.
   - Robust `getEligibilityList()`, `getDocumentsList()`, and `getStepsList()` parsers for rich content.
   - Verified reachable official government application URLs with fallback.
3. **Multi-Proof AI Document Verification Modal (`SchemeEligibilityModal.jsx`)**:
   - Scheme-specific required document slots.
   - 1-click **"⚡ Load Demo Proofs"** button for instant testing.
   - Multi-file upload (PDF/JPG/PNG) and AI OCR scanning animation.
   - Extracted entity display (Applicant Name, Domicile, Occupation, Income, Land Patta No.).
   - Verified checklist & direct link dispatch to WhatsApp / SMS.
4. **AI Assistant Voice Microphone (`AgentChatPage.jsx`)**:
   - Interactive speech recognition with Web Speech API for Tamil (`ta-IN`) and English (`en-IN`).
   - Active audio pulse/wave recording animation.
   - Clickable action cards directing citizens to official portals.

---

## 3. How to Start the Services Tomorrow
```bash
# Terminal 1 - Frontend
cd d:/Akashvaani-AI-main/frontend
npm run dev

# Terminal 2 - Python FastAPI Multi-Agent Backend
cd d:/Akashvaani-AI-main/ai-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. Key File References
- [AllSchemesView.jsx](file:///d:/Akashvaani-AI-main/frontend/src/pages/AllSchemesView.jsx)
- [SchemeDetailPage.jsx](file:///d:/Akashvaani-AI-main/frontend/src/pages/SchemeDetailPage.jsx)
- [SchemeEligibilityModal.jsx](file:///d:/Akashvaani-AI-main/frontend/src/components/SchemeEligibilityModal.jsx)
- [AgentChatPage.jsx](file:///d:/Akashvaani-AI-main/frontend/src/pages/AgentChatPage.jsx)
- [all_india_schemes.js](file:///d:/Akashvaani-AI-main/frontend/src/data/all_india_schemes.js)
- [scheme_knowledge_base.py](file:///d:/Akashvaani-AI-main/ai-service/app/rag/scheme_knowledge_base.py)
- [App.jsx](file:///d:/Akashvaani-AI-main/frontend/src/App.jsx)
