# Autonomiq Freelance Desk 💼

> **Autonomous AI Workstation for Solo Developers, Consultants & Freelancers**  
> *"Bid smarter. Research faster. Close clients while you touch grass."*

---

## 🌟 Overview

**Autonomiq Freelance Desk** is a standalone, local-first autonomous AI workspace tailored for freelancers and technical contractors. Built on the core durability and local-inference foundation of Autonomiq, it automates the most time-consuming, unbillable freelance chores:

1. **RFP & Brief Ingestion**: Drops in client PDFs, Upwork project descriptions, or discovery call transcripts.
2. **Client Reconnaissance**: Autonomous background search (SerpApi) on the client's company, tech stack, and market footprint.
3. **Portfolio & Skills Matching**: Local vector RAG (Qdrant) searching your personal past projects, case studies, and rate cards.
4. **Scope & Proposal Synthesis**: Local LLM reasoning (Gemma via Ollama) generating a complete proposal, Work Breakdown Structure (WBS), milestone schedule, and risk register.
5. **Away Mode Audio Brief**: 2-3 minute ElevenLabs audio briefing so you can review client opportunities on the go.

---

## 🏗️ Architecture

```
Autonomiq_Freelance_Desk/
├── backend/                          # FastAPI REST API & LangGraph Engine
│   ├── app/
│   │   ├── api/                      # Endpoints: Briefs, Proposals, Profile, Health
│   │   ├── agent/                    # LangGraph workflow (Recon, Match, Proposal, Audio)
│   │   ├── models/                   # SQLite database models (Clients, Briefs, Proposals)
│   │   ├── schemas/                  # Pydantic data transfer schemas
│   │   ├── tools/                    # Search, Document Parser, Qdrant Vector, ElevenLabs
│   │   ├── config.py                 # Configuration & environment loader
│   │   ├── database.py               # Async SQLite database connection
│   │   └── main.py                   # FastAPI application entrypoint
│   └── requirements.txt              # Backend dependencies
├── data/                             # Local persistence
│   ├── portfolio/                    # Freelancer profile, case studies & rate cards
│   ├── uploads/                      # Uploaded client RFP and brief documents
│   └── artifacts/                    # Generated proposals, exports, and audio briefs
└── scripts/
    ├── run_backend.py                # Server runner (Port 8010)
    └── seed_profile.py               # Seed freelancer profile & sample portfolio
```

---

## 🚀 Quick Setup

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate optional live API keys (falls back gracefully to local processing if missing):
- `SERPAPI_API_KEY`: For real-time client company reconnaissance.
- `ELEVENLABS_API_KEY`: For executive audio briefing generation.
- `OLLAMA_MODEL`: Target model (default: `gemma3:1b` or `qwen2.5:1.5b`).

### 2. Install Dependencies
```bash
# Python backend
pip install -r requirements.txt

# React frontend
cd frontend
npm install
```

### 3. Seed Profile & Portfolio
```bash
python scripts/seed_profile.py
```

### 4. Run Application
```bash
# Full unified runner (backend + frontend)
python scripts/run_all.py
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
