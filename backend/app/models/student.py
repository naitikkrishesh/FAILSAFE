from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    school = Column(String)
    address = Column(String)
    famsize = Column(String)
    pstatus = Column(String)
    medu = Column(Integer)
    fedu = Column(Integer)
    mjob = Column(String)
    fjob = Column(String)
    reason = Column(String)
    guardian = Column(String)
    traveltime = Column(Integer)
    studytime = Column(Integer)
    failures = Column(Integer)
    schoolsup = Column(String)
    famsup = Column(String)
    paid = Column(String)
    activities = Column(String)
    nursery = Column(String)
    higher = Column(String)
    internet = Column(String)
    romantic = Column(String)
    famrel = Column(Integer)
    freetime = Column(Integer)
    goout = Column(Integer)
    dalc = Column(Integer)
    walc = Column(Integer)
    health = Column(Integer)
    absences = Column(Integer)
    g1 = Column(Float)
    g2 = Column(Float)
    g3 = Column(Float)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_deleted = Column(Boolean, default=False)  # Fix 4: soft delete
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    faculty = relationship("User", back_populates="students")
    predictions = relationship("Prediction", back_populates="student")
    interventions = relationship("Intervention", back_populates="student")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    risk_score = Column(Float)
    risk_label = Column(String)
    shap_values = Column(JSON)
    top_factors = Column(JSON)
    model_version = Column(String, default="v1.0")
    is_deleted = Column(Boolean, default=False)  
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="predictions")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    faculty_id = Column(Integer, ForeignKey("users.id"))
    intervention_type = Column(String)
    description = Column(String)
    status = Column(String, default="pending")
    ai_generated = Column(Boolean, default=True)
    notes = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("Student", back_populates="interventions")
    faculty = relationship("User", back_populates="interventions")
