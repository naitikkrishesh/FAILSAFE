
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, accuracy_score
)
import xgboost as xgb
import shap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURE_COLS = [
    "age", "medu", "fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "dalc", "walc", "health", "absences", "g1", "g2",
    "sex", "address", "famsize", "pstatus", "mjob", "fjob", "reason",
    "guardian", "schoolsup", "famsup", "paid", "activities", "nursery",
    "higher", "internet", "romantic"
]

CATEGORICAL_COLS = [
    "sex", "address", "famsize", "pstatus", "mjob", "fjob", "reason",
    "guardian", "schoolsup", "famsup", "paid", "activities", "nursery",
    "higher", "internet", "romantic"
]

NUMERIC_COLS = [
    "age", "medu", "fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "dalc", "walc", "health", "absences", "g1", "g2"
]


def load_and_prepare(csv_path: str) -> tuple:

    try:
        df = pd.read_csv(csv_path, sep=";")
        if df.shape[1] < 5:
            df = pd.read_csv(csv_path, sep=",")
    except Exception:
        df = pd.read_csv(csv_path, sep=",")

    # Lowercase and strip all column names
    df.columns = [c.lower().strip() for c in df.columns]

    print(f"  Columns found: {list(df.columns)}")
    print(f"  Shape: {df.shape}")

    g3_col = None
    for c in df.columns:
        if c.lower() == "g3":
            g3_col = c
            break

    if g3_col is None:
        raise ValueError(f"Could not find G3 column. Available columns: {list(df.columns)}")

    df["failed"] = (df[g3_col] < 10).astype(int)

    encoders = {}
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le

    available_features = [c for c in FEATURE_COLS if c in df.columns]
    X = df[available_features].copy()
    y = df["failed"]

    scaler = StandardScaler()
    numeric_available = [c for c in NUMERIC_COLS if c in X.columns]
    X[numeric_available] = scaler.fit_transform(X[numeric_available])

    return X, y, encoders, scaler, available_features


def train_model(csv_path: str):
    """Full training pipeline."""
    print("📚 Loading and preparing data...")
    X, y, encoders, scaler, feature_names = load_and_prepare(csv_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Failure rate: {y.mean():.1%}")

    print("\n🚀 Training XGBoost model...")
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum()
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )

    print("\n📊 Evaluating model...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    print(f"  Accuracy: {acc:.4f}")
    print(f"  ROC-AUC:  {auc:.4f}")
    print("\n" + classification_report(y_test, y_pred, target_names=["Pass", "Fail"]))

    print("\n🔍 Computing SHAP values...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)
    print(explainer , shap_values)
    # SHAP summary plot
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_test, feature_names=feature_names, show=False)
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, "shap_summary.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # Feature importance bar
    plt.figure(figsize=(10, 6))
    xgb.plot_importance(model, max_num_features=15, ax=plt.gca())
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, "feature_importance.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # Confusion matrix
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Reds",
                xticklabels=["Pass", "Fail"], yticklabels=["Pass", "Fail"])
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, "confusion_matrix.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # Save artifacts
    print("\n💾 Saving artifacts...")
    joblib.dump(model, os.path.join(MODEL_DIR, "xgb_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    joblib.dump(encoders, os.path.join(MODEL_DIR, "encoders.pkl"))

    meta = {
        "feature_names": feature_names,
        "categorical_cols": CATEGORICAL_COLS,
        "numeric_cols": NUMERIC_COLS,
        "accuracy": round(acc, 4),
        "roc_auc": round(auc, 4),
        "model_version": "v1.0"
    }
    with open(os.path.join(MODEL_DIR, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print(f"✅ Model saved to {MODEL_DIR}")
    return model, explainer, scaler, encoders, feature_names


if __name__ == "__main__":
    import sys
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "data/student-mat.csv"
    train_model(csv_path)
