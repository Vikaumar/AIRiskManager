import React, { useState, useRef } from 'react';
import { Code2, Zap, Copy, Check, Clock, ChevronRight, Terminal } from 'lucide-react';
import { scoreTransaction } from '../../services/api';

const WEBHOOK_EVENTS = [
  {
    id: 'payment_created',
    name: 'payment.intent.created',
    desc: 'New payment attempt from checkout',
    payload: {
      amount: 847.50,
      category: 'Electronics',
      is_new_customer: 0,
      customer_age_days: 290,
      payment_method: 'credit_card',
      device: 'desktop',
      session_duration_sec: 145,
      pages_viewed: 7,
      shipping_destination: 'domestic',
      txn_velocity_24h: 1,
      ip_risk_score: 0.12,
      is_vpn: 0,
      email_domain_type: 'established',
      billing_shipping_mismatch: 0,
    },
  },
  {
    id: 'suspicious_payment',
    name: 'payment.high_risk',
    desc: 'Suspicious cross-border transaction',
    payload: {
      amount: 2890.00,
      category: 'Luxury',
      is_new_customer: 1,
      customer_age_days: 3,
      payment_method: 'buy_now_pay_later',
      device: 'mobile',
      session_duration_sec: 18,
      pages_viewed: 2,
      shipping_destination: 'cross_border_high_risk',
      txn_velocity_24h: 6,
      ip_risk_score: 0.82,
      is_vpn: 1,
      email_domain_type: 'disposable',
      billing_shipping_mismatch: 1,
    },
  },
  {
    id: 'dispute_opened',
    name: 'dispute.chargeback.opened',
    desc: 'Cardholder dispute filed',
    payload: {
      amount: 489.00,
      category: 'Fashion',
      is_new_customer: 0,
      customer_age_days: 120,
      payment_method: 'credit_card',
      device: 'mobile',
      session_duration_sec: 90,
      pages_viewed: 4,
      shipping_destination: 'cross_border_low_risk',
      txn_velocity_24h: 2,
      ip_risk_score: 0.35,
      is_vpn: 0,
      email_domain_type: 'free_provider',
      billing_shipping_mismatch: 1,
    },
  },
  {
    id: 'bot_attack',
    name: 'alert.bot_surge',
    desc: 'Automated bot checkout attack',
    payload: {
      amount: 4500.00,
      category: 'Digital Goods',
      is_new_customer: 1,
      customer_age_days: 0,
      payment_method: 'credit_card',
      device: 'desktop',
      session_duration_sec: 8,
      pages_viewed: 1,
      shipping_destination: 'cross_border_high_risk',
      txn_velocity_24h: 15,
      ip_risk_score: 0.95,
      is_vpn: 1,
      email_domain_type: 'disposable',
      billing_shipping_mismatch: 1,
    },
  },
];

const SDK_SNIPPETS = {
  curl: (payload) => `curl -X POST http://localhost:8000/api/score \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`,

  python: (payload) => `import requests

response = requests.post(
    "http://localhost:8000/api/score",
    json=${JSON.stringify(payload, null, 4).replace(/"/g, '"')}
)

result = response.json()
print(f"Risk Score: {result['risk_score']}")
print(f"Action: {result['recommended_action']}")`,

  node: (payload) => `const response = await fetch("http://localhost:8000/api/score", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${JSON.stringify(payload, null, 4)})
});

const result = await response.json();
console.log(\`Risk: \${result.risk_score} → \${result.recommended_action}\`);`,
};

