from datetime import datetime
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.security import hash_password
from src.db.models import User
from src.schemas.user_schema import UserCreate, UserUpdate


# =============================
# CREATE
# =============================
def create_user(db: Session, user_data: UserCreate):

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        is_active=True,
    )

    db.add(new_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")

    db.refresh(new_user)
    return new_user


# =============================
# GET ONE
# =============================
def get_user_by_id(db: Session, user_id: int):

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# =============================
# GET ALL + FILTER + PAGINATION
# =============================
def get_users(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):

    query = db.query(User)

    # SEARCH
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%"))
            | (User.email.ilike(f"%{search}%"))
            | (User.id == search)
        )

    # FILTER ROLE
    if role:
        query = query.filter(User.role == role)

    # FILTER STATUS
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    # FILTER DATE
    if start_date:
        query = query.filter(User.created_at >= datetime.fromisoformat(start_date))

    if end_date:
        query = query.filter(User.created_at <= datetime.fromisoformat(end_date))

    total = query.count()

    users = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {"total": total, "page": page, "limit": limit, "data": users}


# =============================
# UPDATE
# =============================
def update_user(db: Session, user_id: int, user_data: UserUpdate):

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.username is not None:
        user.username = user_data.username

    if user_data.email is not None:
        user.email = user_data.email

    if user_data.password is not None:
        user.password_hash = hash_password(user_data.password)

    if user_data.role is not None:
        user.role = user_data.role

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")

    db.refresh(user)
    return user


# =============================
# CHANGE ROLE
# =============================
def change_user_role(db: Session, user_id: int, role: str):

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()
    db.refresh(user)

    return {"message": "Role updated successfully"}


# =============================
# LOCK / UNLOCK
# =============================
def set_user_active(db: Session, user_id: int, is_active: bool):

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = is_active
    db.commit()
    db.refresh(user)

    return {"message": "User status updated successfully"}


# =============================
# DELETE
# =============================
def delete_user(db: Session, user_id: int):

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted permanently"}
