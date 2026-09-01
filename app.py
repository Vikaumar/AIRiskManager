"""
╔══════════════════════════════════════════════════════════════╗
║  AI Risk Manager — FastAPI Backend                          ║
║  ──────────────────────────────────────────────────────────  ║
║  REST API for real-time fraud detection & risk scoring.     ║
║  Serves the dashboard and handles transaction analysis.     ║
╚══════════════════════════════════════════════════════════════╝
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime

from data_generator import generate_transactions
from model import FraudDetectionModel

# ── App Setup ────────────────────────────────────────────────
app = FastAPI(
    title="AI Risk Manager",
    description="AI-powered fraud, return & chargeback detection for merchants",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global State ─────────────────────────────────────────────
model = FraudDetectionModel()
dataset = None
scored_dataset = None
is_ready = False


# ── Pydantic Models ──────────────────────────────────────────
class TransactionInput(BaseModel):
    amount: float
    category: str = "Electronics"
    is_new_customer: int = 0
    customer_age_days: int = 365
    payment_method: str = "credit_card"
    device: str = "desktop"
    session_duration_sec: int = 180
    pages_viewed: int = 5
    shipping_destination: str = "domestic"
    txn_velocity_24h: int = 1
    ip_risk_score: float = 0.1
    is_vpn: int = 0
    email_domain_type: str = "established"
    billing_shipping_mismatch: int = 0


class BatchScoreRequest(BaseModel):
    n_transactions: int = 100


# ── Startup ──────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    global model, dataset, scored_dataset, is_ready
    
    print("\n  [*] AI Risk Manager -- Starting up...")
    print("  [*] Generating synthetic transaction data...")
    
    dataset = generate_transactions(n_total=50000)
    
    print("  [*] Training fraud detection model...")
    model.train(dataset)
    
    print("  [*] Scoring all transactions...")
    scored_dataset = model.predict(dataset)
    
    is_ready = True
    print("  [OK] AI Risk Manager is ready!\n")


# ── API Endpoints ────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "healthy", "ready": is_ready, "timestamp": datetime.now().isoformat()}


@app.get("/api/metrics")
async def get_metrics():
    """Get model performance metrics (honest, held-out test set)."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    return model.metrics


