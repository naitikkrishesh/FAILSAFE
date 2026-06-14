
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, accuracy_score
)
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
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



FEATURES = ['age','address','famsize','Pstatus','Medu','Fedu','Mjob','Fjob',
            'traveltime','studytime','failures','schoolsup','famsup','paid',
            'activities','internet','romantic','famrel','freetime','goout',
            'Dalc','Walc','health','absences',
            # engineered
            'avg_grade_so_far','grade_trend','alcohol_total','parent_edu_avg',
            'social_risk','support_score','failure_flag','high_absences',
            # early grades (available before final)
            'G1','G2']
    


def load_and_prepare(csv_path: str) -> tuple:
    
    df = pd.read_csv(csv_path)
    
    print(f"  Columns found: {list(df.columns)}")
    print(f"  Shape: {df.shape}")
    
    df['at_risk'] = (df['G3'] < 10).astype(int)

    cat_cols = ['school','sex','address','famsize','Pstatus','Mjob','Fjob',
            'reason','guardian','schoolsup','famsup','paid','activities',
            'nursery','higher','internet','romantic']
    
    encoders = {}
    le = LabelEncoder()
    for col in cat_cols:
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
    
    df['avg_grade_so_far']    = (df['G1'] + df['G2']) / 2
    df['grade_trend']         = df['G2'] - df['G1']           
    df['alcohol_total']       = df['Dalc'] + df['Walc']
    df['parent_edu_avg']      = (df['Medu'] + df['Fedu']) / 2
    df['social_risk']         = df['goout'] + df['alcohol_total']
    df['support_score']       = df['famsup'] + df['schoolsup'] + df['internet']
    df['failure_flag']        = (df['failures'] > 0).astype(int)
    df['high_absences']       = (df['absences'] > df['absences'].quantile(0.75)).astype(int)


    
    
    X = df[FEATURES]
    y = df['at_risk']

    print(f"\nClass balance — At Risk: {y.sum()} ({y.mean()*100:.1f}%), Safe: {(1-y).sum()}")

    return X , y , encoders
    


def train_model(csv_path: str):
   
    X, y , encoders  = load_and_prepare(csv_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)


    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Failure rate: {y.mean():.1%}")

    models = {
        # 'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        'Random Forest':       RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, class_weight='balanced'),
        # 'Gradient Boosting':   GradientBoostingClassifier(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42),
        # 'XGBoost':             XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42,
                                        #  scale_pos_weight=(1-y.mean())/y.mean(), eval_metric='logloss'),
    }
   

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    results = {}
    for name, model in models.items():
        if name == 'Logistic Regression':
            model.fit(X_train_sc, y_train)
            pred = model.predict(X_test_sc)
            prob = model.predict_proba(X_test_sc)[:,1]
        else:
            model.fit(X_train, y_train)
            pred = model.predict(X_test)
            prob = model.predict_proba(X_test)[:,1]
        acc  = accuracy_score(y_test, pred)
        auc  = roc_auc_score(y_test, prob)
        results[name] = {'model': model, 'pred': pred, 'prob': prob, 'acc': acc, 'auc': auc}
        print(f"  {name:25s} | Acc: {acc:.3f} | AUC: {auc:.3f}")
    
    
    model = RandomForestClassifier(
                n_estimators=200, 
                max_depth=8,
                random_state=42,
                class_weight='balanced',
            )

    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    prob = model.predict_proba(X_test)[:,1]
    acc  = accuracy_score(y_test, pred)
    auc  = roc_auc_score(y_test, prob)

    print(f"  Accuracy: {acc:.4f}")
    print(f"  ROC-AUC:  {auc:.4f}")
    print("\n" + classification_report(y_test, pred, target_names=["Pass", "Fail"]))


    
    print("\n🔍 Computing SHAP values...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)

    # print(explainer , shap_values)
    # SHAP summary plot
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_test, feature_names=FEATURES, show=False)
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, "shap_summary.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # Feature importance bar
    # plt.figure(figsize=(10, 6))
    # xgb.plot_importance(model, max_num_features=15, ax=plt.gca())
    # plt.tight_layout()
    # plt.savefig(os.path.join(MODEL_DIR, "feature_importance.png"), dpi=150, bbox_inches="tight")
    # plt.close()

    # # Confusion matrix
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, pred)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Reds",
                xticklabels=["Pass", "Fail"], yticklabels=["Pass", "Fail"])
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, "confusion_matrix.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # # Save artifacts
    print("\n💾 Saving artifacts...")
    joblib.dump(model, os.path.join(MODEL_DIR, "rfc_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    joblib.dump(encoders, os.path.join(MODEL_DIR, "encoders.pkl"))

    meta = {
        "feature_names": FEATURES,
        "accuracy": round(acc, 4),
        "roc_auc": round(auc, 4),
        "model_version": "v1.0"
    }
    with open(os.path.join(MODEL_DIR, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print(f"✅ Model saved to {MODEL_DIR}")
    return model, explainer, scaler, encoders, FEATURES




if __name__ == "__main__":
    import sys
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "data/student-mat.csv"
    train_model(csv_path)
