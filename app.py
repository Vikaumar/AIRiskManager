"""
╔══════════════════════════════════════════════════════════════╗
║  AI Risk Manager — FastAPI Backend                          ║
║  ──────────────────────────────────────────────────────────  ║
║  REST API for real-time fraud detection & risk scoring.     ║
║  Serves the dashboard and handles transaction analysis.     ║
╚══════════════════════════════════════════════════════════════╝
"""

from fastapi import FastAPI, HTTPException, Request, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional
import pandas as pd
import numpy as np
import os
import json
import time
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("AIRiskManager")

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

# ── Production Rate Limiter Middleware ───────────────────────
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 150):
        super().__init__(app)
        self.rate_limit = requests_per_minute
        self.clients = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        if client_ip not in self.clients:
            self.clients[client_ip] = []
            
        # Clean old requests (rolling window of 60 seconds)
        self.clients[client_ip] = [t for t in self.clients[client_ip] if now - t < 60]
        
        if len(self.clients[client_ip]) >= self.rate_limit:
            return JSONResponse(
                status_code=429, 
                content={"error": "Rate limit exceeded. Please slow down."}
            )
            
        self.clients[client_ip].append(now)
        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

# ── Global State & Cache ─────────────────────────────────────
model = FraudDetectionModel()
dataset = None
scored_dataset = None
is_ready = False
_cache = {}

# ── API Auth & Security ──────────────────────────────────────
API_KEY_NAME = "x-api-key"
API_KEY = "sk_hackathon_demo_key_12345"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        logger.warning(f"Invalid API Key attempt: {api_key}")
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key

# ── Exception Handlers ───────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(status_code=422, content={"error": "Validation Error", "details": exc.errors()})