@app.get("/api/dashboard")
async def get_dashboard():
    """Get dashboard summary data."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    df = scored_dataset
    
    # Overall stats
    total_txns = len(df)
    total_flagged = int(df["is_flagged"].sum())
    total_amount = float(df["amount"].sum())
    flagged_amount = float(df[df["is_flagged"] == 1]["amount"].sum())
    
    # Loss type breakdown
    loss_breakdown = df["loss_type"].value_counts().to_dict()
    
    # Risk level distribution
    risk_distribution = df["risk_level"].value_counts().to_dict()
    
    # Action distribution
    action_distribution = df["recommended_action"].value_counts().to_dict()
    
    # Category risk analysis
    category_risk = df.groupby("category").agg(
        total_transactions=("amount", "count"),
        avg_risk_score=("risk_score", "mean"),
        flagged_count=("is_flagged", "sum"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean"),
    ).round(4).reset_index().to_dict(orient="records")
    
    # Hourly risk pattern
    df_copy = df.copy()
    df_copy["hour"] = pd.to_datetime(df_copy["timestamp"]).dt.hour
    hourly = df_copy.groupby("hour").agg(
        txn_count=("amount", "count"),
        avg_risk=("risk_score", "mean"),
        flagged=("is_flagged", "sum"),
    ).reset_index().to_dict(orient="records")
    
    # Payment method risk
    payment_risk = df.groupby("payment_method").agg(
        count=("amount", "count"),
        avg_risk=("risk_score", "mean"),
        flag_rate=("is_flagged", "mean"),
    ).round(4).reset_index().to_dict(orient="records")
    
    # Top risky transactions
    top_risky = df.nlargest(10, "risk_score")[
        ["transaction_id", "amount", "category", "risk_score", 
         "risk_level", "recommended_action", "payment_method", "loss_type"]
    ].to_dict(orient="records")
    
    # Risk score histogram
    hist_bins = np.linspace(0, 1, 21)
    hist_counts, _ = np.histogram(df["risk_score"], bins=hist_bins)
    risk_histogram = [
        {"bin_start": round(hist_bins[i], 2), "bin_end": round(hist_bins[i+1], 2), "count": int(hist_counts[i])}
        for i in range(len(hist_counts))
    ]
    
    # Actual vs predicted confusion
    actual_loss = df["is_loss"].sum()
    detected = df[(df["is_flagged"] == 1) & (df["is_loss"] == 1)].shape[0]
    missed = df[(df["is_flagged"] == 0) & (df["is_loss"] == 1)].shape[0]
    false_alarms = df[(df["is_flagged"] == 1) & (df["is_loss"] == 0)].shape[0]
    
    return {
        "summary": {
            "total_transactions": total_txns,
            "total_flagged": total_flagged,
            "total_amount": round(total_amount, 2),
            "flagged_amount": round(flagged_amount, 2),
            "flag_rate": round(total_flagged / total_txns, 4),
            "actual_loss_count": int(actual_loss),
            "detected_losses": int(detected),
            "missed_losses": int(missed),
            "false_alarms": int(false_alarms),
        },
        "loss_breakdown": loss_breakdown,
        "risk_distribution": risk_distribution,
        "action_distribution": action_distribution,
        "category_risk": category_risk,
        "hourly_pattern": hourly,
        "payment_risk": payment_risk,
        "top_risky": top_risky,
        "risk_histogram": risk_histogram,
    }


@app.post("/api/score")
async def score_transaction(txn: TransactionInput):
    """Score a single transaction for fraud risk."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    # Build a single-row DataFrame
    txn_df = pd.DataFrame([{
        "transaction_id": f"TXN-LIVE-{datetime.now().strftime('%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "amount": txn.amount,
        "category": txn.category,
        "customer_id": 99999,
        "is_new_customer": txn.is_new_customer,
        "customer_age_days": txn.customer_age_days,
        "payment_method": txn.payment_method,
        "device": txn.device,
        "session_duration_sec": txn.session_duration_sec,
        "pages_viewed": txn.pages_viewed,
        "shipping_destination": txn.shipping_destination,
        "txn_velocity_24h": txn.txn_velocity_24h,
        "ip_risk_score": txn.ip_risk_score,
        "is_vpn": txn.is_vpn,
        "email_domain_type": txn.email_domain_type,
        "billing_shipping_mismatch": txn.billing_shipping_mismatch,
        "loss_type": "unknown",
        "is_loss": 0,
    }])
    
    result = model.predict(txn_df)
    row = result.iloc[0]
    
    return {
        "transaction_id": row["transaction_id"],
        "risk_score": float(row["risk_score"]),
        "risk_level": row["risk_level"],
        "is_flagged": int(row["is_flagged"]),
        "recommended_action": row["recommended_action"],
        "amount": float(row["amount"]),
        "category": row["category"],
    }


@app.post("/api/batch-score")
async def batch_score(req: BatchScoreRequest):
    """Generate and score a batch of new random transactions."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    new_txns = generate_transactions(n_total=min(req.n_transactions, 1000), 
                                      seed=int(datetime.now().timestamp()) % 100000)
    results = model.predict(new_txns)
    
    summary = {
        "total": len(results),
        "flagged": int(results["is_flagged"].sum()),
        "risk_distribution": results["risk_level"].value_counts().to_dict(),
        "action_distribution": results["recommended_action"].value_counts().to_dict(),
        "avg_risk_score": round(float(results["risk_score"].mean()), 4),
    }
    
    top_results = results.nlargest(20, "risk_score")[
        ["transaction_id", "amount", "category", "risk_score", 
         "risk_level", "recommended_action", "loss_type"]
    ].to_dict(orient="records")
    
    return {
        "summary": summary,
        "top_risky_transactions": top_results,
    }


@app.get("/api/recent-alerts")
async def get_recent_alerts():
    """Get the most recent high-risk transaction alerts."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    df = scored_dataset
    alerts = df[df["risk_level"].isin(["HIGH", "CRITICAL"])].nlargest(25, "risk_score")
    
    return alerts[
        ["transaction_id", "timestamp", "amount", "category", "risk_score",
         "risk_level", "recommended_action", "payment_method", 
         "shipping_destination", "loss_type"]
    ].to_dict(orient="records")


# ── Serve Frontend ───────────────────────────────────────────
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
