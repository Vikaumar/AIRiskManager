import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Filter, ArrowUpRight, Copy, Check, Eye } from 'lucide-react';
import { fetchBatchScores } from '../../services/api';

export default function LiveTransactionLedger({ onSelectTransaction, externalFilter = '' }) {
  const [transactions, setTransactions] = useState([]);
  const [filterTier, setFilterTier] = useState('ALL');
  const [isStreaming, setIsStreaming] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      pushRandomTransaction();
    }, 3200);
    return () => clearInterval(interval);
  }, [isStreaming, transactions]);

  async function loadTransactions() {
    try {
      setLoading(true);
      const res = await fetchBatchScores(20);
      if (res.top_risky_transactions) {
        setTransactions(res.top_risky_transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function pushRandomTransaction() {
    const templates = [
      { category: 'Electronics', amount: 1240.0, pm: 'credit_card', vpn: 1, email: 'disposable', dest: 'cross_border_high_risk' },
      { category: 'Fashion', amount: 89.0, pm: 'digital_wallet', vpn: 0, email: 'established', dest: 'domestic' },
      { category: 'Luxury', amount: 5600.0, pm: 'buy_now_pay_later', vpn: 1, email: 'free_provider', dest: 'cross_border_high_risk' },
      { category: 'Groceries', amount: 38.20, pm: 'debit_card', vpn: 0, email: 'established', dest: 'domestic' },
      { category: 'Gaming', amount: 150.0, pm: 'credit_card', vpn: 0, email: 'free_provider', dest: 'domestic' }
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    const isRisky = pick.vpn === 1 || pick.amount > 1500;
    const item = {
      transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: pick.amount,
      category: pick.category,
      risk_score: isRisky ? 0.74 + Math.random() * 0.20 : 0.06 + Math.random() * 0.18,
      risk_level: isRisky ? (pick.amount > 2000 ? 'CRITICAL' : 'HIGH') : 'LOW',
      recommended_action: isRisky ? (pick.amount > 2000 ? 'BLOCK' : 'REVIEW') : 'APPROVE',
      loss_type: isRisky ? (pick.amount > 2000 ? 'fraud' : 'return') : 'legitimate',
      is_vpn: pick.vpn,
      shipping_destination: pick.dest,
      payment_method: pick.pm,
      email_domain_type: pick.email,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [item, ...prev.slice(0, 24)]);
  }

  function handleCopy(id, e) {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filtered = transactions.filter(t => {
    if (filterTier === 'CRITICAL' && t.risk_level !== 'CRITICAL') return false;
    if (filterTier === 'HIGH' && t.risk_level !== 'HIGH') return false;
    if (filterTier === 'LOW' && t.risk_level !== 'LOW') return false;
    if (externalFilter) {
      const q = externalFilter.toLowerCase();
      const matchId = t.transaction_id?.toLowerCase().includes(q);
      const matchCat = t.category?.toLowerCase().includes(q);
      return matchId || matchCat;
    }
    return true;
  });

  return (
    <div className="pro-card">
      {/* Table Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map(tier => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: filterTier === tier ? 'var(--border-strong)' : 'transparent',
                background: filterTier === tier ? 'var(--surface-elevated)' : 'transparent',
                color: filterTier === tier ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tier === 'ALL' ? 'All Inferences' : tier === 'CRITICAL' ? 'Critical Block' : tier === 'HIGH' ? 'Escalated Review' : 'Authorized'}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="pro-btn pro-btn-secondary"
            style={{ padding: '5px 10px', fontSize: 11 }}
          >
            {isStreaming ? <Pause size={12} /> : <Play size={12} />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume'}</span>
          </button>

          <button
            onClick={loadTransactions}
            className="pro-btn pro-btn-secondary"
            style={{ padding: '5px 10px', fontSize: 11 }}
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Fetch Burst</span>
          </button>
        </div>
      </div>

      {/* High Density Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="pro-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Channel</th>
              <th>Score</th>
              <th>Policy Tier</th>
              <th>Decision Action</th>
              <th style={{ textAlign: 'right' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, idx) => {
              const isCrit = t.risk_level === 'CRITICAL';
              const isHigh = t.risk_level === 'HIGH';
              const badgeClass = isCrit ? 'pro-badge-critical' : isHigh ? 'pro-badge-high' : t.risk_level === 'MEDIUM' ? 'pro-badge-medium' : 'pro-badge-low';

              return (
                <tr key={t.transaction_id || idx} onClick={() => onSelectTransaction(t)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.transaction_id}
                      </span>
                      <button
                        onClick={(e) => handleCopy(t.transaction_id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}
                        title="Copy Hash"
                      >
                        {copiedId === t.transaction_id ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>
                    ${Number(t.amount || 0).toFixed(2)}
                  </td>
                  <td>{t.category}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isCrit ? '#fb7185' : isHigh ? '#fb923c' : '#34d399' }}>
                      {(Number(t.risk_score || 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className={`pro-badge ${badgeClass}`}>
                      {t.risk_level}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.recommended_action === 'BLOCK' ? '#fb7185' : t.recommended_action === 'REVIEW' ? '#fb923c' : '#34d399',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {t.recommended_action}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <span>Details</span>
                      <ArrowUpRight size={12} />
                    </span>
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
