import React, { useState, useRef } from 'react';
import { 
  MousePointer, 
  Square, 
  Type, 
  StickyNote, 
  MoveUpRight, 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  LayoutGrid, 
  Sparkles, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Palette
} from 'lucide-react';

interface CanvasItem {
  id: string;
  type: 'note' | 'text' | 'rect';
  title: string;
  x: number;
  y: number;
  bg: string;
  textDark: string;
}

export const CanvasBoard: React.FC = () => {
  const [items, setItems] = useState<CanvasItem[]>([
    { id: '1', type: 'note', title: '1. Discovery & Client Goals', x: 60, y: 70, bg: '#BBF7D0', textDark: '#166534' },
    { id: '2', type: 'note', title: '2. Architecture & Data Model', x: 280, y: 50, bg: '#FEF08A', textDark: '#854D0E' },
    { id: '3', type: 'note', title: '3. Qdrant Vector Pipeline', x: 500, y: 80, bg: '#BAE6FD', textDark: '#0369A1' },
    { id: '4', type: 'note', title: '4. Executive Audio Summary', x: 300, y: 220, bg: '#FBCFE8', textDark: '#9D174D' },
    { id: '5', type: 'note', title: "Let's ship this! 🎉", x: 540, y: 240, bg: '#FED7AA', textDark: '#9A3412' }
  ]);

  const [activeTool, setActiveTool] = useState<'select' | 'note' | 'text' | 'arrow' | 'eraser'>('select');
  const [selectedNoteColor, setSelectedNoteColor] = useState({ bg: '#FEF08A', textDark: '#854D0E' });
  const [zoom, setZoom] = useState(100);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedItemId, setSelectedItemId] = useState<string | null>('1');

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool === 'eraser') {
      setItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    setSelectedItemId(id);
    const item = items.find(i => i.id === id);
    if (!item || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingId(id);
    setDragOffset({
      x: (e.clientX - rect.left) - item.x,
      y: (e.clientY - rect.top) - item.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 180, (e.clientX - rect.left) - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 140, (e.clientY - rect.top) - dragOffset.y));

    setItems(prev => prev.map(item => item.id === draggingId ? { ...item, x: newX, y: newY } : item));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'note' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left - 75;
      const clickY = e.clientY - rect.top - 50;

      const newNote: CanvasItem = {
        id: String(Date.now()),
        type: 'note',
        title: 'New Idea Note',
        x: Math.max(20, clickX),
        y: Math.max(20, clickY),
        bg: selectedNoteColor.bg,
        textDark: selectedNoteColor.textDark
      };

      setItems(prev => [...prev, newNote]);
      setSelectedItemId(newNote.id);
      setActiveTool('select');
    }
  };

  const handleUpdateText = (id: string, text: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, title: text } : item));
  };

  const loadTemplate = (tmpl: 'bigidea' | 'roadmap' | 'retro') => {
    if (tmpl === 'bigidea') {
      setItems([
        { id: '101', type: 'note', title: 'Problem: Manual RFP Writing', x: 80, y: 60, bg: '#FEE2E2', textDark: '#991B1B' },
        { id: '102', type: 'note', title: 'Solution: Autonomous Agent Desk', x: 300, y: 60, bg: '#BBF7D0', textDark: '#166534' },
        { id: '103', type: 'note', title: 'Target Rate: $140/hr Billable', x: 520, y: 60, bg: '#FEF08A', textDark: '#854D0E' },
        { id: '104', type: 'note', title: 'Delivery: High-converting PDF & Audio', x: 300, y: 220, bg: '#BAE6FD', textDark: '#0369A1' }
      ]);
    } else if (tmpl === 'roadmap') {
      setItems([
        { id: '201', type: 'note', title: 'Q1: Client Recon Engine', x: 60, y: 80, bg: '#BBF7D0', textDark: '#166534' },
        { id: '202', type: 'note', title: 'Q2: Multi-Agent Synthesis', x: 260, y: 80, bg: '#FEF08A', textDark: '#854D0E' },
        { id: '203', type: 'note', title: 'Q3: Local Vector Memory', x: 460, y: 80, bg: '#BAE6FD', textDark: '#0369A1' },
        { id: '204', type: 'note', title: 'Q4: Offline Voice Synthesis', x: 660, y: 80, bg: '#FBCFE8', textDark: '#9D174D' }
      ]);
    } else {
      setItems([
        { id: '301', type: 'note', title: 'What Went Well 🎉', x: 80, y: 60, bg: '#BBF7D0', textDark: '#166534' },
        { id: '302', type: 'note', title: 'What to Improve 🤔', x: 320, y: 60, bg: '#FED7AA', textDark: '#9A3412' },
        { id: '303', type: 'note', title: 'Action Items 🚀', x: 560, y: 60, bg: '#BAE6FD', textDark: '#0369A1' }
      ]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      
      {/* Canvas Header Control Bar */}
      <div className="card-collab" style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Template Quick Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-chewy" style={{ fontSize: '18px', color: '#0F172A', marginRight: '4px' }}>
            Board Templates:
          </span>
          <button
            onClick={() => loadTemplate('bigidea')}
            className="btn-collab-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Big Idea
          </button>
          <button
            onClick={() => loadTemplate('roadmap')}
            className="btn-collab-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Project Roadmap
          </button>
          <button
            onClick={() => loadTemplate('retro')}
            className="btn-collab-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Retrospective
          </button>
        </div>

        {/* Color Palette for new sticky notes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Sticky Color:</span>
          {[
            { bg: '#BBF7D0', textDark: '#166534' },
            { bg: '#FEF08A', textDark: '#854D0E' },
            { bg: '#BAE6FD', textDark: '#0369A1' },
            { bg: '#FBCFE8', textDark: '#9D174D' },
            { bg: '#FED7AA', textDark: '#9A3412' }
          ].map((c, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedNoteColor(c);
                setActiveTool('note');
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: c.bg,
                border: selectedNoteColor.bg === c.bg ? '2.5px solid #000000' : '1.5px solid rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transform: selectedNoteColor.bg === c.bg ? 'scale(1.2)' : 'none',
                transition: 'transform 0.15s ease'
              }}
            />
          ))}
        </div>

        {/* Zoom & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setZoom(prev => Math.max(60, prev - 10))}
            style={{ padding: '6px', border: '1.5px solid #000', borderRadius: '6px', backgroundColor: '#FFF', cursor: 'pointer' }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 800 }}>{zoom}%</span>
          <button 
            onClick={() => setZoom(prev => Math.min(140, prev + 10))}
            style={{ padding: '6px', border: '1.5px solid #000', borderRadius: '6px', backgroundColor: '#FFF', cursor: 'pointer' }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => alert('Canvas exported as interactive board!')}
            className="btn-collab-primary"
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            <Share2 size={14} strokeWidth={2.5} />
            <span>Share Board</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Surface */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.09) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          border: '2px solid #000000',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px #000000',
          overflow: 'hidden',
          cursor: activeTool === 'note' ? 'crosshair' : (activeTool === 'eraser' ? 'not-allowed' : 'default')
        }}
      >
        {/* Floating Vertical Canvas Toolbar */}
        <div className="floating-canvas-toolbar" style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          zIndex: 50
        }}>
          <button
            className={activeTool === 'select' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); setActiveTool('select'); }}
            title="Selection pointer"
          >
            <MousePointer size={18} strokeWidth={2.5} />
          </button>
          <button
            className={activeTool === 'note' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); setActiveTool('note'); }}
            title="Add Sticky Note"
          >
            <StickyNote size={18} strokeWidth={2.5} />
          </button>
          <button
            className={activeTool === 'arrow' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); setActiveTool('arrow'); }}
            title="Connector Arrow"
          >
            <MoveUpRight size={18} strokeWidth={2.5} />
          </button>
          <button
            className={activeTool === 'eraser' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); setActiveTool('eraser'); }}
            title="Delete item"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Phase Markers on Canvas */}
        <div style={{ position: 'absolute', top: '16px', left: '120px', pointerEvents: 'none' }}>
          <span className="font-chewy" style={{ fontSize: '18px', color: '#64748B' }}>1. DISCOVERY</span>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
        </div>

        <div style={{ position: 'absolute', top: '16px', left: '380px', pointerEvents: 'none' }}>
          <span className="font-chewy" style={{ fontSize: '18px', color: '#64748B' }}>2. SCOPING & TECH</span>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
        </div>

        <div style={{ position: 'absolute', top: '16px', left: '680px', pointerEvents: 'none' }}>
          <span className="font-chewy" style={{ fontSize: '18px', color: '#64748B' }}>3. PRICING & PROPOSAL</span>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
        </div>

        {/* Curved Hand-drawn SVG Connectors */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
            </marker>
          </defs>
          <path d="M 210 100 Q 240 70 280 80" stroke="#000" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          <path d="M 430 80 Q 460 70 500 100" stroke="#000" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          <path d="M 350 160 Q 370 190 350 220" stroke="#000" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
        </svg>

        {/* Live Multi-Cursors Simulation */}
        <div className="anim-cursor-alex" style={{
          position: 'absolute',
          top: '120px',
          left: '260px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 30,
          pointerEvents: 'none'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#10B981" stroke="#000" strokeWidth="1.5">
            <polygon points="3 3 10 21 14 14 21 10 3 3" />
          </svg>
          <span style={{ backgroundColor: '#10B981', color: '#FFF', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', boxShadow: '1px 1px 0px #000' }}>
            Alex (Architect)
          </span>
        </div>

        <div className="anim-cursor-taylor" style={{
          position: 'absolute',
          top: '280px',
          left: '480px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 30,
          pointerEvents: 'none'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#000" strokeWidth="1.5">
            <polygon points="3 3 10 21 14 14 21 10 3 3" />
          </svg>
          <span style={{ backgroundColor: '#F59E0B', color: '#000', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', boxShadow: '1px 1px 0px #000' }}>
            Taylor (Client)
          </span>
        </div>

        {/* Render Draggable Canvas Items */}
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          return (
            <div
              key={item.id}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              className="sticky-note"
              style={{
                position: 'absolute',
                top: `${item.y}px`,
                left: `${item.x}px`,
                backgroundColor: item.bg,
                color: item.textDark,
                border: isSelected ? '2px solid #0099FF' : '1.5px solid #000000',
                borderRadius: '6px',
                padding: '14px 16px',
                width: '170px',
                boxShadow: isSelected ? '4px 4px 0px #0099FF' : '3px 3px 0px #000000',
                zIndex: isSelected ? 20 : 5,
                cursor: 'grab',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Scotch tape on sticky note */}
              <div className="scotch-tape" style={{ width: '46px', height: '16px', top: '-9px' }} />

              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdateText(item.id, e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 800,
                  fontSize: '13px',
                  color: item.textDark
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
