
from typing import List
from sqlalchemy.orm import Session
from app.models.student import Student, Prediction, Intervention


def generate_interventions(
    student: Student,
    prediction: Prediction,
    faculty_id: int,
    db: Session
) -> List[Intervention]:
    """Generate personalised intervention plans for a student."""

    # Delete existing AI-generated interventions for this student
    db.query(Intervention).filter(
        Intervention.student_id == student.id,
        Intervention.ai_generated == True,
        Intervention.status == "pending"
    ).delete()

    interventions_to_create = []
    top_factors = prediction.top_factors or []
    risk_label = prediction.risk_label

    factor_features = [f["feature"] for f in top_factors if f.get("impact") == "increases_risk"]

    # Core interventions based on risk level
    if risk_label == "high":
        interventions_to_create.append({
            "intervention_type": "counselling",
            "description": (
                f"URGENT: Schedule immediate counselling session for {student.name}. "
                f"Risk score is critically high ({prediction.risk_score:.0%}). "
                "Assess personal, academic, and social challenges in detail."
            )
        })

    if risk_label in ["high", "medium"]:
        interventions_to_create.append({
            "intervention_type": "extra_classes",
            "description": (
                f"Enrol {student.name} in supplementary tutoring sessions. "
                "Focus on subjects with lowest grades. "
                "Schedule 3x per week after school hours."
            )
        })

    # Feature-specific interventions
    if "failures" in factor_features and student.failures and student.failures > 0:
        interventions_to_create.append({
            "intervention_type": "study_plan",
            "description": (
                f"{student.name} has {student.failures} past failure(s). "
                "Create a structured remedial study plan targeting previously failed subjects. "
                "Set weekly milestones and conduct bi-weekly progress checks."
            )
        })

    if "absences" in factor_features and student.absences and student.absences > 10:
        interventions_to_create.append({
            "intervention_type": "attendance_monitoring",
            "description": (
                f"{student.name} has {student.absences} absences this period. "
                "Implement daily attendance tracking. Contact family if absences continue. "
                "Identify and address root causes (health, transport, motivation)."
            )
        })

    if "g1" in factor_features or "g2" in factor_features:
        g1 = student.g1 or 0
        g2 = student.g2 or 0
        interventions_to_create.append({
            "intervention_type": "academic_support",
            "description": (
                f"Mid-term grades are concerning (G1: {g1}, G2: {g2}/20). "
                "Assign a peer mentor and create a targeted revision schedule. "
                "Provide practice exam papers with guided solutions."
            )
        })

    if "goout" in factor_features or "dalc" in factor_features or "walc" in factor_features:
        interventions_to_create.append({
            "intervention_type": "wellness_check",
            "description": (
                f"Lifestyle factors are impacting {student.name}'s performance. "
                "Schedule a wellness meeting to discuss time management, social habits, "
                "and health. Consider referral to school wellness programme."
            )
        })

    if "studytime" in factor_features:
        interventions_to_create.append({
            "intervention_type": "study_plan",
            "description": (
                f"Low study time detected for {student.name}. "
                "Work with student to create a personalised weekly study schedule. "
                "Recommend study techniques: Pomodoro method, active recall, spaced repetition."
            )
        })

    if "higher" in factor_features and student.higher == "no":
        interventions_to_create.append({
            "intervention_type": "motivation_session",
            "description": (
                f"{student.name} has not expressed desire for higher education. "
                "Conduct career counselling session to explore opportunities. "
                "Connect student with alumni and career mentors to build aspiration."
            )
        })

    # Default intervention if none generated
    if not interventions_to_create:
        interventions_to_create.append({
            "intervention_type": "progress_monitoring",
            "description": (
                f"Monitor {student.name}'s progress weekly. "
                "Schedule monthly check-in meetings. "
                "Provide positive reinforcement and set achievable short-term goals."
            )
        })

    # Create and save all interventions
    created = []
    for data in interventions_to_create:
        intervention = Intervention(
            student_id=student.id,
            faculty_id=faculty_id,
            intervention_type=data["intervention_type"],
            description=data["description"],
            status="pending",
            ai_generated=True
        )
        db.add(intervention)
        created.append(intervention)

    db.commit()
    for i in created:
        db.refresh(i)

    return created
