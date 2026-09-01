import React from 'react';
import { Clock, Globe } from 'lucide-react';

export default function IntradayThreatCurve({ hourlyPattern = [], categoryRisk = [] }) {
  const maxTxn = Math.max(...hourlyPattern.map(h => h.txn_count || 1), 1);

  return (
    <div className="grid-2">
      {/* 24h Activity Distribution */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <Clock size={14} color="#818cf8" />
              <span>24-Hour Attack Frequency Telemetry</span>
            </div>
            <div className="pro-card-subtitle">
              Automated night attack window detection & peak load pattern
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 95, marginTop: 14 }}>
          {hourlyPattern.map((h, idx) => {
            const heightPct = ((h.txn_count || 1) / maxTxn) * 100;
            const isNight = idx >= 23 || idx <= 5;
            const color = isNight ? '#fb7185' : '#6366f1';
            return (
              <div
                key={idx}
                title={`Hour ${idx}:00 — ${h.txn_count} orders (${h.flagged || 0} threats)`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
              >
                <div style={{
                  width: '100%',
                  height: `${Math.max(5, heightPct)}%`,
                  background: color,
                  borderRadius: '2px 2px 0 0',
                  opacity: isNight ? 0.9 : 0.6,
                  transition: 'height 0.3s ease'
                }}></div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          <span>00:00 (Night Attack Anomaly)</span>
          <span>12:00 (Peak Retail)</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Category Exposure Index */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <Globe size={14} color="#38bdf8" />
              <span>Category Threat Exposure Index</span>
            </div>
            <div className="pro-card-subtitle">
              Relative risk score index across product lines
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {categoryRisk.slice(0, 5).map((c) => {
            const isHigh = c.avg_risk_score > 0.25;
            return (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, width: 110, color: 'var(--text-secondary)' }}>
                  {c.category}
                </span>
                <div style={{ flex: 1, height: 5, background: 'var(--surface-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, c.avg_risk_score * 300)}%`,
                    background: isHigh ? '#fb7185' : '#6366f1',
                    borderRadius: 'var(--radius-full)'
                  }}></div>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, width: 45, textAlign: 'right', color: isHigh ? '#fb7185' : 'var(--text-muted)' }}>
                  {(c.avg_risk_score * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