export default function DeveloperHub() {
  const [activeSDK, setActiveSDK] = useState('curl');
  const [copied, setCopied] = useState(false);
  const [webhookResults, setWebhookResults] = useState([]);
  const [firing, setFiring] = useState(null);
  const logRef = useRef(null);

  async function fireWebhook(event) {
    setFiring(event.id);
    const start = performance.now();

    try {
      const result = await scoreTransaction(event.payload);
      const latency = Math.round(performance.now() - start);

      setWebhookResults((prev) => [
        {
          id: Date.now(),
          event: event.name,
          request: event.payload,
          response: result,
          latency,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    } catch (err) {
      setWebhookResults((prev) => [
        {
          id: Date.now(),
          event: event.name,
          request: event.payload,
          response: { error: err.message },
          latency: Math.round(performance.now() - start),
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setFiring(null);
    setTimeout(() => {
      logRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const samplePayload = WEBHOOK_EVENTS[0].payload;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* SDK Snippets */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <Code2 size={14} color="#818cf8" />
              <span>Integration SDK — Score Transaction</span>
            </div>
            <div className="pro-card-subtitle">
              Drop-in code snippets for integrating the risk scoring API into your checkout flow
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {['curl', 'python', 'node'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveSDK(lang)}
                className={`pro-btn ${activeSDK === lang ? 'pro-btn-primary' : 'pro-btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: 11, textTransform: 'uppercase' }}
              >
                {lang === 'node' ? 'Node.js' : lang}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <pre style={{
            background: '#0d0f15',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            fontSize: 11,
            lineHeight: 1.6,
            fontFamily: 'var(--font-mono)',
            color: '#94a3b8',
            overflowX: 'auto',
            maxHeight: 280,
          }}>
            {SDK_SNIPPETS[activeSDK](samplePayload)}
          </pre>
          <button
            onClick={() => handleCopy(SDK_SNIPPETS[activeSDK](samplePayload))}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              color: copied ? '#34d399' : 'var(--text-secondary)',
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Webhook Simulator */}
      <div className="grid-2">
        {/* Event Palette */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div>
              <div className="pro-card-title">
                <Zap size={14} color="#f97316" />
                <span>Webhook Event Simulator</span>
              </div>
              <div className="pro-card-subtitle">
                Fire simulated payment events and watch the engine score them in real-time
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WEBHOOK_EVENTS.map((event) => {
              const isFiring = firing === event.id;
              const riskHint = event.payload.is_vpn && event.payload.txn_velocity_24h > 5
                ? 'CRITICAL' : event.payload.billing_shipping_mismatch
                ? 'HIGH' : event.payload.is_new_customer ? 'MEDIUM' : 'LOW';
              const riskColors = {
                CRITICAL: { bg: 'var(--status-critical-bg)', border: 'var(--status-critical-border)', color: '#fb7185' },
                HIGH: { bg: 'var(--status-high-bg)', border: 'var(--status-high-border)', color: '#fb923c' },
                MEDIUM: { bg: 'var(--status-medium-bg)', border: 'var(--status-medium-border)', color: '#facc15' },
                LOW: { bg: 'var(--status-low-bg)', border: 'var(--status-low-border)', color: '#34d399' },
              };
              const rc = riskColors[riskHint];

              return (
                <button
                  key={event.id}
                  onClick={() => fireWebhook(event)}
                  disabled={isFiring}
                  style={{
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    cursor: isFiring ? 'wait' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.12s ease',
                    opacity: isFiring ? 0.6 : 1,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                      {event.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {event.desc} — ${event.payload.amount.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: rc.bg,
                      color: rc.color,
                      border: `1px solid ${rc.border}`,
                    }}>
                      {riskHint}
                    </span>
                    {isFiring ? (
                      <div className="spin" style={{ width: 14, height: 14, border: '2px solid var(--border-default)', borderTopColor: '#818cf8', borderRadius: '50%' }} />
                    ) : (
                      <ChevronRight size={14} color="var(--text-dim)" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Response Log */}
        <div className="pro-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pro-card-header">
            <div>
              <div className="pro-card-title">
                <Terminal size={14} color="#10b981" />
                <span>Live Response Log</span>
              </div>
              <div className="pro-card-subtitle">
                {webhookResults.length} events scored
              </div>
            </div>
            {webhookResults.length > 0 && (
              <button
                onClick={() => setWebhookResults([])}
                className="pro-btn pro-btn-secondary"
                style={{ padding: '3px 8px', fontSize: 10 }}
              >
                Clear
              </button>
            )}
          </div>

          <div
            ref={logRef}
            style={{
              flex: 1,
              maxHeight: 380,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {webhookResults.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                color: 'var(--text-dim)',
                fontSize: 11,
                gap: 8,
              }}>
                <Zap size={20} />
                <span>Fire a webhook event to see live scoring results</span>
              </div>
            ) : (
              webhookResults.map((r) => {
                const isError = !!r.response?.error;
                const riskColor = r.response?.risk_level === 'CRITICAL' ? '#f43f5e'
                  : r.response?.risk_level === 'HIGH' ? '#f97316'
                  : r.response?.risk_level === 'MEDIUM' ? '#eab308' : '#10b981';

                return (
                  <div key={r.id} style={{
                    background: '#0d0f15',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    animation: 'fadeIn 0.2s ease-out',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          background: isError ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
                          color: isError ? '#fb7185' : '#34d399',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}>
                          {isError ? 'ERR' : '200'}
                        </span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {r.event}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={10} color="var(--text-dim)" />
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {r.latency}ms
                        </span>
                      </div>
                    </div>

                    {/* Result */}
                    {!isError && (
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>SCORE</span>
                          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: riskColor }}>
                            {(r.response.risk_score * 1000).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>LEVEL</span>
                          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: riskColor }}>
                            {r.response.risk_level}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>ACTION</span>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {r.response.recommended_action}
                          </div>
                        </div>
                        {r.response.risk_factors?.slice(0, 2).map((f, fi) => (
                          <div key={fi}>
                            <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>
                              {f.type === 'risk' ? 'RISK' : 'TRUST'} SIGNAL
                            </span>
                            <div style={{ fontSize: 10, color: f.type === 'risk' ? '#fb7185' : '#34d399' }}>
                              {f.factor.substring(0, 30)}... {f.impact}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isError && (
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
                        {r.response.error}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
