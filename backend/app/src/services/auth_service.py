from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.core.security import create_access_token, hash_password, verify_password
from src.db.models import User


# ========================
# REGISTER
# ========================
def register_user(db: Session, username: str, email: str, password: str):

    # kiểm tra email tồn tại
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    # kiểm tra username tồn tại
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(password)

    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role="user",
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}


# ========================
# LOGIN
# ========================
def authenticate_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Email not found")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    if not bool(user.is_active):
        raise HTTPException(status_code=403, detail="Account is inactive")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        },
    }
