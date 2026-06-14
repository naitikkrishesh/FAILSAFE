# FAILSAFE — Student Failure Risk Prediction System

> AI-powered early warning system for educational institutions.  
> Predicts at-risk students using XGBoost + SHAP Explainable AI, and auto-generates personalised intervention plans.
 
---

## Tech Stack

| Layer | Technology |
|---|---|
| **ML** | Python, XGBoost, scikit-learn, SHAP, Pandas, Matplotlib, Seaborn |
| **Backend** | FastAPI, PostgreSQL, JWT Authentication, SQLAlchemy |
| **Frontend** | React.js, HTML/CSS, Recharts |

---

## Project Structure

```
failsafe/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # SQLAlchemy DB connection
│   │   ├── auth.py              # JWT authentication
│   │   ├── models/
│   │   │   ├── user.py          # User model (Faculty, HOD, Admin)
│   │   │   └── student.py       # Student, Prediction, Intervention models
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # /api/auth — Login, Register, Me
│   │   │   ├── students.py      # /api/students — CRUD + CSV upload
│   │   │   ├── predictions.py   # /api/predictions — Predict + Interventions
│   │   │   └── dashboard.py     # /api/dashboard — Stats + charts data
│   │   └── ml/
│   │       ├── predictor.py     # XGBoost + SHAP real-time prediction
│   │       └── intervention_generator.py  # Rule-based AI intervention planner
│   ├── ml_pipeline/
│   │   ├── train.py             # Full training pipeline (run once)
│   │   └── artifacts/           # Saved model, scaler, encoders, plots
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js               # Router setup
│   │   ├── index.js             # Entry point
│   │   ├── index.css            # Global styles
│   │   ├── context/
│   │   │   └── AuthContext.js   # JWT auth context
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── components/
│   │   │   └── Layout.js        # Sidebar + navigation shell
│   │   └── pages/
│   │       ├── Login.js         # Faculty login
│   │       ├── Register.js      # Account registration
│   │       ├── Dashboard.js     # Stats, charts, risk overview
│   │       ├── Students.js      # Student list with risk filters
│   │       ├── StudentDetail.js # Full profile + SHAP + interventions
│   │       └── AddStudent.js    # Manual form + CSV bulk upload
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---



### 2. Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

---

## Manual Setup (Development)

### Step 1 — PostgreSQL Database

```bash
# Create database
psql -U postgres
CREATE DATABASE failsafe_db;
CREATE USER failsafe_user WITH PASSWORD 'failsafe_pass';
GRANT ALL PRIVILEGES ON DATABASE failsafe_db TO failsafe_user;
\q
```

### Step 2 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run the API server
uvicorn app.main:app --reload --port 8000
```

The server will auto-create all database tables on first run.

### Step 3 — Train the ML Model


```bash
cd backend

# Train on Math course data
python ml_pipeline/train.py /data/student-mat.csv


```

This will:
- Train an XGBoost classifier
- Evaluate model performance (Accuracy, ROC-AUC)
- Compute SHAP values
- Save `xgb_model.pkl`, `scaler.pkl`, `encoders.pkl`, `meta.json`
- Generate `shap_summary.png`, `feature_importance.png`, `confusion_matrix.png`

> **Note:** If the model is not trained yet, the API falls back to a heuristic rule-based predictor automatically. Train the model for best results.

### Step 4 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at http://localhost:3000

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new faculty/HOD account |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students/` | List all students (with latest prediction) |
| POST | `/api/students/` | Add a single student |
| GET | `/api/students/{id}` | Get student details + prediction |
| POST | `/api/students/upload-csv` | Bulk upload UCI CSV + auto-predict all |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions/predict/{student_id}` | Run XGBoost + SHAP prediction |
| GET | `/api/predictions/student/{student_id}` | Get prediction history |
| POST | `/api/predictions/interventions/generate/{student_id}` | AI-generate intervention plans |
| GET | `/api/predictions/interventions/student/{student_id}` | Get interventions |
| PATCH | `/api/predictions/interventions/{id}` | Update intervention status |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
<!-- | GET | `/api/dashboard/stats` | Aggregate stats (risk counts, trends) | -->
| GET | `/api/dashboard/risk-distribution` | Pie chart data |

---

## Features

### Machine Learning (XGBoost + SHAP)
- **Model:** XGBoost classifier trained on 30+ feature.
- **Features:** Attendance, grades (G1, G2), study time, failures, family background, lifestyle
- **Explainability:** SHAP values explain *why* each student is flagged
- **Risk Labels:** High (≥65%), Medium (35–65%), Low (<35%)
- **Fallback:** Heuristic predictor works without a trained model

### Explainable AI (SHAP)
- Top 5 risk factors per student displayed visually
- Each factor shows direction (increases/decreases risk) and magnitude
- Non-technical faculty-friendly descriptions
- Bar chart visualization in student detail view

### Auto-Generated Interventions
Personalised plans based on SHAP-identified risk factors:
- **Counselling** — for high-risk students
- **Extra Classes** — supplementary tutoring
- **Study Plan** — structured remedial planning
- **Attendance Monitoring** — for high-absentee students
- **Academic Support** — for poor mid-term grades
- **Wellness Check** — for lifestyle-related risks
- **Motivation Session** — for low aspiration

### Dashboard
- Real-time risk distribution (pie chart)
- 5-day risk trend (area chart)
- One-click navigation to risk segments
- Intervention tracking (pending / in progress / completed)

### Role-Based Access
- **Faculty:** See and manage their own students
- **HOD / Admin:** See all students across the institution

---

## Dataset

**UCI Student Performance Data Set**
- Source: https://www.kaggle.com/datasets/uciml/student-alcohol-consumption
- Files: `student-mat.csv` (Math)
- Separator: semicolon (`;`)
- ~395–649 records, 33 features
- Target: G3 < 10 → "at risk of failure"

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://naitikkrishesh:naitikkrishesh@localhost:5432/failsafe_db` | PostgreSQL connection string |
| `SECRET_KEY` | `failsafe-super-secret-key` | JWT signing secret — **change in production** |
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Backend API base URL |

---


CORS ->Cross-Origin Resource Sharing
                  A frontend (React, etc.) running on one origin cannot call a backend on another origin unless allowed. with the help of this Browser allows


