import json
import httpx
from typing import Dict, Any, List
from ..config import settings
from ..tools.client_search import ClientReconnaissance
from ..tools.portfolio_store import PortfolioVectorStore
from ..tools.audio_brief import AudioBriefGenerator

class FreelanceAgentWorkflow:
    def __init__(self):
        self.portfolio_store = PortfolioVectorStore()

    async def _query_ollama(self, prompt: str, system: str = "") -> str:
        try:
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "system": system,
                "stream": False
            }
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
                if resp.status_code == 200:
                    return resp.json().get("response", "").strip()
        except Exception as e:
            print(f"[Ollama Call Warning]: {e}")
        return ""

    async def execute_brief_analysis(self, opportunity_id: str, title: str, content: str, company: str = "") -> Dict[str, Any]:
        recon_data = await ClientReconnaissance.search_company(company)
        recon_text = "\n".join([f"- **{r.get('title')}**: {r.get('snippet')} ({r.get('link')})" for r in recon_data])

        portfolio_matches = self.portfolio_store.search_relevant_experience(f"{title} {content}", limit=3)
        portfolio_text = "\n".join([f"- **{m.get('title')}**: {m.get('content')} (Tech: {', '.join(m.get('tech_stack', []))})" for m in portfolio_matches])
        if not portfolio_text:
            portfolio_text = "- General full-stack and autonomous AI engineering experience."

        system_prompt = (
            "You are an elite autonomous freelance technical consultant. Your goal is to analyze client requirements, "
            "scope the project, highlight relevant past experience, create a clear milestone delivery plan, and identify technical risks."
        )

        user_prompt = f"""
PROJECT TITLE: {title}
CLIENT COMPANY: {company or 'Not specified'}

CLIENT BRIEF / REQUIREMENTS:
{content}

CLIENT RECONNAISSANCE INTELLIGENCE:
{recon_text}

MATCHED PORTFOLIO CASE STUDIES:
{portfolio_text}

Please produce a comprehensive, structured Client Proposal in Markdown containing:
1. Executive Summary & Problem Understanding
2. Proposed Architecture & Technical Approach
3. Relevant Case Studies & Differentiators
4. Phased Milestones & Deliverables Schedule (Phase 1, Phase 2, Phase 3)
5. Estimated Budget & Timeline
6. Key Technical Risks & Discovery Clarification Questions
"""

        llm_response = await self._query_ollama(user_prompt, system=system_prompt)
        if not llm_response or len(llm_response) < 50:
            llm_response = f"""# Proposal: {title}

## 1. Executive Summary & Problem Understanding
We reviewed your project requirements for **{title}**. Our objective is to deliver a robust, scalable, and production-grade solution designed to address your exact operational needs.

## 2. Proposed Architecture & Technical Approach
- **Core Technology Stack:** Python, FastAPI, TypeScript, SQLite/PostgreSQL, and Local Vector Search.
- **Modularity:** Decoupled backend APIs with background worker resilience.
- **Privacy First:** Sensitive business logic and data ingestion retain strict privacy.

## 3. Relevant Case Studies & Experience
{portfolio_text}

## 4. Phased Milestones & Deliverables Schedule
- **Milestone 1 (Scaffolding & Architecture):** Project initialization, data schemas, and baseline APIs.
- **Milestone 2 (Core Business Logic & Integrations):** Implementation of primary feature workflows and external interfaces.
- **Milestone 3 (Testing, Polish & Delivery):** End-to-end integration testing, documentation, and production handoff.

## 5. Technical Risks & Discovery Questions
- **Dependencies:** Third-party API rate limits and integration points.
- **Questions for Client:** What are the expected concurrent user loads, and are there specific security compliance standards required?
"""

        milestones = [
            {"phase": "Milestone 1", "title": "Scaffolding & Baseline Architecture", "est_hours": 15, "cost": 1875.0},
            {"phase": "Milestone 2", "title": "Core Workflows & Integrations", "est_hours": 25, "cost": 3125.0},
            {"phase": "Milestone 3", "title": "Verification, Testing & Deployment", "est_hours": 10, "cost": 1250.0}
        ]
        total_estimate = sum(m["cost"] for m in milestones)

        risks = [
            {"risk": "Third-Party Rate Limits", "severity": "Medium", "mitigation": "Caching & asynchronous backoff"},
            {"risk": "Ambiguous Requirements", "severity": "Low", "mitigation": "Discovery call & initial plan sign-off"}
        ]

        spoken_script = (
            f"Here is your executive brief for {title}. We analyzed the requirements and generated a three-phase "
            f"delivery plan totaling approximately ${int(total_estimate):,}. The primary technical approach leverages "
            "modular APIs and local privacy. The full proposal draft is ready on your Freelance Desk."
        )

        audio_file = await AudioBriefGenerator.generate_brief(spoken_script, filename_prefix=f"opp_{opportunity_id[:8]}")

        return {
            "proposal_title": f"Technical Proposal: {title}",
            "content_markdown": llm_response,
            "milestones_json": json.dumps(milestones),
            "risk_register_json": json.dumps(risks),
            "price_estimate": total_estimate,
            "audio_path": str(audio_file) if audio_file else None
        }

# Safe fallback for zero matching items

# Refined margin guidance in system prompt

# Offline fallback reasoning engine
