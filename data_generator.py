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


def generate_transactions(n_total: int = 50000, fraud_rate: float = 0.035,
                          return_rate: float = 0.08, chargeback_rate: float = 0.012,
                          seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic merchant transaction data with realistic patterns.
    
    Loss types:
      - fraud: unauthorized / stolen card transactions
      - return: legitimate product returns that eat into margin
      - chargeback: disputed transactions (friendly fraud, item-not-received, etc.)
    """
    rng = np.random.default_rng(seed)
    
    # ── Base transaction features ────────────────────────────
    n = n_total
    
    # Transaction amounts — log-normal with category-dependent means
    categories = ["Electronics", "Fashion", "Home & Garden", "Digital Goods", 
                  "Groceries", "Luxury", "Gaming", "Health & Beauty"]
    category_means = {
        "Electronics": 5.2, "Fashion": 4.0, "Home & Garden": 4.5,
        "Digital Goods": 3.0, "Groceries": 3.5, "Luxury": 6.5,
        "Gaming": 3.8, "Health & Beauty": 3.6
    }
    category_stds = {
        "Electronics": 1.0, "Fashion": 0.8, "Home & Garden": 0.9,
        "Digital Goods": 1.2, "Groceries": 0.5, "Luxury": 0.8,
        "Gaming": 0.9, "Health & Beauty": 0.7
    }
    
    txn_categories = rng.choice(categories, size=n, p=[0.18, 0.20, 0.12, 0.10, 0.15, 0.05, 0.10, 0.10])
    
    amounts = np.array([
        np.clip(rng.lognormal(category_means[c], category_stds[c]), 1.0, 15000.0)
        for c in txn_categories
    ])
    
    # Time features
    base_date = datetime(2024, 1, 1)
    days_offset = rng.integers(0, 365, size=n)
    hours = rng.choice(24, size=n, p=_hour_distribution())
    timestamps = [base_date + timedelta(days=int(d), hours=int(h), minutes=int(rng.integers(0, 60)))
                  for d, h in zip(days_offset, hours)]
    
    # Customer features
    customer_ids = rng.integers(1000, 50000, size=n)
    is_new_customer = rng.random(n) < 0.15
    customer_age_days = np.where(is_new_customer, rng.integers(0, 30, size=n), rng.integers(30, 1800, size=n))
    
    # Payment methods
    payment_methods = rng.choice(
        ["credit_card", "debit_card", "digital_wallet", "bank_transfer", "buy_now_pay_later"],
        size=n, p=[0.40, 0.25, 0.20, 0.10, 0.05]
    )
    
    # Device & session features
    devices = rng.choice(["mobile", "desktop", "tablet"], size=n, p=[0.55, 0.35, 0.10])
    session_duration_sec = np.clip(rng.exponential(300, size=n), 5, 7200).astype(int)
    pages_viewed = np.clip(rng.poisson(5, size=n), 1, 50)
    
    # Shipping features
    shipping_countries = rng.choice(
        ["domestic", "cross_border_low_risk", "cross_border_high_risk"],
        size=n, p=[0.70, 0.20, 0.10]
    )
    
    # Velocity features (transactions in last 24h from same customer)
    txn_velocity_24h = np.clip(rng.poisson(1.5, size=n), 0, 30)
    
    # IP risk signals
    ip_risk_score = np.clip(rng.beta(2, 8, size=n), 0, 1)
    is_vpn = rng.random(n) < 0.08
    
    # Email domain risk
    email_domain_types = rng.choice(
        ["established", "free_provider", "disposable", "custom"],
        size=n, p=[0.30, 0.50, 0.05, 0.15]
    )
    
    # Address mismatch
    billing_shipping_mismatch = rng.random(n) < 0.12
    
    # ── Generate labels (fraud, return, chargeback) ──────────
    # Fraud probability — influenced by features
    fraud_base = np.full(n, fraud_rate)
    fraud_base[amounts > 500] *= 2.5
    fraud_base[is_new_customer] *= 3.0
    fraud_base[is_vpn] *= 4.0
    fraud_base[shipping_countries == "cross_border_high_risk"] *= 3.5
    fraud_base[txn_velocity_24h > 5] *= 2.0
    fraud_base[np.array([e == "disposable" for e in email_domain_types])] *= 5.0
    fraud_base[billing_shipping_mismatch] *= 2.0
    fraud_base[session_duration_sec < 30] *= 3.0
    fraud_base[payment_methods == "buy_now_pay_later"] *= 2.5
    fraud_base = np.clip(fraud_base, 0, 0.85)
    
    is_fraud = rng.random(n) < fraud_base
    
    # Return probability — category dependent
    return_base = np.full(n, return_rate)
    return_base[np.array([c in ["Fashion", "Electronics"] for c in txn_categories])] *= 2.0
    return_base[np.array([c == "Groceries" for c in txn_categories])] *= 0.3
    return_base[np.array([c == "Digital Goods" for c in txn_categories])] *= 0.1
    return_base = np.clip(return_base, 0, 0.5)
    
    is_return = (~is_fraud) & (rng.random(n) < return_base)
    
    # Chargeback probability
    chargeback_base = np.full(n, chargeback_rate)
    chargeback_base[amounts > 200] *= 2.0
    chargeback_base[is_new_customer] *= 1.8
    chargeback_base[shipping_countries == "cross_border_high_risk"] *= 2.5
    chargeback_base = np.clip(chargeback_base, 0, 0.3)
    
    is_chargeback = (~is_fraud) & (~is_return) & (rng.random(n) < chargeback_base)
    
    # Combined loss type
    loss_type = np.where(is_fraud, "fraud",
                np.where(is_return, "return",
                np.where(is_chargeback, "chargeback", "legitimate")))
    
    is_loss = is_fraud | is_return | is_chargeback
    
    # ── Build DataFrame ──────────────────────────────────────
    df = pd.DataFrame({
        "transaction_id": [f"TXN-{i:06d}" for i in range(n)],
        "timestamp": timestamps,
        "amount": np.round(amounts, 2),
        "category": txn_categories,
        "customer_id": customer_ids,
        "is_new_customer": is_new_customer.astype(int),
        "customer_age_days": customer_age_days,
        "payment_method": payment_methods,
        "device": devices,
        "session_duration_sec": session_duration_sec,
        "pages_viewed": pages_viewed,
        "shipping_destination": shipping_countries,
        "txn_velocity_24h": txn_velocity_24h,
        "ip_risk_score": np.round(ip_risk_score, 4),
        "is_vpn": is_vpn.astype(int),
        "email_domain_type": email_domain_types,
        "billing_shipping_mismatch": billing_shipping_mismatch.astype(int),
        "loss_type": loss_type,
        "is_loss": is_loss.astype(int),
    })
    
    return df


def _hour_distribution():
    """Realistic hour-of-day distribution for e-commerce."""
    # Peak hours: 10am-2pm, 7pm-10pm
    probs = np.array([
        0.01, 0.005, 0.003, 0.003, 0.005, 0.01,   # 0-5am
        0.02, 0.03, 0.04, 0.06, 0.08, 0.08,         # 6-11am
        0.07, 0.06, 0.05, 0.04, 0.05, 0.06,         # 12-5pm
        0.07, 0.08, 0.08, 0.07, 0.05, 0.03,         # 6-11pm
    ])
    return probs / probs.sum()


if __name__ == "__main__":
    df = generate_transactions()
    print(f"Generated {len(df)} transactions")
    print(f"\nLoss distribution:")
    print(df["loss_type"].value_counts())
    print(f"\nOverall loss rate: {df['is_loss'].mean():.2%}")
    print(f"\nSample:")
    print(df.head(10).to_string())
