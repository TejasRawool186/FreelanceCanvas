from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .middleware import SecurityMiddleware
from .api import health, opportunities, proposals, profile, projects, invoices

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="FreelanceCanvas API",
    description="Visual collaborative AI workspace for solo developers & consultants.",
    version="1.0.0",
    lifespan=lifespan
)

# Parse allowed origins from configuration
origins_list = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
is_wildcard = "*" in origins_list

# Register Security and Isolation Middleware
app.add_middleware(SecurityMiddleware)

# Register CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list if not is_wildcard else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"]
)

# API Routers
app.include_router(health.router)
app.include_router(opportunities.router)
app.include_router(proposals.router)
app.include_router(profile.router)
app.include_router(projects.router)
app.include_router(invoices.router)

from pathlib import Path
from fastapi import Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if dist_dir.exists():
    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/")
async def root(request: Request):
    accept = request.headers.get("accept", "")
    index_file = dist_dir / "index.html"
    if "text/html" in accept and index_file.exists():
        return FileResponse(index_file)
    return {
        "workspace": "FreelanceCanvas",
        "status": "online",
        "docs_url": "/docs"
    }
