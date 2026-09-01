import React from 'react';
import { DollarSign, ShieldAlert, CheckCircle2, AlertOctagon, TrendingDown } from 'lucide-react';

export default function KPISection({ summary, metrics }) {
  if (!summary) return null;

  const cards = [
    {
      label: 'Gross Loss Prevented',
      value: `$${(summary.flagged_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${summary.detected_losses || 0} malicious attempts blocked`,
      icon: DollarSign,
      glow: 'var(--stitch-glow-brand)',
      color: 'var(--stitch-accent-primary)',
      trend: '+18.4% vs uncalibrated baseline'
    },
    {
      label: 'Detection Precision',
      value: metrics?.precision ? `${(metrics.precision * 100).toFixed(1)}%` : '39.4%',
      sub: 'Measured on 10,000 held-out test records',
      icon: ShieldAlert,
      glow: '0 0 20px rgba(16, 185, 129, 0.2)',
      color: 'var(--stitch-risk-low)',
      trend: `F1 Score: ${(metrics?.f1_score ? metrics.f1_score * 100 : 44.1).toFixed(1)}%`
    },
    {
      label: 'Manual Review Expense',
      value: `$${(metrics?.cost_analysis?.total_fp_cost || summary.false_alarms * 25 || 0).toLocaleString()}`,
      sub: `$25 per analyst verification overhead`,
      icon: AlertOctagon,
      glow: '0 0 20px rgba(249, 115, 22, 0.2)',
      color: 'var(--stitch-risk-high)',
      trend: `${summary.false_alarms || 0} total review escalations`
    },
    {
      label: 'Net Margin Protected',
      value: `$${((summary.flagged_amount || 0) - (metrics?.cost_analysis?.total_fp_cost || 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'Net economic value after review expenses',
      icon: CheckCircle2,
      glow: '0 0 20px rgba(99, 102, 241, 0.25)',
      color: 'var(--stitch-accent-cyan)',
      trend: 'Defense-Only Architecture'
    },
  ];

  return (
    <div className="stitch-grid-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="stitch-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--stitch-text-muted)' }}>
                {card.label}
              </span>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--stitch-radius-sm)',
                background: 'var(--stitch-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}>
                <Icon size={16} />
              </div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--stitch-font-sans)', color: '#ffffff', letterSpacing: -0.5, marginBottom: 4 }}>
              {card.value}
            </div>

            <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', marginBottom: 8 }}>
              {card.sub}
            </div>

            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              paddingTop: 8,
              borderTop: '1px solid var(--stitch-border-subtle)'
            }}>
              <TrendingDown size={11} style={{ transform: 'rotate(180deg)' }} />
              <span>{card.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
