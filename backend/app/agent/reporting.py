import re
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from ..schemas.schemas import ClientReportRequest, ClientReportResponse
from ..models.models import Project, ProjectTask

class ClientReportingEngine:
    """
    Automated grounded client communication & status reporting engine.
    Transforms live project metrics, task statuses, and time logs into
    executive updates, milestone sign-off requests, and blocker notifications.
    """

    @classmethod
    def generate_report(
        cls,
        project: Project,
        tasks: List[ProjectTask],
        request: ClientReportRequest,
        client_name: str = "Client",
        freelancer_name: str = "Lead Engineer"
    ) -> ClientReportResponse:
        report_type = request.report_type or "weekly_update"
        effective_client = request.client_name or client_name or "Client"

        # Categorize tasks
        completed_tasks = [t for t in tasks if t.status == "done"]
        in_progress_tasks = [t for t in tasks if t.status in ["in_progress", "review"]]
        upcoming_tasks = [t for t in tasks if t.status == "todo"]

        completed_titles = [f"{t.title} ({t.actual_hours or t.estimated_hours}h)" for t in completed_tasks]
        in_progress_titles = [f"{t.title} (in progress)" for t in in_progress_tasks]
        upcoming_titles = [f"{t.title} (est. {t.estimated_hours}h)" for t in upcoming_tasks[:5]]

        # Detect blockers
        blockers = []
        for t in tasks:
            t_notes = (t.notes or "").lower()
            if t.priority == "urgent":
                blockers.append(f"High Priority Block: {t.title} ({t.notes or 'Urgent attention required'})")
            elif any(w in t_notes for w in ["block", "waiting", "credential", "access", "pending client"]):
                blockers.append(f"{t.title}: {t.notes}")

        if request.custom_notes and ("block" in request.custom_notes.lower() or "wait" in request.custom_notes.lower()):
            blockers.append(f"Developer Note: {request.custom_notes}")

        # Compute hours & financials
        actual_hours = sum(t.actual_hours or 0.0 for t in tasks) if tasks else (project.actual_hours or 0.0)
        est_hours = sum(t.estimated_hours or 0.0 for t in tasks) if tasks else (project.estimated_hours or 0.0)
        hourly_rate = float(project.hourly_rate or 75.0)
        total_budget = float(project.total_budget or (est_hours * hourly_rate))
        budget_burned = round(actual_hours * hourly_rate, 2)
        burn_percent = round((budget_burned / total_budget * 100.0), 1) if total_budget > 0 else 0.0
        now_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

        if report_type == "milestone_signoff":
            report_title = f"Milestone Completion Sign-Off — {project.title}"
            email_subject = f"Milestone Completion & Sign-Off Request: {project.title}"
            exec_summary = (
                f"We have completed all agreed deliverables for the current milestone on {project.title}. "
                f"A total of {len(completed_tasks)} deliverables are verified and ready for client acceptance. "
                f"Total logged effort to date is {actual_hours:.1f} hours (${budget_burned:,.2f} of ${total_budget:,.2f} budget)."
            )
            email_body = (
                f"Hi {effective_client},\n\n"
                f"I am pleased to share that we have completed all deliverables for the current milestone on **{project.title}**!\n\n"
                f"### Completed Deliverables Ready for Review:\n"
                + "\n".join([f"- [x] **{t}**" for t in (completed_titles or ["Core milestone deliverables completed"])])
                + f"\n\n### Budget & Effort Reconciliation:\n"
                f"- **Milestone Effort Logged**: {actual_hours:.1f} hours\n"
                f"- **Budget Burn**: ${budget_burned:,.2f} of ${total_budget:,.2f} total budget ({burn_percent}%)\n\n"
                f"### Next Steps & Sign-Off:\n"
                f"Please review the deliverables above. Once satisfied, kindly reply to this email with **'APPROVED'** "
                f"or let us know if any adjustments are needed. Upon approval, we will immediately initiate the next sprint.\n\n"
                f"Thank you for your ongoing partnership!\n\n"
                f"Best regards,\n"
                f"{freelancer_name}\n"
                f"FreelanceCanvas Project Desk"
            )

        elif report_type == "blocker_alert":
            report_title = f"Action Required: Dependency & Blocker Alert — {project.title}"
            email_subject = f"Action Required: Project Dependency for {project.title}"
            exec_summary = (
                f"Delivery on {project.title} is currently awaiting key client inputs or external credentials. "
                f"Prompt resolution is requested to keep the target launch date on schedule."
            )
            email_body = (
                f"Hi {effective_client},\n\n"
                f"I wanted to flag a quick dependency to keep our delivery timeline on track for **{project.title}**.\n\n"
                f"### Critical Dependencies / Blockers:\n"
                + "\n".join([f"- ⚠️ **{b}**" for b in (blockers or [request.custom_notes or "Pending external API credentials or access approvals"])])
                + f"\n\n### Schedule Impact:\n"
                f"Our development sprint is currently queued on the items above. Providing these inputs within the next 24-48 hours "
                f"will ensure our milestone delivery date remains uninterrupted.\n\n"
                f"Please let me know if you need any assistance getting these over to me!\n\n"
                f"Best regards,\n"
                f"{freelancer_name}\n"
                f"FreelanceCanvas Project Desk"
            )

        else:  # default weekly_update
            report_title = f"Weekly Sprint & Progress Status — {project.title}"
            email_subject = f"Weekly Progress Update: {project.title} ({now_str})"
            exec_summary = (
                f"Weekly progress summary for {project.title}. "
                f"Completed {len(completed_tasks)} tasks, {len(in_progress_tasks)} in progress, "
                f"and overall progress is at {project.progress_percent if hasattr(project, 'progress_percent') else 0}%."
            )
            email_body = (
                f"Hi {effective_client},\n\n"
                f"Here is your weekly progress summary for **{project.title}** as of {now_str}.\n\n"
                f"### Key Accomplishments This Sprint:\n"
                + "\n".join([f"- ✅ {t}" for t in (completed_titles or ["Initial project setup and architecture"])])
                + f"\n\n### In Progress & Up Next:\n"
                + "\n".join([f"- ⏳ {t}" for t in (in_progress_titles or upcoming_titles or ["Next sprint deliverables"])])
                + f"\n\n### Budget & Hours Health:\n"
                f"- **Hours Logged**: {actual_hours:.1f}h / {est_hours:.1f}h planned\n"
                f"- **Budget Utilized**: ${budget_burned:,.2f} of ${total_budget:,.2f} ({burn_percent}%)\n\n"
                + (f"### Blockers / Action Items:\n" + "\n".join([f"- ⚠️ {b}" for b in blockers]) + "\n\n" if blockers else "")
                + f"Everything is progressing smoothly. Please feel free to reach out with any questions!\n\n"
                f"Best regards,\n"
                f"{freelancer_name}\n"
                f"FreelanceCanvas Project Desk"
            )

        return ClientReportResponse(
            project_id=project.id,
            project_title=project.title,
            report_type=report_type,
            report_title=report_title,
            executive_summary=exec_summary,
            completed_deliverables=completed_titles,
            in_progress_deliverables=in_progress_titles,
            upcoming_deliverables=upcoming_titles,
            blockers=blockers,
            total_estimated_hours=est_hours,
            total_actual_hours=actual_hours,
            total_budget=total_budget,
            budget_burned=budget_burned,
            budget_burn_percent=burn_percent,
            email_subject=email_subject,
            email_body_markdown=email_body,
            generated_at=now_str
        )

    @classmethod
    def generate_html_report(
        cls,
        report: ClientReportResponse,
        client_name: str = "Client",
        freelancer_name: str = "Lead Engineer"
    ) -> str:
        """
        Generates standalone, styled, print-ready HTML status report for clients.
        """
        completed_html = "".join([f"<li>✅ <strong>{item}</strong></li>" for item in report.completed_deliverables]) or "<li>No deliverables finalized yet.</li>"
        in_prog_html = "".join([f"<li>⏳ {item}</li>" for item in report.in_progress_deliverables]) or "<li>No active tasks in progress.</li>"
        blockers_html = "".join([f"<li style='color: #DC2626;'>⚠️ {b}</li>" for b in report.blockers])

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{report.report_title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            background-color: #F8FAFC;
            margin: 0;
            padding: 30px 20px;
        }}
        .report-sheet {{
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            padding: 40px;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }}
        .header {{
            border-bottom: 2px solid #0F172A;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }}
        .header h1 {{
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            color: #0F172A;
        }}
        .header .meta {{
            font-size: 13px;
            color: #64748B;
            text-align: right;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            background: #F1F5F9;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
        }}
        .metric-card {{
            text-align: center;
        }}
        .metric-card .val {{
            font-size: 20px;
            font-weight: 800;
            color: #0F172A;
        }}
        .metric-card .lbl {{
            font-size: 11px;
            font-weight: 700;
            color: #64748B;
            text-transform: uppercase;
        }}
        .section-title {{
            font-size: 16px;
            font-weight: 800;
            border-bottom: 1.5px solid #E2E8F0;
            padding-bottom: 6px;
            margin-top: 24px;
            color: #1E293B;
        }}
        ul {{
            padding-left: 20px;
            font-size: 14px;
            line-height: 1.6;
        }}
        .signature-box {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1.5px dashed #CBD5E1;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #475569;
        }}
        @media print {{
            body {{ background: transparent; padding: 0; }}
            .report-sheet {{ border: none; box-shadow: none; padding: 0; }}
        }}
    </style>
</head>
<body>
    <div class="report-sheet">
        <div class="header">
            <div>
                <h1>{report.report_title}</h1>
                <div style="font-size: 14px; color: #475569; margin-top: 4px;">Project: {report.project_title}</div>
            </div>
            <div class="meta">
                <div>Date: {report.generated_at}</div>
                <div>Client: {client_name}</div>
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="val">{report.total_actual_hours:.1f}h / {report.total_estimated_hours:.1f}h</div>
                <div class="lbl">Hours Logged</div>
            </div>
            <div class="metric-card">
                <div class="val">${report.budget_burned:,.2f}</div>
                <div class="lbl">Budget Utilized ({report.budget_burn_percent}%)</div>
            </div>
            <div class="metric-card">
                <div class="val">${report.total_budget:,.2f}</div>
                <div class="lbl">Total Budget</div>
            </div>
        </div>

        <div class="section-title">Executive Summary</div>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">{report.executive_summary}</p>

        <div class="section-title">Completed Deliverables</div>
        <ul>{completed_html}</ul>

        <div class="section-title">In Progress & Upcoming</div>
        <ul>{in_prog_html}</ul>

        {f'''
        <div class="section-title" style="color: #DC2626;">Blockers & Dependencies</div>
        <ul>{blockers_html}</ul>
        ''' if report.blockers else ''}

        <div class="signature-box">
            <div>
                <strong>Prepared by:</strong><br>
                {freelancer_name}<br>
                FreelanceCanvas Project Desk
            </div>
            <div>
                <strong>Client Sign-off:</strong><br>
                Representative for {client_name}<br>
                Signature: ______________________ Date: _________
            </div>
        </div>
    </div>
    <script>
        if (window.location.search.includes('print=true')) {{
            window.print();
        }}
    </script>
</body>
</html>"""
