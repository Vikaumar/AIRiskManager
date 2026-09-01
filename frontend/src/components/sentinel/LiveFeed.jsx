import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Eye, RefreshCw, Zap } from 'lucide-react';
import { fetchBatchScores } from '../../services/api';

export default function LiveFeed({ onInspectTransaction }) {
  const [stream, setStream] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Generate initial stream batch
  useEffect(() => {
    loadStreamBatch();
  }, []);

  // Periodic simulation ticks when streaming is active
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      simulateSingleIncoming();
    }, 3800);
    return () => clearInterval(timer);
  }, [isStreaming, stream]);

  async function loadStreamBatch() {
    try {
      setIsSimulating(true);
      const res = await fetchBatchScores(15);
      if (res.top_risky_transactions) {
        setStream(res.top_risky_transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  }

  function simulateSingleIncoming() {
    const templates = [
      { category: 'Electronics', amount: 980.0, payment_method: 'credit_card', device: 'mobile', is_vpn: 1, email_domain_type: 'disposable', shipping_destination: 'cross_border_high_risk' },
      { category: 'Fashion', amount: 65.0, payment_method: 'digital_wallet', device: 'desktop', is_vpn: 0, email_domain_type: 'established', shipping_destination: 'domestic' },
      { category: 'Luxury', amount: 4200.0, payment_method: 'buy_now_pay_later', device: 'mobile', is_vpn: 1, email_domain_type: 'free_provider', shipping_destination: 'cross_border_high_risk' },
      { category: 'Groceries', amount: 42.50, payment_method: 'debit_card', device: 'desktop', is_vpn: 0, email_domain_type: 'established', shipping_destination: 'domestic' },
      { category: 'Gaming', amount: 120.0, payment_method: 'credit_card', device: 'mobile', is_vpn: 0, email_domain_type: 'free_provider', shipping_destination: 'domestic' }
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    const isRisky = pick.is_vpn === 1 || pick.amount > 1500;
    const newTxn = {
      transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: pick.amount,
      category: pick.category,
      risk_score: isRisky ? 0.72 + Math.random() * 0.22 : 0.08 + Math.random() * 0.20,
      risk_level: isRisky ? (pick.amount > 2000 ? 'CRITICAL' : 'HIGH') : 'LOW',
      recommended_action: isRisky ? (pick.amount > 2000 ? 'BLOCK' : 'REVIEW') : 'APPROVE',
      loss_type: isRisky ? (pick.amount > 2000 ? 'fraud' : 'return') : 'legitimate',
      timestamp: new Date().toISOString()
    };

    setStream(prev => [newTxn, ...prev.slice(0, 19)]);
  }

  return (
    <div className="stitch-card">
      <div className="stitch-card-header">
        <div>
          <div className="stitch-card-title">
            <Activity size={18} color="var(--stitch-risk-critical)" />
            <span>Live Transaction Sentinel Stream</span>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isStreaming ? 'var(--stitch-risk-low)' : 'var(--stitch-text-muted)',
              boxShadow: isStreaming ? '0 0 10px var(--stitch-risk-low)' : 'none',
              display: 'inline-block'
            }}></span>
          </div>
          <div className="stitch-card-subtitle">
            Autonomous streaming inference with real-time intercept triggers
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`stitch-btn ${isStreaming ? 'stitch-btn-secondary' : 'stitch-btn-primary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            <Zap size={13} />
            <span>{isStreaming ? 'Pause Sentinel' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={loadStreamBatch}
            className="stitch-btn stitch-btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12 }}
            disabled={isSimulating}
          >
            <RefreshCw size={13} className={isSimulating ? 'stitch-spin' : ''} />
            <span>Simulate Burst</span>
          </button>
        </div>
      </div>

      {/* Stream Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--stitch-border-default)' }}>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Transaction ID</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Vertical</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Threat Score</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Risk Tier</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Auto Action</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {stream.map((txn, idx) => {
              const isCrit = txn.risk_level === 'CRITICAL';
              const isHigh = txn.risk_level === 'HIGH';
              const badgeClass = isCrit ? 'stitch-badge-critical' : isHigh ? 'stitch-badge-high' : txn.risk_level === 'MEDIUM' ? 'stitch-badge-medium' : 'stitch-badge-low';

              return (
                <tr
                  key={txn.transaction_id || idx}
                  style={{
                    borderBottom: '1px solid var(--stitch-border-subtle)',
                    background: idx === 0 ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <td style={{ padding: '12px', fontFamily: 'var(--stitch-font-mono)', fontSize: 12, fontWeight: 600, color: '#ffffff' }}>
                    {txn.transaction_id}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--stitch-font-mono)', fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    ${Number(txn.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: 'var(--stitch-text-secondary)' }}>
                    {txn.category}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--stitch-font-mono)', fontSize: 13, fontWeight: 800, color: isCrit ? 'var(--stitch-risk-critical)' : isHigh ? 'var(--stitch-risk-high)' : 'var(--stitch-risk-low)' }}>
                    {(Number(txn.risk_score) * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`stitch-badge ${badgeClass}`}>
                      {txn.risk_level}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: txn.recommended_action === 'BLOCK' ? 'var(--stitch-risk-critical)' : txn.recommended_action === 'REVIEW' ? 'var(--stitch-risk-high)' : 'var(--stitch-risk-low)',
                      background: txn.recommended_action === 'BLOCK' ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.04)',
                      padding: '3px 8px',
                      borderRadius: 4
                    }}>
                      {txn.recommended_action}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onInspectTransaction(txn)}
                      className="stitch-btn stitch-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      title="Inspect Risk Attribution"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
