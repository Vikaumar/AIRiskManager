import React, { useState } from 'react';
import { Sliders, DollarSign, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function PolicyOptimizer({ metrics }) {
  const [threshold, setThreshold] = useState(0.38);
  const [analystRate, setAnalystRate] = useState(25);

  const totalVolume = 10000;
  const avgLossAmount = 320;
  const trueLossRate = 0.196;
  const actualLossCount = totalVolume * trueLossRate;

  const estimatedRecall = Math.min(0.96, Math.max(0.08, 0.94 - (threshold * 0.88)));
  const estimatedPrecision = Math.min(0.88, Math.max(0.12, 0.18 + (threshold * 0.72)));

  const detectedLosses = Math.round(actualLossCount * estimatedRecall);
  const missedLosses = Math.round(actualLossCount - detectedLosses);
  
  const totalFlagged = Math.round(detectedLosses / Math.max(0.01, estimatedPrecision));
  const falseAlarms = Math.max(0, totalFlagged - detectedLosses);

  const fraudLossesPrevented = detectedLosses * avgLossAmount;
  const missedFraudCost = missedLosses * avgLossAmount;
  const manualReviewCost = falseAlarms * analystRate;
  const netEconomicValue = fraudLossesPrevented - manualReviewCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Parameter Adjustment */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <Sliders size={14} color="#818cf8" />
              <span>Cost-Aware Decision Policy Calibration</span>
            </div>
            <div className="pro-card-subtitle">
              Calibrate operational review expense against downstream loss prevention
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Threshold Cutoff (τ)</label>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818cf8' }}>
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
              style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
              <span>0.10 (High Intercept / High FP)</span>
              <span>0.85 (Zero Friction)</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Analyst Hourly / Case Expense</label>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fb923c' }}>
                ${analystRate}
              </span>
            </div>
            <input
              type="number"
              min="5"
              max="100"
              value={analystRate}
              onChange={e => setAnalystRate(parseFloat(e.target.value) || 25)}
              style={{ width: '100%', padding: '6px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
            />
          </div>
        </div>
      </div>

      {/* Financial Matrix Cards */}
      <div className="grid-4">
        <div className="pro-card">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fraud Loss Intercepted</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: 4 }}>
            ${fraudLossesPrevented.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            {detectedLosses.toLocaleString()} threats intercepted ({(estimatedRecall * 100).toFixed(1)}% Recall)
          </div>
        </div>

        <div className="pro-card">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Analyst Verification Overhead</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fb923c', marginTop: 4 }}>
            ${manualReviewCost.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            {falseAlarms.toLocaleString()} false alarms at ${analystRate}/ticket
          </div>
        </div>

        <div className="pro-card">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Uncaught Loss Leakage</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fb7185', marginTop: 4 }}>
            ${missedFraudCost.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            {missedLosses.toLocaleString()} missed incidents
          </div>
        </div>

        <div className="pro-card" style={{ border: '1px solid rgba(99, 102, 241, 0.35)', background: 'var(--surface-muted)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>Net Economic Benefit</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: 4 }}>
            ${netEconomicValue.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            Net profit retained after review expenses
          </div>
        </div>
      </div>
    </div>
  );
}
