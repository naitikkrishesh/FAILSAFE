from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User
from app.models.student import Student, Prediction, Intervention
from app.schemas.schemas import DashboardStats
from app.auth import get_current_user

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    if current_user.role == "faculty":
        query = query.filter(Student.faculty_id == current_user.id)

    students = query.all()
    student_ids = [s.id for s in students]

    # Get latest prediction per student
    subquery = (
        db.query(
            Prediction.student_id,
            func.max(Prediction.created_at).label("latest")
        )
        .filter(Prediction.student_id.in_(student_ids))
        .group_by(Prediction.student_id)
        .subquery()
    )

    latest_preds = (
        db.query(Prediction)
        .join(subquery, (Prediction.student_id == subquery.c.student_id) &
              (Prediction.created_at == subquery.c.latest))
        .all()
    )

    high_risk = sum(1 for p in latest_preds if p.risk_label == "high")
    medium_risk = sum(1 for p in latest_preds if p.risk_label == "medium")
    low_risk = sum(1 for p in latest_preds if p.risk_label == "low")
    avg_score = sum(p.risk_score for p in latest_preds) / len(latest_preds) if latest_preds else 0

    interventions_pending = db.query(Intervention).filter(
        Intervention.student_id.in_(student_ids),
        Intervention.status == "pending"
    ).count()

    interventions_completed = db.query(Intervention).filter(
        Intervention.student_id.in_(student_ids),
        Intervention.status == "completed"
    ).count()

    # Risk trend (last 7 days mock)
    risk_trend = [
        {"day": "Mon", "high": 3, "medium": 5, "low": 12},
        {"day": "Tue", "high": 4, "medium": 6, "low": 10},
        {"day": "Wed", "high": 5, "medium": 4, "low": 11},
        {"day": "Thu", "high": 3, "medium": 7, "low": 10},
        {"day": "Fri", "high": high_risk, "medium": medium_risk, "low": low_risk},
    ]

    return DashboardStats(
        total_students=len(students),
        high_risk=high_risk,
        medium_risk=medium_risk,
        low_risk=low_risk,
        interventions_pending=interventions_pending,
        interventions_completed=interventions_completed,
        avg_risk_score=round(avg_score, 3),
        risk_trend=risk_trend
    )

@router.get("/risk-distribution")
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    if current_user.role == "faculty":
        query = query.filter(Student.faculty_id == current_user.id)
    students = query.all()
    student_ids = [s.id for s in students]

    preds = (
        db.query(Prediction)
        .filter(Prediction.student_id.in_(student_ids))
        .all()
    )

    distribution = {"high": 0, "medium": 0, "low": 0}
    for p in preds:
        distribution[p.risk_label] = distribution.get(p.risk_label, 0) + 1

    return distribution
