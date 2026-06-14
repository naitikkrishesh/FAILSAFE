from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.student import Student, Prediction, Intervention
from app.schemas.schemas import PredictionOut, InterventionCreate, InterventionUpdate, InterventionOut
from app.auth import get_current_user
from app.ml.predictor import predict_student_risk
from app.ml.intervention_generator import generate_interventions

router = APIRouter()

@router.post("/predict/{student_id}", response_model=PredictionOut)
def run_prediction(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    prediction = predict_student_risk(student_id, db)
    return prediction

@router.get("/student/{student_id}", response_model=List[PredictionOut])
def get_student_predictions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.student_id == student_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return predictions

@router.post("/interventions/", response_model=InterventionOut)
def create_intervention(
    data: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    intervention = Intervention(
        **data.dict(),
        faculty_id=current_user.id
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention

@router.post("/interventions/generate/{student_id}", response_model=List[InterventionOut])
def generate_ai_interventions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.student_id == student_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )
    if not latest_pred:
        raise HTTPException(status_code=400, detail="No prediction found. Run prediction first.")

    interventions = generate_interventions(student, latest_pred, current_user.id, db)
    return interventions

@router.get("/interventions/student/{student_id}", response_model=List[InterventionOut])
def get_interventions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Intervention).filter(Intervention.student_id == student_id).all()

@router.patch("/interventions/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: int,
    data: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(intervention, field, value)
    db.commit()
    db.refresh(intervention)
    return intervention
