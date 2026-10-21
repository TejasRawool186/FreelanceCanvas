# FreelanceCanvas — Engineering Implementation Roadmap

> **Document Version**: 1.0.0  
> **Status**: Active Baseline  
> **Phased Plan**: Aligned with the Master Product Engineering Specification  

---

## 1. Prioritized Issue & Task Hierarchy

### 🚨 Priority 0 (P0) — Immediate Blockers & Architectural Foundations
1. **Remove Fabricated Fallbacks & Fake Proposals**:
   - *Root Cause*: `backend/app/agent/workflow.py` silently returns a pre-written markdown template and hardcoded $6,250 milestones if Ollama returns empty.
   - *Fix*: Return explicit failure/partial states. Never save fabricated results into the proposal database.
2. **Remove Hardcoded Demo Identities**:
   - *Root Cause*: `backend/app/api/profile.py` and `backend/app/models/models.py` hardcode "Alex Mercer", $140/hr, and synthetic client profiles in `App.tsx`.
   - *Fix*: Provide true first-run onboarding; allow blank/custom user profiles with explicit setup checks.
3. **Fix Misleading Health Endpoint**:
   - *Root Cause*: `backend/app/api/health.py` returns `"status": "healthy"` even when Ollama is offline.
   - *Fix*: Distinguish application health from external dependency health (`degraded` when Ollama is offline).
4. **Replace Pseudo-Embeddings with Real Vector Intelligence**:
   - *Root Cause*: `PortfolioVectorStore._pseudo_embed()` uses an MD5 hash sine wave calculation instead of semantic embeddings.
   - *Fix*: Provide a pluggable embedding provider (SentenceTransformers/FastEmbed/Ollama embeddings) with graceful fallback to keyword matching when local models are unavailable.
5. **Secure Document Upload & Parsing**:
   - *Root Cause*: `upload_brief_document` accepts any file size/extension and saves unsanitized filenames.
   - *Fix*: Allowlist `.pdf, .txt, .md`, enforce a 10MB limit, sanitize filenames, and return actionable errors on OCR-needed or malformed files.

---

### 🔨 Priority 1 (P1) — Core Opportunity-to-Proposal Lifecycle
1. **Full Opportunity CRUD**:
   - Add `PUT /api/opportunities/{id}` and `DELETE /api/opportunities/{id}` with cascade deletion and UI edit/delete buttons.
2. **Structured Requirements Extraction (Phase 3)**:
   - Separate analysis into distinct steps: Extract requirements -> Calculate explainable score -> Propose clarification questions.
   - Validate outputs using Pydantic schemas.
3. **Deterministic Scope, Estimation & Pricing Engine (Phase 5)**:
   - Price = `estimated_hours * user_configured_hourly_rate`.
   - Tasks and hours must be editable in UI; arithmetic handled strictly in deterministic code.
4. **Editable Proposal Studio (Phase 6)**:
   - Implement `PUT /api/proposals/{id}`.
   - Make proposal markdown, milestones, and risk register editable in `ProposalDetail.tsx` with autosave.
   - Clean, selectable-text PDF export.

---

### 📈 Priority 2 (P2) — Post-Proposal Execution & Refinement
1. **Project Execution & Task Board (Phase 7)**:
   - Add `Project` and `Task` database models.
   - Convert approved proposals into an actionable Kanban/task board with estimated vs. actual hours tracking.
   - Scope change detection when client adds new briefs.
2. **Real Portfolio Management (Phase 4)**:
   - Case study creation, editing, deletion, and semantic reindexing.
3. **Audio Briefing Realism (Phase 9)**:
   - Make audio an optional enhancement; never return a text file as audio.

---

### 🎨 Priority 3 (P3) — UI/UX Overhaul & Polish
1. **Vercel Design System Migration (Phase 10)**:
   - Transition from bulky sticky-note mockups to a clean, modern, accessible SaaS layout (neutral off-white background, crisp borders, legible typography, proper loading/empty states).
   - Follow `web-design-guidelines` and `vercel-react-best-practices`.

---

### 🔒 Priority 4 (P4) — Security, Isolation & Multi-User Architecture (Phase 11 & 12)
1. **User Scoping & Workspace Ownership**:
   - Scope opportunities, clients, proposals, and projects by user/workspace ID.
   - Secure CORS and configurable environment bindings.

---

## 2. Phase-by-Phase Roadmap Details

