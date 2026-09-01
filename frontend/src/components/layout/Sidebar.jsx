import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  SearchCode, 
  SlidersHorizontal, 
  FileText, 
  Sparkles 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, liveCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: BarChart3, badge: null },
    { id: 'sentinel', label: 'Live Sentinel Feed', icon: Activity, badge: 'LIVE', pulse: true },
    { id: 'inspector', label: 'Scorer & Explainability', icon: SearchCode, badge: 'AI' },
    { id: 'policy', label: 'Cost & Policy Lab', icon: SlidersHorizontal, badge: 'OPTIMIZER' },
    { id: 'evidence', label: 'Chargeback Evidence Kit', icon: FileText, badge: 'DEFENSE' },
  ];

  return (
    <aside className="stitch-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--stitch-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--stitch-radius-sm)',
            background: 'var(--stitch-gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)',
            flexShrink: 0
          }}>
            <ShieldAlert size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Risk Manager
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--stitch-accent-primary)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              STITCH DEFENSE V2
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--stitch-text-muted)', letterSpacing: 1.2, textTransform: 'uppercase', padding: '6px 12px 10px' }}>
          Platform Modules
        </div>

        {navItems.map((item) => {
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
                padding: '10px 14px',
                borderRadius: 'var(--stitch-radius-sm)',
                border: '1px solid',
                borderColor: isActive ? 'var(--stitch-border-focus)' : 'transparent',
                background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--stitch-text-secondary)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={17} color={isActive ? 'var(--stitch-accent-primary)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 'var(--stitch-radius-full)',
                  background: item.pulse ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                  color: item.pulse ? 'var(--stitch-risk-critical)' : 'var(--stitch-accent-primary)',
                  border: `1px solid ${item.pulse ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
                  letterSpacing: 0.5
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* EVT Model Status Card */}
      <div style={{ padding: 16, borderTop: '1px solid var(--stitch-border-subtle)' }}>
        <div style={{
          background: 'var(--stitch-surface-2)',
          border: '1px solid var(--stitch-border-default)',
          borderRadius: 'var(--stitch-radius-md)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--stitch-risk-low)', boxShadow: '0 0 8px var(--stitch-risk-low)' }}></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-primary)' }}>EVT-GPD Online</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--stitch-font-mono)', color: 'var(--stitch-text-muted)' }}>v1.4</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', lineHeight: 1.4 }}>
            Tail Risk Exceedance engine calibrated to 88th percentile.
          </div>
        </div>
      </div>
    </aside>
  );
}
