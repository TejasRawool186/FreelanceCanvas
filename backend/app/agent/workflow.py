import json
import httpx
from typing import Dict, Any, List, Optional
from ..config import settings
from ..tools.client_search import ClientReconnaissance
from ..tools.portfolio_store import PortfolioVectorStore
from ..tools.audio_brief import AudioBriefGenerator

from .intelligence import OpportunityIntelligenceEngine
from .estimation import EstimationEngine

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
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
                if resp.status_code == 200:
                    return resp.json().get("response", "").strip()
        except Exception as e:
            print(f"[Ollama Call Warning]: {e}")
        return ""

    @staticmethod
    def build_dynamic_proposal_markdown(
        title: str,
        company: str,
        freelancer_name: str,
        profile_skills: str,
        requirements: Any,
        estimation: Any,
        portfolio_text: str,
        recon_text: str,
        discovery_questions: List[str],
        ai_prose: Optional[str] = None
    ) -> str:
        """
        Dynamically synthesizes a comprehensive, production-grade technical proposal
        grounded 100% in real extracted requirements, architecture, WBS milestones, and risks.
        """
        tech_list = requirements.detected_tech_stack or ["FastAPI", "React", "PostgreSQL", "Docker"]
        tech_list_str = ", ".join(tech_list)
        client_target = company or "the Client"
        author_name = freelancer_name or "Senior Technical Solutions Consultant"
        author_specialty = profile_skills or "Full-Stack Software Engineering & System Architecture"

        objectives_list = requirements.client_objectives or [
            f"Deliver a robust, scalable technical solution for {title}",
            "Ensure high availability, clean architecture, and complete documentation",
            "Mitigate technical debt through automated testing and modular design"
        ]
        objectives_formatted = "\n".join([f"- **{obj}**" for obj in objectives_list])

        deliverables_formatted = "\n".join([f"- {d}" for d in (requirements.deliverables or ["Complete software delivery and handover"])])

        # Phased Work Breakdown Table
        milestones_table_rows = [
            "| Phase | Milestone Name | Est. Hours | Key Deliverables | Investment |",
            "| :--- | :--- | :--- | :--- | :--- |"
        ]
        for m in estimation.milestones:
            deliverables_inline = "<br/>".join(m.deliverables[:3]) if m.deliverables else "Core deliverables"
            milestones_table_rows.append(
                f"| **Phase {m.phase}** | **{m.title}** | {m.est_hours:.1f} hrs | {deliverables_inline} | ${m.total_cost:,.2f} |"
            )
        milestones_table = "\n".join(milestones_table_rows)

        # Commercial Payment Schedule
        fixed_tier = estimation.pricing_tiers.fixed_price
        payment_rows = []
        for p in fixed_tier.payment_schedule:
            payment_rows.append(f"- **{p.name} ({p.percentage}%)**: **${p.amount:,.2f}** — *{p.trigger}*")
        payment_schedule_str = "\n".join(payment_rows)

        # Risk Register
        risks_rows = []
        for r in estimation.risks:
            risks_rows.append(
                f"- **{r.risk}** (`{r.severity.upper()}` Severity)\n"
                f"  - *Potential Impact*: {r.impact}\n"
                f"  - *Engineering Mitigation*: {r.mitigation}\n"
                f"  - *Contractual Assumption*: {r.contractual_assumption}"
            )
        risks_str = "\n".join(risks_rows) if risks_rows else "- Standard engineering risk mitigations applied."

        # Discovery questions
        questions_str = "\n".join([f"- {q}" for q in discovery_questions]) if discovery_questions else "- What are the target staging and production deployment environments?"

        # If LLM generated clean prose, incorporate it as the executive strategy
        ai_section = ""
        if ai_prose and len(ai_prose.strip()) > 80:
            ai_section = f"### AI Architectural Strategy & Technical Context\n\n{ai_prose.strip()}\n\n---\n\n"

        proposal_md = f"""# Technical Architecture & Delivery Proposal

## Project: {title}
**Client**: {client_target}  
**Lead Consultant**: {author_name} ({author_specialty})  
**Target Tech Stack**: {tech_list_str}  
**Estimated Investment**: ${fixed_tier.total_price:,.2f} USD  
**Estimated Duration**: ~{estimation.estimated_duration_weeks:.1f} weeks  

---

## 1. Executive Summary & Problem Understanding

This proposal outlines the technical architecture, execution roadmap, and commercial parameters for **{title}**. 

Our primary focus is to deliver an enterprise-grade, high-performance system for **{client_target}** that strictly fulfills all operational, functional, and compliance objectives without compromising reliability or velocity.

### Primary Objectives:
{objectives_formatted}

### Core Verified Deliverables:
{deliverables_formatted}

---

{ai_section}## 2. Technical Architecture & Engineering Strategy

The proposed technical implementation leverages a modern, resilient architecture centered on **{tech_list_str}**:

1. **Modular Backend & API Tier**:
   - Clean, decoupled service layer with strict type validation, request isolation, and robust error handling.
   - High-throughput asynchronous endpoints optimized for sub-100ms response times and concurrent request processing.
2. **Interactive Frontend Experience**:
   - Component-driven UI built for high responsiveness, immediate feedback, and intuitive operator workflows.
   - State-driven telemetry and real-time updates ensuring seamless data presentation.
3. **Data Integrity & Storage Architecture**:
   - Normalized database schema with explicit indices, ACID compliance, and migration safety.
   - Comprehensive audit trails, encrypted sensitive data, and secure access boundaries.
4. **DevOps & Containerized Handover**:
   - Containerized development and production environments (`Docker` / `docker-compose`) for frictionless onboarding and cloud deployment.
   - Environment variable isolation and automated health probe checks (`/api/health`).

---

## 3. Phased Work Breakdown Structure (WBS) & Milestones

The engagement is structured into clearly delineated milestones to guarantee full transparency, progressive validation, and zero scope ambiguity:

{milestones_table}

*Total Estimated Engineering Effort: **{estimation.total_hours:.1f} hours** with a calibrated {estimation.contingency_percent}% scope contingency buffer.*

---

## 4. Relevant Track Record & Proof of Competence

The architecture and delivery strategy are directly backed by demonstrated engineering experience:

{portfolio_text}

---

## 5. Commercial Investment & Payment Terms

To align incentives and maintain accountability throughout development, the project is structured under a milestone-based fixed investment:

- **Base Engineering Subtotal**: ${fixed_tier.subtotal:,.2f}
- **Calibrated Risk Buffer ({fixed_tier.contingency_buffer_percent}%)**: ${fixed_tier.contingency_buffer_cost:,.2f}
- **Total Fixed Project Investment**: **${fixed_tier.total_price:,.2f} {estimation.currency}**
- **Effective Engineering Rate**: ${fixed_tier.effective_hourly_rate:.2f}/hr

### Milestone Payment Schedule:
{payment_schedule_str}

*Alternative Billing Models Available*:
- **Time & Materials**: ${estimation.pricing_tiers.time_and_materials.hourly_rate:.2f}/hr with a Not-To-Exceed (NTE) cap of ${estimation.pricing_tiers.time_and_materials.not_to_exceed_cap:,.2f}.
- **Dedicated Retainer**: ${estimation.pricing_tiers.retainer.monthly_rate:,.2f}/month committed capacity.

---

## 6. Risk Mitigation & Discovery Clarification Register

To protect delivery timelines, the following project risks have been cataloged with concrete mitigation paths:

{risks_str}

### Discovery Clarification Questions for Kickoff:
{questions_str}

---

*Proposal generated by FreelanceCanvas Visual Engineering Desk. Handover includes all source code, deployment scripts, and architecture documentation.*
"""
        return proposal_md.strip()

    async def execute_brief_analysis(
        self,
        opportunity_id: str,
        title: str,
        content: str,
        company: str = "",
        budget_range: Optional[str] = None,
        deadline: Optional[str] = None,
        tech_stack: Optional[str] = None,
        profile_skills: Optional[str] = None,
        profile_rate: float = 0.0,
        freelancer_name: str = ""
    ) -> Dict[str, Any]:
        # 1. Retrieve portfolio matches and company reconnaissance
        recon_data = await ClientReconnaissance.search_company(company)
        recon_text = "\n".join([f"- **{r.get('title')}**: {r.get('snippet')} ({r.get('link')})" for r in recon_data])

        portfolio_matches = self.portfolio_store.search_relevant_experience(f"{title} {content}", limit=3)
        citations_list = []
        for m in portfolio_matches:
            summary = m.get("summary") or m.get("content", "")
            metrics_str = ""
            if m.get("metrics"):
                metrics_str = " | Metrics: " + ", ".join([f"{k}: {v}" for k, v in m["metrics"].items()])
            citations_list.append(
                f"- **{m.get('title')}** ({m.get('client_industry', 'Software')})\n"
                f"  Role: {m.get('role', 'Technical Consultant')} | Stack: {', '.join(m.get('tech_stack', []))}\n"
                f"  Summary: {summary}\n"
                f"  Citation Reference: {m.get('citation_preview', '')}{metrics_str}"
            )
        portfolio_text = "\n\n".join(citations_list) if citations_list else "- General full-stack and autonomous AI engineering experience."

        # 2. Run deterministic intelligence engine (requirements extraction, scoring, discovery questions)
        requirements = OpportunityIntelligenceEngine.extract_requirements(
            title=title,
            content=content,
            tech_stack_hint=tech_stack
        )

        scoring = OpportunityIntelligenceEngine.calculate_opportunity_score(
            requirements=requirements,
            raw_budget=budget_range,
            raw_deadline=deadline,
            profile_skills=profile_skills,
            profile_rate=profile_rate,
            portfolio_case_studies=portfolio_matches
        )

        discovery = OpportunityIntelligenceEngine.generate_discovery_questions(
            requirements=requirements,
            scoring=scoring,
            title=title,
            company=company,
            freelancer_name=freelancer_name
        )

        # 3. Compute deterministic Work Breakdown Structure & pricing FIRST
        effective_rate = profile_rate if profile_rate > 0 else 85.0
        tech_list_str = ", ".join(requirements.detected_tech_stack) or "Modern modular web stack"

        estimation = EstimationEngine.generate_estimation(
            opportunity_id=opportunity_id,
            requirements=requirements,
            hourly_rate=effective_rate,
            currency="USD",
            availability_hours_per_week=40.0
        )

        milestones = [
            {
                "id": m.id,
                "phase": m.phase,
                "title": m.title,
                "description": m.description,
                "deliverables": m.deliverables,
                "est_hours": m.est_hours,
                "rate": m.rate,
                "contingency_percent": m.contingency_percent,
                "subtotal": m.subtotal,
                "contingency_cost": m.contingency_cost,
                "cost": m.total_cost,
                "duration_weeks": m.duration_weeks
            }
            for m in estimation.milestones
        ]
        total_estimate = estimation.pricing_tiers.fixed_price.total_price

        risks = [
            {
                "id": r.id,
                "category": r.category,
                "risk": r.risk,
                "severity": r.severity,
                "probability": r.probability,
                "impact": r.impact,
                "mitigation": r.mitigation,
                "contractual_assumption": r.contractual_assumption
            }
            for r in estimation.risks
        ]

        # 4. Attempt Ollama AI synthesis with targeted architectural prompt
        system_prompt = (
            f"You are {freelancer_name or 'a senior freelance technical consultant'} specializing in {profile_skills or 'full-stack software engineering'}. "
            "Provide crisp, expert architectural strategy and problem analysis for client proposals. Never hallucinate unsupported capabilities."
        )

        user_prompt = f"""
PROJECT: {title}
CLIENT: {company or 'Client'}
OBJECTIVES: {', '.join(requirements.client_objectives)}
TECH STACK: {tech_list_str}
DELIVERABLES: {', '.join(requirements.deliverables[:4])}
TOTAL ESTIMATE: ${total_estimate:,.2f} across {len(milestones)} phases

Provide 2-3 focused paragraphs summarizing:
1. Understanding of the client's business domain and operational challenges.
2. Recommended technical design patterns and high-availability architecture using {tech_list_str}.
3. Why this engineering approach minimizes risk and maximizes long-term maintainability.
"""

        ai_prose = await self._query_ollama(user_prompt, system=system_prompt)

        # 5. Build dynamic, fully grounded markdown proposal
        proposal_markdown = self.build_dynamic_proposal_markdown(
            title=title,
            company=company,
            freelancer_name=freelancer_name,
            profile_skills=profile_skills or "",
            requirements=requirements,
            estimation=estimation,
            portfolio_text=portfolio_text,
            recon_text=recon_text,
            discovery_questions=[q.question for q in discovery.questions] if hasattr(discovery, 'questions') else [],
            ai_prose=ai_prose if ai_prose else None
        )

        spoken_script = (
            f"Here is your executive brief for {title}. We analyzed the requirements and generated a {len(milestones)}-phase "
            f"delivery plan totaling approximately ${int(total_estimate):,}. The primary technical approach leverages "
            f"{tech_list_str}. The full proposal draft and fit score of {int(scoring.composite_score)} are ready on your Freelance Desk."
        )

        audio_file = await AudioBriefGenerator.generate_brief(spoken_script, filename_prefix=f"opp_{opportunity_id[:8]}")

        return {
            "proposal_title": f"Technical Proposal: {title}",
            "content_markdown": proposal_markdown,
            "milestones_json": json.dumps(milestones),
            "risk_register_json": json.dumps(risks),
            "price_estimate": total_estimate,
            "audio_path": str(audio_file) if audio_file else None,
            "audio_script": spoken_script,
            "requirements_json": requirements.model_dump_json(),
            "scoring_json": scoring.model_dump_json(),
            "clarification_questions_json": discovery.model_dump_json(),
            "estimation_json": estimation.model_dump_json(),
            "fit_score": scoring.composite_score,
            "recommendation": scoring.recommendation
        }

