import React from 'react';
import { 
  ShieldCheck, 
  BarChart2, 
  ListTree, 
  Terminal, 
  Sliders, 
  FileCheck2,
  Lock
} from 'lucide-react';

export default function SidebarNav({ activeTab, setActiveTab }) {
  const items = [
    { id: 'overview', label: 'Overview', shortcut: '1', icon: BarChart2 },
    { id: 'ledger', label: 'Live Ledger', shortcut: '2', icon: ListTree, count: 'LIVE' },
    { id: 'simulator', label: 'Decision Engine', shortcut: '3', icon: Terminal },
    { id: 'policy', label: 'Cost Calibration', shortcut: '4', icon: Sliders },
    { id: 'dispute', label: 'Dispute Rebuttal', shortcut: '5', icon: FileCheck2 },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            background: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Sentinel Risk Core
            </div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              DEFENSE INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '6px 10px 8px' }}>
          Navigation
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--surface-elevated)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon size={15} color={isActive ? '#818cf8' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.count && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: '#fb7185',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {item.count}
                  </span>
                )}
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-dim)',
                  background: 'var(--surface-base)',
                  padding: '1px 4px',
                  borderRadius: 3,
                  border: '1px solid var(--border-subtle)'
                }}>
                  {item.shortcut}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Model Health / Strict Defense Pill */}
      <div style={{ padding: 14, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          background: 'var(--surface-base)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Defensive Compliance
            </span>
            <Lock size={11} color="var(--status-low)" />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Zero offensive vector capability. 100% merchant fraud shielding.
          </div>
        </div>
      </div>
    </aside>
  );
}
