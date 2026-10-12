import httpx
from pathlib import Path
from typing import Optional
from ..config import settings

class AudioBriefGenerator:
    @staticmethod
    async def generate_brief(script: str, filename_prefix: str = "brief") -> Optional[Path]:
        if settings.ELEVENLABS_API_KEY:
            try:
                output_file = settings.ARTIFACTS_DIR / f"{filename_prefix}.mp3"
                voice_id = settings.ELEVENLABS_VOICE_ID or "21m00Tcm4TlvDq8ikWAM"
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": settings.ELEVENLABS_API_KEY
                }
                payload = {
                    "text": script,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75
                    }
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        with open(output_file, "wb") as f:
                            f.write(resp.content)
                        return output_file
            except Exception as e:
                print(f"[AudioBriefGenerator ElevenLabs Warning]: {e}")

        txt_brief = settings.ARTIFACTS_DIR / f"{filename_prefix}_brief.txt"
        with open(txt_brief, "w", encoding="utf-8") as f:
            f.write(f"=== EXECUTIVE AUDIO BRIEF SCRIPT ===\n\n{script}")
        return txt_brief
