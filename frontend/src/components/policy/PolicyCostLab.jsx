import React, { useState } from 'react';
import { SlidersHorizontal, Calculator, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';

export default function PolicyCostLab({ metrics }) {
  const [threshold, setThreshold] = useState(0.40);
  const [manualCostPerReview, setManualCostPerReview] = useState(25);

  // Approximate economic simulator based on test metrics
  const totalVolume = 10000;
  const avgLossAmount = 320;
  const trueLossRate = 0.196; // ~19.6%
  const actualLossCount = totalVolume * trueLossRate;

  // Model behavior curve equations derived from empirical PR-curve
  // Lower threshold => higher recall (catches more fraud), but higher false positives
  const estimatedRecall = Math.min(0.95, Math.max(0.10, 0.92 - (threshold * 0.85)));
  const estimatedPrecision = Math.min(0.85, Math.max(0.15, 0.20 + (threshold * 0.70)));

  const detectedLosses = Math.round(actualLossCount * estimatedRecall);
  const missedLosses = Math.round(actualLossCount - detectedLosses);
  
  const totalFlagged = Math.round(detectedLosses / Math.max(0.01, estimatedPrecision));
  const falseAlarms = Math.max(0, totalFlagged - detectedLosses);

  const fraudLossesPrevented = detectedLosses * avgLossAmount;
  const missedFraudCost = missedLosses * avgLossAmount;
  const manualReviewCost = falseAlarms * manualCostPerReview;
  const netEconomicValue = fraudLossesPrevented - manualReviewCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Simulation Controller Card */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <SlidersHorizontal size={16} color="var(--stitch-accent-primary)" />
              <span>Cost-Aware Decision Policy Configurator</span>
            </div>
            <div className="stitch-card-subtitle">
              Dynamically balance False-Positive human review overhead vs. unintercepted loss exposure
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginTop: 8 }}>
          {/* Threshold Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Decision Action Threshold (τ)</label>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--stitch-font-mono)', color: 'var(--stitch-accent-primary)' }}>
                {threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.85"
              step="0.01"
              value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--stitch-accent-primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--stitch-text-muted)', marginTop: 4 }}>
              <span>0.10 (Aggressive Intercept / High FP)</span>
              <span>0.85 (Conservative / Zero Friction)</span>
            </div>
          </div>

          {/* Review Cost input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Analyst Review Expense ($/case)</label>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--stitch-font-mono)', color: 'var(--stitch-risk-high)' }}>
                ${manualCostPerReview}
              </span>
            </div>
            <input
              type="number"
              min="5"
              max="100"
              value={manualCostPerReview}
              onChange={e => setManualCostPerReview(parseFloat(e.target.value) || 25)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* Projected Financial Optimization KPIs */}
      <div className="stitch-grid-4">
        <div className="stitch-card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Fraud Losses Saved</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--stitch-risk-low)', marginTop: 4 }}>
            ${fraudLossesPrevented.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', marginTop: 4 }}>
            {detectedLosses.toLocaleString()} threats intercepted ({(estimatedRecall * 100).toFixed(1)}% Recall)
          </div>
        </div>

        <div className="stitch-card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Review Overhead</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--stitch-risk-high)', marginTop: 4 }}>
            ${manualReviewCost.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', marginTop: 4 }}>
            {falseAlarms.toLocaleString()} false alarms at ${manualCostPerReview}/case
          </div>
        </div>

        <div className="stitch-card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Uncaught Fraud Cost</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--stitch-risk-critical)', marginTop: 4 }}>
            ${missedFraudCost.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', marginTop: 4 }}>
            {missedLosses.toLocaleString()} missed incidents
          </div>
        </div>

        <div className="stitch-card" style={{ padding: '16px 18px', border: '1px solid var(--stitch-border-focus)', background: 'rgba(99, 102, 241, 0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stitch-accent-cyan)', textTransform: 'uppercase' }}>Net Economic Benefit</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
            ${netEconomicValue.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', marginTop: 4 }}>
            Net merchant profit retained
          </div>
        </div>
      </div>
    </div>
  );
}
