const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
const API_KEY = 'sk_hackathon_demo_key_12345';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function fetchRecentAlerts() {
  const res = await fetch(`${API_BASE}/recent-alerts`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function scoreTransaction(payload) {
  const res = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to score transaction');
  return res.json();
}

export async function fetchBatchScores(n = 50) {
  const res = await fetch(`${API_BASE}/batch-score`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ n_transactions: n }),
  });
  if (!res.ok) throw new Error('Failed to fetch batch scores');
  return res.json();
}

export async function fetchFraudNetwork() {
  const res = await fetch(`${API_BASE}/fraud-network`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch fraud network');
  return res.json();
}

export async function fetchEVTAnalysis() {
  const res = await fetch(`${API_BASE}/evt-analysis`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch EVT analysis');
  return res.json();
}

export async function fetchAIInvestigation(transactionId) {
  const res = await fetch(`${API_BASE}/investigate`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ transaction_id: transactionId }),
  });
  if (!res.ok) throw new Error('Failed to fetch AI investigation');
  return res.json();
}

