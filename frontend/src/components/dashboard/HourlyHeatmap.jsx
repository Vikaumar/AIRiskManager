import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function HourlyHeatmap({ hourlyPattern = [], categoryRisk = [] }) {
  const maxTxn = Math.max(...hourlyPattern.map(h => h.txn_count || 1), 1);

  return (
    <div className="stitch-grid-2">
      {/* 24-Hour Threat Activity Pattern */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <Clock size={16} color="var(--stitch-accent-cyan)" />
              <span>24-Hour Threat Velocity Map</span>
            </div>
            <div className="stitch-card-subtitle">
              Intraday attack frequencies & night-time spikes
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 110, marginTop: 16 }}>
          {hourlyPattern.map((h, idx) => {
            const heightPct = ((h.txn_count || 1) / maxTxn) * 100;
            const isNight = idx >= 23 || idx <= 5;
            const barColor = isNight ? 'var(--stitch-risk-high)' : 'var(--stitch-accent-primary)';
            return (
              <div
                key={idx}
                title={`Hour ${idx}:00 — ${h.txn_count} txns, ${h.flagged || 0} flagged`}
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
                  height: `${Math.max(6, heightPct)}%`,
                  background: barColor,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.4s ease',
                  opacity: isNight ? 0.95 : 0.65
                }}></div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--stitch-text-muted)' }}>
          <span>00:00 (Night Attack Window)</span>
          <span>12:00 (Peak Retail Volume)</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Category Exposure Ranking */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <AlertTriangle size={16} color="var(--stitch-risk-medium)" />
              <span>Category Vulnerability Index</span>
            </div>
            <div className="stitch-card-subtitle">
              Relative risk exposure across product verticals
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {categoryRisk.slice(0, 5).map((cat) => {
            const riskPct = (cat.avg_risk_score * 100).toFixed(1);
            const isHigh = cat.avg_risk_score > 0.25;
            return (
              <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, width: 110, color: 'var(--stitch-text-secondary)', whiteSpace: 'nowrap' }}>
                  {cat.category}
                </span>
                <div style={{ flex: 1, height: 7, background: 'var(--stitch-surface-2)', borderRadius: 'var(--stitch-radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, cat.avg_risk_score * 300)}%`,
                    background: isHigh ? 'var(--stitch-gradient-danger)' : 'var(--stitch-gradient-brand)',
                    borderRadius: 'var(--stitch-radius-full)'
                  }}></div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--stitch-font-mono)', width: 45, textAlign: 'right', color: isHigh ? 'var(--stitch-risk-critical)' : 'var(--stitch-text-muted)' }}>
                  {riskPct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
