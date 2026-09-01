import React from 'react';
import { SlidersHorizontal, ShieldAlert } from 'lucide-react';

export default function ThreatDistribution({ riskDistribution = {}, lossBreakdown = {}, riskHistogram = [] }) {
  const total = Object.values(riskDistribution).reduce((a, b) => a + b, 0) || 1;

  const tiers = [
    { key: 'CRITICAL', label: 'Critical Risk [Auto-Block]', range: 'Score 700 - 1000', color: '#fb7185', bg: 'var(--status-critical-bg)', count: riskDistribution.CRITICAL || 0 },
    { key: 'HIGH', label: 'High Risk [Manual Review]', range: 'Score 350 - 699', color: '#fb923c', bg: 'var(--status-high-bg)', count: riskDistribution.HIGH || 0 },
    { key: 'MEDIUM', label: 'Medium Risk [Monitoring]', range: 'Score 150 - 349', color: '#facc15', bg: 'var(--status-medium-bg)', count: riskDistribution.MEDIUM || 0 },
    { key: 'LOW', label: 'Low Risk [Instant Allow]', range: 'Score 0 - 149', color: '#34d399', bg: 'var(--status-low-bg)', count: riskDistribution.LOW || 0 },
  ];

  const lossChannels = [
    { type: 'fraud', title: 'Unauthorized Payment Fraud', desc: 'Card theft, brute force enumeration & bot checkouts', count: lossBreakdown.fraud || 0, color: '#fb7185' },
    { type: 'return', title: 'Serial Return Abuse & Wardrobing', desc: 'Policy abuse, excessive returns & margin drain', count: lossBreakdown.return || 0, color: '#fb923c' },
    { type: 'chargeback', title: 'Disputed Claims (Chargebacks)', desc: 'Friendly fraud, item-not-received & chargeback claims', count: lossBreakdown.chargeback || 0, color: '#facc15' },
    { type: 'legitimate', title: 'Clean Merchant Volume', desc: 'Verified friction-free retail checkouts', count: lossBreakdown.legitimate || 0, color: '#34d399' },
  ];

  return (
    <div className="grid-2">
      {/* Tiered Policy Stratification */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <SlidersHorizontal size={14} color="#818cf8" />
              <span>Risk Policy Stratification [0 - 1000 Scale]</span>
            </div>
            <div className="pro-card-subtitle">
              Automated routing rules across threat boundaries
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tiers.map((t) => {
            const pct = ((t.count / total) * 100).toFixed(1);
            return (
              <div key={t.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{t.range}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {t.count.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div style={{ height: 5, width: '100%', background: 'var(--surface-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: t.color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loss Channel Taxonomy */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <ShieldAlert size={14} color="#fb7185" />
              <span>Protected Loss Taxonomy</span>
            </div>
            <div className="pro-card-subtitle">
              Multi-channel defense against fraud, returns & disputes
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lossChannels.map((c) => {
            const pct = ((c.count / total) * 100).toFixed(1);
            return (
              <div
                key={c.type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.desc}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: c.color }}>
                    {c.count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{pct}% vol</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
