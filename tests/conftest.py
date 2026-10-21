import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.app.database import Base, get_db, _run_sync_migrations
from backend.app.main import app
import backend.app.api.opportunities as opp_api

TEST_DATABASE_URL = "sqlite+aiosqlite:///data/test_freelance_desk.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Also override the background task session maker in opportunities.py
opp_api.AsyncSessionLocal = TestAsyncSessionLocal

async def override_get_db():
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def init_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(_run_sync_migrations)
    yield
