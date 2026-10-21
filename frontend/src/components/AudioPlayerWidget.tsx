import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AudioBriefMetadata } from '../types';

interface AudioPlayerWidgetProps {
  proposalId: string;
  initialScript?: string;
  onClose: () => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  proposalId,
  initialScript,
  onClose
}) => {
  const [metadata, setMetadata] = useState<AudioBriefMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthMessage, setSynthMessage] = useState<string | null>(null);

  // Audio element ref for MP3 streaming
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Speech API state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch audio brief metadata
  const fetchMetadata = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/audio-brief`);
      if (res.ok) {
        const data: AudioBriefMetadata = await res.json();
        setMetadata(data);
      }
    } catch (err) {
      console.error('Failed to load audio brief:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [proposalId]);

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          // Prefer English voices
          const defaultIdx = voices.findIndex(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
          setSelectedVoiceIndex(defaultIdx >= 0 ? defaultIdx : 0);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (!metadata) return;

    if (metadata.has_audio_file && metadata.audio_url && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
      }
    } else {
      // Use browser Web Speech API
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        alert('Web Speech API is not supported in this browser. Please upgrade to a modern browser.');
        return;
      }

      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          window.speechSynthesis.cancel();
          const scriptToRead = metadata.script || initialScript || 'Executive brief script not available.';
          const utterance = new SpeechSynthesisUtterance(scriptToRead);
          utterance.rate = playbackSpeed;
          if (availableVoices[selectedVoiceIndex]) {
            utterance.voice = availableVoices[selectedVoiceIndex];
          }

          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
          utterance.onerror = () => setIsPlaying(false);

          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }
    }
  };

  const handleRestart = () => {
    if (metadata?.has_audio_file && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      handleTogglePlay();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (utteranceRef.current && isPlaying) {
      // Restart with new rate
      window.speechSynthesis.cancel();
      const scriptToRead = metadata?.script || initialScript || '';
      const u = new SpeechSynthesisUtterance(scriptToRead);
      u.rate = speed;
      if (availableVoices[selectedVoiceIndex]) u.voice = availableVoices[selectedVoiceIndex];
      u.onend = () => setIsPlaying(false);
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSynthesizeCloudAudio = async () => {
    setIsSynthesizing(true);
    setSynthMessage(null);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/synthesize-audio`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSynthMessage(data.message);
        fetchMetadata();
      } else {
        setSynthMessage('Synthesis request failed.');
      }
    } catch {
      setSynthMessage('Network error during synthesis.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyScript = () => {
    const text = metadata?.script || initialScript || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="card-collab"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '3px solid #000000',
        boxShadow: '6px 6px 0px #000000',
        zIndex: 1000,
        width: '440px',
        maxWidth: 'calc(100vw - 48px)',
        fontFamily: "'Fredoka', sans-serif"
      }}
    >
      {/* Scotch Tape Accent */}
      <div className="scotch-tape" style={{ width: '60px', height: '18px', top: '-10px', left: '24px' }} />

      {/* Hidden Native Audio Element for Real MP3s */}
      {metadata?.has_audio_file && metadata.audio_url && (
        <audio
          ref={audioRef}
          src={metadata.audio_url}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: metadata?.has_audio_file ? '#DCFCE7' : '#FEF08A',
              color: metadata?.has_audio_file ? '#166534' : '#854D0E',
              border: '1.5px solid #000000',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {metadata?.has_audio_file ? (
                <>
                  <Sparkles size={11} />
                  <span>ElevenLabs Studio Stream</span>
                </>
              ) : (
                <>
                  <Radio size={11} />
                  <span>Browser Speech Engine (Offline)</span>
                </>
              )}
            </span>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '6px 0 2px 0' }}>
            Executive Audio Briefing
          </h4>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            {metadata?.proposal_title || 'Client Opportunity Brief'}
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            if (audioRef.current) audioRef.current.pause();
            onClose();
          }}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '2px solid #000000',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={14} color="#0F172A" strokeWidth={2.5} />
        </button>
      </div>

      {/* Synthesis Message Banner */}
      {synthMessage && (
        <div style={{
          backgroundColor: '#F1F5F9',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          color: '#334155',
          marginBottom: '12px'
        }}>
          {synthMessage}
        </div>
      )}

      {/* Main Playback Bar & Waveform Preview */}
      <div style={{
        backgroundColor: '#F8FAFC',
        border: '2px solid #000000',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#10B981' : '#94A3B8',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
              {isPlaying ? 'Synthesized Voice Active' : 'Ready to Play'}
            </span>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
            {metadata?.has_audio_file
              ? `${formatSeconds(currentTime)} / ${formatSeconds(duration || 0)}`
              : `${playbackSpeed}x Rate`}
          </span>
        </div>

        {/* Animated Visualizer / Scrub Bar */}
        <div style={{
          height: '6px',
          width: '100%',
          backgroundColor: '#E2E8F0',
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
          cursor: metadata?.has_audio_file ? 'pointer' : 'default'
        }}
          onClick={(e) => {
            if (metadata?.has_audio_file && audioRef.current && duration > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pos * duration;
            }
          }}
        >
          <div style={{
            height: '100%',
            width: metadata?.has_audio_file && duration > 0
              ? `${(currentTime / duration) * 100}%`
              : isPlaying ? '100%' : '0%',
            backgroundColor: isPlaying ? '#10B981' : '#6366F1',
            borderRadius: '3px',
            transition: 'width 0.2s linear'
          }} />
        </div>
      </div>

      {/* Audio Controls Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={isLoading}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#F59E0B' : '#10B981',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px #000000',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? (
              <Pause size={20} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Play size={20} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            title="Restart from beginning"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} color="#0F172A" />
          </button>

          {/* Playback Speed Toggles */}
          <div style={{ display: 'flex', gap: '2px', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
            {[1.0, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  backgroundColor: playbackSpeed === speed ? '#0F172A' : 'transparent',
                  color: playbackSpeed === speed ? '#FFFFFF' : '#64748B'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Actions: Script Drawer & Cloud Synthesize */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowScript(!showScript)}
            title="Read / Copy Brief Script"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1.5px solid #000000',
              backgroundColor: showScript ? '#FEF08A' : '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FileText size={13} />
            <span>Script</span>
          </button>

          {/* ElevenLabs Cloud Synthesize Button */}
          <button
            onClick={handleSynthesizeCloudAudio}
            disabled={isSynthesizing}
            title="Synthesize studio audio with ElevenLabs"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1.5px solid #000000',
              backgroundColor: '#EEF2FF',
              color: '#4338CA',
              fontSize: '11px',
              fontWeight: 800,
              cursor: isSynthesizing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} className={isSynthesizing ? 'spin' : ''} />
            <span>Studio Voice</span>
          </button>
        </div>
      </div>

      {/* Script Drawer */}
      {showScript && (
        <div style={{
          marginTop: '14px',
          padding: '12px',
          backgroundColor: '#FFFBEB',
          border: '1.5px dashed #F59E0B',
          borderRadius: '8px',
          maxHeight: '140px',
          overflowY: 'auto',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#78350F',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ fontSize: '11px', textTransform: 'uppercase' }}>Spoken Telemetry Script:</strong>
            <button
              onClick={handleCopyScript}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {copied ? <Check size={12} color="#166534" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          {metadata?.script || initialScript || 'No executive briefing script available.'}
        </div>
      )}
    </div>
  );
};
