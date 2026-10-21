import re
import json
from typing import List, Dict, Any, Optional
from ..schemas.schemas import (
    ExtractedRequirements,
    DeliveryRisk,
    ScoringFactor,
    OpportunityScore,
    ClarificationQuestion,
    DiscoveryQuestionsReport,
    OpportunityIntelligence
)

COMMON_TECH_KEYWORDS = [
    "Python", "FastAPI", "Django", "Flask", "Node.js", "Express", "NestJS",
    "React", "Next.js", "Vue", "Nuxt", "Svelte", "Angular", "TypeScript", "JavaScript",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Qdrant", "Pinecone",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel", "Supabase", "Firebase",
    "GraphQL", "REST", "WebSocket", "gRPC", "Kafka", "RabbitMQ", "Celery",
    "Stripe", "OAuth", "TailwindCSS", "Pandas", "PyTorch", "OpenAI", "LangChain", "Ollama"
]

class OpportunityIntelligenceEngine:
    @classmethod
    def extract_requirements(
        cls,
        title: str,
        content: str,
        tech_stack_hint: Optional[str] = None,
        llm_response_json: Optional[str] = None
    ) -> ExtractedRequirements:
        """
        Extract structured requirements from RFP / brief text.
        If structured LLM output is provided, parses and validates with Pydantic;
        otherwise runs robust, deterministic NLP extraction with explicit unknowns.
        """
        if llm_response_json:
            try:
                # Try parsing LLM JSON
                clean_json = llm_response_json.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()
                parsed = json.loads(clean_json)
                return ExtractedRequirements.model_validate(parsed)
            except Exception:
                pass  # Fall back to deterministic extractor

        return cls._rule_based_extract(title, content, tech_stack_hint)

    @classmethod
    def _rule_based_extract(
        cls,
        title: str,
        content: str,
        tech_stack_hint: Optional[str] = None
    ) -> ExtractedRequirements:
        full_text = f"{title}\n{content}"
        lines = [line.strip() for line in content.splitlines() if line.strip()]

        # 1. Tech stack detection
        detected_tech = set()
        if tech_stack_hint:
            for item in tech_stack_hint.replace(";", ",").split(","):
                if item.strip():
                    detected_tech.add(item.strip())

        for keyword in COMMON_TECH_KEYWORDS:
            pattern = rf"\b{re.escape(keyword)}\b"
            if re.search(pattern, full_text, re.IGNORECASE):
                detected_tech.add(keyword)

        # 2. Extract bullet points or sentences
        bullets = []
        for line in lines:
            if line.startswith(("-", "*", "•", "1.", "2.", "3.", "4.", "5.", ">")):
                cleaned = re.sub(r"^[-*•>\d\.]+\s*", "", line).strip()
                if len(cleaned) > 10:
                    bullets.append(cleaned)

        objectives = []
        functional = []
        non_functional = []
        deliverables = []
        constraints = []

        # Derive objectives
        if bullets:
            objectives.append(f"Deliver solution addressing: {title}")
            for b in bullets[:2]:
                objectives.append(b)
        else:
            first_sentences = [s.strip() for s in re.split(r"[\.\n]", content) if len(s.strip()) > 15]
            if first_sentences:
                objectives.append(first_sentences[0])
            else:
                objectives.append(f"Execute project requirements for '{title}'")

        # Partition bullets or sentences into requirements
        candidate_items = bullets if bullets else [s.strip() for s in re.split(r"[\.\n]", content) if len(s.strip()) > 15]

        for item in candidate_items:
            lower = item.lower()
            if any(k in lower for k in ["must", "deliverable", "deliver", "provide", "handover", "github", "repo", "documentation"]):
                deliverables.append(item)
            elif any(k in lower for k in ["performance", "latency", "scale", "security", "sla", "uptime", "gdpr", "compliance"]):
                non_functional.append(item)
            elif any(k in lower for k in ["deadline", "budget", "limit", "restrict", "cannot", "only use", "fixed"]):
                constraints.append(item)
            else:
                functional.append(item)

        if not deliverables:
            deliverables = [
                "Production-ready codebase with modular architecture",
                "Automated test suite and deployment documentation",
                "Handover review and verification walkthrough"
            ]

        # 3. Explicit Unknowns & Ambiguities (Honest detection of missing specs)
        unknowns = []
        lower_full = full_text.lower()

        if not any(k in lower_full for k in ["aws", "gcp", "azure", "vercel", "heroku", "docker", "kubernetes", "cloud", "hosting", "server"]):
            unknowns.append("Hosting environment and target infrastructure (e.g. AWS, GCP, Vercel, on-prem) unspecified.")
        
        if not any(k in lower_full for k in ["auth", "login", "jwt", "oauth", "sso", "user role", "rbac", "permission"]):
            unknowns.append("User authentication, authorization hierarchy, and session management standards not detailed.")

        if not any(k in lower_full for k in ["scale", "concurrent", "rps", "users", "volume", "traffic", "qps"]):
            unknowns.append("Target concurrent user volume and expected daily data throughput unquantified.")

        if not any(k in lower_full for k in ["test", "coverage", "jest", "pytest", "unit test", "e2e", "qa"]):
            unknowns.append("Automated test coverage thresholds and acceptance test criteria not explicitly specified.")

        if not any(k in lower_full for k in ["budget", "$", "usd", "hourly", "fixed price", "rate"]):
            unknowns.append("Commercial compensation ceiling and payment milestone schedule not established in brief.")

        # 4. Standard baseline assumptions
        assumptions = [
            "Client will provide required third-party API credentials, sandbox keys, and repository permissions during onboarding.",
            "Design assets and interface specifications (Figma/wireframes) are finalized prior to frontend implementation.",
            "Asynchronous written communication via Slack/Teams with weekly milestone check-ins."
        ]

        # 5. Delivery risks
        delivery_risks = []
        if len(unknowns) >= 3:
            delivery_risks.append(DeliveryRisk(
                risk="Scope Ambiguity & Creep",
                severity="High",
                mitigation="Conduct formal Phase 0 discovery interview to lock down acceptance criteria before writing code."
            ))
        
        if any(k in lower_full for k in ["urgent", "asap", "tight", "immediate", "days"]):
            delivery_risks.append(DeliveryRisk(
                risk="Aggressive Delivery Schedule",
                severity="High",
                mitigation="Stage deliverables into strict MVP essentials followed by secondary feature polish."
            ))

        delivery_risks.append(DeliveryRisk(
            risk="Third-Party Integration Dependencies",
            severity="Medium",
            mitigation="Implement mock interfaces and fault-tolerant retry handlers with circuit breaking."
        ))

        return ExtractedRequirements(
            client_objectives=objectives[:4],
            functional_requirements=functional[:8] if functional else ["Core application workflow execution"],
            non_functional_requirements=non_functional if non_functional else ["Maintainable, documented code conforming to clean architecture standards"],
            deliverables=deliverables[:5],
            constraints=constraints if constraints else ["Standard production quality and security guidelines apply"],
            detected_tech_stack=sorted(list(detected_tech)),
            unknowns=unknowns,
            assumptions=assumptions,
            delivery_risks=delivery_risks
        )

    @classmethod
    def calculate_opportunity_score(
        cls,
        requirements: ExtractedRequirements,
        raw_budget: Optional[str] = None,
        raw_deadline: Optional[str] = None,
        profile_skills: Optional[str] = None,
        profile_rate: float = 0.0,
        portfolio_case_studies: Optional[List[Dict[str, Any]]] = None
    ) -> OpportunityScore:
        """
        Calculates a deterministic, explainable fit score (0-100) across 5 weighted factors.
        """
        portfolio_case_studies = portfolio_case_studies or []
        factors: List[ScoringFactor] = []

        # 1. Skill Compatibility (Weight: 0.25)
        user_skills = [s.strip().lower() for s in (profile_skills or "").split(",") if s.strip()]
        detected_tech = requirements.detected_tech_stack

        if not detected_tech:
            skill_score = 65.0
            skill_status = "neutral"
            skill_expl = "No specific tech stack mandated in brief; flexible to modern standard stacks."
        elif not user_skills:
            skill_score = 50.0
            skill_status = "warning"
            skill_expl = f"Client requested {len(detected_tech)} technologies ({', '.join(detected_tech)}), but freelancer profile has no skills listed."
        else:
            matched = []
            unmatched = []
            for dt in detected_tech:
                dt_lower = dt.lower()
                if any(us in dt_lower or dt_lower in us for us in user_skills):
                    matched.append(dt)
                else:
                    unmatched.append(dt)

            ratio = len(matched) / len(detected_tech)
            skill_score = round(ratio * 100, 1)
            if ratio >= 0.7:
                skill_status = "positive"
                skill_expl = f"Strong match: {len(matched)} of {len(detected_tech)} required technologies verified ({', '.join(matched)})."
            elif ratio >= 0.4:
                skill_status = "neutral"
                skill_expl = f"Partial match: {len(matched)} of {len(detected_tech)} technologies ({', '.join(matched)}). Missing: {', '.join(unmatched)}."
            else:
                skill_status = "critical"
                skill_expl = f"Low match: Only {len(matched)} of {len(detected_tech)} technologies matched. Missing critical stack: {', '.join(unmatched)}."

        factors.append(ScoringFactor(
            name="Skill Compatibility",
            weight=0.25,
            raw_score=skill_score,
            weighted_score=round(skill_score * 0.25, 1),
            explanation=skill_expl,
            status=skill_status
        ))

        # 2. Portfolio Relevance (Weight: 0.20)
        matching_studies = 0
        all_studies_count = len(portfolio_case_studies)
        detected_lower = {t.lower() for t in detected_tech}

        for cs in portfolio_case_studies:
            cs_stack = [t.lower() for t in cs.get("tech_stack", [])]
            if any(t in detected_lower for t in cs_stack):
                matching_studies += 1

        if all_studies_count == 0:
            port_score = 40.0
            port_status = "warning"
            port_expl = "No portfolio case studies uploaded to RAG vector store. Add past work in Portfolio tab."
        elif matching_studies > 0:
            port_score = min(100.0, 60.0 + (matching_studies * 20.0))
            port_status = "positive"
            port_expl = f"Found {matching_studies} verified case studies in your portfolio matching the required tech stack."
        else:
            port_score = 55.0
            port_status = "neutral"
            port_expl = f"Evaluated {all_studies_count} portfolio items; general engineering overlap but no direct stack match."

        factors.append(ScoringFactor(
            name="Portfolio Relevance",
            weight=0.20,
            raw_score=port_score,
            weighted_score=round(port_score * 0.20, 1),
            explanation=port_expl,
            status=port_status
        ))

        # 3. Budget Feasibility (Weight: 0.20)
        budget_str = (raw_budget or "").strip()
        budget_lower = budget_str.lower()
        budget_numbers = [float(x.replace(",", "")) for x in re.findall(r"\d+(?:,\d+)*(?:\.\d+)?", budget_str)]

        if not budget_str or not budget_numbers:
            budget_score = 45.0
            budget_status = "warning"
            budget_expl = "Budget unspecified in client RFP. Commercial terms require discovery clarification."
        elif profile_rate <= 0:
            budget_score = 75.0
            budget_status = "neutral"
            budget_expl = f"Client specified budget '{budget_str}'. Set your hourly rate in Settings for precise margin calculation."
        else:
            max_budget_num = max(budget_numbers)
            if "/hr" in budget_lower or "hour" in budget_lower:
                if max_budget_num >= profile_rate:
                    budget_score = 95.0
                    budget_status = "positive"
                    budget_expl = f"Client rate (${max_budget_num:,.0f}/hr) matches or exceeds your profile rate (${profile_rate:,.0f}/hr)."
                elif max_budget_num >= profile_rate * 0.75:
                    budget_score = 70.0
                    budget_status = "neutral"
                    budget_expl = f"Client rate (${max_budget_num:,.0f}/hr) is slightly below your standard rate (${profile_rate:,.0f}/hr). Scope renegotiation possible."
                else:
                    budget_score = 35.0
                    budget_status = "critical"
                    budget_expl = f"Client rate (${max_budget_num:,.0f}/hr) is significantly below your profile rate (${profile_rate:,.0f}/hr)."
            else:
                # Fixed price budget comparison
                est_min_hours = 25.0
                est_min_cost = est_min_hours * profile_rate
                if max_budget_num >= est_min_cost:
                    budget_score = 90.0
                    budget_status = "positive"
                    budget_expl = f"Fixed budget (${max_budget_num:,.0f}) is viable for project scope at your rate (${profile_rate:,.0f}/hr)."
                else:
                    budget_score = 45.0
                    budget_status = "warning"
                    budget_expl = f"Fixed budget (${max_budget_num:,.0f}) is low relative to standard scope at your rate (${profile_rate:,.0f}/hr)."

        factors.append(ScoringFactor(
            name="Budget Feasibility",
            weight=0.20,
            raw_score=budget_score,
            weighted_score=round(budget_score * 0.20, 1),
            explanation=budget_expl,
            status=budget_status
        ))

        # 4. Timeline Feasibility (Weight: 0.15)
        deadline_str = (raw_deadline or "").strip().lower()
        if not deadline_str:
            time_score = 65.0
            time_status = "neutral"
            time_expl = "Delivery deadline not established in RFP; milestone delivery schedule can be proposed."
        elif any(k in deadline_str for k in ["urgent", "asap", "immediate", "1 week", "2 days", "3 days"]):
            time_score = 40.0
            time_status = "warning"
            time_expl = f"Tight delivery window ('{deadline_str}') relative to scope. Requires compressed milestones and overtime."
        else:
            time_score = 90.0
            time_status = "positive"
            time_expl = f"Specified schedule ('{raw_deadline}') provides adequate runway for phased architecture and QA."

        factors.append(ScoringFactor(
            name="Timeline Feasibility",
            weight=0.15,
            raw_score=time_score,
            weighted_score=round(time_score * 0.15, 1),
            explanation=time_expl,
            status=time_status
        ))

        # 5. Requirement Clarity (Weight: 0.20)
        unknowns_count = len(requirements.unknowns)
        clarity_score = max(25.0, min(100.0, 100.0 - (unknowns_count * 12.5)))
        if clarity_score >= 80:
            clarity_status = "positive"
            clarity_expl = f"High specification clarity with only {unknowns_count} unclarified ambiguities."
        elif clarity_score >= 55:
            clarity_status = "neutral"
            clarity_expl = f"Moderate clarity; identified {unknowns_count} critical unknowns requiring client discovery."
        else:
            clarity_status = "warning"
            clarity_expl = f"Low clarity; brief has {unknowns_count} major missing requirements and undefined parameters."

        factors.append(ScoringFactor(
            name="Requirement Clarity",
            weight=0.20,
            raw_score=clarity_score,
            weighted_score=round(clarity_score * 0.20, 1),
            explanation=clarity_expl,
            status=clarity_status
        ))

        # Risk Penalty Calculation
        risk_penalty = 0.0
        for dr in requirements.delivery_risks:
            if dr.severity.lower() == "high":
                risk_penalty += 4.0
            elif dr.severity.lower() == "medium":
                risk_penalty += 2.0
        risk_penalty = min(15.0, risk_penalty)

        # Composite Score
        composite = sum(f.weighted_score for f in factors) - risk_penalty
        composite = max(0.0, min(100.0, round(composite, 1)))

        # Reasons to pursue & caution
        reasons_to_pursue = []
        reasons_to_caution = []

        for f in factors:
            if f.status == "positive":
                reasons_to_pursue.append(f"{f.name}: {f.explanation}")
            elif f.status in ("warning", "critical"):
                reasons_to_caution.append(f"{f.name}: {f.explanation}")

        for dr in requirements.delivery_risks:
            if dr.severity.lower() == "high":
                reasons_to_caution.append(f"Risk: {dr.risk} — {dr.mitigation}")

        # Recommendation
        if composite >= 75.0 and len(reasons_to_caution) <= 1:
            recommendation = "Pursue"
            summary = "High strategic and technical alignment. Recommend prioritizing for proposal submission."
        elif budget_status == "critical" or (budget_status == "warning" and composite >= 50.0):
            recommendation = "Renegotiate"
            summary = "Strong technical match, but commercial budget or timeline terms require renegotiation."
        elif len(requirements.unknowns) >= 3 or composite >= 50.0:
            recommendation = "Request Clarification"
            summary = "Viable opportunity with actionable unknowns. Recommend sending discovery clarification questionnaire."
        else:
            recommendation = "Skip"
            summary = "Low fit or excessive delivery risk. We recommend passing to preserve capacity."

        return OpportunityScore(
            composite_score=composite,
            recommendation=recommendation,
            summary=summary,
            factors=factors,
            risk_penalty=round(risk_penalty, 1),
            reasons_to_pursue=reasons_to_pursue if reasons_to_pursue else ["General software development alignment"],
            reasons_to_caution=reasons_to_caution if reasons_to_caution else ["No immediate critical disqualifiers detected"]
        )

    @classmethod
    def generate_discovery_questions(
        cls,
        requirements: ExtractedRequirements,
        scoring: OpportunityScore,
        title: str,
        company: str = "",
        freelancer_name: str = ""
    ) -> DiscoveryQuestionsReport:
        """
        Generate structured, categorized client clarification questions
        and an exportable client email draft based on detected unknowns.
        """
        questions: List[ClarificationQuestion] = []

        # Scope & Architecture
        if any("hosting" in u.lower() or "infrastructure" in u.lower() for u in requirements.unknowns):
            questions.append(ClarificationQuestion(
                category="Scope & Architecture",
                question="What cloud infrastructure or hosting environment do you prefer for staging and production (e.g., AWS, GCP, Vercel, or existing on-prem)?",
                importance="High",
                rationale="Determines containerization, DevOps setup, and recurring cloud cost expectations."
            ))

        if any("auth" in u.lower() for u in requirements.unknowns):
            questions.append(ClarificationQuestion(
                category="Scope & Architecture",
                question="Do you have an existing user authentication service (such as Supabase, Auth0, or OAuth providers), or should we architect a standalone role-based auth system?",
                importance="High",
                rationale="Prevents architectural rework and ensures compliance with your security policies."
            ))

        if any("scale" in u.lower() or "traffic" in u.lower() for u in requirements.unknowns):
            questions.append(ClarificationQuestion(
                category="Scope & Architecture",
                question="What is the anticipated initial user volume and peak concurrency we should architect and benchmark for?",
                importance="Medium",
                rationale="Informs database caching strategy, indexing, and connection pooling."
            ))

        # Timeline & Milestones
        questions.append(ClarificationQuestion(
            category="Timeline & Milestones",
            question="Is there a hard external event, investor demo, or business launch date driving your target timeline?",
            importance="High",
            rationale="Allows us to backwards-plan milestones and protect your critical launch window."
        ))

        # Commercials & Payment
        if any("budget" in u.lower() for u in requirements.unknowns) or scoring.factors[2].status in ("warning", "critical"):
            questions.append(ClarificationQuestion(
                category="Budget & Commercials",
                question="Could you share your target budget envelope or preference between milestone-based fixed fees versus weekly sprint retainers?",
                importance="High",
                rationale="Ensures our phased proposal respects your financial allocation and delivers maximum value per milestone."
            ))

        # Integrations & Access
        questions.append(ClarificationQuestion(
            category="Integrations & Access",
            question="Are all third-party API keys, sandbox credentials, and design assets ready for developer access, or are any currently pending approval?",
            importance="Medium",
            rationale="Guarantees sprint kickoff without blocker delays waiting for partner access."
        ))

        # Build email draft
        client_address = f"Hi {company} Team," if company else "Hi there,"
        sender = freelancer_name or "Technical Consultant"

        questions_grouped: Dict[str, List[str]] = {}
        for q in questions:
            questions_grouped.setdefault(q.category, []).append(q.question)

        email_body_sections = []
        for cat, q_list in questions_grouped.items():
            formatted_q = "\n".join([f"  • {q}" for q in q_list])
            email_body_sections.append(f"**{cat}**:\n{formatted_q}")

        questions_text = "\n\n".join(email_body_sections)

        email_draft = (
            f"Subject: Discovery & Scope Clarification: {title}\n\n"
            f"{client_address}\n\n"
            f"Thank you for sharing the requirements for '{title}'. I have completed an initial technical review "
            f"of your brief and mapped out a proposed architectural framework.\n\n"
            f"To guarantee our implementation roadmap and milestone pricing precisely match your operational goals, "
            f"could you please clarify a few key points?\n\n"
            f"{questions_text}\n\n"
            f"Once you confirm these details, I will finalize our milestone schedule, delivery architecture, "
            f"and fixed pricing breakdown for your review.\n\n"
            f"Looking forward to collaborating,\n"
            f"{sender}"
        )

        # Markdown questionnaire
        markdown_sections = []
        for q in questions:
            markdown_sections.append(
                f"- [ ] **[{q.category}]** {q.question}\n"
                f"  *Importance*: `{q.importance}` | *Rationale*: {q.rationale}"
            )
        questionnaire_md = f"### Discovery Questionnaire: {title}\n\n" + "\n\n".join(markdown_sections)

        return DiscoveryQuestionsReport(
            questions=questions,
            client_email_draft=email_draft,
            questionnaire_markdown=questionnaire_md
        )

    @classmethod
    def run_full_intelligence(
        cls,
        opportunity_id: str,
        title: str,
        content: str,
        tech_stack_hint: Optional[str] = None,
        raw_budget: Optional[str] = None,
        raw_deadline: Optional[str] = None,
        company: str = "",
        profile_skills: Optional[str] = None,
        profile_rate: float = 0.0,
        freelancer_name: str = "",
        portfolio_case_studies: Optional[List[Dict[str, Any]]] = None,
        llm_response_json: Optional[str] = None
    ) -> OpportunityIntelligence:
        """
        Executes end-to-end intelligence: extraction, scoring, and discovery question formulation.
        """
        requirements = cls.extract_requirements(
            title=title,
            content=content,
            tech_stack_hint=tech_stack_hint,
            llm_response_json=llm_response_json
        )

        scoring = cls.calculate_opportunity_score(
            requirements=requirements,
            raw_budget=raw_budget,
            raw_deadline=raw_deadline,
            profile_skills=profile_skills,
            profile_rate=profile_rate,
            portfolio_case_studies=portfolio_case_studies
        )

        discovery = cls.generate_discovery_questions(
            requirements=requirements,
            scoring=scoring,
            title=title,
            company=company,
            freelancer_name=freelancer_name
        )

        return OpportunityIntelligence(
            opportunity_id=opportunity_id,
            title=title,
            requirements=requirements,
            scoring=scoring,
            discovery=discovery
        )
