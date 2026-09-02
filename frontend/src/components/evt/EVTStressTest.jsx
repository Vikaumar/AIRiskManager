import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';
import { fetchEVTAnalysis } from '../../services/api';

// Canvas-based dual-curve renderer
function TailCurveCanvas({ analysis, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysis) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const { x_points, gpd_survival, gaussian_survival, threshold } = analysis;
    if (!x_points || !x_points.length) return;

    ctx.clearRect(0, 0, width, height);

    const pad = { top: 30, right: 24, bottom: 50, left: 64 };
    const pw = width - pad.left - pad.right;
    const ph = height - pad.top - pad.bottom;

    const xMin = x_points[0];
    const xMax = x_points[x_points.length - 1];

    // Use log scale for survival probabilities
    const allVals = [...gpd_survival, ...gaussian_survival].filter((v) => v > 0);
    const yMin = Math.max(Math.min(...allVals) * 0.5, 1e-10);
    const yMax = Math.max(...allVals) * 1.5;

    function toX(val) { return pad.left + ((val - xMin) / (xMax - xMin)) * pw; }
    function toY(val) {
      if (val <= 0) return pad.top + ph;
      const logVal = Math.log10(val);
      const logMin = Math.log10(yMin);
      const logMax = Math.log10(yMax);
      return pad.top + ph - ((logVal - logMin) / (logMax - logMin)) * ph;
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (ph / 5) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + pw, y);
      ctx.stroke();
    }

    // X axis labels
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    const xTicks = 6;
    for (let i = 0; i <= xTicks; i++) {
      const val = xMin + (xMax - xMin) * (i / xTicks);
      const x = toX(val);
      ctx.fillText(`$${Math.round(val).toLocaleString()}`, x, height - 10);
    }

    // Y axis labels (log scale)
    ctx.textAlign = 'right';
    const logMin = Math.log10(yMin);
    const logMax = Math.log10(yMax);
    for (let p = Math.ceil(logMin); p <= Math.floor(logMax); p++) {
      const val = Math.pow(10, p);
      const y = toY(val);
      if (y >= pad.top && y <= pad.top + ph) {
        ctx.fillText(`10^${p}`, pad.left - 8, y + 4);
      }
    }

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Transaction Amount ($)', pad.left + pw / 2, height - 0);
    ctx.save();
    ctx.translate(14, pad.top + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P(Loss > x) — Survival', 0, 0);
    ctx.restore();

    // Threshold line
    const threshX = toX(threshold);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(threshX, pad.top);
    ctx.lineTo(threshX, pad.top + ph);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#818cf8';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`τ = $${threshold.toLocaleString()}`, threshX + 4, pad.top + 12);

    // Draw Gaussian curve (dashed, faded)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;
    x_points.forEach((x, i) => {
      const v = gaussian_survival[i];
      if (v <= 0) return;
      const px = toX(x);
      const py = toY(v);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw GPD curve (solid, vibrant)
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    started = false;
    x_points.forEach((x, i) => {
      const v = gpd_survival[i];
      if (v <= 0) return;
      const px = toX(x);
      const py = toY(v);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Area between curves (showing underestimation)
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    let firstX = null;
    x_points.forEach((x, i) => {
      const gv = gpd_survival[i];
      const nv = gaussian_survival[i];
      if (gv <= 0 || nv <= 0) return;
      const px = toX(x);
      if (firstX === null) { firstX = px; ctx.moveTo(px, toY(gv)); }
      else ctx.lineTo(px, toY(gv));
    });
    // Go back along Gaussian
    for (let i = x_points.length - 1; i >= 0; i--) {
      const nv = gaussian_survival[i];
      if (nv <= 0) continue;
      ctx.lineTo(toX(x_points[i]), toY(nv));
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Legend
    const legendX = pad.left + pw - 180;
    const legendY = pad.top + 12;
    ctx.fillStyle = 'rgba(18, 20, 28, 0.9)';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, 170, 50, 6);
    ctx.fill();
    ctx.stroke();

    // GPD legend
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(legendX + 10, legendY + 16);
    ctx.lineTo(legendX + 30, legendY + 16);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GPD (Tail-Aware)', legendX + 36, legendY + 20);

    // Gaussian legend
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(legendX + 10, legendY + 36);
    ctx.lineTo(legendX + 30, legendY + 36);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Gaussian (Naive)', legendX + 36, legendY + 40);

  }, [analysis, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height, borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}
    />
  );
}

export default function EVTStressTest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(2); // Default to 0.88 quantile

  useEffect(() => {
    fetchEVTAnalysis().then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pro-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Loader2 size={20} className="spin" style={{ marginRight: 8 }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fitting Generalized Pareto Distribution...</span>
      </div>
    );
  }

  if (!data || !data.analyses || !data.analyses.length) {
    return (
      <div className="pro-card" style={{ padding: 30, textAlign: 'center' }}>
        <span style={{ color: 'var(--text-muted)' }}>No EVT analysis data available.</span>
      </div>
    );
  }

  const analysis = data.analyses[selectedIdx] || data.analyses[0];
  const stats = data.amount_stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header with distribution stats */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <Activity size={14} color="#818cf8" />
              <span>Extreme Value Theory — Tail Risk Stress Test</span>
            </div>
            <div className="pro-card-subtitle">
              Pickands–Balkema–de Haan Theorem: Peaks-Over-Threshold with Generalized Pareto Distribution
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>POT THRESHOLD (τ):</span>
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                padding: '4px 8px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {data.analyses.map((a, i) => (
                <option key={i} value={i}>
                  Q{(a.quantile * 100).toFixed(0)} — ${a.threshold.toLocaleString()} ({a.n_exceedances} exceedances)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distribution stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {[
            { label: 'N', value: data.n_transactions.toLocaleString(), color: '#94a3b8' },
            { label: 'Mean', value: `$${stats.mean.toLocaleString()}`, color: '#94a3b8' },
            { label: 'σ', value: `$${stats.std.toLocaleString()}`, color: '#94a3b8' },
            { label: 'ξ (Shape)', value: analysis.gpd_shape.toFixed(4), color: analysis.gpd_shape > 0 ? '#f43f5e' : '#10b981' },
            { label: 'σ_GPD (Scale)', value: analysis.gpd_scale.toFixed(2), color: '#818cf8' },
            { label: 'Max', value: `$${stats.max.toLocaleString()}`, color: '#f97316' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface-muted)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Mathematical note */}
        {analysis.gpd_shape > 0 && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'rgba(244, 63, 94, 0.06)',
            border: '1px solid rgba(244, 63, 94, 0.15)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11,
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertTriangle size={13} />
            <span>
              <strong>ξ {'>'} 0</strong> indicates a heavy-tailed (Fréchet-type) distribution.
              Gaussian models will systematically underestimate extreme loss events.
              This is the fat-tail regime where EVT provides superior risk estimates.
            </span>
          </div>
        )}
      </div>

      {/* Survival Curve Comparison */}
      <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="pro-card-title">
            <TrendingUp size={14} color="#818cf8" />
            <span>Survival Function: P(Loss {'>'} x) — Log Scale</span>
          </div>
          <div className="pro-card-subtitle">
            Shaded region shows where Gaussian assumptions underestimate true tail risk
          </div>
        </div>
        <TailCurveCanvas analysis={analysis} width={900} height={360} />
      </div>

      {/* VaR / CVaR Comparison Table + Stress Scenarios */}
      <div className="grid-2">
        {/* VaR Table */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div className="pro-card-title">
              <span>Value-at-Risk & Expected Shortfall Comparison</span>
            </div>
          </div>
          <table className="pro-table">
            <thead>
              <tr>
                <th>Confidence</th>
                <th>Gaussian VaR</th>
                <th>GPD VaR</th>
                <th>GPD CVaR</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {analysis.var_comparison.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {(v.confidence * 100).toFixed(1)}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                    ${v.gaussian_var.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 600 }}>
                    ${v.gpd_var.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#f97316' }}>
                    ${v.gpd_cvar.toLocaleString()}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: v.underestimation_pct > 50 ? '#f43f5e' : v.underestimation_pct > 20 ? '#f97316' : '#10b981',
                    }}>
                      {v.underestimation_pct > 0 ? '+' : ''}{v.underestimation_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stress Scenarios */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div className="pro-card-title">
              <AlertTriangle size={14} color="#f43f5e" />
              <span>Extreme Loss Stress Scenarios</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.stress_scenarios.map((s, i) => {
              const gpdPct = (s.gpd_probability * 100);
              const gaussPct = (s.gaussian_probability * 100);
              const gpdLabel = gpdPct >= 0.01 ? `${gpdPct.toFixed(3)}%` : `${(s.gpd_probability * 1e6).toFixed(1)} ppm`;
              const gaussLabel = gaussPct >= 0.01 ? `${gaussPct.toFixed(3)}%` : gaussPct >= 1e-6 ? `${(s.gaussian_probability * 1e6).toFixed(1)} ppm` : '≈ 0';

              return (
                <div key={i} style={{
                  padding: '10px 14px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Loss {'>'} ${s.loss_level.toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: s.ratio > 100 ? '#f43f5e' : s.ratio > 10 ? '#f97316' : '#eab308',
                      background: s.ratio > 100 ? 'rgba(244,63,94,0.1)' : s.ratio > 10 ? 'rgba(249,115,22,0.1)' : 'rgba(234,179,8,0.1)',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}>
                      GPD predicts {s.ratio}× more likely
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>GAUSSIAN</span>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{gaussLabel}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>GPD (EVT)</span>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 600 }}>{gpdLabel}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
