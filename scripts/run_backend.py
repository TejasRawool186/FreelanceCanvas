import sys
from pathlib import Path
import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

if __name__ == "__main__":
    from app.config import settings
    print(f"🚀 Starting Autonomiq Freelance Desk Backend on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
