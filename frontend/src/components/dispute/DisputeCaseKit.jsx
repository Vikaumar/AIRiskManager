import React, { useState } from 'react';
import { Copy, Check, Download, ShieldCheck, FileCheck } from 'lucide-react';

export default function DisputeCaseKit() {
  const [copied, setCopied] = useState(false);

  const sample = {
    dispute_id: 'DSP-2026-98124',
    txn_id: 'TXN-098231',
    amount: '$489.00',
    cardholder: 'Alex Mercer',
    carrier: 'FedEx Express (#9400111899562537499218)',
    delivery: 'Delivered & Signed on 2026-08-16 11:05 UTC',
    ip_telemetry: '198.51.100.44 (Clean Residential ISP - Verizon)',
    device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) - Hardware UUID Matched',
    win_probability: '87.4%'
  };

  const letterText = `MERCHANT CHARGEBACK REBUTTAL EVIDENCE LETTER
Case Reference: ${sample.dispute_id}
Original Transaction: ${sample.txn_id} (${sample.amount})

TO: Acquiring Bank & Cardholder Dispute Division

EXECUTIVE SUMMARY:
The merchant respectfully contests this dispute. Comprehensive forensic evidence confirms that the authorized cardholder initiated, received, and accepted this purchase without protest prior to filing.

PRIMARY EVIDENCE ARTIFACTS:
1. Proof of Physical Fulfillment:
   - Carrier: ${sample.carrier}
   - Status: ${sample.delivery}

2. Digital Identity & Device Telemetry:
   - IP Address & Geolocation: ${sample.ip_telemetry}
   - Device Fingerprint: ${sample.device}
   - Session Duration: 280 seconds across 6 product review pages.

3. Account Tenure & Consistency:
   - Account Status: Active since 2024 with 4 successful lifetime orders.
   - Communication: Automated shipping confirmations delivered and opened.

CONCLUSION:
Based on matching device telemetry, verified delivery receipt, and historical account legitimacy, we request that this chargeback be reversed and the disputed funds returned to the merchant.`;

  function handleCopy() {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Info */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div>
            <div className="pro-card-title">
              <FileCheck size={14} color="#818cf8" />
              <span>Chargeback Dispute Rebuttal Kit</span>
            </div>
            <div className="pro-card-subtitle">
              Automated acquirer-ready rebuttal document with forensic telemetry attachments
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-low-bg)',
            border: '1px solid var(--status-low-border)',
            color: '#34d399',
            fontSize: 11,
            fontWeight: 700
          }}>
            <ShieldCheck size={12} />
            <span>Win Probability: {sample.win_probability}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <div style={{ background: 'var(--surface-muted)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dispute ID</div>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: 2 }}>{sample.dispute_id}</div>
          </div>
          <div style={{ background: 'var(--surface-muted)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Disputed Value</div>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fb7185', marginTop: 2 }}>{sample.amount}</div>
          </div>
          <div style={{ background: 'var(--surface-muted)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reason Code</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', marginTop: 2 }}>Cardholder Unauthorized</div>
          </div>
          <div style={{ background: 'var(--surface-muted)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proof Attached</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#34d399', marginTop: 2 }}>Signed Delivery Receipt</div>
          </div>
        </div>
      </div>

      {/* Rebuttal Preview & Attachments */}
      <div className="grid-2">
        {/* Letter */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div>
              <div className="pro-card-title">
                <span>Standardized Rebuttal Document</span>
              </div>
            </div>

            <button onClick={handleCopy} className="pro-btn pro-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>
              {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <pre style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: 11,
            lineHeight: 1.5,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
            maxHeight: 320,
            overflowY: 'auto'
          }}>
            {letterText}
          </pre>
        </div>

        {/* Telemetry Checklist */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div>
              <div className="pro-card-title">
                <span>Forensic Telemetry Checklist</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { title: 'Signed Proof of Physical Delivery', desc: sample.delivery, status: 'ATTACHED' },
              { title: 'Device Fingerprint Match', desc: sample.device, status: 'ATTACHED' },
              { title: 'Clean Residential IP Verification', desc: sample.ip_telemetry, status: 'ATTACHED' },
              { title: 'Customer Lifetime History', desc: '4 lifetime orders without disputes', status: 'ATTACHED' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399', background: 'var(--status-low-bg)', padding: '2px 6px', borderRadius: 3 }}>
                  {item.status}
                </span>
              </div>
            ))}

            <button
              onClick={() => alert('Dispute rebuttal package exported with PDF telemetry.')}
              className="pro-btn pro-btn-primary"
              style={{ width: '100%', marginTop: 6, padding: '9px' }}
            >
              <Download size={13} />
              <span>Export Signed Acquirer Package (.PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
