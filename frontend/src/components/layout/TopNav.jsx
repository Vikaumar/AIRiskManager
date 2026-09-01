import React from 'react';
import { RefreshCw, Search, CheckCircle2, ChevronDown, Building2 } from 'lucide-react';

export default function TopNav({ isRefreshing, onRefresh, activeTabLabel, searchQuery, setSearchQuery }) {
  return (
    <header className="app-header">
      {/* Merchant / Organization Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '4px 10px',
          background: 'var(--surface-base)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}>
          <Building2 size={13} color="var(--text-muted)" />
          <span>Apex Merchant Corp (US-East)</span>
          <ChevronDown size={11} color="var(--text-dim)" />
        </div>

        <span style={{ color: 'var(--border-strong)', fontSize: 12 }}>/</span>

        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {activeTabLabel}
        </span>
      </div>

      {/* Search Input & Action Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Global Search Bar with ⌘K Badge */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={13} color="var(--text-dim)" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            placeholder="Search txn_id, customer, IP..."
            value={searchQuery || ''}
            onChange={e => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              width: 220,
              padding: '6px 36px 6px 30px',
              background: 'var(--surface-base)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
              outline: 'none'
            }}
          />
          <span style={{
            position: 'absolute',
            right: 8,
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            background: 'var(--surface-muted)',
            padding: '1px 4px',
            borderRadius: 3,
            border: '1px solid var(--border-subtle)'
          }}>
            ⌘K
          </span>
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          className="pro-btn pro-btn-secondary"
          style={{ padding: '6px 10px', fontSize: 11 }}
          disabled={isRefreshing}
          title="Fetch latest streaming inferences"
        >
          <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Engine SLA Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 9px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-low-bg)',
          border: '1px solid var(--status-low-border)',
          fontSize: 11,
          fontWeight: 600,
          color: '#34d399'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }}></span>
          <span>Inference Latency: 9ms</span>
        </div>
      </div>
    </header>
  );
}
