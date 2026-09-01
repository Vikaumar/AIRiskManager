const API_BASE = 'http://localhost:8000/api';

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function fetchRecentAlerts() {
  const res = await fetch(`${API_BASE}/recent-alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function scoreTransaction(payload) {
  const res = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to score transaction');
  return res.json();
}

export async function fetchBatchScores(n = 50) {
  const res = await fetch(`${API_BASE}/batch-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n_transactions: n }),
  });
  if (!res.ok) throw new Error('Failed to fetch batch scores');
  return res.json();
}