# ── Pydantic Models ──────────────────────────────────────────
class TransactionInput(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    category: str = Field("Electronics", min_length=2)
    is_new_customer: int = Field(0, ge=0, le=1)
    customer_age_days: int = Field(365, ge=0)
    payment_method: str = Field("credit_card", min_length=2)
    device: str = Field("desktop", min_length=2)
    session_duration_sec: int = Field(180, ge=0)
    pages_viewed: int = Field(5, ge=1)
    shipping_destination: str = Field("domestic", min_length=2)
    txn_velocity_24h: int = Field(1, ge=0)
    ip_risk_score: float = Field(0.1, ge=0, le=1)
    is_vpn: int = Field(0, ge=0, le=1)
    email_domain_type: str = Field("established", min_length=2)
    billing_shipping_mismatch: int = Field(0, ge=0, le=1)

class BatchScoreRequest(BaseModel):
    n_transactions: int = Field(100, gt=0, le=5000)


# ── Startup ──────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    global model, dataset, scored_dataset, is_ready
    
    logger.info("AI Risk Manager -- Starting up...")
    logger.info("Generating synthetic transaction data...")
    
    dataset = generate_transactions(n_total=50000)
    
    logger.info("Training fraud detection model...")
    model.train(dataset)
    
    logger.info("Scoring all transactions...")
    scored_dataset = model.predict(dataset)
    
    is_ready = True
    logger.info("AI Risk Manager is ready!")


# ── API Endpoints ────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "healthy", "ready": is_ready, "timestamp": datetime.now().isoformat()}


@app.get("/api/metrics")
async def get_metrics(api_key: str = Depends(verify_api_key)):
    """Get model performance metrics (honest, held-out test set)."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    return model.metrics


@app.get("/api/dashboard")
async def get_dashboard(api_key: str = Depends(verify_api_key)):
    """Get dashboard summary data (Cached)."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    if "dashboard" in _cache:
        return _cache["dashboard"]
    
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
async def score_transaction(txn: TransactionInput, api_key: str = Depends(verify_api_key)):
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
    risk_factors = model.explain_transaction(txn.dict())
    
    return {
        "transaction_id": row["transaction_id"],
        "risk_score": float(row["risk_score"]),
        "risk_level": row["risk_level"],
        "is_flagged": int(row["is_flagged"]),
        "recommended_action": row["recommended_action"],
        "amount": float(row["amount"]),
        "category": row["category"],
        "risk_factors": risk_factors,
    }


@app.post("/api/batch-score")
async def batch_score(req: BatchScoreRequest, api_key: str = Depends(verify_api_key)):
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
async def get_recent_alerts(api_key: str = Depends(verify_api_key)):
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


@app.get("/api/fraud-network")
async def get_fraud_network(api_key: str = Depends(verify_api_key)):
    """Build a graph of linked entities from the scored dataset for the fraud ring visualizer (Cached)."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    if "network" in _cache:
        return _cache["network"]
        
    df = scored_dataset
    
    # Focus on flagged and high-risk transactions for the network
    risky = df[df["risk_score"] >= 0.30].copy()
    if len(risky) > 500:
        risky = risky.nlargest(500, "risk_score")
    
    nodes = []
    edges = []
    node_ids = set()
    
    # Create transaction nodes
    for _, row in risky.iterrows():
        txn_id = str(row["transaction_id"])
        risk = float(row["risk_score"])
        level = str(row["risk_level"])
        
        nodes.append({
            "id": txn_id,
            "type": "transaction",
            "label": txn_id[-8:],
            "risk_score": round(risk, 3),
            "risk_level": level,
            "amount": round(float(row["amount"]), 2),
            "category": str(row["category"]),
            "loss_type": str(row["loss_type"]),
        })
        node_ids.add(txn_id)
    
    # Create shared-attribute hub nodes and edges
    # Group by IP risk buckets (simulating shared IP subnets)
    ip_buckets = {}
    for _, row in risky.iterrows():
        ip_bucket = f"IP-{int(row['ip_risk_score'] * 10)}"
        if ip_bucket not in ip_buckets:
            ip_buckets[ip_bucket] = []
        ip_buckets[ip_bucket].append(str(row["transaction_id"]))
    
    for ip_id, txns in ip_buckets.items():
        if len(txns) >= 3:
            if ip_id not in node_ids:
                nodes.append({
                    "id": ip_id,
                    "type": "ip_cluster",
                    "label": ip_id,
                    "risk_score": 0.6,
                    "risk_level": "MEDIUM",
                    "count": len(txns),
                })
                node_ids.add(ip_id)
            for txn_id in txns[:15]:
                edges.append({"source": txn_id, "target": ip_id, "type": "shared_ip"})
    
    # Group by device type + VPN usage (simulating device fingerprint clusters)
    device_clusters = {}
    for _, row in risky.iterrows():
        key = f"DEV-{row['device']}-{'vpn' if row['is_vpn'] else 'clean'}"
        if key not in device_clusters:
            device_clusters[key] = []
        device_clusters[key].append(str(row["transaction_id"]))
    
    for dev_id, txns in device_clusters.items():
        if len(txns) >= 5:
            if dev_id not in node_ids:
                is_vpn = "vpn" in dev_id
                nodes.append({
                    "id": dev_id,
                    "type": "device_cluster",
                    "label": dev_id,
                    "risk_score": 0.75 if is_vpn else 0.4,
                    "risk_level": "HIGH" if is_vpn else "MEDIUM",
                    "count": len(txns),
                })
                node_ids.add(dev_id)
            for txn_id in txns[:12]:
                edges.append({"source": txn_id, "target": dev_id, "type": "shared_device"})
    
    # Group by email domain type (disposable emails form clusters)
    email_clusters = {}
    for _, row in risky.iterrows():
        key = f"EMAIL-{row['email_domain_type']}"
        if key not in email_clusters:
            email_clusters[key] = []
        email_clusters[key].append(str(row["transaction_id"]))
    
    for email_id, txns in email_clusters.items():
        if len(txns) >= 4:
            if email_id not in node_ids:
                is_disposable = "disposable" in email_id
                nodes.append({
                    "id": email_id,
                    "type": "email_cluster",
                    "label": email_id.replace("EMAIL-", ""),
                    "risk_score": 0.8 if is_disposable else 0.3,
                    "risk_level": "HIGH" if is_disposable else "LOW",
                    "count": len(txns),
                })
                node_ids.add(email_id)
            for txn_id in txns[:10]:
                edges.append({"source": txn_id, "target": email_id, "type": "shared_email"})
    
    # Group by shipping destination for cross-border rings
    dest_clusters = {}
    for _, row in risky.iterrows():
        if row["shipping_destination"] == "cross_border_high_risk":
            key = "DEST-high-risk-xborder"
            if key not in dest_clusters:
                dest_clusters[key] = []
            dest_clusters[key].append(str(row["transaction_id"]))
    
    for dest_id, txns in dest_clusters.items():
        if len(txns) >= 3:
            if dest_id not in node_ids:
                nodes.append({
                    "id": dest_id,
                    "type": "destination_cluster",
                    "label": "High-Risk Cross-Border",
                    "risk_score": 0.85,
                    "risk_level": "HIGH",
                    "count": len(txns),
                })
                node_ids.add(dest_id)
            for txn_id in txns[:15]:
                edges.append({"source": txn_id, "target": dest_id, "type": "shared_destination"})
    
    # Identify fraud rings: groups of 3+ transactions sharing 2+ attributes
    ring_count = 0
    txn_connections = {}
    for edge in edges:
        src = edge["source"]
        if src.startswith("TXN"):
            if src not in txn_connections:
                txn_connections[src] = set()
            txn_connections[src].add(edge["target"])
    
    # Find transactions that share multiple hub nodes (likely coordinated)
    ring_members = set()
    txn_list = list(txn_connections.keys())
    for i in range(len(txn_list)):
        for j in range(i + 1, min(i + 50, len(txn_list))):
            shared = txn_connections[txn_list[i]] & txn_connections[txn_list[j]]
            if len(shared) >= 2:
                ring_members.add(txn_list[i])
                ring_members.add(txn_list[j])
    
    ring_count = len(ring_members)
    
    response = {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "transaction_nodes": sum(1 for n in nodes if n["type"] == "transaction"),
            "hub_nodes": sum(1 for n in nodes if n["type"] != "transaction"),
            "suspected_ring_members": ring_count,
        }
    }
    
    _cache["network"] = response
    return response


@app.get("/api/evt-analysis")
async def get_evt_analysis(api_key: str = Depends(verify_api_key)):
    """Get EVT Generalized Pareto Distribution analysis for the tail-risk visualizer (Cached)."""
    if not is_ready:
        raise HTTPException(503, "Model not ready yet")
    
    if "evt" in _cache:
        return _cache["evt"]
        
    amounts = scored_dataset["amount"].values
    response = model.get_evt_analysis(amounts)
    
    _cache["evt"] = response
    return response


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
