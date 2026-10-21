import uuid
import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from ..schemas.schemas import (
    ExtractedRequirements,
    MilestoneItem,
    RiskAssessmentItem,
    PaymentMilestone,
    PricingTierFixed,
    PricingTierTimeMaterials,
    PricingTierRetainer,
    PricingTiersSummary,
    ProjectEstimation
)

class EstimationEngine:
    """
    Scope, Estimation & Pricing Engine for FreelanceCanvas.
    Provides deterministic, explainable Work Breakdown Structure (WBS),
    multi-tier mathematical pricing models, and contractual risk registers.
    """

    DEFAULT_HOURLY_RATE = 75.0
    MIN_PROJECT_FLOOR = 1200.0  # Professional freelance engagement minimum

    @classmethod
    def generate_estimation(
        cls,
        opportunity_id: str,
        requirements: ExtractedRequirements,
        hourly_rate: Optional[float] = None,
        currency: str = "USD",
        availability_hours_per_week: float = 40.0,
        contingency_override: Optional[float] = None
    ) -> ProjectEstimation:
        """
        Generates a structured Work Breakdown Structure and pricing models
        derived deterministically from extracted opportunity requirements.
        """
        rate = float(hourly_rate) if (hourly_rate is not None and hourly_rate > 0) else cls.DEFAULT_HOURLY_RATE
        weekly_capacity = max(10.0, float(availability_hours_per_week or 30.0))

        # Determine contingency buffer based on scope clarity & risks
        if contingency_override is not None:
            contingency_percent = float(contingency_override)
        else:
            clarity = (getattr(requirements, "scope_clarity", None) or "Medium").lower()
            unknowns_list = getattr(requirements, "unknowns", [])
            if clarity == "low" or len(unknowns_list) >= 3:
                contingency_percent = 25.0
            elif clarity == "high" and len(unknowns_list) == 0:
                contingency_percent = 10.0
            else:
                contingency_percent = 15.0

        # Build dynamic milestones based on extracted deliverables & stack
        milestones = cls._generate_wbs_milestones(requirements, rate, contingency_percent, weekly_capacity)
        total_hours = sum(m.est_hours for m in milestones)
        total_duration_weeks = max(1.0, math.ceil(total_hours / (weekly_capacity * 0.75)))  # 75% focus efficiency

        # Build multi-model pricing tiers
        pricing_tiers = cls._compute_pricing_tiers(
            milestones=milestones,
            rate=rate,
            contingency_percent=contingency_percent,
            weekly_capacity=weekly_capacity,
            total_duration_weeks=total_duration_weeks,
            currency=currency,
            scope_clarity=requirements.scope_clarity or "Medium"
        )

        # Build Risk & Contractual Assumption Register
        risks = cls._generate_risk_register(requirements)
        assumptions = cls._generate_contractual_assumptions(requirements)

        return ProjectEstimation(
            opportunity_id=opportunity_id,
            currency=currency,
            hourly_rate=rate,
            contingency_percent=contingency_percent,
            total_hours=total_hours,
            estimated_duration_weeks=float(total_duration_weeks),
            pricing_model=pricing_tiers.recommended_model,
            milestones=milestones,
            pricing_tiers=pricing_tiers,
            risks=risks,
            assumptions=assumptions,
            generated_at=datetime.now(timezone.utc)
        )

    @classmethod
    def recalculate_estimation(
        cls,
        current_estimation: ProjectEstimation,
        new_hourly_rate: Optional[float] = None,
        new_contingency_percent: Optional[float] = None,
        new_pricing_model: Optional[str] = None,
        custom_milestones: Optional[List[MilestoneItem]] = None,
        custom_risks: Optional[List[RiskAssessmentItem]] = None,
        custom_assumptions: Optional[List[str]] = None,
        weekly_capacity: float = 30.0
    ) -> ProjectEstimation:
        """
        Deterministically recalculates totals and pricing tiers when rate, buffer,
        or milestone hours are edited by the user.
        """
        rate = float(new_hourly_rate) if (new_hourly_rate is not None and new_hourly_rate > 0) else current_estimation.hourly_rate
        contingency = float(new_contingency_percent) if new_contingency_percent is not None else current_estimation.contingency_percent
        model = new_pricing_model or current_estimation.pricing_model

        source_milestones = custom_milestones if custom_milestones is not None else current_estimation.milestones
        recalculated_milestones: List[MilestoneItem] = []

        for m in source_milestones:
            m_hours = max(0.5, float(m.est_hours))
            m_contingency = contingency if new_contingency_percent is not None else m.contingency_percent
            subtotal = round(m_hours * rate, 2)
            contingency_cost = round(subtotal * (m_contingency / 100.0), 2)
            total_cost = round(subtotal + contingency_cost, 2)
            dur_weeks = max(0.5, round(m_hours / (weekly_capacity * 0.75), 1))

            recalculated_milestones.append(MilestoneItem(
                id=m.id,
                phase=m.phase,
                title=m.title,
                description=m.description,
                deliverables=m.deliverables,
                est_hours=m_hours,
                rate=rate,
                contingency_percent=m_contingency,
                subtotal=subtotal,
                contingency_cost=contingency_cost,
                total_cost=total_cost,
                duration_weeks=dur_weeks
            ))

        total_hours = sum(m.est_hours for m in recalculated_milestones)
        total_duration_weeks = max(1.0, math.ceil(total_hours / (weekly_capacity * 0.75)))

        pricing_tiers = cls._compute_pricing_tiers(
            milestones=recalculated_milestones,
            rate=rate,
            contingency_percent=contingency,
            weekly_capacity=weekly_capacity,
            total_duration_weeks=total_duration_weeks,
            currency=current_estimation.currency,
            scope_clarity="Medium"
        )
        pricing_tiers.recommended_model = model

        risks = custom_risks if custom_risks is not None else current_estimation.risks
        assumptions = custom_assumptions if custom_assumptions is not None else current_estimation.assumptions

        return ProjectEstimation(
            opportunity_id=current_estimation.opportunity_id,
            currency=current_estimation.currency,
            hourly_rate=rate,
            contingency_percent=contingency,
            total_hours=total_hours,
            estimated_duration_weeks=float(total_duration_weeks),
            pricing_model=model,
            milestones=recalculated_milestones,
            pricing_tiers=pricing_tiers,
            risks=risks,
            assumptions=assumptions,
            generated_at=datetime.now(timezone.utc)
        )

    # -------------------------------------------------------------------------
    # Internal Breakdown & Tier Calculation Helpers
    # -------------------------------------------------------------------------

    @classmethod
    def _generate_wbs_milestones(
        cls,
        req: ExtractedRequirements,
        rate: float,
        contingency: float,
        weekly_capacity: float
    ) -> List[MilestoneItem]:
        milestones: List[MilestoneItem] = []

        # Phase 1: Architecture, Scaffolding & Setup
        tech_list = getattr(req, "detected_tech_stack", [])
        m1_hours = 14.0
        if len(tech_list) > 3 or any("db" in t.lower() or "sql" in t.lower() for t in tech_list):
            m1_hours += 6.0
        m1_deliverables = [
            "Project repository scaffolding & environment configuration",
            f"Core data models & architecture setup ({', '.join(tech_list[:3]) or 'Standard Stack'})",
            "Authentication, baseline security & developer documentation"
        ]
        milestones.append(cls._build_milestone(
            id=f"m_{uuid.uuid4().hex[:6]}",
            phase="Phase 1",
            title="Architecture, Scaffolding & Core Setup",
            description="Establish the technical foundation, database schema, CI/CD, and security baseline.",
            deliverables=m1_deliverables,
            hours=m1_hours,
            rate=rate,
            contingency=contingency,
            weekly_capacity=weekly_capacity
        ))

        # Phase 2: Core Feature Implementation
        # Dynamically scale by detected deliverables
        deliverables_slice = req.deliverables[:4] if req.deliverables else [
            "Primary domain workflows and user-facing views",
            "Business logic and persistence operations",
            "CRUD endpoints and validated inputs"
        ]
        m2_hours = max(24.0, float(len(deliverables_slice) * 8.0))
        milestones.append(cls._build_milestone(
            id=f"m_{uuid.uuid4().hex[:6]}",
            phase="Phase 2",
            title="Core Domain Implementation & Business Logic",
            description="Implementation of core product workflows, API endpoints, and critical user journeys.",
            deliverables=deliverables_slice,
            hours=m2_hours,
            rate=rate,
            contingency=contingency,
            weekly_capacity=weekly_capacity
        ))

        # Phase 3: Integrations & Secondary Capabilities
        m3_deliverables = []
        if len(req.deliverables) > 4:
            m3_deliverables.extend(req.deliverables[4:8])
        else:
            m3_deliverables.extend([
                "Third-party API integrations & webhook handlers",
                "Data validation, error logging & error recovery flows",
                "Administrative controls and configuration management"
            ])
        m3_hours = max(16.0, float(len(m3_deliverables) * 6.0))
        milestones.append(cls._build_milestone(
            id=f"m_{uuid.uuid4().hex[:6]}",
            phase="Phase 3",
            title="Integrations, APIs & Workflow Polishing",
            description="External service integrations, automated notifications, background jobs, and edge cases.",
            deliverables=m3_deliverables,
            hours=m3_hours,
            rate=rate,
            contingency=contingency,
            weekly_capacity=weekly_capacity
        ))

        # Phase 4: Quality Assurance, Hardening & Deployment
        m4_hours = 12.0
        m4_deliverables = [
            "Automated test coverage for core paths & regression suite",
            "Staging environment walkthrough and client acceptance testing",
            "Production deployment, monitoring setup & operational handover"
        ]
        milestones.append(cls._build_milestone(
            id=f"m_{uuid.uuid4().hex[:6]}",
            phase="Phase 4",
            title="Quality Assurance, Hardening & Production Launch",
            description="End-to-end verification, performance tuning, client sign-off, and production go-live.",
            deliverables=m4_deliverables,
            hours=m4_hours,
            rate=rate,
            contingency=contingency,
            weekly_capacity=weekly_capacity
        ))

        return milestones

    @classmethod
    def _build_milestone(
        cls,
        id: str,
        phase: str,
        title: str,
        description: str,
        deliverables: List[str],
        hours: float,
        rate: float,
        contingency: float,
        weekly_capacity: float
    ) -> MilestoneItem:
        subtotal = round(hours * rate, 2)
        contingency_cost = round(subtotal * (contingency / 100.0), 2)
        total_cost = round(subtotal + contingency_cost, 2)
        dur_weeks = max(0.5, round(hours / (weekly_capacity * 0.75), 1))

        return MilestoneItem(
            id=id,
            phase=phase,
            title=title,
            description=description,
            deliverables=deliverables,
            est_hours=hours,
            rate=rate,
            contingency_percent=contingency,
            subtotal=subtotal,
            contingency_cost=contingency_cost,
            total_cost=total_cost,
            duration_weeks=dur_weeks
        )

    @classmethod
    def _compute_pricing_tiers(
        cls,
        milestones: List[MilestoneItem],
        rate: float,
        contingency_percent: float,
        weekly_capacity: float,
        total_duration_weeks: int,
        currency: str,
        scope_clarity: str
    ) -> PricingTiersSummary:
        raw_subtotal = round(sum(m.subtotal for m in milestones), 2)
        contingency_cost = round(raw_subtotal * (contingency_percent / 100.0), 2)
        calculated_total = round(raw_subtotal + contingency_cost, 2)
        final_fixed_total = max(cls.MIN_PROJECT_FLOOR, calculated_total)

        total_hours = sum(m.est_hours for m in milestones)
        effective_hourly = round(final_fixed_total / total_hours, 2) if total_hours > 0 else rate

        # Fixed Price Payment Schedule (Kickoff 30%, Intermediate 40%, Final Delivery 30%)
        deposit = round(final_fixed_total * 0.30, 2)
        interim = round(final_fixed_total * 0.40, 2)
        final_payment = round(final_fixed_total - (deposit + interim), 2)

        payment_schedule = [
            PaymentMilestone(
                name="Project Kickoff Deposit",
                percentage=30.0,
                amount=deposit,
                trigger="Due upon contract signature prior to commencement of Phase 1."
            ),
            PaymentMilestone(
                name="Core Implementation Review",
                percentage=40.0,
                amount=interim,
                trigger="Due upon demonstration and staging deployment of Phase 2 deliverables."
            ),
            PaymentMilestone(
                name="Final Acceptance & Launch",
                percentage=30.0,
                amount=final_payment,
                trigger="Due upon client sign-off, final code handover, and production deployment."
            )
        ]

        fixed_tier = PricingTierFixed(
            subtotal=raw_subtotal,
            contingency_buffer_percent=contingency_percent,
            contingency_buffer_cost=contingency_cost,
            total_price=final_fixed_total,
            effective_hourly_rate=effective_hourly,
            min_project_floor=cls.MIN_PROJECT_FLOOR,
            payment_schedule=payment_schedule
        )

        # Time & Materials Tier (-15% to +25% range)
        hours_min = round(max(10.0, total_hours * 0.85), 1)
        hours_max = round(total_hours * 1.25, 1)
        cost_min = round(hours_min * rate, 2)
        cost_max = round(hours_max * rate, 2)
        not_to_exceed = round(cost_max * (1 + contingency_percent / 100.0), 2)

        tm_tier = PricingTierTimeMaterials(
            hourly_rate=rate,
            estimated_hours_min=hours_min,
            estimated_hours_max=hours_max,
            estimated_cost_min=cost_min,
            estimated_cost_max=cost_max,
            not_to_exceed_cap=not_to_exceed,
            billing_cycle="Weekly invoice against verified timesheet hours"
        )

        # Retainer Tier
        avg_weekly_hours = round(total_hours / max(1, total_duration_weeks), 1)
        weekly_rate = round(avg_weekly_hours * rate, 2)
        monthly_rate = round(weekly_rate * 4.2, 2)

        retainer_tier = PricingTierRetainer(
            estimated_duration_weeks=float(total_duration_weeks),
            weekly_rate=weekly_rate,
            monthly_rate=monthly_rate,
            committed_hours_per_week=avg_weekly_hours,
            includes_support_maintenance=True
        )

        # Recommend model based on scope clarity
        clarity_norm = (scope_clarity or "Medium").lower()
        if clarity_norm == "low":
            recommended = "time_and_materials"
        elif total_duration_weeks >= 8:
            recommended = "retainer"
        else:
            recommended = "fixed_price"

        return PricingTiersSummary(
            fixed_price=fixed_tier,
            time_and_materials=tm_tier,
            retainer=retainer_tier,
            recommended_model=recommended,
            currency=currency
        )

    @classmethod
    def _generate_risk_register(cls, req: ExtractedRequirements) -> List[RiskAssessmentItem]:
        risks: List[RiskAssessmentItem] = []

        # Convert detected delivery risks
        for r in req.delivery_risks:
            risks.append(RiskAssessmentItem(
                id=f"r_{uuid.uuid4().hex[:6]}",
                category="Technical & Delivery",
                risk=r.risk,
                severity=r.severity.capitalize(),
                probability="Medium",
                impact="Potential delay in implementation schedule without early resolution.",
                mitigation=r.mitigation,
                contractual_assumption="Client will participate in weekly architecture reviews."
            ))

        # Scope uncertainty risk
        unknowns_items = getattr(req, "unknowns", [])
        if unknowns_items:
            risks.append(RiskAssessmentItem(
                id=f"r_{uuid.uuid4().hex[:6]}",
                category="Scope Uncertainty",
                risk=f"Unclarified requirements in {len(unknowns_items)} scope areas: {', '.join(unknowns_items[:2])}.",
                severity="High" if len(unknowns_items) >= 3 else "Medium",
                probability="High",
                impact="Risk of milestone re-work or revised scope boundaries.",
                mitigation="Conduct discovery interview before Phase 1 freeze to lock technical specifications.",
                contractual_assumption="Detailed discovery documentation will serve as the single source of truth for scope completion."
            ))

        # Standard client feedback risk
        risks.append(RiskAssessmentItem(
            id=f"r_{uuid.uuid4().hex[:6]}",
            category="Client Dependency",
            risk="Turnaround delays in milestone review, acceptance, or third-party credentials.",
            severity="Medium",
            probability="Medium",
            impact="Schedule compression or blocked developer sprint.",
            mitigation="Client designates a single product decision-maker with 48-hour response SLA.",
            contractual_assumption="Milestone acceptance will be deemed approved if no feedback is provided within 5 business days."
        ))

        return risks

    @classmethod
    def _generate_contractual_assumptions(cls, req: ExtractedRequirements) -> List[str]:
        return [
            "All third-party accounts (APIs, cloud hosting, payments, domains) will be provisioned by the client prior to Milestone 2.",
            "Client provides a single primary technical or business contact authorized to approve milestones.",
            "Each milestone includes up to two (2) consolidated rounds of feedback and revisions within scope.",
            "Features or requests outside the approved Work Breakdown Structure will be quoted under a separate Change Order.",
            "Milestone deliverables will be tested and verified against modern evergreen browsers and standard runtime environments."
        ]
