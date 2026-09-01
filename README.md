# 🛡️ AI Risk Manager — Merchant Defense System

> **Hackathon Track 02: AI Risk Manager**  
> Stop the merchant losing money to fraud, returns and chargebacks.

## 🎯 What It Does

AI Risk Manager is a **defense-only** fraud detection system that scores merchant transactions in real-time, flagging suspicious activity across three loss categories:

- **Fraud** — Unauthorized/stolen card transactions
- **Returns** — Legitimate returns that erode margin  
- **Chargebacks** — Disputed transactions (friendly fraud, item-not-received)

### Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Ensemble ML Model** | GBM + Random Forest + Logistic Regression weighted ensemble |
| 📊 **EVT-Inspired Features** | Tail-risk scoring using Generalized Pareto Distribution (GPD) — inspired by our climate risk research |
| 🎯 **Honest Metrics** | Precision, Recall, F1, AUC-ROC on a held-out test set |
| 💰 **False-Positive Cost Analysis** | Quantifies the economic cost of each false alarm ($25/review) |
| ⚡ **Real-Time Scoring** | Score any transaction instantly via REST API |
| 🔍 **Interactive Dashboard** | Beautiful web UI with analytics, alerts, and transaction scorer |

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│   React Dashboard│────▶│   FastAPI     │────▶│  ML Ensemble   │
│   (Vite + React) │◀────│   Backend     │◀────│  GBM+RF+LR     │
└─────────────────┘     └──────────────┘     └────────────────┘
                              │                       │
                        ┌─────▼──────┐          ┌─────▼──────┐
                        │ Transaction│          │ EVT/GPD    │
                        │ Data Gen   │          │ Tail Risk  │
                        └────────────┘          └────────────┘
```

## 🔬 Connection to Climate Risk Research

This project leverages techniques from our **Temporal EVT-Clustering Framework** for quantifying climate transition risk in financial markets:

- **EVT (Extreme Value Theory)**: We fit Generalized Pareto Distributions to transaction amounts to identify extreme tail transactions — the same POT (Peaks Over Threshold) approach used in our climate risk paper
- **Risk Stratification**: Our Safe/Warning/Crash clustering maps to LOW/MEDIUM/HIGH/CRITICAL risk levels
- **Honest Backtesting**: Following our research methodology of out-of-sample validation with proper train/test splits

## 🚀 Quick Start

### Backend
```bash
cd AIRiskManager
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd AIRiskManager/frontend
npm install
npm run dev
```

The backend runs on `http://localhost:8000` and the frontend on `http://localhost:5173`.

## 📈 Metrics (Honest, Held-Out Test Set)

The model reports honest metrics on a **held-out 20% test set** that is never seen during training:

- **Precision**: Fraction of flagged transactions that are actual losses
- **Recall**: Fraction of actual losses that were caught
- **F1 Score**: Harmonic mean of precision and recall
- **False-Positive Cost**: $25 per false alarm (manual review cost)
- **False-Negative Cost**: 1× missed transaction amount

## 🔒 Defense-Only

This system is **strictly defense-only**. It detects and flags potential fraud/losses but contains no offense-capable features:
- No ability to generate fake transactions
- No tools to bypass fraud detection
- No personally identifiable information in the synthetic data
- All data is synthetically generated — no real customer data

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Model performance metrics |
| `/api/dashboard` | GET | Dashboard summary data |
| `/api/score` | POST | Score a single transaction |
| `/api/batch-score` | POST | Score a batch of transactions |
| `/api/recent-alerts` | GET | Recent high-risk alerts |

---

Built with ❤️ for the AI Risk Manager hackathon track.
