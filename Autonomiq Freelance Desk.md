# Autonomiq Freelance Desk — SRS Analysis & Domain Evolution

**Document Type:** Technical & Product Requirements Analysis  
**Reference Document:** [srs.md](file:///d:/Autonomiq/srs.md) (Autonomiq v3.0 Final)  
**Author:** @pm (Product Manager & Lead Architect)  
**Date:** October 2026  

---

## 1. Executive Summary

The current [srs.md](file:///d:/Autonomiq/srs.md) defines **Autonomiq** as a local-first autonomous research workspace built around the *"Touch Grass"* philosophy: users submit a natural-language task, approve an execution plan, and step away while a durable background worker conducts web research, parses documents, builds local RAG embeddings, performs local LLM inference (Gemma via Ollama), and generates a verified report and ElevenLabs audio digest.

**Autonomiq Freelance Desk** represents the natural commercial domain evolution of this architecture: transforming a generalized research assistant into an **autonomous operational desk for solo developers, consultants, and freelancers**.

Freelancers spend an estimated 30–45% of their working hours on unbillable administrative overhead:
1. Dissecting lengthy client briefs and RFPs (Requests for Proposals).
2. Researching client companies, tech stacks, and competitors.
3. Estimating scope, milestone breakdowns, and risk profiles.
4. Drafting customized, evidence-backed proposals.
5. Reviewing deliverables against initial client requirements.

By tailoring the existing LangGraph pipeline, Temporal durability, Qdrant vector memory, and Away Mode UX, the Freelance Desk allows independent contractors to ingest a client brief, close the laptop, and return to an end-to-end client dossier, tailored proposal, and audio debrief.

---

## 2. Comprehensive Analysis of the Existing SRS (`srs.md`)

### 2.1 Core Architectural Strengths

| Component | Specification in `srs.md` | Freelance Desk Value |
|---|---|---|
| **Durable Execution** | Temporal workflow wrapping all agent tasks (FR-07) | Long-running client recon or deep document analysis will not fail if the browser tab closes or the machine sleeps briefly. |
| **Local-First Privacy** | Ollama with Gemma; local SQLite + Qdrant (FR-05, FR-06) | Critical for freelancers handling NDA-protected client documents, proprietary briefs, and private contract terms. |
| **Grounded Retrieval (RAG)** | Document chunking, Qdrant indexing, and SerpApi live search (FR-03, FR-04, FR-05) | Proposals and scope analyses cite verifiable evidence rather than generating hallucinated estimates. |
| **Away Mode & Audio Digest** | ElevenLabs TTS audio summary + browser-independent execution (FR-09, FR-12) | Allows freelancers to listen to an incoming RFP breakdown or morning task briefing away from the screen. |
| **Observability** | Sentry spans for LLM prompts, token latency, and tool calls (FR-08) | Provides full auditability over tool execution and local inference latency. |

### 2.2 Architectural Limitations & Gaps in Current `srs.md`

1. **Rigid Research-Only Pipeline:**
   - *Current:* LangGraph flow is strictly linear: `Planner -> Researcher (SerpApi) -> Extractor -> Chunker/Qdrant -> Analyst (Gemma) -> Reporter -> ElevenLabs`.
   - *Gap:* Freelance work requires multi-artifact outputs (e.g., Executive Proposal + Milestones/Pricing Table + Risk Register + Audio Brief), rather than just an academic research report.
2. **Absence of Persistent Freelancer Context (Portfolio/Rates):**
   - *Current:* Every task runs in isolation; vector store is populated ephemeral per-task or per-document batch.
   - *Gap:* The agent cannot tailor proposals without a persistent profile of the freelancer’s skills, tech stack, hourly rates, past case studies, and contract terms.
3. **Hardware & Latency Constraints:**
   - *Current:* Relies strictly on local Gemma via Ollama (Gemma 2B/7B).
   - *Gap:* Complex RFP extraction and multi-constraint project estimations may tax smaller local models. Needs support for hybrid routing (local Gemma for sensitive extraction + optional cloud API for deep synthesis if user permits).
4. **No Financial or Timeline Entity Model:**
   - *Current:* Data model tracks `Task`, `ExecutionStep`, `Source`, `Chunk`, and `Artifact`.
   - *Gap:* Lacks entities for `Client`, `ProjectScope`, `Milestone`, `BudgetEstimate`, and `Proposal`.

---

## 3. Product Vision: "Autonomiq Freelance Desk"

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FREELANCE DESK WORKFLOW                         │
└────────────────────────────────────────────────────────────────────────┘
          │
          ▼
   [Client Brief / RFP]  (PDF / Markdown / Upwork URL / Email)
          │
          ├──► Step 1: Ingestion & Requirement Extraction (DocParser)
          │
          ├──► Step 2: Client Reconnaissance (SerpApi + WebScraper)
          │            └─ Company background, tech stack, recent news
          │
          ├──► Step 3: Freelancer Fit Matching (Qdrant RAG)
          │            └─ Match brief against past portfolio & case studies
          │
          ├──► Step 4: Estimation & Risk Analysis (Gemma / LLM Engine)
          │            └─ Work Breakdown Structure (WBS), hours, milestones
          │
          ├──► Step 5: Multi-Artifact Generation
          │            ├─ 📄 Client Proposal & Bid Document (.md / .pdf)
          │            ├─ 📊 Scope & Milestone Breakdown
          │            ├─ ⚠️ Risk Register & Questions for Client
          │            └─ 🎙️ 3-Minute Audio Briefing (ElevenLabs)
          │
          ▼
   [Away Mode Notification] ──► Freelancer reviews on desktop or listens on-the-go
```

---

## 4. Proposed Functional Requirements for Freelance Desk

### Module A: Client & Opportunity Ingestion
- **FDR-01: Brief Ingestion:** Accept PDF briefs, Word docs, raw text pastes, and public project/RFP URLs.
- **FDR-02: Client Profile Extraction:** Automatically extract client organization, project budget range, deadline, tech stack requirements, and deliverables.

### Module B: Autonomous Reconnaissance
- **FDR-03: Company & Market Intelligence:** Run SerpApi queries targeting the client company, recent funding, existing public repositories, tech stack footprint, and key stakeholders.
- **FDR-04: Competitive Differentiation:** Identify standard industry solutions to highlight value propositions in the proposal.

### Module C: Freelancer Profile & Portfolio RAG
- **FDR-05: Persistent Knowledge Base:** A permanent Qdrant collection containing the freelancer's:
  - Resume & Bio.
  - Previous case studies & client testimonials.
  - Standard rate cards & minimum engagement terms.
  - Reusable code templates & architectural blueprints.
- **FDR-06: Relevant Experience Retrieval:** Semantic matching of past project wins against the client's problem statement for direct citation in proposals.

### Module D: Proposal & Scope Engineering
- **FDR-07: Structured Proposal Generation:** Output a professional, ready-to-send proposal including:
  - Problem Understanding & Proposed Architecture.
  - Phased Milestones with deliverables and timelines.
  - Transparent pricing models (Fixed-Price vs. Time & Materials).
  - Clarification Questions to ask the client during discovery calls.
- **FDR-08: Deliverable Formats:** Export directly to Markdown, Styled PDF, and JSON milestone specs.

### Module E: Away Mode Briefing
- **FDR-09: Executive Audio Brief:** ElevenLabs voice synthesis generating a concise 2–3 minute audio memo:
  - *"Here is your summary of the Acme Corp RFP. Budget is estimated at $8,000 across 3 milestones. Main risk is third-party API integration. Full proposal draft is ready on your desk."*

---

## 5. Technology Stack & Integration Feasibility

| Capability | Current Autonomiq Stack | Freelance Desk Adaptation |
|---|---|---|
| **Orchestration** | LangGraph (StateGraph) | Add specialized nodes: `ClientProfiler`, `PortfolioMatcher`, `ScopeEstimator`, `ProposalWriter`. |
| **Worker Engine** | Temporal Workflows | Durable execution for multi-stage proposal workflows and background client web crawling. |
| **Vector DB** | Qdrant (Local) | Dual collection schema: `client_brief_chunks` (ephemeral) + `freelancer_portfolio` (persistent). |
| **LLM Inference** | Ollama (Gemma 2B / 7B) | Local inference for privacy; Gemma tailored with few-shot proposal and estimation system prompts. |
| **Audio Voice** | ElevenLabs v2 | Customized briefing voices (Professional Executive tone) with audio player controls. |
| **Frontend UI** | React + Vite + TypeScript | Add Freelance Workspace view, Portfolio Uploader, and Proposal Previewer alongside Task Monitor. |

---

## 6. Recommended Immediate Action Plan

1. **Keep `srs.md` Intact:** Preserve the foundational hackathon/core research MVP specification as the reference baseline.
2. **Adopt `Autonomiq Freelance Desk.md` as the Product Extension:** Use this specification to guide specialized modules, schemas, and UI views.
3. **Phase 1 Implementation:**
   - Create a persistent `freelancer_profile` data directory in `data/freelancer/`.
   - Add a `Portfolio RAG` ingestion script to index user past work into Qdrant.
   - Build a `ProposalNode` in the LangGraph agent to generate proposal artifacts alongside standard research reports.
