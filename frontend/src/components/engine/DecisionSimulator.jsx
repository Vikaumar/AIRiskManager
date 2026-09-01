import React, { useState } from 'react';
import { Play, Sparkles, Terminal, AlertCircle, CheckCircle2, Sliders, Cpu } from 'lucide-react';
import { scoreTransaction } from '../../services/api';

export default function DecisionSimulator() {
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

  async function handleRunInference() {
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

  const presets = [
    {
      label: 'Stolen Card / Bot Attack',
      meta: '$8,500 luxury cart via VPN with disposable email',
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
      label: 'Serial Wardrobing Abuse',
      meta: '$420 fast fashion with address mismatch',
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
      label: 'Cross-Border Dispute Risk',
      meta: '$1,400 gaming setup to high-risk region',
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
      label: 'Clean Customer Checkout',
      meta: '$65 recurring grocery order from verified account',
      data: {
        amount: 65, category: 'Groceries', is_new_customer: 0,
        customer_age_days: 720, payment_method: 'debit_card',
        device: 'desktop', session_duration_sec: 340, pages_viewed: 12,
        shipping_destination: 'domestic', txn_velocity_24h: 1,
        ip_risk_score: 0.04, is_vpn: 0, email_domain_type: 'established',
        billing_shipping_mismatch: 0
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Quick Test Vector Selector */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <Sparkles size={14} color="#818cf8" />
              <span>Diagnostic Test Vectors</span>
            </div>
            <div className="pro-card-subtitle">
              Pre-configured synthetic threat and trust profiles
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setForm(p.data);
                setResult(null);
              }}
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.meta}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Split-Pane Simulator */}
      <div className="grid-2">
        {/* Form Controls */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div>
              <div className="pro-card-title">
                <Sliders size={14} color="#818cf8" />
                <span>Feature Input Vector</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Vertical</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              >
                {["Electronics", "Fashion", "Home & Garden", "Digital Goods", "Groceries", "Luxury", "Gaming"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Payment Rail</label>
              <select
                value={form.payment_method}
                onChange={e => setForm({ ...form, payment_method: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              >
                <option value="credit_card">Credit Card (Card-Not-Present)</option>
                <option value="buy_now_pay_later">Buy Now Pay Later (BNPL)</option>
                <option value="digital_wallet">Digital Wallet (Apple/Google Pay)</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Destination Zone</label>
              <select
                value={form.shipping_destination}
                onChange={e => setForm({ ...form, shipping_destination: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              >
                <option value="domestic">Domestic (Verified Low Risk)</option>
                <option value="cross_border_low_risk">Cross-Border (Tier 1)</option>
                <option value="cross_border_high_risk">Cross-Border (High Risk Region)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Email Domain Category</label>
              <select
                value={form.email_domain_type}
                onChange={e => setForm({ ...form, email_domain_type: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              >
                <option value="established">Corporate / Established Domain</option>
                <option value="free_provider">Standard Free Webmail</option>
                <option value="disposable">Disposable / Temp Mail Domain</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>24h Velocity Count</label>
              <input
                type="number"
                value={form.txn_velocity_24h}
                onChange={e => setForm({ ...form, txn_velocity_24h: parseInt(e.target.value) || 1 })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>VPN / Proxy Signature</label>
              <select
                value={form.is_vpn}
                onChange={e => setForm({ ...form, is_vpn: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              >
                <option value={0}>Clean Residential IP</option>
                <option value={1}>Anonymous VPN / Proxy Node</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Address Mismatch</label>
              <select
                value={form.billing_shipping_mismatch}
                onChange={e => setForm({ ...form, billing_shipping_mismatch: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12 }}
              >
                <option value={0}>Matched Billing & Shipping</option>
                <option value={1}>Billing / Shipping Delta Detected</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunInference}
            className="pro-btn pro-btn-primary"
            style={{ width: '100%', marginTop: 16, padding: '10px' }}
            disabled={loading}
          >
            <Play size={13} />
            <span>{loading ? 'Evaluating Model Ensemble...' : 'Execute Real-Time Scoring'}</span>
          </button>
        </div>

        {/* Output & Attribution */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div>
              <div className="pro-card-title">
                <Terminal size={14} color="#38bdf8" />
                <span>Decision Engine Inference</span>
              </div>
            </div>
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: result.risk_level === 'CRITICAL' ? 'var(--status-critical-bg)' : result.risk_level === 'HIGH' ? 'var(--status-high-bg)' : 'var(--status-low-bg)',
                border: `1px solid ${result.risk_level === 'CRITICAL' ? 'var(--status-critical-border)' : result.risk_level === 'HIGH' ? 'var(--status-high-border)' : 'var(--status-low-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Policy Routing Directive
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                    {result.recommended_action === 'BLOCK' ? 'Automatic Hard Intercept' : result.recommended_action === 'REVIEW' ? 'Escalate to Manual Queue' : 'Authorized Clean Order'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)', color: result.risk_level === 'CRITICAL' ? '#fb7185' : result.risk_level === 'HIGH' ? '#fb923c' : '#34d399' }}>
                    {(result.risk_score * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Threat Index</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Attribution Factor Weights
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.risk_factors?.map((rf, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: rf.type === 'risk' ? 'rgba(244, 63, 94, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                        border: `1px solid ${rf.type === 'risk' ? 'rgba(244, 63, 94, 0.18)' : 'rgba(16, 185, 129, 0.18)'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {rf.type === 'risk' ? <AlertCircle size={13} color="#fb7185" /> : <CheckCircle2 size={13} color="#34d399" />}
                        <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{rf.factor}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', color: rf.type === 'risk' ? '#fb7185' : '#34d399' }}>
                        {rf.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dim)' }}>
              <Terminal size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontSize: 12, fontWeight: 600 }}>Inference Engine Idle</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>Select a preset or edit parameters, then execute scoring.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
