import pytest
from pathlib import Path
from unittest.mock import patch, AsyncMock
import httpx
from httpx import AsyncClient, ASGITransport, Response
from backend.app.main import app
from backend.app.tools.audio_brief import AudioBriefGenerator
from backend.app.config import settings

@pytest.mark.asyncio
async def test_audio_generator_honest_degradation_when_unconfigured():
    # Ensure ELEVENLABS_API_KEY is empty
    with patch.object(settings, "ELEVENLABS_API_KEY", ""):
        result = await AudioBriefGenerator.generate_brief(
            script="This is a test script for executive briefing.",
            filename_prefix="test_unconfigured"
        )
        # MUST return None honestly, NEVER a .txt file
        assert result is None
        
        status = AudioBriefGenerator.get_audio_status()
        assert status["configured"] is False
        assert status["provider"] == "browser_speech_synthesis"
        assert status["native_tts_fallback_supported"] is True

@pytest.mark.asyncio
async def test_audio_generator_direct_synthesis_with_mocked_elevenlabs():
    fake_mp3_bytes = b"ID3\x03\x00\x00\x00\x00\x00#TSSE\x00\x00\x00\x0f\x00\x00\x01\xff\xfeLavf60.3.100\x00\x00"
    mock_response = Response(status_code=200, content=fake_mp3_bytes)

    with patch.object(settings, "ELEVENLABS_API_KEY", "test_elevenlabs_key_12345"):
        with patch.object(httpx.AsyncClient, "post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_response
            audio_path = await AudioBriefGenerator.generate_brief(
                script="ElevenLabs synthesized brief.",
                filename_prefix="test_eleven_direct"
            )
            assert audio_path is not None
            assert audio_path.exists()
            assert audio_path.suffix == ".mp3"
            assert audio_path.read_bytes() == fake_mp3_bytes
            audio_path.unlink(missing_ok=True)

@pytest.mark.asyncio
async def test_proposal_audio_endpoints_honest_behavior():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create opportunity and proposal
        opp_res = await client.post("/api/opportunities", json={
            "title": "Quantum Cloud Computing Gateway",
            "raw_content": "Design and build an asynchronous dispatch layer for quantum annealing clusters."
        })
        assert opp_res.status_code == 200
        opp_id = opp_res.json()["id"]

        prop_res = await client.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "Quantum Gateway Proposal",
            "content_markdown": "### Executive Overview\n\nHigh-speed quantum dispatch gateway using gRPC and Rust.",
            "audio_script": "Here is your executive brief for the Quantum Gateway."
        })
        assert prop_res.status_code == 200
        prop = prop_res.json()
        prop_id = prop["id"]
        assert prop["audio_path"] is None
        assert prop["audio_script"] == "Here is your executive brief for the Quantum Gateway."

        # 1. Fetching raw audio when ungenerated must return 404 (NEVER text/plain)
        raw_audio_res = await client.get(f"/api/proposals/{prop_id}/audio")
        assert raw_audio_res.status_code == 404
        assert "Audio" in raw_audio_res.json()["detail"]

        # 2. Fetching audio-brief metadata
        brief_res = await client.get(f"/api/proposals/{prop_id}/audio-brief")
        assert brief_res.status_code == 200
        brief_data = brief_res.json()
        assert brief_data["proposal_id"] == prop_id
        assert brief_data["has_audio_file"] is False
        assert brief_data["audio_url"] is None
        assert "Quantum Gateway" in brief_data["script"]
        assert brief_data["recommended_engine"] == "browser_speech_synthesis"

        # 3. Requesting synthesis when ElevenLabs is unconfigured
        with patch.object(settings, "ELEVENLABS_API_KEY", ""):
            synth_res = await client.post(f"/api/proposals/{prop_id}/synthesize-audio", json={
                "script": "Custom revised executive brief script."
            })
            assert synth_res.status_code == 200
            synth_data = synth_res.json()
            assert synth_data["has_audio_file"] is False
            assert synth_data["script"] == "Custom revised executive brief script."
            assert "unconfigured" in synth_data["message"] or "browser" in synth_data["message"]

@pytest.mark.asyncio
async def test_proposal_audio_synthesis_and_streaming_integration():
    transport = ASGITransport(app=app)
    fake_file = settings.ARTIFACTS_DIR / "prop_test_fake.mp3"
    fake_file.parent.mkdir(parents=True, exist_ok=True)
    fake_file.write_bytes(b"ID3fake_mp3_audio_stream")

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        opp_res = await client.post("/api/opportunities", json={
            "title": "BioTech Gene Analysis",
            "raw_content": "Bioinformatic gene sequencing pipeline."
        })
        opp_id = opp_res.json()["id"]
        prop_res = await client.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "BioTech Proposal",
            "content_markdown": "Bioinformatics platform."
        })
        prop_id = prop_res.json()["id"]

        with patch("backend.app.api.proposals.AudioBriefGenerator.generate_brief", new_callable=AsyncMock) as mock_gen:
            with patch.object(settings, "ELEVENLABS_API_KEY", "mock_key_active"):
                mock_gen.return_value = fake_file

                synth_res = await client.post(f"/api/proposals/{prop_id}/synthesize-audio")
                assert synth_res.status_code == 200
                synth_data = synth_res.json()
                assert synth_data["has_audio_file"] is True
                assert f"/api/proposals/{prop_id}/audio" in synth_data["audio_url"]

                # Now stream the audio
                stream_res = await client.get(f"/api/proposals/{prop_id}/audio")
                assert stream_res.status_code == 200
                assert stream_res.headers["content-type"] == "audio/mpeg"
                assert stream_res.content == b"ID3fake_mp3_audio_stream"

    fake_file.unlink(missing_ok=True)
