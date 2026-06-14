from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.student import Student, Prediction
from app.schemas.schemas import StudentCreate, StudentOut, StudentWithPrediction
from app.auth import get_current_user
from app.ml.predictor import predict_student_risk
import pandas as pd
import io

router = APIRouter()

@router.get("/", response_model=List[StudentWithPrediction])
def get_students(
    risk_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    if current_user.role == "faculty":
        query = query.filter(Student.faculty_id == current_user.id)

    students = query.all()
    result = []
    for student in students:
        latest_pred = (
            db.query(Prediction)
            .filter(Prediction.student_id == student.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        student_data = StudentWithPrediction.from_orm(student)
        student_data.latest_prediction = latest_pred
        if risk_filter and latest_pred and latest_pred.risk_label != risk_filter:
            continue
        result.append(student_data)
    return result

@router.post("/", response_model=StudentOut)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Student).filter(Student.student_id == student_data.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")

    student = Student(**student_data.dict(), faculty_id=current_user.id)
    db.add(student)
    db.commit()
    db.refresh(student)

    # Auto-predict on creation
    try:
        predict_student_risk(student.id, db)
    except Exception as e:
        pass  # Don't fail creation if prediction fails

    return student

@router.get("/{student_id}", response_model=StudentWithPrediction)
def get_student(
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
    result = StudentWithPrediction.from_orm(student)
    result.latest_prediction = latest_pred
    return result

@router.post("/upload-csv")
async def upload_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a CSV of students (UCI format) and run batch prediction."""
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")), sep=";")

    added = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            student_id_str = f"STU{idx+1:04d}"
            existing = db.query(Student).filter(Student.student_id == student_id_str).first()
            if existing:
                continue

            student = Student(
                student_id=student_id_str,
                name=f"Student {idx+1}",
                age=row.get("age"),
                gender=row.get("sex"),
                school=row.get("school"),
                address=row.get("address"),
                famsize=row.get("famsize"),
                pstatus=row.get("Pstatus"),
                medu=row.get("Medu"),
                fedu=row.get("Fedu"),
                mjob=row.get("Mjob"),
                fjob=row.get("Fjob"),
                reason=row.get("reason"),
                guardian=row.get("guardian"),
                traveltime=row.get("traveltime"),
                studytime=row.get("studytime"),
                failures=row.get("failures"),
                schoolsup=row.get("schoolsup"),
                famsup=row.get("famsup"),
                paid=row.get("paid"),
                activities=row.get("activities"),
                nursery=row.get("nursery"),
                higher=row.get("higher"),
                internet=row.get("internet"),
                romantic=row.get("romantic"),
                famrel=row.get("famrel"),
                freetime=row.get("freetime"),
                goout=row.get("goout"),
                dalc=row.get("Dalc"),
                walc=row.get("Walc"),
                health=row.get("health"),
                absences=row.get("absences"),
                g1=row.get("G1"),
                g2=row.get("G2"),
                g3=row.get("G3"),
                faculty_id=current_user.id
            )
            db.add(student)
            db.commit()
            db.refresh(student)
            predict_student_risk(student.id, db)
            added += 1
        except Exception as e:
            errors.append(f"Row {idx}: {str(e)}")

    return {"added": added, "errors": errors}
