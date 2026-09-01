import React, { useState } from 'react';
import { SearchCode, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { scoreTransaction } from '../../services/api';

export default function ExplainabilityModal() {
  const [form, setForm] = useState({
    amount: 8500,
    category: 'Luxury',
    is_new_customer: 1,
    customer_age_days: 3,
    payment_method: 'buy_now_pay_later',
    device: 'mobile',
    session_duration_sec: 14,
    pages_viewed: 1,
    shipping_destination: 'cross_border_high_risk',
    txn_velocity_24h: 9,
    ip_risk_score: 0.88,
    is_vpn: 1,
    email_domain_type: 'disposable',
    billing_shipping_mismatch: 1,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleScore() {
    try {
      setLoading(true);
      const res = await scoreTransaction(form);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const quickScenarios = [
    {
      title: '🚫 Stolen Card / Bot Attack',
      desc: '$8,500 luxury cart via VPN with disposable email',
      data: {
        amount: 8500, category: 'Luxury', is_new_customer: 1,
        customer_age_days: 2, payment_method: 'buy_now_pay_later',
        device: 'mobile', session_duration_sec: 15, pages_viewed: 1,
        shipping_destination: 'cross_border_high_risk', txn_velocity_24h: 12,
        ip_risk_score: 0.85, is_vpn: 1, email_domain_type: 'disposable',
        billing_shipping_mismatch: 1
      }
    },
    {
      title: '↩️ Serial Return Abuse',
      desc: '$420 fast fashion with address mismatch',
      data: {
        amount: 420, category: 'Fashion', is_new_customer: 0,
        customer_age_days: 45, payment_method: 'credit_card',
        device: 'mobile', session_duration_sec: 60, pages_viewed: 2,
        shipping_destination: 'domestic', txn_velocity_24h: 4,
        ip_risk_score: 0.35, is_vpn: 0, email_domain_type: 'free_provider',
        billing_shipping_mismatch: 1
      }
    },
    {
      title: '⚡ Cross-Border Chargeback',
      desc: '$1,400 gaming rig to high-risk territory',
      data: {
        amount: 1400, category: 'Gaming', is_new_customer: 1,
        customer_age_days: 12, payment_method: 'credit_card',
        device: 'desktop', session_duration_sec: 45, pages_viewed: 2,
        shipping_destination: 'cross_border_high_risk', txn_velocity_24h: 3,
        ip_risk_score: 0.65, is_vpn: 1, email_domain_type: 'free_provider',
        billing_shipping_mismatch: 1
      }
    },
    {
      title: '✅ Verified VIP Order',
      desc: '$65 grocery order from loyal 2-year account',
      data: {
        amount: 65, category: 'Groceries', is_new_customer: 0,
        customer_age_days: 720, payment_method: 'debit_card',
        device: 'desktop', session_duration_sec: 340, pages_viewed: 12,
        shipping_destination: 'domestic', txn_velocity_24h: 1,
        ip_risk_score: 0.04, is_vpn: 0, email_domain_type: 'established',
        billing_shipping_mismatch: 0
      }
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Quick Scenario Picker */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <Sparkles size={16} color="var(--stitch-accent-primary)" />
              <span>Real-Time Threat Simulation Presets</span>
            </div>
            <div className="stitch-card-subtitle">
              Instantly populate standard loss vectors to evaluate attribution behavior
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {quickScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => {
                setForm(sc.data);
                setResult(null);
              }}
              style={{
                background: 'var(--stitch-surface-2)',
                border: '1px solid var(--stitch-border-default)',
                borderRadius: 'var(--stitch-radius-md)',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'var(--stitch-text-primary)'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{sc.title}</div>
              <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)' }}>{sc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Scorer Form & Live Attribution Inspector */}
      <div className="stitch-grid-2">
        {/* Form Inputs */}
        <div className="stitch-card">
          <div className="stitch-card-header">
            <div>
              <div className="stitch-card-title">
                <SearchCode size={16} color="var(--stitch-accent-primary)" />
                <span>Transaction Feature Vectors</span>
              </div>
              <div className="stitch-card-subtitle">
                Synthetic telemetry & merchant risk signals
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>Product Vertical</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              >
                {["Electronics", "Fashion", "Home & Garden", "Digital Goods", "Groceries", "Luxury", "Gaming"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>Payment Method</label>
              <select
                value={form.payment_method}
                onChange={e => setForm({ ...form, payment_method: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              >
                <option value="credit_card">Credit Card</option>
                <option value="buy_now_pay_later">Buy Now Pay Later (BNPL)</option>
                <option value="digital_wallet">Digital Wallet</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>Shipping Destination</label>
              <select
                value={form.shipping_destination}
                onChange={e => setForm({ ...form, shipping_destination: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              >
                <option value="domestic">Domestic (Low Risk)</option>
                <option value="cross_border_low_risk">Cross-Border (Standard)</option>
                <option value="cross_border_high_risk">Cross-Border (High Risk Region)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>Email Provider</label>
              <select
                value={form.email_domain_type}
                onChange={e => setForm({ ...form, email_domain_type: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              >
                <option value="established">Established Domain (Corporate/EDU)</option>
                <option value="free_provider">Standard Free (Gmail/Yahoo)</option>
                <option value="disposable">Disposable / Temp Mail</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>24h Velocity Count</label>
              <input
                type="number"
                value={form.txn_velocity_24h}
                onChange={e => setForm({ ...form, txn_velocity_24h: parseInt(e.target.value) || 1 })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>VPN / Proxy Active</label>
              <select
                value={form.is_vpn}
                onChange={e => setForm({ ...form, is_vpn: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              >
                <option value={0}>No (Clean Residential IP)</option>
                <option value={1}>Yes (Anonymous Proxy / VPN)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stitch-text-muted)', display: 'block', marginBottom: 4 }}>Address Mismatch</label>
              <select
                value={form.billing_shipping_mismatch}
                onChange={e => setForm({ ...form, billing_shipping_mismatch: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--stitch-surface-2)', border: '1px solid var(--stitch-border-default)', borderRadius: 'var(--stitch-radius-sm)', color: '#ffffff', fontSize: 13 }}
              >
                <option value={0}>Matching Billing & Shipping</option>
                <option value={1}>Billing / Shipping Delta</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleScore}
            className="stitch-btn stitch-btn-primary"
            style={{ width: '100%', marginTop: 20, padding: '12px', fontSize: 14 }}
            disabled={loading}
          >
            <Cpu size={16} />
            <span>{loading ? 'Evaluating Model Ensemble...' : 'Run Real-Time Inference'}</span>
          </button>
        </div>

        {/* Explainability & Attribution Output */}
        <div className="stitch-card">
          <div className="stitch-card-header">
            <div>
              <div className="stitch-card-title">
                <Cpu size={16} color="var(--stitch-accent-cyan)" />
                <span>Model Output & Risk Attribution</span>
              </div>
              <div className="stitch-card-subtitle">
                Calibrated ensemble decision & mathematical feature weights
              </div>
            </div>
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Verdict Banner */}
              <div style={{
                padding: '16px 20px',
                borderRadius: 'var(--stitch-radius-md)',
                background: result.risk_level === 'CRITICAL' ? 'var(--stitch-risk-critical-bg)' : result.risk_level === 'HIGH' ? 'var(--stitch-risk-high-bg)' : 'var(--stitch-risk-low-bg)',
                border: `1px solid ${result.risk_level === 'CRITICAL' ? 'var(--stitch-risk-critical-border)' : result.risk_level === 'HIGH' ? 'var(--stitch-risk-high-border)' : 'var(--stitch-risk-low-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--stitch-text-muted)' }}>
                    Actionable Autonomous Verdict
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                    {result.recommended_action === 'BLOCK' ? '🔴 AUTOMATIC HARD BLOCK' : result.recommended_action === 'REVIEW' ? '🟠 ESCALATE TO ANALYST' : '🟢 AUTOMATIC INSTANT APPROVAL'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--stitch-font-mono)', color: '#ffffff' }}>
                    {(result.risk_score * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)' }}>Threat Score</div>
                </div>
              </div>

              {/* Attribution Factors */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--stitch-accent-primary)', marginBottom: 10 }}>
                  Top Risk & Trust Attributions
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.risk_factors?.map((rf, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--stitch-radius-sm)',
                        background: rf.type === 'risk' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        border: `1px solid ${rf.type === 'risk' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {rf.type === 'risk' ? <AlertCircle size={15} color="var(--stitch-risk-critical)" /> : <CheckCircle2 size={15} color="var(--stitch-risk-low)" />}
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{rf.factor}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--stitch-font-mono)', color: rf.type === 'risk' ? 'var(--stitch-risk-critical)' : 'var(--stitch-risk-low)' }}>
                        {rf.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--stitch-text-muted)' }}>
              <Cpu size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Awaiting Input Signals</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Select a preset above or modify features, then click Run Real-Time Inference.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
