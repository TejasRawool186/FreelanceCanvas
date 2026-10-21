import json
import random
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models.models import Invoice, Project, Client, ProjectTask, FreelancerProfile
from ..schemas.schemas import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceLineItem,
    FinancialHealthMetrics
)

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

def _format_invoice_response(inv: Invoice, client_name: str = "", project_title: str = "") -> InvoiceResponse:
    line_items_data = []
    if inv.line_items_json:
        try:
            raw = json.loads(inv.line_items_json)
            line_items_data = [InvoiceLineItem(**item) for item in raw]
        except Exception:
            pass

    return InvoiceResponse(
        id=inv.id,
        invoice_number=inv.invoice_number,
        client_id=inv.client_id,
        client_name=client_name or (inv.client.name if inv.client else None),
        project_id=inv.project_id,
        project_title=project_title or (inv.project.title if inv.project else None),
        title=inv.title,
        status=inv.status or "draft",
        billing_model=inv.billing_model or "fixed",
        issue_date=inv.issue_date,
        due_date=inv.due_date,
        paid_at=inv.paid_at,
        currency=inv.currency or "USD",
        subtotal=float(inv.subtotal or 0.0),
        tax_rate=float(inv.tax_rate or 0.0),
        tax_amount=float(inv.tax_amount or 0.0),
        total_amount=float(inv.total_amount or 0.0),
        line_items=line_items_data,
        notes=inv.notes,
        payment_terms=inv.payment_terms or "Net 15",
        payment_instructions=inv.payment_instructions,
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )

async def _generate_unique_invoice_number(db: AsyncSession) -> str:
    year = datetime.now(timezone.utc).year
    res = await db.execute(select(func.count(Invoice.id)))
    count = (res.scalar() or 0) + 1
    return f"INV-{year}-{count:03d}"

@router.get("", response_model=List[InvoiceResponse])
async def list_invoices(
    status: Optional[str] = None,
    project_id: Optional[str] = None,
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project)).order_by(Invoice.created_at.desc())
    if status:
        query = query.where(Invoice.status == status)
    if project_id:
        query = query.where(Invoice.project_id == project_id)
    if client_id:
        query = query.where(Invoice.client_id == client_id)

    res = await db.execute(query)
    invoices = res.scalars().all()
    return [_format_invoice_response(inv) for inv in invoices]

@router.get("/financial-health", response_model=FinancialHealthMetrics)
async def get_financial_health(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project)))
    all_invoices = res.scalars().all()

    total_invoiced = 0.0
    total_collected = 0.0
    outstanding_receivables = 0.0
    overdue_amount = 0.0
    draft_invoices_amount = 0.0

    for inv in all_invoices:
        amt = float(inv.total_amount or 0.0)
        s = (inv.status or "draft").lower()
        if s == "paid":
            total_collected += amt
            total_invoiced += amt
        elif s == "issued":
            outstanding_receivables += amt
            total_invoiced += amt
        elif s == "overdue":
            overdue_amount += amt
            outstanding_receivables += amt
            total_invoiced += amt
        elif s == "draft":
            draft_invoices_amount += amt

    # Active projects count
    p_res = await db.execute(select(func.count(Project.id)).where(Project.status == "active"))
    active_projects_count = p_res.scalar() or 0

    # Total hours logged across all tasks
    t_res = await db.execute(select(func.sum(ProjectTask.actual_hours)))
    total_hours_logged = float(t_res.scalar() or 0.0)

    avg_realized_rate = round(total_collected / total_hours_logged, 2) if total_hours_logged > 0 and total_collected > 0 else 0.0

    recent_sorted = sorted(all_invoices, key=lambda x: x.created_at, reverse=True)[:5]
    recent_responses = [_format_invoice_response(inv) for inv in recent_sorted]

    return FinancialHealthMetrics(
        total_invoiced=round(total_invoiced, 2),
        total_collected=round(total_collected, 2),
        outstanding_receivables=round(outstanding_receivables, 2),
        overdue_amount=round(overdue_amount, 2),
        draft_invoices_amount=round(draft_invoices_amount, 2),
        active_projects_count=active_projects_count,
        total_hours_logged=round(total_hours_logged, 1),
        average_realized_hourly_rate=avg_realized_rate,
        currency="USD",
        recent_invoices=recent_responses
    )

