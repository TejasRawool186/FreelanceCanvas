import React from 'react';
import { Inbox, FileText, Briefcase, Users, Headphones, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onGoToLanding, onSignOut }) => {
  const navItems = [
    { id: 'briefs', label: 'Briefs & RFPs', icon: Inbox },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'portfolio', label: 'Portfolio & RAG', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'audio', label: 'Audio Briefs', icon: Headphones }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: '#FFF',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh'
    }}>
      <div>
        <div style={{ padding: '0 12px 28px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#9CA3AF',
            fontWeight: 700
          }}>
            Autonomous Workspace
          </span>
          {onGoToLanding && (
            <button
              id="sidebar-home-link"
              onClick={onGoToLanding}
              title="Return to Public Landing Page"
              style={{ fontSize: '11px', color: 'var(--accent-pink)', fontWeight: 700 }}
            >
              Public View
            </button>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: active ? '#FFF' : '#9CA3AF',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Icon size={18} color={active ? 'var(--accent-pink)' : '#9CA3AF'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '12px',
          color: '#9CA3AF'
        }}>
          <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>Touch Grass Mode</div>
          <p style={{ fontSize: '11px', lineHeight: 1.4 }}>Background synthesis active. Walk away and review briefs on mobile audio.</p>
        </div>

        {onSignOut && (
          <button
            id="sidebar-signout-btn"
            onClick={onSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#F87171',
              fontSize: '12px',
              fontWeight: 600,
              width: '100%'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out Session</span>
          </button>
        )}
      </div>
    </aside>
  );
};
