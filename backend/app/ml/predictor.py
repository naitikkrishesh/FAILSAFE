
import numpy as np
import pandas as pd
import joblib
import shap
import json
import os
from sqlalchemy.orm import Session
from app.models.student import Student, Prediction

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_pipeline", "artifacts")

_model = None
_scaler = None
_encoders = None
_meta = None
_explainer = None


def _load_artifacts():
    global _model, _scaler, _encoders, _meta, _explainer

    model_path = os.path.join(MODEL_DIR, "xgb_model.pkl")
    if not os.path.exists(model_path):
        return False

    _model = joblib.load(model_path)
    _scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    _encoders = joblib.load(os.path.join(MODEL_DIR, "encoders.pkl"))
    with open(os.path.join(MODEL_DIR, "meta.json")) as f:
        _meta = json.load(f)
    _explainer = shap.TreeExplainer(_model)
    return True


def _student_to_features(student: Student) -> pd.DataFrame:
    """Convert a Student ORM object to a feature DataFrame."""
    if _meta is None:
        _load_artifacts()

    row = {
        "age": student.age or 17,
        "medu": student.medu or 2,
        "fedu": student.fedu or 2,
        "traveltime": student.traveltime or 2,
        "studytime": student.studytime or 2,
        "failures": student.failures or 0,
        "famrel": student.famrel or 4,
        "freetime": student.freetime or 3,
        "goout": student.goout or 3,
        "dalc": student.dalc or 1,
        "walc": student.walc or 1,
        "health": student.health or 3,
        "absences": student.absences or 0,
        "g1": student.g1 or 10.0,
        "g2": student.g2 or 10.0,
        "sex": student.gender or "M",
        "address": student.address or "U",
        "famsize": student.famsize or "GT3",
        "pstatus": student.pstatus or "T",
        "mjob": student.mjob or "other",
        "fjob": student.fjob or "other",
        "reason": student.reason or "course",
        "guardian": student.guardian or "mother",
        "schoolsup": student.schoolsup or "no",
        "famsup": student.famsup or "yes",
        "paid": student.paid or "no",
        "activities": student.activities or "no",
        "nursery": student.nursery or "yes",
        "higher": student.higher or "yes",
        "internet": student.internet or "yes",
        "romantic": student.romantic or "no",
    }

    df = pd.DataFrame([row])
    feature_names = _meta["feature_names"]

    for col in _meta["categorical_cols"]:
        if col in df.columns and col in _encoders:
            try:
                df[col] = _encoders[col].transform(df[col].astype(str))
            except ValueError:
                df[col] = 0

    numeric_available = [c for c in _meta["numeric_cols"] if c in df.columns]
    df[numeric_available] = _scaler.transform(df[numeric_available])

    available = [c for c in feature_names if c in df.columns]
    return df[available]


def predict_student_risk(student_id: int, db: Session) -> Prediction:
    """Run prediction for a student and store result."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student {student_id} not found")

    loaded = _load_artifacts()

    if not loaded:
        # Fallback: heuristic prediction when model not trained yet
        risk_score = _heuristic_risk(student)
    else:
        X = _student_to_features(student)
        risk_score = float(_model.predict_proba(X)[0][1])

    # Risk label
    if risk_score >= 0.65:
        risk_label = "high"
    elif risk_score >= 0.35:
        risk_label = "medium"
    else:
        risk_label = "low"

    # SHAP explanation
    shap_vals = {}
    top_factors = []
    if loaded and _explainer is not None:
        try:
            X = _student_to_features(student)
            sv = _explainer.shap_values(X)[0]
            feature_names = _meta["feature_names"][:len(sv)]
            shap_vals = {f: round(float(v), 4) for f, v in zip(feature_names, sv)}

            sorted_factors = sorted(
                [(f, v) for f, v in shap_vals.items()],
                key=lambda x: abs(x[1]),
                reverse=True
            )[:5]

            top_factors = [
                {
                    "feature": f,
                    "shap_value": v,
                    "impact": "increases_risk" if v > 0 else "decreases_risk",
                    "description": _factor_description(f, v)
                }
                for f, v in sorted_factors
            ]
        except Exception:
            pass

    if not top_factors:
        top_factors = _heuristic_factors(student)

    prediction = Prediction(
        student_id=student_id,
        risk_score=round(risk_score, 4),
        risk_label=risk_label,
        shap_values=shap_vals,
        top_factors=top_factors,
        model_version=_meta.get("model_version", "v1.0") if _meta else "heuristic"
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


def _heuristic_risk(student: Student) -> float:
    """Rule-based fallback when ML model isn't trained yet."""
    score = 0.3
    if student.failures and student.failures > 0:
        score += 0.2 * student.failures
    if student.absences and student.absences > 15:
        score += 0.15
    if student.g1 and student.g1 < 8:
        score += 0.2
    if student.g2 and student.g2 < 8:
        score += 0.2
    if student.studytime and student.studytime < 2:
        score += 0.1
    if student.higher == "no":
        score += 0.1
    return min(score, 0.99)


def _heuristic_factors(student: Student):
    factors = []
    if student.failures and student.failures > 0:
        factors.append({"feature": "failures", "shap_value": 0.3,
                        "impact": "increases_risk", "description": f"{student.failures} past failure(s) significantly increases risk"})
    if student.absences and student.absences > 10:
        factors.append({"feature": "absences", "shap_value": 0.2,
                        "impact": "increases_risk", "description": f"High absences ({student.absences}) increases dropout risk"})
    if student.g1 and student.g1 < 10:
        factors.append({"feature": "g1", "shap_value": 0.25,
                        "impact": "increases_risk", "description": f"Low first-period grade ({student.g1}) is a strong predictor"})
    if student.studytime and student.studytime >= 3:
        factors.append({"feature": "studytime", "shap_value": -0.15,
                        "impact": "decreases_risk", "description": "Good study time reduces risk"})
    return factors


def _factor_description(feature: str, shap_value: float) -> str:
    descriptions = {
        "failures": "Past academic failures are a strong risk indicator",
        "absences": "High absenteeism correlates with failure risk",
        "g1": "First period grade predicts final outcome",
        "g2": "Second period grade is a strong predictor",
        "studytime": "Weekly study time impacts performance",
        "goout": "Frequent socializing may impact study time",
        "dalc": "Weekday alcohol consumption affects performance",
        "walc": "Weekend alcohol consumption affects performance",
        "higher": "Aspiration for higher education motivates performance",
        "internet": "Home internet access supports self-study",
        "medu": "Mother's education level influences support",
        "fedu": "Father's education level influences support",
    }
    return descriptions.get(feature, f"{'Increases' if shap_value > 0 else 'Decreases'} failure probability")