@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    inv_number = payload.invoice_number or await _generate_unique_invoice_number(db)
    
    # Check uniqueness
    existing = await db.execute(select(Invoice).where(Invoice.invoice_number == inv_number))
    if existing.scalar_one_or_none():
        inv_number = f"{inv_number}-{random.randint(10, 99)}"

    client_id = payload.client_id
    if not client_id and payload.client_name:
        new_client = Client(name=payload.client_name)
        db.add(new_client)
        await db.flush()
        client_id = new_client.id

    project_id = payload.project_id
    line_items: List[InvoiceLineItem] = list(payload.line_items or [])
    billing_model = payload.billing_model or "fixed"

    project: Optional[Project] = None
    if project_id:
        p_res = await db.execute(
            select(Project).options(selectinload(Project.tasks)).where(Project.id == project_id)
        )
        project = p_res.scalar_one_or_none()
        if project:
            if not client_id:
                client_id = project.client_id
            billing_model = project.pricing_model or billing_model

            # Auto-generate from specific milestone
            if payload.generate_from_milestone_id and project.milestones_baseline_json:
                try:
                    milestones = json.loads(project.milestones_baseline_json)
                    target_m = next((m for m in milestones if m.get("id") == payload.generate_from_milestone_id), None)
                    if target_m:
                        cost = float(target_m.get("cost") or target_m.get("total_cost") or 2000.0)
                        title = target_m.get("title") or target_m.get("milestone_name") or "Project Milestone"
                        delivs = target_m.get("deliverables") or []
                        desc = f"{title}" + (f" ({', '.join(delivs)})" if delivs else "")
                        line_items.append(InvoiceLineItem(
                            description=desc,
                            quantity=1.0,
                            unit_price=cost,
                            amount=cost
                        ))
                except Exception:
                    pass

            # Auto-generate from unbilled completed tasks
            elif payload.generate_from_unbilled_hours and project.tasks:
                hourly_rate = float(project.hourly_rate or 75.0)
                for t in project.tasks:
                    if t.status == "done" and (t.actual_hours or 0) > 0:
                        hrs = float(t.actual_hours)
                        amt = round(hrs * hourly_rate, 2)
                        line_items.append(InvoiceLineItem(
                            description=f"{t.title} ({hrs} hrs @ ${hourly_rate}/hr)",
                            quantity=hrs,
                            unit_price=hourly_rate,
                            amount=amt
                        ))

    # Calculate financial totals
    subtotal = sum(item.amount or (item.quantity * item.unit_price) for item in line_items)
    tax_rate = float(payload.tax_rate or 0.0)
    tax_amount = round(subtotal * tax_rate, 2)
    total_amount = round(subtotal + tax_amount, 2)

    # Defaults for dates
    now_utc = datetime.now(timezone.utc)
    issue_date = payload.issue_date or now_utc.strftime("%Y-%m-%d")
    due_date = payload.due_date or now_utc.strftime("%Y-%m-%d")

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    payment_instructions = payload.payment_instructions or (
        f"Bank Transfer (ACH / Wire / SEPA):\n"
        f"Account Name: {profile.full_name if profile and profile.full_name else 'Freelance Service Provider'}\n"
        f"Bank: Mercury / Silicon Valley Bank\n"
        f"Account Routing: 123456789 | Account: 987654321\n"
        f"Payment Terms: {payload.payment_terms or 'Net 15'}. Thank you for your business!"
    )

    new_invoice = Invoice(
        invoice_number=inv_number,
        client_id=client_id,
        project_id=project_id,
        title=payload.title,
        status="draft",
        billing_model=billing_model,
        issue_date=issue_date,
        due_date=due_date,
        currency=payload.currency or "USD",
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        total_amount=total_amount,
        line_items_json=json.dumps([item.model_dump() for item in line_items]),
        notes=payload.notes,
        payment_terms=payload.payment_terms or "Net 15",
        payment_instructions=payment_instructions,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)

    # Reload with relationships
    refreshed = await db.execute(
        select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project)).where(Invoice.id == new_invoice.id)
    )
    full_inv = refreshed.scalar_one()
    return _format_invoice_response(full_inv)

