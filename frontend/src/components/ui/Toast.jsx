import React, { useEffect } from 'react';
import { CheckCircle2, X, Download, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={16} color="#34d399" />,
    download: <Download size={16} color="#818cf8" />,
    error: <AlertCircle size={16} color="#fb7185" />,
    shield: <ShieldCheck size={16} color="#38bdf8" />
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-elevated)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 320,
      maxWidth: 420,
      animation: 'slideUpToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ flexShrink: 0 }}>
        {icons[toast.type] || icons.success}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {toast.message}
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
