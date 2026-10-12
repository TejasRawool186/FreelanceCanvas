import subprocess
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def main():
    print("=" * 60)
    print("💼 Autonomiq Freelance Desk — Unified Runner")
    print("=" * 60)

    print("\n[1/2] Starting Backend (FastAPI on Port 8010)...")
    backend_proc = subprocess.Popen([sys.executable, str(ROOT_DIR / "scripts" / "run_backend.py")], cwd=str(ROOT_DIR))

    time.sleep(2)

    print("\n[2/2] Starting Frontend (Vite on Port 5173)...")
    frontend_proc = subprocess.Popen(["npm", "run", "dev"], cwd=str(ROOT_DIR / "frontend"), shell=True)

    print("\n✅ All services running! Press Ctrl+C to terminate both.\n")
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Autonomiq Freelance Desk services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