@router.get("/{id}", response_model=InvoiceResponse)
async def get_invoice(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project)).where(Invoice.id == id)
    )
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Invoice '{id}' not found.")
    return _format_invoice_response(inv)

@router.put("/{id}", response_model=InvoiceResponse)
async def update_invoice(id: str, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project)).where(Invoice.id == id)
    )
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Invoice '{id}' not found.")

    if payload.title is not None:
        inv.title = payload.title
    if payload.status is not None:
        valid_statuses = {"draft", "issued", "paid", "overdue", "cancelled"}
        if payload.status not in valid_statuses:
            raise HTTPException(status_code=422, detail=f"Invalid invoice status. Must be one of {valid_statuses}")
        inv.status = payload.status
        if payload.status == "paid" and not inv.paid_at:
            inv.paid_at = datetime.utcnow()
    if payload.due_date is not None:
        inv.due_date = payload.due_date
    if payload.paid_at is not None:
        inv.paid_at = payload.paid_at
    if payload.notes is not None:
        inv.notes = payload.notes
    if payload.payment_instructions is not None:
        inv.payment_instructions = payload.payment_instructions
    if payload.line_items is not None:
        inv.line_items_json = json.dumps([item.model_dump() for item in payload.line_items])
        subtotal = sum(item.amount or (item.quantity * item.unit_price) for item in payload.line_items)
        inv.subtotal = subtotal
        inv.tax_amount = round(subtotal * (inv.tax_rate or 0.0), 2)
        inv.total_amount = round(inv.subtotal + inv.tax_amount, 2)

    inv.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(inv)
    return _format_invoice_response(inv)

@router.delete("/{id}")
async def delete_invoice(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Invoice).where(Invoice.id == id))
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Invoice '{id}' not found.")
    await db.delete(inv)
    await db.commit()
    return {"message": f"Invoice '{id}' deleted."}

