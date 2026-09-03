import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { fetchAIInvestigation } from '../../services/api';
import ReactMarkdown from 'react-markdown';

export default function AIInvestigator({ transactionId, onClose }) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await fetchAIInvestigation(transactionId);
        setReport(res.report);
      } catch (err) {
        setError('Failed to contact AI Investigator API. Using simulated fallback.');
        setReport(`## 🕵️ AI Investigation Report (Fallback)\n\n**Transaction:** ${transactionId}\n\n### 1. Primary Reason\nCoordinated high-velocity attack vector detected.\n\n### 2. Evidence\n- High velocity anomalous behavior\n- Shared network signature\n\n### 3. Attack Pattern\n"Multi-account payment abuse"\n\n### 4. Recommended Action\n**BLOCK**`);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [transactionId]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 480, // Next to the TransactionDrawer
      width: 480,
      height: '100vh',
      background: 'var(--surface-base)',
      borderLeft: '1px solid var(--border-default)',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      animation: 'slideInRight 0.2s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 8, 
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={16} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              AI Investigator <Sparkles size={12} color="#a855f7" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Mistral 8x7B • Autonomous Risk Analysis
            </div>
          </div>
        </div>
        <button onClick={onClose} className="pro-btn pro-btn-secondary" style={{ padding: 6 }}>
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: 'var(--text-muted)' }}>
            <Bot size={32} className="spinning-icon" />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Synthesizing forensic telemetry...</div>
          </div>
        ) : (
          <div className="markdown-body" style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6 }}>
            {error && (
              <div style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid #fb7185', padding: '10px', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fb7185', fontSize: '12px' }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 style={{ fontSize: 18, color: '#e2e8f0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginTop: 24, marginBottom: 16 }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ fontSize: 14, color: '#cbd5e1', marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ paddingLeft: 20, marginBottom: 16 }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: 6 }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: '#ffffff', fontWeight: 600 }} {...props} />,
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-default)', background: 'var(--surface-muted)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={12} /> AI-generated report. Always verify critical decisions.
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .spinning-icon {
          animation: spin 2s linear infinite;
          color: #a855f7;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
