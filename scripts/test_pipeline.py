import asyncio
import sys
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

async def test():
    print("🧪 Testing Autonomiq Freelance Desk Pipeline...")
    base_url = "http://localhost:8010"

    async with httpx.AsyncClient(timeout=60.0) as client:
        print("1. Checking Health...")
        r = await client.get(f"{base_url}/api/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        print(f"   Health Response: {r.json()['status']}")

        print("2. Ingesting RFP Brief...")
        brief_payload = {
            "title": "Real-Time Telematics & AI Fleet Dashboard",
            "company": "FleetPulse Global",
            "raw_content": "We need a solo technical consultant to build an MVP for fleet vehicle telemetry tracking. Must support real-time map updates, predictive vehicle maintenance scoring, and clean REST APIs. Looking for high reliability and clean codebase.",
            "source_type": "text",
            "budget_range": "$5,000 - $8,000",
            "deadline": "4 weeks",
            "tech_stack": "Python, FastAPI, TypeScript, React"
        }
        r = await client.post(f"{base_url}/api/opportunities", json=brief_payload, timeout=10.0)
        assert r.status_code == 200, f"Create opportunity failed: {r.text}"
        opp = r.json()
        opp_id = opp["id"]
        print(f"   Created Opportunity: {opp_id} (Status: {opp['status']})")

        print("3. Waiting for Autonomous Agent to synthesize proposal...")
        for i in range(25):
            await asyncio.sleep(2)
            r = await client.get(f"{base_url}/api/opportunities/{opp_id}")
            opp_data = r.json()
            status = opp_data["status"]
            print(f"   Status at {i*2}s: {status}")
            if status == "completed":
                break
            if status == "failed":
                raise RuntimeError("Proposal synthesis failed!")

        print("4. Fetching Generated Proposal...")
        r = await client.get(f"{base_url}/api/proposals/opportunity/{opp_id}")
        proposals = r.json()
        assert len(proposals) > 0, "No proposal generated!"
        prop = proposals[0]
        print(f"   Proposal Title: {prop['title']}")
        print(f"   Estimated Price: ${prop['price_estimate']}")
        print(f"   Audio Brief Path: {prop['audio_path']}")
        print("✅ Full Pipeline Test Passed Successfully!")

if __name__ == "__main__":
    asyncio.run(test())
