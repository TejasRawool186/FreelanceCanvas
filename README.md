# FreelanceCanvas 🎨💼

> **Visual Collaborative AI Workstation for Solo Developers, Consultants & Freelancers**  
> *"Brainstorm visually. Research faster. Close clients while you touch grass."*

---

## 🌟 Overview

**FreelanceCanvas** is an interactive, visual-first whiteboard and autonomous AI workspace tailored for freelancers, solo developers, and technical consultants. Combining playful neo-brutalist collaborative canvas boards with local vector RAG and AI synthesis, it automates the most time-consuming, unbillable freelance chores:

1. **Visual Brainstorming & Whiteboarding**: Interactive draggable sticky notes, phase workflows, and real-time team collaboration canvas.
2. **RFP & Brief Ingestion**: Drops in client PDFs, Upwork project descriptions, or discovery call transcripts.
3. **Client Reconnaissance**: Autonomous background search (SerpApi) on the client's company, tech stack, and market footprint.
4. **Portfolio & Skills Matching**: Local vector RAG (Qdrant) searching your personal past projects, case studies, and rate cards.
5. **Scope & Proposal Synthesis**: Local LLM reasoning (Gemma via Ollama) generating a complete proposal, Work Breakdown Structure (WBS), milestone schedule, and risk register.
6. **Away Mode Audio Brief**: 2-3 minute ElevenLabs audio briefing so you can review client opportunities on the go.

---

## 🏗️ Architecture

```
FreelanceCanvas/
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
