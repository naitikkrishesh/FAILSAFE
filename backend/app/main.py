from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, students, predictions, dashboard, settings
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FAILSAFE API",
    description="AI-powered student failure risk prediction system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])  

@app.get("/")
def root():
    return {"message": "FAILSAFE API is running", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
