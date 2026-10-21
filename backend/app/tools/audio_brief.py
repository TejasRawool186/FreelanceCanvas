import httpx
from pathlib import Path
from typing import Optional, Dict, Any
from ..config import settings

class AudioBriefGenerator:
    """
    Production-grade executive audio brief generator.
    Synthesizes speech using ElevenLabs API when configured.
    Maintains honest degradation: if ElevenLabs is unconfigured or unavailable,
    it returns None (never a .txt file disguised as audio). The script is preserved
    for client-side Web Speech API playback.
    """

    @staticmethod
    async def generate_brief(script: str, filename_prefix: str = "brief") -> Optional[Path]:
        if not script or not script.strip():
            return None

        if settings.ELEVENLABS_API_KEY:
            try:
                settings.ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
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
                    if resp.status_code == 200 and len(resp.content) > 0:
                        with open(output_file, "wb") as f:
                            f.write(resp.content)
                        return output_file
                    else:
                        print(f"[AudioBriefGenerator ElevenLabs Warning]: HTTP {resp.status_code} - {resp.text[:120]}")
            except Exception as e:
                print(f"[AudioBriefGenerator ElevenLabs Warning]: {e}")

        # Honest Degradation: No ElevenLabs API key or synthesis failed.
        # Spoken text is preserved as audio_script for client-side Web Speech API.
        return None

    @staticmethod
    def get_audio_status() -> Dict[str, Any]:
        """Returns the operational status and capabilities of the audio subsystem."""
        is_configured = bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_API_KEY.strip())
        return {
            "configured": is_configured,
            "provider": "elevenlabs" if is_configured else "browser_speech_synthesis",
            "voice_id": settings.ELEVENLABS_VOICE_ID or "21m00Tcm4TlvDq8ikWAM",
            "native_tts_fallback_supported": True,
            "message": "ElevenLabs Studio API ready." if is_configured else "ElevenLabs unconfigured. Using high-fidelity browser Web Speech API (zero-cost offline mode)."
        }
