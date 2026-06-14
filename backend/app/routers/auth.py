from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserSettings
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut, UserUpdate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        User.email == user_data.email,
        # User.is_deleted == False
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please use a different email or login."
        )

    hashed_pw = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role,
        department=user_data.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Only create settings row if not already exists
    existing_settings = db.query(UserSettings).filter(
        UserSettings.user_id == user.id
    ).first()
    if not existing_settings:
        settings = UserSettings(user_id=user.id, theme="light")
        db.add(settings)
        db.commit()

    token = create_access_token(data={"sub": user.email})
    return Token(access_token=token, token_type="bearer", user=user)


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == user_data.email,
        User.is_deleted == False
    ).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token(data={"sub": user.email})
    return Token(access_token=token, token_type="bearer", user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
