from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from sqlalchemy.orm import Session

from src.core.security import ALGORITHM, SECRET_KEY
from src.db.database import get_db
from src.db.models import User
from src.schemas.auth_schema import LoginRequest, RegisterRequest
from src.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

security = HTTPBearer()


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(db, data.email, data.password)


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, data.username, data.email, data.password)


# 🔥 THÊM ĐOẠN NÀY
@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).get(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")

    return {"id": user.id, "email": user.email, "role": user.role}
