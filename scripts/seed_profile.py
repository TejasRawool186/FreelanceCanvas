import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.database import AsyncSessionLocal, init_db
from app.models.models import FreelancerProfile
from app.tools.portfolio_store import PortfolioVectorStore
from sqlalchemy import select

async def seed():
    print("🌱 Seeding Freelancer Profile and Portfolio Case Studies...")
    await init_db()

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(FreelancerProfile))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = FreelancerProfile(
                full_name="Alex Mercer",
                title="Senior Autonomous Systems & Full-Stack AI Engineer",
                bio="10+ years architecting fault-tolerant web applications, local-first AI pipelines, and agentic workflows.",
                hourly_rate=140.0,
                skills="Python, FastAPI, LangGraph, React, TypeScript, Qdrant, Ollama, Docker, PostgreSQL"
            )
            session.add(profile)
            await session.commit()
            print("✅ Created default Freelancer Profile: Alex Mercer ($140/hr)")
        else:
            print(f"ℹ️ Profile already exists: {profile.full_name}")

    store = PortfolioVectorStore()
    case_studies = [
        ("telematics_fleet_ai", "Real-Time Telematics & AI Fleet Dashboard", "Built an edge IoT streaming platform tracking 2,500+ commercial vehicles with automated predictive maintenance alerts.", ["Python", "FastAPI", "WebSockets", "Docker", "PostgreSQL"]),
        ("autonomous_rag_portal", "Autonomous RAG Legal Document Analyzer", "Architected offline-first vector search across 50,000+ contracts using local embedding models and semantic clustering.", ["LangChain", "Qdrant", "Python", "React", "TypeScript"]),
        ("ecommerce_realtime_engine", "High-Concurrency Flash Sale Inventory Engine", "Engineered distributed locking and event-driven architecture handling 45,000 requests/sec with zero oversell.", ["Go", "Redis", "Kafka", "PostgreSQL", "Next.js"])
    ]

    for doc_id, title, content, tech in case_studies:
        store.add_case_study(doc_id=doc_id, title=title, content=content, tech_stack=tech)
        print(f"  📌 Indexed case study: {title}")

    print("🎉 Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
