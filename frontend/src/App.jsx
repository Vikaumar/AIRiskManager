import { useState, useEffect, useCallback } from 'react'
import './index.css'

const API_BASE = 'http://localhost:8000/api'

// ── Risk Badge Component ────────────────────────────────────
function RiskBadge({ level }) {
  return (
    <span className={`risk-badge ${level?.toLowerCase()}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'currentColor', display: 'inline-block'
      }}></span>
      {level}
    </span>
  )
}

// ── Action Badge Component ──────────────────────────────────
function ActionBadge({ action }) {
  return (
    <span className={`action-badge ${action?.toLowerCase()}`}>
      {action}
    </span>
  )
}

// ── Stat Card Component ─────────────────────────────────────
function StatCard({ label, value, subtitle, variant = '' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${variant === 'danger' ? '' : 'accent'}`}
        style={variant === 'danger' ? { color: 'var(--risk-critical)' } :
          variant === 'success' ? { color: 'var(--risk-low)' } :
            variant === 'warning' ? { color: 'var(--risk-medium)' } : {}}>
        {value}
      </div>
      {subtitle && <div className="stat-change">{subtitle}</div>}
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Scorer state
  const [scorerForm, setScorerForm] = useState({
    amount: 250,
    category: 'Electronics',
    is_new_customer: 0,
    customer_age_days: 365,
    payment_method: 'credit_card',
    device: 'desktop',
    session_duration_sec: 180,
    pages_viewed: 5,
    shipping_destination: 'domestic',
    txn_velocity_24h: 1,
    ip_risk_score: 0.1,
    is_vpn: 0,
    email_domain_type: 'established',
    billing_shipping_mismatch: 0,
  })
  const [scoreResult, setScoreResult] = useState(null)
  const [scoring, setScoring] = useState(false)

  // ── Fetch Data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [dashRes, metricsRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard`),
        fetch(`${API_BASE}/metrics`),
        fetch(`${API_BASE}/recent-alerts`),
      ])

      if (!dashRes.ok || !metricsRes.ok || !alertsRes.ok) {
        throw new Error('API not ready yet')
      }

      setDashboard(await dashRes.json())
      setMetrics(await metricsRes.json())
      setAlerts(await alertsRes.json())
      setLoading(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      // Retry after 2 seconds
      setTimeout(fetchData, 2000)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Score Transaction ─────────────────────────────────
  const handleScore = async () => {
    setScoring(true)
    try {
      const res = await fetch(`${API_BASE}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scorerForm),
      })
      setScoreResult(await res.json())
    } catch (err) {
      console.error('Score error:', err)
    }
    setScoring(false)
  }

  // ── Loading Screen ────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <div className="loading-text">🛡️ AI Risk Manager</div>
        <div className="loading-subtext">
          {error ? 'Connecting to backend... Training model...' : 'Loading dashboard data...'}
        </div>
      </div>
    )
  }

  const { summary, loss_breakdown, risk_distribution, category_risk,
    hourly_pattern, payment_risk, top_risky, risk_histogram,
    action_distribution } = dashboard

  return (
    <div className="app">
      {/* ── Header ──────────────────────────────────── */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">🛡️</div>
            <div>
              <div className="logo-text">AI Risk Manager</div>
              <div className="logo-subtitle">Merchant Defense System</div>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="status-badge">
            <span className="status-dot"></span>
            Model Active
          </div>
        </div>
      </header>

      {/* ── Navigation ──────────────────────────────── */}
      <nav className="nav-tabs">
        {[
          { id: 'dashboard', label: '📊 Dashboard', },
          { id: 'metrics', label: '🎯 Model Metrics', },
          { id: 'alerts', label: '🚨 Alerts', },
          { id: 'scorer', label: '🔍 Transaction Scorer', },
        ].map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Main Content ────────────────────────────── */}
      <main className="main-content">

        {/* ═══ Dashboard Tab ═══ */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stat Cards */}
            <div className="stats-grid">
              <StatCard
                label="Total Transactions"
                value={summary.total_transactions.toLocaleString()}
                subtitle="Synthetic test dataset"
              />
              <StatCard
                label="Flagged Transactions"
                value={summary.total_flagged.toLocaleString()}
                subtitle={`${(summary.flag_rate * 100).toFixed(1)}% flag rate`}
                variant="warning"
              />
              <StatCard
                label="Losses Detected"
                value={summary.detected_losses.toLocaleString()}
                subtitle={`of ${summary.actual_loss_count} actual losses`}
                variant="success"
              />
              <StatCard
                label="Missed Losses"
                value={summary.missed_losses.toLocaleString()}
                subtitle={`${summary.false_alarms} false alarms`}
                variant="danger"
              />
            </div>

            {/* Charts */}
            <div className="charts-grid">
              {/* Risk Distribution */}
              <div className="chart-card">
                <div className="chart-title">Risk Level Distribution</div>
                <div className="chart-subtitle">Transaction risk stratification</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                    const count = risk_distribution[level] || 0
                    const pct = (count / summary.total_transactions * 100)
                    const colors = {
                      CRITICAL: 'var(--risk-critical)',
                      HIGH: 'var(--risk-high)',
                      MEDIUM: 'var(--risk-medium)',
                      LOW: 'var(--risk-low)',
                    }
                    return (
                      <div key={level}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <RiskBadge level={level} />
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                            {count.toLocaleString()} ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div style={{
                          height: 8, background: 'rgba(255,255,255,0.03)',
                          borderRadius: 4, overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: colors[level], borderRadius: 4,
                            transition: 'width 0.6s ease'
                          }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Loss Type Breakdown */}
              <div className="chart-card">
                <div className="chart-title">Loss Type Breakdown</div>
                <div className="chart-subtitle">Fraud, returns & chargebacks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  {Object.entries(loss_breakdown).map(([type, count]) => {
                    const pct = (count / summary.total_transactions * 100)
                    const colors = {
                      legitimate: 'var(--risk-low)',
                      fraud: 'var(--risk-critical)',
                      return: 'var(--risk-high)',
                      chargeback: 'var(--risk-medium)',
                    }
                    const icons = {
                      legitimate: '✅', fraud: '🚫', return: '↩️', chargeback: '⚡'
                    }
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: colors[type] }}>
                            {icons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                            {count.toLocaleString()} ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div style={{
                          height: 8, background: 'rgba(255,255,255,0.03)',
                          borderRadius: 4, overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', width: `${Math.min(pct * (type === 'legitimate' ? 1 : 5), 100)}%`,
                            background: colors[type], borderRadius: 4,
                            transition: 'width 0.6s ease'
                          }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Category Risk Analysis */}
              <div className="chart-card">
                <div className="chart-title">Category Risk Analysis</div>
                <div className="chart-subtitle">Average risk score by product category</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {[...category_risk]
                    .sort((a, b) => b.avg_risk_score - a.avg_risk_score)
                    .map(cat => (
                      <div key={cat.category} className="feature-bar">
                        <span className="feature-name" style={{ minWidth: 120 }}>{cat.category}</span>
                        <div className="feature-bar-track">
                          <div className="feature-bar-fill" style={{
                            width: `${cat.avg_risk_score * 100}%`,
                            background: cat.avg_risk_score > 0.3 ? 'var(--gradient-danger)' :
                              cat.avg_risk_score > 0.2 ? 'var(--gradient-warning)' : 'var(--gradient-primary)'
                          }}></div>
                        </div>
                        <span className="feature-bar-value">{(cat.avg_risk_score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Payment Method Risk */}
              <div className="chart-card">
                <div className="chart-title">Payment Method Risk</div>
                <div className="chart-subtitle">Flag rate by payment method</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {[...payment_risk]
                    .sort((a, b) => b.flag_rate - a.flag_rate)
                    .map(pm => (
                      <div key={pm.payment_method} className="feature-bar">
                        <span className="feature-name" style={{ minWidth: 140 }}>
                          {pm.payment_method.replace(/_/g, ' ')}
                        </span>
                        <div className="feature-bar-track">
                          <div className="feature-bar-fill" style={{
                            width: `${pm.flag_rate * 100 * 3}%`,
                            background: pm.flag_rate > 0.3 ? 'var(--gradient-danger)' :
                              pm.flag_rate > 0.15 ? 'var(--gradient-warning)' : 'var(--gradient-primary)'
                          }}></div>
                        </div>
                        <span className="feature-bar-value">{(pm.flag_rate * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Risk Score Histogram */}
              <div className="chart-card full-width">
                <div className="chart-title">Risk Score Distribution</div>
                <div className="chart-subtitle">Histogram of transaction risk scores (0 = safe, 1 = certain fraud)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120, marginTop: 16 }}>
                  {risk_histogram.map((bin, i) => {
                    const maxCount = Math.max(...risk_histogram.map(b => b.count))
                    const height = (bin.count / maxCount * 100)
                    const hue = 120 - (bin.bin_start * 120) // green->red
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%', height: `${height}%`, minHeight: 2,
                          background: `hsl(${hue}, 70%, 50%)`,
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}></div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>0.0 (Safe)</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>0.5</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>1.0 (Fraud)</span>
                </div>
              </div>
            </div>

            {/* Top Risky Transactions */}
            <div className="alerts-panel">
              <div className="section-header">
                <div>
                  <div className="section-title">🔥 Highest Risk Transactions</div>
                  <div className="section-subtitle">Top 10 transactions by risk score</div>
                </div>
              </div>
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Action</th>
                    <th>Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {top_risky.map((txn, i) => (
                    <tr key={i}>
                      <td className="mono">{txn.transaction_id}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>${txn.amount.toFixed(2)}</td>
                      <td>{txn.category}</td>
                      <td className="mono" style={{
                        color: txn.risk_score > 0.7 ? 'var(--risk-critical)' :
                          txn.risk_score > 0.5 ? 'var(--risk-high)' : 'var(--risk-medium)',
                        fontWeight: 700
                      }}>
                        {(txn.risk_score * 100).toFixed(1)}%
                      </td>
                      <td><RiskBadge level={txn.risk_level} /></td>
                      <td><ActionBadge action={txn.recommended_action} /></td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: txn.loss_type !== 'legitimate' ? 'var(--risk-critical)' : 'var(--risk-low)'
                        }}>
                          {txn.loss_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ Metrics Tab ═══ */}
        {activeTab === 'metrics' && metrics && (
          <>
            {/* Core Metrics */}
            <div className="metrics-panel gradient-border">
              <div className="metrics-header">
                <div className="metrics-title">🎯 Model Performance — Held-Out Test Set</div>
                <span className="metrics-badge">Honest Metrics</span>
              </div>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className={`metric-value ${metrics.precision > 0.7 ? 'good' : metrics.precision > 0.5 ? 'warning' : 'bad'}`}>
                    {(metrics.precision * 100).toFixed(1)}%
                  </div>
                  <div className="metric-label">Precision</div>
                </div>
                <div className="metric-item">
                  <div className={`metric-value ${metrics.recall > 0.7 ? 'good' : metrics.recall > 0.5 ? 'warning' : 'bad'}`}>
                    {(metrics.recall * 100).toFixed(1)}%
                  </div>
                  <div className="metric-label">Recall</div>
                </div>
                <div className="metric-item">
                  <div className={`metric-value ${metrics.f1_score > 0.7 ? 'good' : metrics.f1_score > 0.5 ? 'warning' : 'bad'}`}>
                    {(metrics.f1_score * 100).toFixed(1)}%
                  </div>
                  <div className="metric-label">F1 Score</div>
                </div>
                <div className="metric-item">
                  <div className={`metric-value ${metrics.auc_roc > 0.8 ? 'good' : 'warning'}`}>
                    {(metrics.auc_roc * 100).toFixed(1)}%
                  </div>
                  <div className="metric-label">AUC-ROC</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value neutral">
                    {(metrics.average_precision * 100).toFixed(1)}%
                  </div>
                  <div className="metric-label">Avg Precision</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value neutral">
                    {metrics.threshold.toFixed(3)}
                  </div>
                  <div className="metric-label">Threshold</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              {/* Confusion Matrix */}
              <div className="chart-card">
                <div className="chart-title">Confusion Matrix</div>
                <div className="chart-subtitle">True vs predicted classifications on test set</div>
                <div style={{ marginTop: 16 }}>
                  <div className="confusion-matrix">
                    <div></div>
                    <div className="cm-header">Pred Loss</div>
                    <div className="cm-header">Pred OK</div>

                    <div className="cm-header" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>Actual Loss</div>
                    <div className="cm-cell cm-tp">
                      {metrics.confusion_matrix.true_positives.toLocaleString()}
                      <div className="cm-label">TP</div>
                    </div>
                    <div className="cm-cell cm-fn">
                      {metrics.confusion_matrix.false_negatives.toLocaleString()}
                      <div className="cm-label">FN</div>
                    </div>

                    <div className="cm-header" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>Actual OK</div>
                    <div className="cm-cell cm-fp">
                      {metrics.confusion_matrix.false_positives.toLocaleString()}
                      <div className="cm-label">FP</div>
                    </div>
                    <div className="cm-cell cm-tn">
                      {metrics.confusion_matrix.true_negatives.toLocaleString()}
                      <div className="cm-label">TN</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="chart-card">
                <div className="chart-title">💰 False-Positive Cost Analysis</div>
                <div className="chart-subtitle">Economic impact of model decisions</div>
                <div className="cost-grid" style={{ marginTop: 16 }}>
                  <div className="cost-item">
                    <div className="cost-value" style={{ color: 'var(--risk-high)' }}>
                      ${metrics.cost_analysis.total_fp_cost.toLocaleString()}
                    </div>
                    <div className="cost-label">FP Review Cost</div>
                  </div>
                  <div className="cost-item">
                    <div className="cost-value" style={{ color: 'var(--risk-critical)' }}>
                      ${metrics.cost_analysis.total_fn_cost.toLocaleString()}
                    </div>
                    <div className="cost-label">Missed Fraud Cost</div>
                  </div>
                  <div className="cost-item">
                    <div className="cost-value" style={{ color: 'var(--text-accent)' }}>
                      ${metrics.cost_analysis.total_cost.toLocaleString()}
                    </div>
                    <div className="cost-label">Total Cost</div>
                  </div>
                  <div className="cost-item">
                    <div className="cost-value" style={{ color: 'var(--text-secondary)' }}>
                      ${metrics.cost_analysis.cost_per_transaction.toFixed(2)}
                    </div>
                    <div className="cost-label">Cost / Txn</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  FP cost: ${metrics.cost_analysis.false_positive_cost_per_unit} per manual review.
                  FN cost: 1× missed transaction amount.
                </div>
              </div>

              {/* Feature Importance */}
              <div className="chart-card full-width">
                <div className="chart-title">🧠 Feature Importance (Gradient Boosting)</div>
                <div className="chart-subtitle">Top features driving fraud detection decisions</div>
                <div style={{ marginTop: 16 }}>
                  {metrics.feature_importance.map((feat, i) => {
                    const maxImp = metrics.feature_importance[0].importance
                    return (
                      <div key={i} className="feature-bar">
                        <span className="feature-name">{feat.feature}</span>
                        <div className="feature-bar-track">
                          <div className="feature-bar-fill" style={{
                            width: `${(feat.importance / maxImp) * 100}%`
                          }}></div>
                        </div>
                        <span className="feature-bar-value">
                          {(feat.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Individual Model Performance */}
              <div className="chart-card full-width">
                <div className="chart-title">🤖 Individual Model Comparison</div>
                <div className="chart-subtitle">Performance of each model in the ensemble</div>
                <table className="alerts-table" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>AUC-ROC</th>
                      <th>Average Precision</th>
                      <th>Ensemble Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.model_scores).map(([name, scores]) => {
                      const weights = { gradient_boosting: '50%', random_forest: '35%', logistic_regression: '15%' }
                      return (
                        <tr key={name}>
                          <td style={{ fontWeight: 600 }}>{name.replace(/_/g, ' ')}</td>
                          <td className="mono" style={{
                            color: scores.auc > 0.85 ? 'var(--risk-low)' : 'var(--risk-medium)'
                          }}>
                            {(scores.auc * 100).toFixed(2)}%
                          </td>
                          <td className="mono">{(scores.ap * 100).toFixed(2)}%</td>
                          <td className="mono" style={{ color: 'var(--text-accent)' }}>{weights[name]}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ═══ Alerts Tab ═══ */}
        {activeTab === 'alerts' && (
          <div className="alerts-panel">
            <div className="section-header">
              <div>
                <div className="section-title">🚨 High-Risk Transaction Alerts</div>
                <div className="section-subtitle">{alerts.length} transactions flagged as HIGH or CRITICAL risk</div>
              </div>
            </div>
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Timestamp</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                  <th>Payment</th>
                  <th>Shipping</th>
                  <th>Actual</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, i) => (
                  <tr key={i}>
                    <td className="mono">{alert.transaction_id}</td>
                    <td className="mono" style={{ fontSize: 11 }}>
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>${alert.amount.toFixed(2)}</td>
                    <td>{alert.category}</td>
                    <td className="mono" style={{
                      color: alert.risk_score > 0.7 ? 'var(--risk-critical)' : 'var(--risk-high)',
                      fontWeight: 700
                    }}>
                      {(alert.risk_score * 100).toFixed(1)}%
                    </td>
                    <td><RiskBadge level={alert.risk_level} /></td>
                    <td><ActionBadge action={alert.recommended_action} /></td>
                    <td style={{ fontSize: 12 }}>{alert.payment_method?.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: 12 }}>{alert.shipping_destination?.replace(/_/g, ' ')}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: alert.loss_type !== 'legitimate' ? 'var(--risk-critical)' : 'var(--risk-low)'
                      }}>
                        {alert.loss_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══ Scorer Tab ═══ */}
        {activeTab === 'scorer' && (
          <>
            <div className="scorer-panel">
              <div className="section-header">
                <div>
                  <div className="section-title">🔍 Real-Time Transaction Scorer</div>
                  <div className="section-subtitle">Input transaction details to get an instant risk assessment</div>
                </div>
              </div>

              <div className="scorer-form">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input type="number" value={scorerForm.amount}
                    onChange={e => setScorerForm({ ...scorerForm, amount: parseFloat(e.target.value) || 0 })} />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={scorerForm.category}
                    onChange={e => setScorerForm({ ...scorerForm, category: e.target.value })}>
                    {["Electronics", "Fashion", "Home & Garden", "Digital Goods",
                      "Groceries", "Luxury", "Gaming", "Health & Beauty"].map(c =>
                        <option key={c} value={c}>{c}</option>
                      )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={scorerForm.payment_method}
                    onChange={e => setScorerForm({ ...scorerForm, payment_method: e.target.value })}>
                    {["credit_card", "debit_card", "digital_wallet", "bank_transfer", "buy_now_pay_later"].map(p =>
                      <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Device</label>
                  <select value={scorerForm.device}
                    onChange={e => setScorerForm({ ...scorerForm, device: e.target.value })}>
                    {["mobile", "desktop", "tablet"].map(d =>
                      <option key={d} value={d}>{d}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Shipping</label>
                  <select value={scorerForm.shipping_destination}
                    onChange={e => setScorerForm({ ...scorerForm, shipping_destination: e.target.value })}>
                    {["domestic", "cross_border_low_risk", "cross_border_high_risk"].map(s =>
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Email Domain</label>
                  <select value={scorerForm.email_domain_type}
                    onChange={e => setScorerForm({ ...scorerForm, email_domain_type: e.target.value })}>
                    {["established", "free_provider", "disposable", "custom"].map(e =>
                      <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>New Customer</label>
                  <select value={scorerForm.is_new_customer}
                    onChange={e => setScorerForm({ ...scorerForm, is_new_customer: parseInt(e.target.value) })}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Customer Age (days)</label>
                  <input type="number" value={scorerForm.customer_age_days}
                    onChange={e => setScorerForm({ ...scorerForm, customer_age_days: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="form-group">
                  <label>Session Duration (sec)</label>
                  <input type="number" value={scorerForm.session_duration_sec}
                    onChange={e => setScorerForm({ ...scorerForm, session_duration_sec: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="form-group">
                  <label>Pages Viewed</label>
                  <input type="number" value={scorerForm.pages_viewed}
                    onChange={e => setScorerForm({ ...scorerForm, pages_viewed: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="form-group">
                  <label>Txn Velocity (24h)</label>
                  <input type="number" value={scorerForm.txn_velocity_24h}
                    onChange={e => setScorerForm({ ...scorerForm, txn_velocity_24h: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="form-group">
                  <label>IP Risk Score</label>
                  <input type="number" step="0.01" min="0" max="1" value={scorerForm.ip_risk_score}
                    onChange={e => setScorerForm({ ...scorerForm, ip_risk_score: parseFloat(e.target.value) || 0 })} />
                </div>

                <div className="form-group">
                  <label>VPN</label>
                  <select value={scorerForm.is_vpn}
                    onChange={e => setScorerForm({ ...scorerForm, is_vpn: parseInt(e.target.value) })}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Address Mismatch</label>
                  <select value={scorerForm.billing_shipping_mismatch}
                    onChange={e => setScorerForm({ ...scorerForm, billing_shipping_mismatch: parseInt(e.target.value) })}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={handleScore} disabled={scoring}>
                {scoring ? '⏳ Scoring...' : '🔍 Score Transaction'}
              </button>
            </div>

            {/* Score Result */}
            {scoreResult && (
              <div className="score-result">
                <div className="score-gauge" style={{
                  '--gauge-pct': `${scoreResult.risk_score * 100}%`,
                  '--gauge-color': scoreResult.risk_score > 0.7 ? 'var(--risk-critical)' :
                    scoreResult.risk_score > 0.5 ? 'var(--risk-high)' :
                      scoreResult.risk_score > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)',
                }}>
                  <div className="score-gauge-value" style={{
                    color: scoreResult.risk_score > 0.7 ? 'var(--risk-critical)' :
                      scoreResult.risk_score > 0.5 ? 'var(--risk-high)' :
                        scoreResult.risk_score > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)',
                  }}>
                    {(scoreResult.risk_score * 100).toFixed(0)}%
                  </div>
                  <div className="score-gauge-label">Risk</div>
                </div>

                <div className="score-details">
                  <div className="score-detail-item">
                    <h4>Risk Level</h4>
                    <div className="value"><RiskBadge level={scoreResult.risk_level} /></div>
                  </div>
                  <div className="score-detail-item">
                    <h4>Recommended Action</h4>
                    <div className="value"><ActionBadge action={scoreResult.recommended_action} /></div>
                  </div>
                  <div className="score-detail-item">
                    <h4>Amount</h4>
                    <div className="value" style={{ fontFamily: 'JetBrains Mono' }}>
                      ${scoreResult.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="score-detail-item">
                    <h4>Category</h4>
                    <div className="value">{scoreResult.category}</div>
                  </div>
                  <div className="score-detail-item">
                    <h4>Flagged</h4>
                    <div className="value" style={{
                      color: scoreResult.is_flagged ? 'var(--risk-critical)' : 'var(--risk-low)'
                    }}>
                      {scoreResult.is_flagged ? '🚫 YES' : '✅ NO'}
                    </div>
                  </div>
                  <div className="score-detail-item">
                    <h4>Transaction ID</h4>
                    <div className="value" style={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                      {scoreResult.transaction_id}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Test Scenarios */}
            <div className="chart-card" style={{ marginTop: 16 }}>
              <div className="chart-title">⚡ Quick Test Scenarios</div>
              <div className="chart-subtitle">Click to pre-fill suspicious transaction patterns</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {[
                  {
                    label: '🚫 Obvious Fraud',
                    data: {
                      amount: 8500, category: 'Luxury', is_new_customer: 1,
                      customer_age_days: 2, payment_method: 'buy_now_pay_later',
                      device: 'mobile', session_duration_sec: 15, pages_viewed: 1,
                      shipping_destination: 'cross_border_high_risk', txn_velocity_24h: 12,
                      ip_risk_score: 0.85, is_vpn: 1, email_domain_type: 'disposable',
                      billing_shipping_mismatch: 1,
                    }
                  },
                  {
                    label: '⚠️ Suspicious Return',
                    data: {
                      amount: 450, category: 'Fashion', is_new_customer: 0,
                      customer_age_days: 45, payment_method: 'credit_card',
                      device: 'mobile', session_duration_sec: 60, pages_viewed: 2,
                      shipping_destination: 'domestic', txn_velocity_24h: 4,
                      ip_risk_score: 0.3, is_vpn: 0, email_domain_type: 'free_provider',
                      billing_shipping_mismatch: 1,
                    }
                  },
                  {
                    label: '✅ Legitimate Purchase',
                    data: {
                      amount: 75, category: 'Groceries', is_new_customer: 0,
                      customer_age_days: 800, payment_method: 'debit_card',
                      device: 'desktop', session_duration_sec: 420, pages_viewed: 12,
                      shipping_destination: 'domestic', txn_velocity_24h: 1,
                      ip_risk_score: 0.05, is_vpn: 0, email_domain_type: 'established',
                      billing_shipping_mismatch: 0,
                    }
                  },
                  {
                    label: '⚡ Chargeback Risk',
                    data: {
                      amount: 1200, category: 'Electronics', is_new_customer: 1,
                      customer_age_days: 10, payment_method: 'credit_card',
                      device: 'mobile', session_duration_sec: 30, pages_viewed: 1,
                      shipping_destination: 'cross_border_high_risk', txn_velocity_24h: 3,
                      ip_risk_score: 0.5, is_vpn: 1, email_domain_type: 'free_provider',
                      billing_shipping_mismatch: 1,
                    }
                  },
                ].map(scenario => (
                  <button key={scenario.label} className="btn-primary" style={{
                    background: 'var(--bg-elevated)', fontSize: 12, padding: '8px 16px'
                  }} onClick={() => {
                    setScorerForm({ ...scorerForm, ...scenario.data })
                    setScoreResult(null)
                  }}>
                    {scenario.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}>
        <div>AI Risk Manager v1.0 — Defense-only fraud detection system</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Test Dataset: {summary?.total_transactions?.toLocaleString()} transactions</span>
          <span>Model: Ensemble (GBM + RF + LR)</span>
          <span>EVT-Inspired Risk Features</span>
        </div>
      </footer>
    </div>
  )
}
