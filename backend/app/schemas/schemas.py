from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ── Auth Schemas ──────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "faculty"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):  
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ── Settings Schemas ──────────────────────────────────────────
class SettingsOut(BaseModel):  
    id: int
    user_id: int
    theme: str

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel): 
    theme: str  # "light" or "dark"

# ── Student Schemas ───────────────────────────────────────────
class StudentBase(BaseModel):
    student_id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    school: Optional[str] = None
    address: Optional[str] = None
    famsize: Optional[str] = None
    pstatus: Optional[str] = None
    medu: Optional[int] = None
    fedu: Optional[int] = None
    mjob: Optional[str] = None
    fjob: Optional[str] = None
    reason: Optional[str] = None
    guardian: Optional[str] = None
    traveltime: Optional[int] = None
    studytime: Optional[int] = None
    failures: Optional[int] = None
    schoolsup: Optional[str] = None
    famsup: Optional[str] = None
    paid: Optional[str] = None
    activities: Optional[str] = None
    nursery: Optional[str] = None
    higher: Optional[str] = None
    internet: Optional[str] = None
    romantic: Optional[str] = None
    famrel: Optional[int] = None
    freetime: Optional[int] = None
    goout: Optional[int] = None
    dalc: Optional[int] = None
    walc: Optional[int] = None
    health: Optional[int] = None
    absences: Optional[int] = None
    g1: Optional[float] = None
    g2: Optional[float] = None
    g3: Optional[float] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):  
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    school: Optional[str] = None
    address: Optional[str] = None
    famsize: Optional[str] = None
    pstatus: Optional[str] = None
    medu: Optional[int] = None
    fedu: Optional[int] = None
    mjob: Optional[str] = None
    fjob: Optional[str] = None
    reason: Optional[str] = None
    guardian: Optional[str] = None
    traveltime: Optional[int] = None
    studytime: Optional[int] = None
    failures: Optional[int] = None
    schoolsup: Optional[str] = None
    famsup: Optional[str] = None
    paid: Optional[str] = None
    activities: Optional[str] = None
    nursery: Optional[str] = None
    higher: Optional[str] = None
    internet: Optional[str] = None
    romantic: Optional[str] = None
    famrel: Optional[int] = None
    freetime: Optional[int] = None
    goout: Optional[int] = None
    dalc: Optional[int] = None
    walc: Optional[int] = None
    health: Optional[int] = None
    absences: Optional[int] = None
    g1: Optional[float] = None
    g2: Optional[float] = None
    g3: Optional[float] = None

class StudentOut(StudentBase):
    id: int
    faculty_id: Optional[int]
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ── Prediction Schemas ─────────────────────────────────────────
class PredictionOut(BaseModel):
    id: int
    student_id: int
    risk_score: float
    risk_label: str
    shap_values: Optional[Dict[str, float]]
    top_factors: Optional[List[Dict[str, Any]]]
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True

class StudentWithPrediction(StudentOut):
    latest_prediction: Optional[PredictionOut] = None

# ── Intervention Schemas ───────────────────────────────────────
class InterventionCreate(BaseModel):
    student_id: int
    intervention_type: str
    description: str
    ai_generated: bool = True
    notes: Optional[str] = None
 
class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class InterventionOut(BaseModel):
    id: int
    student_id: int
    faculty_id: int
    intervention_type: str
    description: str
    status: str
    ai_generated: bool
    notes: Optional[str]
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ── Dashboard Schemas ──────────────────────────────────────────
class DashboardStats(BaseModel):
    total_students: int
    high_risk: int
    medium_risk: int
    low_risk: int
    interventions_pending: int
    interventions_completed: int
    avg_risk_score: float
    risk_trend: List[Dict[str, Any]]
