import React, { useState } from 'react';
import { FileText, Download, Check, ShieldCheck, FileCheck, Copy } from 'lucide-react';

export default function EvidenceResponder() {
  const [caseId, setCaseId] = useState('CB-98214');
  const [copied, setCopied] = useState(false);

  const sampleEvidence = {
    dispute_id: 'DSP-2026-88190',
    original_txn_id: 'TXN-089412',
    amount: '$489.00',
    customer_name: 'Alex Mercer',
    customer_email: 'alex.mercer88@gmail.com',
    dispute_reason: 'Fraudulent - Cardholder does not recognize transaction',
    order_date: '2026-08-14 14:22:10 UTC',
    ip_address: '198.51.100.44 (Clean Residential ISP - Verizon)',
    device_fingerprint: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) - Hardware UUID Matched',
    delivery_carrier: 'FedEx Express (Tracking #9400111899562537499218)',
    delivery_status: 'Delivered to Front Door & Signed on 2026-08-16 11:05:00 UTC',
    previous_order_count: '4 successful lifetime orders (0 prior disputes)',
    win_probability: '87.4%'
  };

  const letterText = `MERCHANT CHARGEBACK REBUTTAL EVIDENCE LETTER
Case Reference: ${sampleEvidence.dispute_id}
Original Transaction: ${sampleEvidence.original_txn_id} (${sampleEvidence.amount})

TO: Acquiring Bank & Cardholder Dispute Division

EXECUTIVE SUMMARY:
The merchant respectfully contests this dispute. Comprehensive forensic evidence confirms that the authorized cardholder initiated, received, and accepted this purchase without protest prior to filing.

PRIMARY EVIDENCE ARTIFACTS:
1. Proof of Delivery & Acceptance:
   - Carrier: ${sampleEvidence.delivery_carrier}
   - Proof Status: ${sampleEvidence.delivery_status}

2. Digital Identity & Device Telemetry:
   - IP Address & Geolocation: ${sampleEvidence.ip_address}
   - Device Fingerprint: ${sampleEvidence.device_fingerprint}
   - Session Duration: 280 seconds across 6 product review pages.

3. Account Tenure & Consistency:
   - Account Status: Active since 2024 with ${sampleEvidence.previous_order_count}.
   - Communication: Automated shipping confirmations opened at ${sampleEvidence.customer_email}.

CONCLUSION:
Based on matching device telemetry, verified delivery receipt, and historical account legitimacy, we request that this chargeback be reversed and the disputed funds returned to the merchant.`;

  function handleCopy() {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview header */}
      <div className="stitch-card">
        <div className="stitch-card-header">
          <div>
            <div className="stitch-card-title">
              <FileText size={16} color="var(--stitch-accent-primary)" />
              <span>Automated Chargeback Evidence Rebuttal Kit</span>
            </div>
            <div className="stitch-card-subtitle">
              Generates court-admissible dispute response packages with biometric & telemetry proofs
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--stitch-radius-full)',
            background: 'var(--stitch-risk-low-bg)',
            border: '1px solid var(--stitch-risk-low-border)',
            color: 'var(--stitch-risk-low)',
            fontSize: 11,
            fontWeight: 800
          }}>
            <ShieldCheck size={13} />
            <span>Estimated Win Probability: {sampleEvidence.win_probability}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <div style={{ background: 'var(--stitch-surface-2)', padding: '12px 14px', borderRadius: 'var(--stitch-radius-sm)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Dispute ID</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', marginTop: 2, fontFamily: 'var(--stitch-font-mono)' }}>{sampleEvidence.dispute_id}</div>
          </div>
          <div style={{ background: 'var(--stitch-surface-2)', padding: '12px 14px', borderRadius: 'var(--stitch-radius-sm)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Disputed Amount</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--stitch-risk-critical)', marginTop: 2, fontFamily: 'var(--stitch-font-mono)' }}>{sampleEvidence.amount}</div>
          </div>
          <div style={{ background: 'var(--stitch-surface-2)', padding: '12px 14px', borderRadius: 'var(--stitch-radius-sm)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Cardholder Reason</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Unauthorized Use</div>
          </div>
          <div style={{ background: 'var(--stitch-surface-2)', padding: '12px 14px', borderRadius: 'var(--stitch-radius-sm)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--stitch-text-muted)', textTransform: 'uppercase' }}>Fulfillment Proof</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--stitch-risk-low)', marginTop: 2 }}>Signed Delivery Verified</div>
          </div>
        </div>
      </div>

      {/* Evidence Package Generator */}
      <div className="stitch-grid-2">
        {/* Rebuttal Letter Preview */}
        <div className="stitch-card">
          <div className="stitch-card-header">
            <div>
              <div className="stitch-card-title">
                <FileCheck size={16} color="var(--stitch-accent-cyan)" />
                <span>Standardized Acquirer Submission Document</span>
              </div>
            </div>

            <button onClick={handleCopy} className="stitch-btn stitch-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>
              {copied ? <Check size={12} color="var(--stitch-risk-low)" /> : <Copy size={12} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Letter'}</span>
            </button>
          </div>

          <pre style={{
            background: 'var(--stitch-surface-2)',
            border: '1px solid var(--stitch-border-default)',
            borderRadius: 'var(--stitch-radius-sm)',
            padding: '16px',
            fontSize: 11,
            lineHeight: 1.55,
            fontFamily: 'var(--stitch-font-mono)',
            color: 'var(--stitch-text-secondary)',
            whiteSpace: 'pre-wrap',
            maxHeight: 380,
            overflowY: 'auto'
          }}>
            {letterText}
          </pre>
        </div>

        {/* Telemetry Attachment Checklist */}
        <div className="stitch-card">
          <div className="stitch-card-header">
            <div>
              <div className="stitch-card-title">
                <ShieldCheck size={16} color="var(--stitch-risk-low)" />
                <span>Forensic Evidence Telemetry Bundles</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Proof of Physical Delivery', desc: sampleEvidence.delivery_status, status: 'ATTACHED' },
              { title: 'Device Fingerprint Match', desc: sampleEvidence.device_fingerprint, status: 'ATTACHED' },
              { title: 'Clean Residential IP Verification', desc: sampleEvidence.ip_address, status: 'ATTACHED' },
              { title: 'Account Tenure History', desc: sampleEvidence.previous_order_count, status: 'ATTACHED' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--stitch-radius-sm)',
                background: 'var(--stitch-surface-2)',
                border: '1px solid var(--stitch-border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--stitch-text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--stitch-risk-low)', background: 'var(--stitch-risk-low-bg)', padding: '3px 8px', borderRadius: 4 }}>
                  {item.status}
                </span>
              </div>
            ))}

            <button
              onClick={() => alert('Dispute Package exported with forensic attachments!')}
              className="stitch-btn stitch-btn-primary"
              style={{ width: '100%', marginTop: 8, padding: '10px', fontSize: 13 }}
            >
              <Download size={14} />
              <span>Download Complete Dispute Package (.PDF + Evidence)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
