import re
import json
import httpx
from typing import List, Dict, Any, Optional
from ..config import settings
from ..schemas.schemas import ScopeCheckResponse

EXPANSION_PHRASES = [
    r"\balso\s+want\b",
    r"\bcan\s+we\s+add\b",
    r"\bin\s+addition\b",
    r"\bnew\s+feature\b",
    r"\badditional\s+page\b",
    r"\bextra\s+revision\b",
    r"\bmobile\s+app\b",
    r"\bnative\s+(?:ios|android)\b",
    r"\bpush\s+notifications?\b",
    r"\bmulti-tenant\b",
    r"\bwhitelabel\b",
    r"\badmin\s+portal\b",
    r"\bcrypto\b",
    r"\bblockchain\b",
    r"\bchatbot\b",
    r"\bthird-party\s+api\b"
]

class ScopeGuardEngine:
    """
    Evaluates incoming client communications against baseline project WBS & milestones
    to detect scope creep, estimate change order costs, and generate professional email responses.
    """

    async def _query_ollama(self, prompt: str, system: str = "") -> str:
        try:
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "system": system,
                "stream": False
            }
            async with httpx.AsyncClient(timeout=40.0) as client:
                resp = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
                if resp.status_code == 200:
                    return resp.json().get("response", "").strip()
        except Exception as e:
            print(f"[ScopeGuard Ollama Warning]: {e}")
        return ""

    async def analyze_scope(
        self,
        project_title: str,
        baseline_wbs: List[Dict[str, Any]],
        baseline_tasks: List[Dict[str, Any]],
        new_request_text: str,
        hourly_rate: float = 75.0,
        client_name: str = "Client"
    ) -> ScopeCheckResponse:
        # Build baseline summary
        milestone_summaries = []
        baseline_deliverables = set()

        for m in baseline_wbs:
            m_title = m.get("milestone_name") or m.get("title", "")
            m_desc = m.get("description", "")
            delivs = m.get("deliverables", [])
            for d in delivs:
                baseline_deliverables.add(d.lower())
            milestone_summaries.append(f"- Milestone {m_title}: {m_desc} (Deliverables: {', '.join(delivs)})")

        for t in baseline_tasks:
            t_title = t.get("title", "")
            if t_title:
                baseline_deliverables.add(t_title.lower())

        baseline_text = "\n".join(milestone_summaries) if milestone_summaries else "Standard MVP web development"

        # Try LLM analysis first if available
        system_prompt = (
            "You are a Senior Project Manager & Contract Scope Auditor. "
            "Compare the client's new request against the agreed baseline milestones. "
            "Respond ONLY with a JSON object containing keys: is_scope_creep (boolean), confidence_score (float 0.0-1.0), "
            "scope_status ('in_scope', 'probable_scope_creep', 'definitive_scope_creep'), analysis_summary (string), "
            "matched_milestones (array of strings), out_of_scope_items (array of strings), "
            "estimated_impact_hours (float), suggested_client_response (string)."
        )
        prompt = (
            f"Project: {project_title}\n"
            f"Hourly Rate: ${hourly_rate}/hr\n\n"
            f"Agreed Baseline Scope:\n{baseline_text}\n\n"
            f"Incoming Client Request:\n\"\"\"{new_request_text}\"\"\"\n\n"
            "Evaluate whether this request is covered by the baseline or constitutes scope creep."
        )

        llm_resp = await self._query_ollama(prompt, system=system_prompt)
        if llm_resp:
            try:
                clean = llm_resp
                if "```json" in clean:
                    clean = clean.split("```json")[1].split("```")[0].strip()
                elif "```" in clean:
                    clean = clean.split("```")[1].split("```")[0].strip()
                data = json.loads(clean)
                impact_hrs = float(data.get("estimated_impact_hours", 0.0))
                return ScopeCheckResponse(
                    is_scope_creep=bool(data.get("is_scope_creep", False)),
                    confidence_score=float(data.get("confidence_score", 0.85)),
                    scope_status=str(data.get("scope_status", "probable_scope_creep")),
                    analysis_summary=str(data.get("analysis_summary", "")),
                    matched_milestones=list(data.get("matched_milestones", [])),
                    out_of_scope_items=list(data.get("out_of_scope_items", [])),
                    estimated_impact_hours=impact_hrs,
                    suggested_change_order_cost=round(impact_hrs * hourly_rate, 2),
                    suggested_client_response=str(data.get("suggested_client_response", ""))
                )
            except Exception:
                pass

        # Deterministic Grounded Scope Analysis Fallback
        return self._deterministic_analyze(
            project_title=project_title,
            baseline_wbs=baseline_wbs,
            baseline_tasks=baseline_tasks,
            new_request_text=new_request_text,
            hourly_rate=hourly_rate,
            client_name=client_name
        )

    def _deterministic_analyze(
        self,
        project_title: str,
        baseline_wbs: List[Dict[str, Any]],
        baseline_tasks: List[Dict[str, Any]],
        new_request_text: str,
        hourly_rate: float,
        client_name: str
    ) -> ScopeCheckResponse:
        req_lower = new_request_text.lower()

        # 1. Collect baseline tokens and deliverables
        baseline_tokens = set()
        matched_milestones = []
        for m in baseline_wbs:
            m_name = m.get("milestone_name") or m.get("title", "")
            desc = m.get("description", "")
            delivs = m.get("deliverables", [])
            m_text = f"{m_name} {desc} {' '.join(delivs)}".lower()
            tokens = set(re.findall(r"\b[a-zA-Z]{3,}\b", m_text))
            baseline_tokens.update(tokens)

            # Check if this milestone matches any phrase in request
            if any(term in req_lower for term in [m_name.lower()[:8]] if len(term) >= 4):
                matched_milestones.append(m_name)

        # Also collect tokens from tasks
        for t in baseline_tasks:
            t_tokens = set(re.findall(r"\b[a-zA-Z]{3,}\b", t.get("title", "").lower()))
            baseline_tokens.update(t_tokens)

        # 2. Extract potential out-of-scope items from request
        sentences = [s.strip() for s in re.split(r"[.!?\n;]", new_request_text) if len(s.strip()) > 10]
        out_of_scope_items = []

        # Check explicit expansion patterns
        has_expansion_keywords = any(re.search(pat, req_lower) for pat in EXPANSION_PHRASES)

        for s in sentences:
            s_lower = s.lower()
            s_tokens = set(re.findall(r"\b[a-zA-Z]{3,}\b", s_lower))
            overlap = s_tokens.intersection(baseline_tokens)
            # If low overlap and contains actionable verbs/nouns, likely out of scope
            action_words = {"add", "integrate", "build", "create", "support", "need", "want", "require", "app", "mobile"}
            if any(w in s_tokens for w in action_words):
                if len(overlap) < 2 or any(re.search(pat, s_lower) for pat in EXPANSION_PHRASES):
                    out_of_scope_items.append(s.strip())

        # If sentences list was empty but text is substantial
        if not out_of_scope_items and has_expansion_keywords:
            out_of_scope_items.append(new_request_text.strip())

        is_creep = len(out_of_scope_items) > 0 or has_expansion_keywords
        
        if len(out_of_scope_items) >= 2 or (is_creep and has_expansion_keywords):
            scope_status = "definitive_scope_creep"
            confidence = 0.92
            impact_hours = float(len(out_of_scope_items) * 12.0)
            if impact_hours == 0:
                impact_hours = 16.0
        elif is_creep:
            scope_status = "probable_scope_creep"
            confidence = 0.84
            impact_hours = 8.0
        else:
            scope_status = "in_scope"
            confidence = 0.88
            impact_hours = 0.0

        change_order_cost = round(impact_hours * hourly_rate, 2)

        if is_creep:
            summary = (
                f"Scope expansion detected: The incoming request requests capabilities "
                f"({', '.join([item[:40] + '...' if len(item) > 40 else item for item in out_of_scope_items])}) "
                f"that are not accounted for in the baseline deliverables or current WBS milestones. "
                f"Estimated additional effort is {impact_hours:.1f} hours (${change_order_cost:,.2f})."
            )
            email_draft = (
                f"Hi {client_name},\n\n"
                f"Thanks for sharing these thoughts! That feature direction sounds very promising for {project_title}.\n\n"
                f"I reviewed the request against our agreed baseline Statement of Work. Because this introduces "
                f"additional functionality ({', '.join(out_of_scope_items[:2])}) outside our initial milestones, "
                f"here are two transparent ways we can handle it:\n\n"
                f"1. **Option A (Formal Change Order)**: We incorporate this right now via Change Order #1. "
                f"This would add approximately {impact_hours:.1f} hours (${change_order_cost:,.2f} at ${hourly_rate}/hr) "
                f"and extend our target delivery by ~1 week.\n\n"
                f"2. **Option B (Phase 2 Backlog)**: We keep our existing sprint focus locked on delivering our agreed "
                f"baseline milestone on time, and queue this item at the top of our Phase 2 roadmap immediately following launch.\n\n"
                f"Let me know which option aligns better with your launch priorities!\n\n"
                f"Best regards,\n"
                f"FreelanceCanvas Desk"
            )
        else:
            summary = (
                "The requested tasks/clarifications align with existing milestone deliverables "
                f"({', '.join(matched_milestones) if matched_milestones else 'Core Baseline'}) "
                "and can be accommodated within the current sprint estimates without budget adjustments."
            )
            email_draft = (
                f"Hi {client_name},\n\n"
                f"Thanks for following up! I checked the details against our active project plan. "
                f"This falls squarely within our planned deliverables, so we can incorporate it directly "
                f"into the current milestone without altering our delivery timeline or budget.\n\n"
                f"Best regards,\n"
                f"FreelanceCanvas Desk"
            )

        return ScopeCheckResponse(
            is_scope_creep=is_creep,
            confidence_score=confidence,
            scope_status=scope_status,
            analysis_summary=summary,
            matched_milestones=matched_milestones,
            out_of_scope_items=out_of_scope_items,
            estimated_impact_hours=impact_hours,
            suggested_change_order_cost=change_order_cost,
            suggested_client_response=email_draft
        )
