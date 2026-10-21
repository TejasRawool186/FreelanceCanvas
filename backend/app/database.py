from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def _run_sync_migrations(sync_conn):
    from sqlalchemy import text
    from .models import models  # noqa: F401 - ensure all tables are registered
    Base.metadata.create_all(sync_conn)

    dialect = sync_conn.dialect.name
    # Lightweight schema & column synchronization for SQLite and PostgreSQL
    schema_specs = {
        "freelancer_profile": {
            "currency": ("VARCHAR(10) DEFAULT 'USD'", "VARCHAR(10) DEFAULT 'USD'"),
            "timezone": ("VARCHAR(50) DEFAULT 'UTC'", "VARCHAR(50) DEFAULT 'UTC'"),
            "availability_hours_per_week": ("FLOAT DEFAULT 40.0", "FLOAT DEFAULT 40.0"),
            "skills": ("TEXT", "TEXT"),
            "experience_years": ("FLOAT", "FLOAT"),
            "preferred_categories": ("TEXT", "TEXT"),
            "preferred_ai_provider": ("VARCHAR(50) DEFAULT 'ollama'", "VARCHAR(50) DEFAULT 'ollama'"),
            "preferred_ai_model": ("VARCHAR(100) DEFAULT 'gemma3:1b'", "VARCHAR(100) DEFAULT 'gemma3:1b'"),
            "onboarding_completed": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "created_at": ("TIMESTAMP", "DATETIME"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        },
        "opportunities": {
            "client_id": ("VARCHAR(36)", "VARCHAR(36)"),
            "source_url": ("VARCHAR(512)", "VARCHAR(512)"),
            "notes": ("TEXT", "TEXT"),
            "tags": ("VARCHAR(255)", "VARCHAR(255)"),
            "requirements_json": ("TEXT", "TEXT"),
            "scoring_json": ("TEXT", "TEXT"),
            "clarification_questions_json": ("TEXT", "TEXT"),
            "estimation_json": ("TEXT", "TEXT"),
            "fit_score": ("FLOAT", "FLOAT"),
            "recommendation": ("VARCHAR(50)", "VARCHAR(50)"),
            "is_demo": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        },
        "proposals": {
            "milestones_json": ("TEXT", "TEXT"),
            "risk_register_json": ("TEXT", "TEXT"),
            "price_estimate": ("FLOAT", "FLOAT"),
            "audio_path": ("VARCHAR(512)", "VARCHAR(512)"),
            "audio_script": ("TEXT", "TEXT"),
            "is_demo": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        },
        "clients": {
            "company": ("VARCHAR(255)", "VARCHAR(255)"),
            "website": ("VARCHAR(512)", "VARCHAR(512)"),
            "notes": ("TEXT", "TEXT"),
            "created_at": ("TIMESTAMP", "DATETIME")
        },
        "projects": {
            "client_id": ("VARCHAR(36)", "VARCHAR(36)"),
            "opportunity_id": ("VARCHAR(36)", "VARCHAR(36)"),
            "proposal_id": ("VARCHAR(36)", "VARCHAR(36)"),
            "pricing_model": ("VARCHAR(50) DEFAULT 'fixed'", "VARCHAR(50) DEFAULT 'fixed'"),
            "total_budget": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "hourly_rate": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "estimated_hours": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "actual_hours": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "milestones_baseline_json": ("TEXT", "TEXT"),
            "is_demo": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        },
        "project_tasks": {
            "milestone_id": ("VARCHAR(100)", "VARCHAR(100)"),
            "description": ("TEXT", "TEXT"),
            "priority": ("VARCHAR(50) DEFAULT 'medium'", "VARCHAR(50) DEFAULT 'medium'"),
            "estimated_hours": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "actual_hours": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "assignee": ("VARCHAR(100)", "VARCHAR(100)"),
            "due_date": ("VARCHAR(50)", "VARCHAR(50)"),
            "notes": ("TEXT", "TEXT"),
            "is_scope_change": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "order_index": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        },
        "case_studies": {
            "client_industry": ("VARCHAR(100)", "VARCHAR(100)"),
            "role": ("VARCHAR(150)", "VARCHAR(150)"),
            "tech_stack": ("TEXT", "TEXT"),
            "outcomes": ("TEXT", "TEXT"),
            "metrics": ("TEXT", "TEXT"),
            "testimonial_quote": ("TEXT", "TEXT"),
            "link_url": ("VARCHAR(512)", "VARCHAR(512)"),
            "is_demo": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        },
        "invoices": {
            "client_id": ("VARCHAR(36)", "VARCHAR(36)"),
            "project_id": ("VARCHAR(36)", "VARCHAR(36)"),
            "billing_model": ("VARCHAR(50) DEFAULT 'fixed'", "VARCHAR(50) DEFAULT 'fixed'"),
            "issue_date": ("VARCHAR(50)", "VARCHAR(50)"),
            "due_date": ("VARCHAR(50)", "VARCHAR(50)"),
            "paid_at": ("TIMESTAMP", "DATETIME"),
            "currency": ("VARCHAR(10) DEFAULT 'USD'", "VARCHAR(10) DEFAULT 'USD'"),
            "subtotal": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "tax_rate": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "tax_amount": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "total_amount": ("FLOAT DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
            "line_items_json": ("TEXT DEFAULT '[]'", "TEXT DEFAULT '[]'"),
            "notes": ("TEXT", "TEXT"),
            "payment_terms": ("VARCHAR(100) DEFAULT 'Net 15'", "VARCHAR(100) DEFAULT 'Net 15'"),
            "payment_instructions": ("TEXT", "TEXT"),
            "is_demo": ("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
            "updated_at": ("TIMESTAMP", "DATETIME")
        }
    }

    for table_name, cols in schema_specs.items():
        try:
            existing_cols = set()
            if dialect == "sqlite":
                res = sync_conn.exec_driver_sql(f"PRAGMA table_info({table_name})")
                existing_cols = {str(row[1]).lower() for row in res.fetchall()}
            elif dialect == "postgresql":
                res = sync_conn.execute(
                    text("SELECT column_name FROM information_schema.columns WHERE table_name = :t"),
                    {"t": table_name.lower()}
                )
                existing_cols = {str(row[0]).lower() for row in res.fetchall()}

            if not existing_cols:
                continue

            for col_name, (pg_type, sqlite_type) in cols.items():
                if col_name.lower() not in existing_cols:
                    col_type = pg_type if dialect == "postgresql" else sqlite_type
                    sync_conn.exec_driver_sql(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}")
        except Exception as e:
            print(f"[Migration Warning] Skipping column sync for table '{table_name}': {e}")

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(_run_sync_migrations)

