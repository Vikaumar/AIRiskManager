"""
╔══════════════════════════════════════════════════════════════╗
║  AI Risk Manager — Synthetic Transaction Data Generator     ║
║  ──────────────────────────────────────────────────────────  ║
║  Generates realistic e-commerce transaction data with       ║
║  fraud, returns, and chargeback labels for model training.  ║
╚══════════════════════════════════════════════════════════════╝
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def generate_transactions(n_total: int = 50000, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic merchant transaction data with realistic multi-factor risk profiles.
    
    Loss types:
      - fraud: unauthorized / stolen card transactions, account takeover, bot attacks
      - return: serial returns and policy abuse eating into merchant margins
      - chargeback: disputed transactions, friendly fraud, cross-border claims
    """
    rng = np.random.default_rng(seed)
    n = n_total
    
    # ── Categories & Amounts ─────────────────────────────────
    categories = ["Electronics", "Fashion", "Home & Garden", "Digital Goods", 
                  "Groceries", "Luxury", "Gaming", "Health & Beauty"]
    cat_weights = [0.18, 0.20, 0.12, 0.10, 0.15, 0.05, 0.10, 0.10]
    
    category_means = {
        "Electronics": 5.4, "Fashion": 4.1, "Home & Garden": 4.6,
        "Digital Goods": 3.2, "Groceries": 3.4, "Luxury": 6.8,
        "Gaming": 3.7, "Health & Beauty": 3.6
    }
    category_stds = {
        "Electronics": 0.9, "Fashion": 0.7, "Home & Garden": 0.8,
        "Digital Goods": 1.1, "Groceries": 0.4, "Luxury": 0.8,
        "Gaming": 0.8, "Health & Beauty": 0.6
    }
    
    txn_categories = rng.choice(categories, size=n, p=cat_weights)
    amounts = np.array([
        np.clip(rng.lognormal(category_means[c], category_stds[c]), 2.0, 15000.0)
        for c in txn_categories
    ])
    
    # Time features
    base_date = datetime(2025, 1, 1)
    days_offset = rng.integers(0, 365, size=n)
    hours = rng.choice(24, size=n, p=_hour_distribution())
    timestamps = [base_date + timedelta(days=int(d), hours=int(h), minutes=int(rng.integers(0, 60)))
                  for d, h in zip(days_offset, hours)]
    
    # Customer features
    customer_ids = rng.integers(1000, 50000, size=n)
    is_new_customer = (rng.random(n) < 0.18).astype(int)
    customer_age_days = np.where(is_new_customer == 1, rng.integers(0, 15, size=n), rng.integers(30, 1500, size=n))
    
    # Payment methods
    payment_methods = rng.choice(
        ["credit_card", "debit_card", "digital_wallet", "bank_transfer", "buy_now_pay_later"],
        size=n, p=[0.42, 0.23, 0.20, 0.08, 0.07]
    )
    
    # Device & session features
    devices = rng.choice(["mobile", "desktop", "tablet"], size=n, p=[0.55, 0.35, 0.10])
    session_duration_sec = np.clip(rng.exponential(240, size=n), 5, 5400).astype(int)
    pages_viewed = np.clip(rng.poisson(5, size=n), 1, 40)
    
    # Shipping destination
    shipping_countries = rng.choice(
        ["domestic", "cross_border_low_risk", "cross_border_high_risk"],
        size=n, p=[0.72, 0.18, 0.10]
    )
    
    # Velocity features
    txn_velocity_24h = np.clip(rng.poisson(1.4, size=n), 0, 25)
    
    # IP risk & VPN
    ip_risk_score = np.clip(rng.beta(2, 7, size=n), 0, 1)
    is_vpn = (rng.random(n) < 0.09).astype(int)
    
    # Email domain risk
    email_domain_types = rng.choice(
        ["established", "free_provider", "disposable", "custom"],
        size=n, p=[0.32, 0.48, 0.06, 0.14]
    )
    
    # Billing & Shipping Address mismatch
    billing_shipping_mismatch = (rng.random(n) < 0.11).astype(int)
    
    # ── Realistic Risk Latent Scoring ─────────────────────────
    # Fraud signal synthesis (Linear-Logistic latent function)
    fraud_logits = (
        -4.2
        + 1.35 * (amounts > 800)
        + 1.80 * is_vpn
        + 2.10 * (email_domain_types == "disposable")
        + 1.60 * (shipping_countries == "cross_border_high_risk")
        + 1.40 * billing_shipping_mismatch
        + 1.25 * is_new_customer
        + 0.28 * np.clip(txn_velocity_24h - 2, 0, 10)
        + 1.90 * ip_risk_score
        + 0.90 * (session_duration_sec < 25)
        + 0.80 * (payment_methods == "buy_now_pay_later")
    )
    prob_fraud = 1 / (1 + np.exp(-fraud_logits))
    is_fraud = rng.random(n) < prob_fraud
    
    # Return signal synthesis (abuse & margin drain)
    return_logits = (
        -3.4
        + 1.20 * np.isin(txn_categories, ["Fashion", "Electronics", "Luxury"])
        + 0.80 * (amounts > 300)
        + 0.60 * (payment_methods == "buy_now_pay_later")
        + 0.50 * (txn_velocity_24h >= 3)
        - 1.50 * np.isin(txn_categories, ["Groceries", "Digital Goods"])
    )
    prob_return = 1 / (1 + np.exp(-return_logits))
    is_return = (~is_fraud) & (rng.random(n) < prob_return)
    
    # Chargeback signal synthesis
    cb_logits = (
        -4.6
        + 1.40 * (shipping_countries == "cross_border_high_risk")
        + 1.30 * (amounts > 600)
        + 1.10 * is_new_customer
        + 1.00 * billing_shipping_mismatch
        + 0.70 * (payment_methods == "credit_card")
    )
    prob_cb = 1 / (1 + np.exp(-cb_logits))
    is_chargeback = (~is_fraud) & (~is_return) & (rng.random(n) < prob_cb)
    
    loss_type = np.where(is_fraud, "fraud",
                np.where(is_return, "return",
                np.where(is_chargeback, "chargeback", "legitimate")))
    
    is_loss = (is_fraud | is_return | is_chargeback).astype(int)
    
    df = pd.DataFrame({
        "transaction_id": [f"TXN-{i:06d}" for i in range(n)],
        "timestamp": timestamps,
        "amount": np.round(amounts, 2),
        "category": txn_categories,
        "customer_id": customer_ids,
        "is_new_customer": is_new_customer,
        "customer_age_days": customer_age_days,
        "payment_method": payment_methods,
        "device": devices,
        "session_duration_sec": session_duration_sec,
        "pages_viewed": pages_viewed,
        "shipping_destination": shipping_countries,
        "txn_velocity_24h": txn_velocity_24h,
        "ip_risk_score": np.round(ip_risk_score, 4),
        "is_vpn": is_vpn,
        "email_domain_type": email_domain_types,
        "billing_shipping_mismatch": billing_shipping_mismatch,
        "loss_type": loss_type,
        "is_loss": is_loss,
    })
    
    return df


def _hour_distribution():
    """Realistic hour-of-day distribution for transactions."""
    probs = np.array([
        0.012, 0.008, 0.005, 0.005, 0.008, 0.015,
        0.025, 0.040, 0.055, 0.070, 0.080, 0.085,
        0.075, 0.065, 0.055, 0.050, 0.055, 0.065,
        0.075, 0.080, 0.075, 0.060, 0.045, 0.024,
    ])
    return probs / probs.sum()


if __name__ == "__main__":
    df = generate_transactions(n_total=10000)
    print("Generated:", len(df))
    print(df["loss_type"].value_counts(normalize=True))
