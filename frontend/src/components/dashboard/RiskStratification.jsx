import React from 'react';
import { Layers, CreditCard, ShieldX } from 'lucide-react';

export default function RiskStratification({ lossBreakdown = {}, riskDistribution = {}, categoryRisk = [] }) {
  const riskLevels = [
    { key: 'CRITICAL', label: 'Critical Risk (Auto-Block)', color: 'var(--stitch-risk-critical)', pct: riskDistribution.CRITICAL || 0 },
    { key: 'HIGH', label: 'High Risk (Manual Review)', color: 'var(--stitch-risk-high)', pct: riskDistribution.HIGH || 0 },
    { key: 'MEDIUM', label: 'Medium Risk (Monitor)', color: 'var(--stitch-risk-medium)', pct: riskDistribution.MEDIUM || 0 },
    { key: 'LOW', label: 'Low Risk (Auto-Approve)', color: 'var(--stitch-risk-low)', pct: riskDistribution.LOW || 0 },
  ];

  const totalTxn = Object.values(riskDistribution).reduce((a, b) => a + b, 0) || 1;

  const lossColors = {
    legitimate: 'var(--stitch-risk-low)',
    fraud: 'var(--stitch-risk-critical)',
    return: 'var(--stitch-risk-high)',
    chargeback: 'var(--stitch-risk-medium)',
  };

  const lossIcons = {
    legitimate: '✅',
    fraud: '🚫',
    return: '↩️',
    chargeback: '⚡',
  };

  return (
    <div className="stitch-grid-2">
      {/* Risk Stratification Breakdown */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <Layers size={16} color="var(--stitch-accent-primary)" />
              <span>Multi-Tier Risk Stratification</span>
            </div>
            <div className="stitch-card-subtitle">
              Calibrated boundary defense mapping
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {riskLevels.map((lvl) => {
            const count = lvl.pct;
            const percentage = ((count / totalTxn) * 100).toFixed(1);
            return (
              <div key={lvl.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--stitch-text-primary)' }}>
                    {lvl.label}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--stitch-font-mono)', color: 'var(--stitch-text-muted)' }}>
                    {count.toLocaleString()} ({percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--stitch-surface-2)', borderRadius: 'var(--stitch-radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, background: lvl.color, borderRadius: 'var(--stitch-radius-full)', transition: 'width 0.8s ease' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Classes of Loss: Fraud, Returns & Chargebacks */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <ShieldX size={16} color="var(--stitch-risk-critical)" />
              <span>Protected Loss Taxonomy</span>
            </div>
            <div className="stitch-card-subtitle">
              Defense breakdown across 3 merchant vulnerability channels
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(lossBreakdown).map(([type, count]) => {
            const pct = ((count / totalTxn) * 100).toFixed(1);
            const color = lossColors[type] || 'var(--stitch-text-muted)';
            const icon = lossIcons[type] || '📦';
            return (
              <div key={type} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--stitch-radius-sm)',
                background: 'var(--stitch-surface-2)',
                border: '1px solid var(--stitch-border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', textTransform: 'capitalize' }}>
                      {type === 'return' ? 'Serial Return Abuse' : type === 'chargeback' ? 'Friendly & Disputed Chargeback' : type === 'fraud' ? 'Unauthorized Payment Fraud' : 'Legitimate Orders'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)' }}>
                      {type === 'fraud' ? 'Card theft, bots & account takeovers' : type === 'return' ? 'Margin erosion & wardrobing patterns' : type === 'chargeback' ? 'Post-fulfillment claims & dispute risk' : 'Clean customer revenue'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--stitch-font-mono)', color }}>
                    {count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--stitch-text-muted)' }}>
                    {pct}% volume
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
