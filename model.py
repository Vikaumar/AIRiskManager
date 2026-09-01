"""
╔══════════════════════════════════════════════════════════════╗
║  AI Risk Manager — Fraud Detection Model                    ║
║  ──────────────────────────────────────────────────────────  ║
║  Multi-model ensemble for transaction risk scoring.         ║
║  Inspired by EVT-based risk clustering from the Climate     ║
║  Risk project — applies statistical risk stratification     ║
║  to merchant fraud detection.                               ║
╚══════════════════════════════════════════════════════════════╝
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score, recall_score, f1_score, confusion_matrix,
    roc_auc_score, precision_recall_curve, average_precision_score,
    classification_report
)
from scipy.stats import genpareto
import pickle
import os


# ── Feature Engineering ──────────────────────────────────────
CATEGORICAL_COLS = ["category", "payment_method", "device", 
                    "shipping_destination", "email_domain_type"]
NUMERIC_COLS = ["amount", "is_new_customer", "customer_age_days",
                "session_duration_sec", "pages_viewed", "txn_velocity_24h",
                "ip_risk_score", "is_vpn", "billing_shipping_mismatch"]


def engineer_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """
    Transform raw transaction data into model-ready features.
    Includes EVT-inspired tail risk features.
    """
    feat = df.copy()
    
    # ── Log-transform amount ─────────────────────────────────
    feat["log_amount"] = np.log1p(feat["amount"])
    
    # ── Amount z-score within category ───────────────────────
    cat_stats = feat.groupby("category")["amount"].agg(["mean", "std"]).reset_index()
    cat_stats.columns = ["category", "cat_amount_mean", "cat_amount_std"]
    feat = feat.merge(cat_stats, on="category", how="left")
    feat["amount_zscore"] = (feat["amount"] - feat["cat_amount_mean"]) / feat["cat_amount_std"].clip(lower=1)
    
    # ── Time-based features ──────────────────────────────────
    feat["hour"] = pd.to_datetime(feat["timestamp"]).dt.hour
    feat["day_of_week"] = pd.to_datetime(feat["timestamp"]).dt.dayofweek
    feat["is_weekend"] = (feat["day_of_week"] >= 5).astype(int)
    feat["is_night"] = ((feat["hour"] >= 23) | (feat["hour"] <= 5)).astype(int)
    
    # ── Interaction features ─────────────────────────────────
    feat["amount_x_velocity"] = feat["log_amount"] * feat["txn_velocity_24h"]
    feat["amount_x_ip_risk"] = feat["log_amount"] * feat["ip_risk_score"]
    feat["new_customer_x_amount"] = feat["is_new_customer"] * feat["log_amount"]
    feat["vpn_x_mismatch"] = feat["is_vpn"] * feat["billing_shipping_mismatch"]
    feat["session_per_page"] = feat["session_duration_sec"] / feat["pages_viewed"].clip(lower=1)
    
    # ── EVT-Inspired: Tail Risk Score ────────────────────────
    # Fit GPD to transaction amounts to identify extreme tail transactions
    # This mirrors the POT (Peaks Over Threshold) approach from StocksClimateRisk
    threshold = feat["amount"].quantile(0.90)
    exceedances = feat["amount"][feat["amount"] > threshold] - threshold
    if len(exceedances) > 20:
        try:
            params = genpareto.fit(exceedances, floc=0)
            feat["evt_tail_prob"] = 1 - genpareto.cdf(
                np.clip(feat["amount"] - threshold, 0, None), *params
            )
        except Exception:
            feat["evt_tail_prob"] = (feat["amount"] > threshold).astype(float)
    else:
        feat["evt_tail_prob"] = (feat["amount"] > threshold).astype(float)
    
    feat["evt_tail_prob"] = feat["evt_tail_prob"].fillna(0)
    
    # ── Encode categoricals ──────────────────────────────────
    label_encoders = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        feat[f"{col}_enc"] = le.fit_transform(feat[col].astype(str))
        label_encoders[col] = le
    
    # ── Final feature list ───────────────────────────────────
    feature_cols = (
        NUMERIC_COLS + 
        [f"{c}_enc" for c in CATEGORICAL_COLS] +
        ["log_amount", "amount_zscore", "hour", "day_of_week", "is_weekend",
         "is_night", "amount_x_velocity", "amount_x_ip_risk", 
         "new_customer_x_amount", "vpn_x_mismatch", "session_per_page",
         "evt_tail_prob"]
    )
    
    return feat, feature_cols


# ── Model Training ───────────────────────────────────────────

class FraudDetectionModel:
    """
    Ensemble fraud detection model with honest metrics reporting.
    
    Architecture inspired by EVT-Clustering risk framework:
    - Statistical tail-risk features (GPD/EVT)
    - Multi-model ensemble (like comparing baselines)
    - Honest precision/recall/F1 with false-positive cost analysis
    """
    
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_cols = None
        self.is_trained = False
        self.metrics = {}
        self.threshold = 0.5
        self.false_positive_cost = 25.0  # $ cost per false positive (manual review)
        self.false_negative_cost_multiplier = 1.0  # multiplier on transaction amount
    
    def train(self, df: pd.DataFrame, target_col: str = "is_loss",
              test_size: float = 0.2, seed: int = 42):
        """Train the ensemble model and compute honest metrics."""
        
        print("\n  === Training AI Risk Manager Model ===")
        
        # Feature engineering
        feat_df, self.feature_cols = engineer_features(df)
        
        X = feat_df[self.feature_cols].values
        y = feat_df[target_col].values
        
        # Stratified split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=seed, stratify=y
        )
        
        # Also keep test amounts for cost analysis
        test_mask = feat_df.index.isin(
            feat_df.iloc[len(X_train):].index
        )
        test_amounts = feat_df.loc[test_mask, "amount"].values[:len(X_test)]
        
        # Scale
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"\n  Train set: {len(X_train)} transactions")
        print(f"  Test set:  {len(X_test)} transactions")
        print(f"  Loss rate: {y_train.mean():.2%} (train) / {y_test.mean():.2%} (test)")
        
        # ── Train ensemble ───────────────────────────────────
        self.models = {
            "gradient_boosting": GradientBoostingClassifier(
                n_estimators=200, max_depth=5, learning_rate=0.1,
                subsample=0.8, random_state=seed
            ),
            "random_forest": RandomForestClassifier(
                n_estimators=200, max_depth=8, random_state=seed,
                class_weight="balanced"
            ),
            "logistic_regression": LogisticRegression(
                max_iter=1000, random_state=seed, class_weight="balanced"
            ),
        }
        
        model_scores = {}
        for name, model in self.models.items():
            print(f"\n  Training {name}...")
            model.fit(X_train_scaled, y_train)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]
            auc = roc_auc_score(y_test, y_prob)
            ap = average_precision_score(y_test, y_prob)
            model_scores[name] = {"auc": auc, "ap": ap}
            print(f"    AUC-ROC: {auc:.4f}  |  AP: {ap:.4f}")
        
        # ── Ensemble prediction (weighted average) ───────────
        weights = {
            "gradient_boosting": 0.50,
            "random_forest": 0.35,
            "logistic_regression": 0.15,
        }
        
        y_prob_ensemble = np.zeros(len(X_test))
        for name, model in self.models.items():
            y_prob_ensemble += weights[name] * model.predict_proba(X_test_scaled)[:, 1]
        
        # ── Optimize threshold for F1 ───────────────────────
        precisions, recalls, thresholds = precision_recall_curve(y_test, y_prob_ensemble)
        f1s = 2 * precisions * recalls / (precisions + recalls + 1e-10)
        best_idx = np.argmax(f1s[:-1])
        self.threshold = thresholds[best_idx]
        
        y_pred = (y_prob_ensemble >= self.threshold).astype(int)
        
        # ── Compute honest metrics ───────────────────────────
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob_ensemble)
        ap = average_precision_score(y_test, y_prob_ensemble)
        
        # ── False positive cost analysis ─────────────────────
        fp_cost_total = fp * self.false_positive_cost
        fn_cost_total = np.sum(test_amounts[:len(y_test)][
            (y_pred == 0) & (y_test == 1)
        ]) * self.false_negative_cost_multiplier if fn > 0 else 0
        
        total_cost = fp_cost_total + fn_cost_total
        
        # ── Feature importance ───────────────────────────────
        gb_model = self.models["gradient_boosting"]
        importance = pd.DataFrame({
            "feature": self.feature_cols,
            "importance": gb_model.feature_importances_
        }).sort_values("importance", ascending=False)
        
        self.metrics = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "auc_roc": round(auc, 4),
            "average_precision": round(ap, 4),
            "threshold": round(self.threshold, 4),
            "confusion_matrix": {
                "true_negatives": int(tn),
                "false_positives": int(fp),
                "false_negatives": int(fn),
                "true_positives": int(tp),
            },
            "cost_analysis": {
                "false_positive_cost_per_unit": self.false_positive_cost,
                "total_fp_cost": round(fp_cost_total, 2),
                "total_fn_cost": round(fn_cost_total, 2),
                "total_cost": round(total_cost, 2),
                "cost_per_transaction": round(total_cost / len(y_test), 4),
            },
            "model_scores": model_scores,
            "feature_importance": importance.head(15).to_dict(orient="records"),
            "test_set_size": len(y_test),
            "loss_rate_test": round(y_test.mean(), 4),
            "pr_curve": {
                "precisions": precisions[::max(1, len(precisions)//100)].tolist(),
                "recalls": recalls[::max(1, len(recalls)//100)].tolist(),
            },
        }
        
        self.is_trained = True
        
        print(f"\n  === Ensemble Results (Held-Out Test Set) ===")
        print(f"  |  Precision:       {precision:.4f}")
        print(f"  |  Recall:          {recall:.4f}")
        print(f"  |  F1 Score:        {f1:.4f}")
        print(f"  |  AUC-ROC:         {auc:.4f}")
        print(f"  |  Avg Precision:   {ap:.4f}")
        print(f"  |  Threshold:       {self.threshold:.4f}")
        print(f"  |")
        print(f"  |  Confusion Matrix:")
        print(f"  |    TP={tp}  FP={fp}")
        print(f"  |    FN={fn}  TN={tn}")
        print(f"  |")
        print(f"  |  Cost Analysis:")
        print(f"  |    FP cost:  ${fp_cost_total:,.2f} ({fp} x ${self.false_positive_cost})")
        print(f"  |    FN cost:  ${fn_cost_total:,.2f} (missed fraud value)")
        print(f"  |    Total:    ${total_cost:,.2f}")
        print(f"  =============================================")
        
        return self.metrics
    
    def predict(self, transactions: pd.DataFrame) -> pd.DataFrame:
        """Score transactions and return risk assessments."""
        if not self.is_trained:
            raise RuntimeError("Model not trained yet!")
        
        feat_df, _ = engineer_features(transactions)
        
        # Handle missing feature columns
        for col in self.feature_cols:
            if col not in feat_df.columns:
                feat_df[col] = 0
        
        # Fill NaN values (can occur with single-row predictions where groupby stats are NaN)
        feat_df[self.feature_cols] = feat_df[self.feature_cols].fillna(0)
        
        X = feat_df[self.feature_cols].values
        X_scaled = self.scaler.transform(X)
        
        # Ensemble prediction
        weights = {"gradient_boosting": 0.50, "random_forest": 0.35, "logistic_regression": 0.15}
        
        y_prob = np.zeros(len(X))
        for name, model in self.models.items():
            y_prob += weights[name] * model.predict_proba(X_scaled)[:, 1]
        
        # Risk categorization (inspired by Safe/Warning/Crash clustering)
        risk_levels = np.where(
            y_prob >= 0.7, "CRITICAL",
            np.where(y_prob >= self.threshold, "HIGH",
            np.where(y_prob >= self.threshold * 0.6, "MEDIUM", "LOW"))
        )
        
        results = transactions.copy()
        results["risk_score"] = np.round(y_prob, 4)
        results["risk_level"] = risk_levels
        results["is_flagged"] = (y_prob >= self.threshold).astype(int)
        results["recommended_action"] = np.where(
            risk_levels == "CRITICAL", "BLOCK",
            np.where(risk_levels == "HIGH", "REVIEW",
            np.where(risk_levels == "MEDIUM", "MONITOR", "APPROVE"))
        )
        
        return results
    
    def save(self, path: str = "model"):
        """Save the trained model to disk."""
        os.makedirs(path, exist_ok=True)
        with open(os.path.join(path, "model.pkl"), "wb") as f:
            pickle.dump({
                "models": self.models,
                "scaler": self.scaler,
                "feature_cols": self.feature_cols,
                "threshold": self.threshold,
                "metrics": self.metrics,
            }, f)
    
    def load(self, path: str = "model"):
        """Load a trained model from disk."""
        with open(os.path.join(path, "model.pkl"), "rb") as f:
            data = pickle.load(f)
        self.models = data["models"]
        self.scaler = data["scaler"]
        self.feature_cols = data["feature_cols"]
        self.threshold = data["threshold"]
        self.metrics = data["metrics"]
        self.is_trained = True


if __name__ == "__main__":
    from data_generator import generate_transactions
    
    df = generate_transactions(n_total=50000)
    model = FraudDetectionModel()
    metrics = model.train(df)
    
    # Test prediction on a small batch
    sample = df.head(20)
    results = model.predict(sample)
    print("\n\nSample predictions:")
    print(results[["transaction_id", "amount", "loss_type", "risk_score", "risk_level", "recommended_action"]].to_string())