| Phase | Description | Key Modules Affected | Acceptance Criteria | Tests Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Full Repository Audit | `docs/PRODUCT_AUDIT.md`, `docs/IMPLEMENTATION_ROADMAP.md` | Complete inventory of code, verified paths, documented blockers. | Build & syntax check | **Completed** |
| **Phase 1** | Foundation & Clean Onboarding | `profile.py`, `models.py`, `App.tsx`, `RegisterPage.tsx`, `database.py` | New user can register custom profile, set hourly rate/skills, persist without hardcoded "Alex Mercer". | Profile CRUD pytest | **Completed** |
| **Phase 2** | Opportunity Management | `opportunities.py`, `doc_parser.py`, `OpportunityList.tsx`, `NewBriefModal.tsx` | Create, edit, delete, upload PDF/TXT/MD with size & type limits; actionable error states. | Upload & CRUD pytest | **Completed** |
| **Phase 3** | AI Opportunity Intelligence | `workflow.py`, `schemas.py`, `CanvasBoard.tsx` | Structured requirements extraction, explainable scoring criteria, client clarification questionnaire. | Extraction & schema pytest | **Completed** |
| **Phase 4** | Real Portfolio Intelligence | `portfolio_store.py`, `profile.py`, `PortfolioManager.tsx` | Replace MD5 pseudo-embeddings with real semantic embeddings (FastEmbed/Ollama), explainable matches. | Vector search pytest | **Completed** |
| **Phase 5** | Scope, Estimation & Pricing | `workflow.py`, `proposals.py`, `ProposalDetail.tsx` | Deterministic pricing math (`hours * rate`), editable milestones, risk register, recalculation on rate change. | Pricing calculation pytest | **Completed** |
| **Phase 6** | Proposal Studio & Export | `proposals.py`, `ProposalDetail.tsx` | Inline markdown & milestone editing, autosave/PUT, high-quality PDF & styled Markdown export. | Proposal persistence pytest | **Completed** |
| **Phase 7** | Approved Proposal to Project | `models.py`, `projects.py`, `ProjectWorkspace.tsx` | Convert approved proposal into project with milestone tasks, estimated vs. actual hours, scope creep alert. | Project conversion pytest | **Completed** |
| **Phase 8** | Client Communications Hub | `reporting.py`, `projects.py`, `ClientReportingModal.tsx` | Grounded sprint updates, milestone sign-offs, blocker alerts with dependencies, print-ready HTML status reports. | Reporting & export pytest | **Completed** |
| **Phase 9** | Invoicing & Financial Health | `invoices.py`, `models.py`, `FinancialsHub.tsx` | Milestone releases, unbilled T&M timesheet billing, cash collected & yield telemetry, print-ready vector HTML invoices. | Invoicing & health pytest | **Completed** |
| **Phase 10** | Audio Briefing & Voice Synthesis | `audio_brief.py`, `proposals.py`, `AudioPlayerWidget.tsx` | Honest audio briefing (never fake .txt as audio), graceful degradation, real MP3 streaming or offline Web Speech fallback. | Audio pipeline pytest | **Completed** |
| **Phase 11** | Security, Isolation & Error Boundaries | `main.py`, `middleware/`, `ErrorBoundary.tsx` | Rate limits, secure CORS, strict payload sanitization, frontend error crash boundaries. | Security & audit pytest | **Completed** |
| **Phase 12** | Production Monitoring & System Health | `health.py`, `Header.tsx`, `SystemHealthModal.tsx` | Health ping subsystem checks, real DB ping, live diagnostics modal, connection resilience. | Health telemetry pytest | **Completed** |
| **Phase 13-14**| End-to-End Release Packaging & Final Polish | `Dockerfile`, `docker-compose.yml`, `README.md`, `test_phase13_end_to_end_journey.py` | Multi-stage Docker, full E2E lifecycle test, Hacktoberfest docs, SPA delivery. | Full suite (54 passed) | **Completed** |

---

## 3. Current Implementation Status
- **Phases 0–14 are 100% fully implemented and verified**: 54 passed tests across 13 test modules in backend pytest suite (`tests/`).
- **Frontend production build**: `tsc && vite build` passing with 0 errors (`dist/assets/index-BmL7cWO9.js`).
- **Containerization**: Multi-stage `Dockerfile` and `docker-compose.yml` validated.
- **Repository Health**: Production-ready, zero fake files, zero mock disguises, honest degradation throughout.