@router.get("/{id}/export-html", response_class=HTMLResponse)
async def export_invoice_html(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project)).where(Invoice.id == id)
    )
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Invoice '{id}' not found.")

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    freelancer_name = profile.full_name if profile and profile.full_name else "Independent Consultant"
    freelancer_title = profile.title if profile and profile.title else "Full-Stack Engineer"

    client_name = inv.client.name if inv.client else "Valued Client"
    client_company = inv.client.company if inv.client and inv.client.company else ""

    line_items = []
    if inv.line_items_json:
        try:
            line_items = json.loads(inv.line_items_json)
        except Exception:
            pass

    table_rows = "".join([
        f"""<tr>
            <td style="padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B;">
                <strong>{item.get('description', '')}</strong>
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: center; color: #64748B;">
                {item.get('quantity', 1.0)}
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: right; color: #64748B;">
                ${float(item.get('unit_price', 0.0)):,.2f}
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: right; font-weight: 700; color: #0F172A;">
                ${float(item.get('amount', 0.0)):,.2f}
            </td>
        </tr>"""
        for item in line_items
    ])

    status_badge_color = (
        "#166534; background: #DCFCE7;" if inv.status == "paid" else
        "#1E40AF; background: #DBEAFE;" if inv.status == "issued" else
        "#991B1B; background: #FEE2E2;" if inv.status == "overdue" else
        "#854D0E; background: #FEF9C3;"
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {inv.invoice_number} — {freelancer_name}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            background-color: #F8FAFC;
            margin: 0;
            padding: 30px 20px;
        }}
        .invoice-box {{
            max-width: 820px;
            margin: 0 auto;
            background: #FFFFFF;
            padding: 44px;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 24px;
            border-bottom: 2px solid #0F172A;
            margin-bottom: 28px;
        }}
        .brand-title {{
            font-size: 26px;
            font-weight: 900;
            color: #0F172A;
            margin: 0;
        }}
        .status-pill {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 6px;
        }}
        .parties-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 30px;
        }}
        .party-col h4 {{
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 800;
            color: #64748B;
            margin: 0 0 6px 0;
            letter-spacing: 0.05em;
        }}
        .party-col .name {{
            font-size: 15px;
            font-weight: 800;
            color: #0F172A;
        }}
        .meta-dates {{
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px 18px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 30px;
            font-size: 13px;
        }}
        .meta-dates .lbl {{
            color: #64748B;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }}
        .meta-dates .val {{
            font-weight: 800;
            color: #0F172A;
            margin-top: 2px;
        }}
        table.items-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }}
        table.items-table th {{
            background: #F1F5F9;
            padding: 10px 14px;
            font-size: 11px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #CBD5E1;
        }}
        .totals-section {{
            display: flex;
            justify-content: flex-end;
            margin-bottom: 36px;
        }}
        .totals-table {{
            width: 280px;
            border-collapse: collapse;
            font-size: 14px;
        }}
        .totals-table td {{
            padding: 6px 0;
        }}
        .totals-table tr.total-row td {{
            font-size: 18px;
            font-weight: 900;
            color: #0F172A;
            border-top: 2px solid #0F172A;
            padding-top: 10px;
        }}
        .instructions-box {{
            background: #F8FAFC;
            border: 1px dashed #CBD5E1;
            border-radius: 8px;
            padding: 16px 20px;
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
        }}
        @media print {{
            body {{ background: transparent; padding: 0; }}
            .invoice-box {{ border: none; box-shadow: none; padding: 0; }}
        }}
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div>
                <h1 class="brand-title">INVOICE</h1>
                <div style="font-size: 13px; color: #64748B; margin-top: 4px;">Invoice #{inv.invoice_number}</div>
                <div class="status-pill" style="color: {status_badge_color}">
                    Status: {(inv.status or 'draft').upper()}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 16px; color: #0F172A;">{freelancer_name}</div>
                <div style="font-size: 13px; color: #64748B;">{freelancer_title}</div>
                <div style="font-size: 12px; color: #94A3B8; margin-top: 2px;">FreelanceCanvas Verified Service Provider</div>
            </div>
        </div>

        <div class="parties-grid">
            <div class="party-col">
                <h4>Billed To</h4>
                <div class="name">{client_name}</div>
                {f'<div style="font-size: 13px; color: #475569;">{client_company}</div>' if client_company else ''}
                {f'<div style="font-size: 12px; color: #64748B; margin-top: 4px;">Project: {inv.project.title}</div>' if inv.project else ''}
            </div>
            <div class="party-col" style="text-align: right;">
                <h4>Service Provider</h4>
                <div class="name">{freelancer_name}</div>
                <div style="font-size: 12px; color: #64748B;">Independent Software Engineering & Consulting</div>
            </div>
        </div>

        <div class="meta-dates">
            <div>
                <div class="lbl">Issue Date</div>
                <div class="val">{inv.issue_date}</div>
            </div>
            <div>
                <div class="lbl">Payment Terms</div>
                <div class="val">{inv.payment_terms}</div>
            </div>
            <div>
                <div class="lbl">Due Date</div>
                <div class="val">{inv.due_date}</div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 55%; text-align: left;">Item Description</th>
                    <th style="width: 15%; text-align: center;">Qty / Hrs</th>
                    <th style="width: 15%; text-align: right;">Rate</th>
                    <th style="width: 15%; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                {table_rows or '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94A3B8;">No line items</td></tr>'}
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td style="color: #64748B;">Subtotal:</td>
                    <td style="text-align: right; font-weight: 700;">${inv.subtotal:,.2f}</td>
                </tr>
                {f'''<tr>
                    <td style="color: #64748B;">Tax ({inv.tax_rate * 100:.1f}%):</td>
                    <td style="text-align: right; font-weight: 700;">${inv.tax_amount:,.2f}</td>
                </tr>''' if inv.tax_amount > 0 else ''}
                <tr class="total-row">
                    <td>Total Due:</td>
                    <td style="text-align: right;">${inv.total_amount:,.2f} {inv.currency}</td>
                </tr>
            </table>
        </div>

        <div class="instructions-box">
            <strong style="color: #0F172A; text-transform: uppercase; font-size: 11px;">Payment Remittance & Instructions:</strong><br>
            <div style="white-space: pre-wrap; margin-top: 4px;">{inv.payment_instructions}</div>
        </div>
    </div>
    <script>
        if (window.location.search.includes('print=true')) {{
            window.print();
        }}
    </script>
</body>
</html>"""
    return HTMLResponse(content=html, media_type="text/html")
