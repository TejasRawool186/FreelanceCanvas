from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .api import health, opportunities, proposals, profile

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Autonomiq Freelance Desk API",
    description="Autonomous local-first AI workspace for solo developers & consultants.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health.router)
app.include_router(opportunities.router)
app.include_router(proposals.router)
app.include_router(profile.router)

@app.get("/")
async def root():
    return {
        "workspace": "Autonomiq Freelance Desk",
        "status": "online",
        "docs_url": "/docs"
    }
