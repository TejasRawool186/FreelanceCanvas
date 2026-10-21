import React from 'react';
import { 
  Inbox, 
  FileText, 
  Briefcase, 
  Users, 
  Headphones, 
  LogOut, 
  Layout, 
  Sparkles, 
  ExternalLink,
  Compass,
  Settings as SettingsIcon,
  FolderKanban,
  Receipt
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onGoToLanding, 
  onSignOut 
}) => {
  const navItems = [
    { id: 'canvas', label: 'Canvas Board', icon: Layout, badge: 'Interactive' },
    { id: 'briefs', label: 'Briefs & RFPs', icon: Inbox },
    { id: 'projects', label: 'Project Workspace', icon: FolderKanban, badge: 'Live Kanban' },
    { id: 'invoicing', label: 'Invoices & Health', icon: Receipt, badge: 'Phase 9' },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'portfolio', label: 'Portfolio & RAG', icon: Briefcase },
    { id: 'clients', label: 'Client Intel', icon: Users },
    { id: 'audio', label: 'Audio Briefs', icon: Headphones },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#FFFFFF',
      borderRight: '2px solid #000000',
      color: '#0F172A',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      fontFamily: "'Fredoka', sans-serif"
    }}>
      <div>
        {/* Workspace Brand Header */}
        <div style={{ 
          padding: '0 8px 24px 8px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1.5px dashed #CBD5E1',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '1.5px 1.5px 0px #000000'
            }}>
              <span className="font-chewy" style={{ fontSize: '15px', lineHeight: 1 }}>FC</span>
            </div>
            <span className="font-chewy" style={{ fontSize: '18px', color: '#0F172A', letterSpacing: '0.02em' }}>
              FreelanceCanvas
            </span>
          </div>

          {onGoToLanding && (
            <button
              id="sidebar-home-link"
              onClick={onGoToLanding}
              title="Return to Public Landing Page"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0099FF',
                cursor: 'pointer'
              }}
            >
              <span>Public</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: active ? '#0099FF' : 'transparent',
                  color: active ? '#000000' : '#475569',
                  border: active ? '2px solid #000000' : '2px solid transparent',
                  boxShadow: active ? '2px 2px 0px #000000' : 'none',
                  fontSize: '14px',
                  fontWeight: active ? 800 : 600,
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} strokeWidth={2.5} color={active ? '#000000' : '#64748B'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: active ? '#FFFFFF' : '#DCFCE7',
                    color: active ? '#000000' : '#166534',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sticky Note Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="sticky-note" style={{
          padding: '16px',
          backgroundColor: '#FEF08A',
          border: '1.5px solid #000000',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#854D0E',
          boxShadow: '2px 2px 0px #000000'
        }}>
          <div className="scotch-tape" style={{ width: '40px', height: '14px', top: '-8px' }} />
          <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#0099FF" />
            <span>Autonomous Engine</span>
          </div>
          <p style={{ fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
            Qdrant vector collection active. Automatic background RFP proposal drafting ready.
          </p>
        </div>

        {onSignOut && (
          <button
            id="sidebar-signout-btn"
            onClick={onSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '2px 2px 0px #000000',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
