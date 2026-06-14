from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserSettings
from app.schemas.schemas import SettingsOut, SettingsUpdate
from app.auth import get_current_user

router = APIRouter()

def get_or_create_settings(user_id: int, db: Session) -> UserSettings:
    """Get existing settings or create default ones safely."""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == user_id
    ).first()

    if not settings:
        try:
            settings = UserSettings(user_id=user_id, theme="light")
            db.add(settings)
            db.commit()
            db.refresh(settings)
        except Exception:
            db.rollback()
            # Row was inserted by a concurrent request, just fetch it
            settings = db.query(UserSettings).filter(
                UserSettings.user_id == user_id
            ).first()

    return settings


@router.get("/", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_or_create_settings(current_user.id, db)


@router.patch("/", response_model=SettingsOut)
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = get_or_create_settings(current_user.id, db)
    settings.theme = data.theme
    db.commit()
    db.refresh(settings)
    return settings
