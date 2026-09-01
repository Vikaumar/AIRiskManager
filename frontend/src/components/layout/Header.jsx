import React from 'react';
import { Search, Bell, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';

export default function Header({ isRefreshing, onRefresh, activeTabName }) {
  return (
    <header className="stitch-header">
      {/* Breadcrumb / Section context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--stitch-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Merchant Defense
        </span>
        <span style={{ color: 'var(--stitch-border-strong)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--stitch-text-primary)' }}>
          {activeTabName}
        </span>
      </div>

      {/* Action Controls & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Environment Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 'var(--stitch-radius-full)',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--stitch-accent-primary)'
        }}>
          <Cpu size={12} />
          <span>PRODUCTION-SANDBOX</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="stitch-btn stitch-btn-secondary"
          style={{ padding: '6px 12px', fontSize: 12 }}
          disabled={isRefreshing}
          title="Sync latest live inferences"
        >
          <RefreshCw size={13} className={isRefreshing ? 'stitch-spin' : ''} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        {/* Protection Health Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--stitch-radius-sm)',
          background: 'var(--stitch-risk-low-bg)',
          border: '1px solid var(--stitch-risk-low-border)',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--stitch-risk-low)'
        }}>
          <ShieldCheck size={14} />
          <span>Shield 100% Active</span>
        </div>
      </div>
    </header>
  );
}
