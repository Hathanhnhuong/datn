from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.core.security import ALGORITHM, SECRET_KEY
from src.db.database import get_db
from src.db.models import News, Prediction, User
from src.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from src.services.admin_service import (
    activate_model,
    get_images,
    get_models,
    get_predictions,
    get_statistics,
    get_users,
    set_user_active,
)
from src.services.user_service import (
    change_user_role,
    create_user,
    delete_user,
    get_user_by_id,
    get_users,
    set_user_active,
    update_user,
)
from fastapi.responses import StreamingResponse
from src.services.diagnosis_history_service import (
    get_diagnosis_history,
    add_professional_note,
    diagnosis_analytics,
    export_diagnosis_csv,
)
router = APIRouter(prefix="/api/admin", tags=["Admin"])
security = HTTPBearer()


# ================== AUTH ==================
def admin_required(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user = db.query(User).get(payload["sub"])

    if not user:
        raise HTTPException(status_code=401, detail="User không tồn tại")

    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tài khoản bị khóa")

    return user


# 👤 USERS
# ================== USERS ==================


@router.post(
    "/users", response_model=UserResponse,
    dependencies=[Depends(admin_required)]
)
def create_new_user(user_data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user_data)


@router.get("/users", dependencies=[Depends(admin_required)])
def users(
    page: int = 1,
    limit: int = 10,
    search: str = None,
    role: str = None,
    is_active: bool = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
):
    return get_users(db, page, limit, search, role, is_active, start_date, end_date)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(admin_required)],
)
def get_one_user(user_id: int, db: Session = Depends(get_db)):
    return get_user_by_id(db, user_id)


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(admin_required)],
)
def update_user_info(
    user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)
):
    return update_user(db, user_id, user_data)


@router.patch("/users/{user_id}/role", dependencies=[Depends(admin_required)])
def update_role(user_id: int, role: str, db: Session = Depends(get_db)):
    return change_user_role(db, user_id, role)


@router.patch("/users/{user_id}/status",
              dependencies=[Depends(admin_required)])
def update_status(user_id: int, is_active: bool, db: Session = Depends(get_db)):
    return set_user_active(db, user_id, is_active)


@router.delete("/users/{user_id}", dependencies=[Depends(admin_required)])
def remove_user(user_id: int, db: Session = Depends(get_db)):
    return delete_user(db, user_id)


# 🖼️ CONTENT
@router.get("/images", dependencies=[Depends(admin_required)])
def images(db: Session = Depends(get_db)):
    return get_images(db)


@router.get("/predictions", dependencies=[Depends(admin_required)])
def predictions(db: Session = Depends(get_db)):
    return get_predictions(db)


# 📊 STAT
@router.get("/statistics", dependencies=[Depends(admin_required)])
def statistics(db: Session = Depends(get_db)):
    return get_statistics(db)


# 🤖 MODEL
@router.get("/models", dependencies=[Depends(admin_required)])
def models(db: Session = Depends(get_db)):
    return get_models(db)


@router.patch("/models/{model_id}/activate",
              dependencies=[Depends(admin_required)])
def model_activate(model_id: int, db: Session = Depends(get_db)):
    return activate_model(db, model_id)


# ================== DASHBOARD (MỚI) ==================
@router.get("/stats", dependencies=[Depends(admin_required)])
def get_admin_stats(db: Session = Depends(get_db)):

    now = datetime.utcnow()

    # ======================
    # TỔNG QUAN HỆ THỐNG
    # ======================

    total_users = db.query(User).count()
    total_diagnoses = db.query(Prediction).count()
    total_articles = db.query(News).count()

    melanoma_cases = (
        db.query(Prediction).filter(Prediction.predicted_class == "mel").count()
    )

    # ======================
    # PHÂN PHỐI BỆNH
    # ======================

    prediction_stats = (
        db.query(Prediction.predicted_class, func.count(Prediction.id))
        .group_by(Prediction.predicted_class)
        .all()
    )

    # ======================
    # XU HƯỚNG THEO NGÀY
    # ======================

    per_day = (
        db.query(func.date(Prediction.predicted_at), func.count(Prediction.id))
        .group_by(func.date(Prediction.predicted_at))
        .all()
    )

    # ===============================
    # MEL THÁNG NÀY VS THÁNG TRƯỚC
    # ===============================

    first_day_this_month = now.replace(day=1)

    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1)

    mel_current_month = (
        db.query(func.count(Prediction.id))
        .filter(
            Prediction.predicted_class == "mel",
            Prediction.predicted_at >= first_day_this_month,
        )
        .scalar()
    )

    mel_previous_month = (
        db.query(func.count(Prediction.id))
        .filter(
            Prediction.predicted_class == "mel",
            Prediction.predicted_at >= first_day_last_month,
            Prediction.predicted_at < first_day_this_month,
        )
        .scalar()
    )

    return {
        "metrics": {
            "total_users": total_users,
            "total_diagnoses": total_diagnoses,
            "total_articles": total_articles,
            "melanoma_cases": melanoma_cases,
        },
        "health_insights": {
            "diagnosis_trend": [{"date": str(d[0]), "count": d[1]} 
                                for d in per_day],
            "disease_distribution": [
                {"label": p[0], "count": p[1]} for p in prediction_stats
            ],
            "mel_month_comparison": {
                "current_month": mel_current_month or 0,
                "previous_month": mel_previous_month or 0,
            },
        },
    }
# ================== DIAGNOSIS HISTORY ==================


@router.get("/diagnosis", dependencies=[Depends(admin_required)])
def diagnosis_history(
    page: int = 1,
    limit: int = 10,
    start_date: str = None,
    end_date: str = None,
    label: str = None,
    min_confidence: float = None,
    db: Session = Depends(get_db),
):
    return get_diagnosis_history(
        db, page, limit, start_date, end_date, label, min_confidence
    )


@router.patch("/diagnosis/{prediction_id}/note", dependencies=[Depends(admin_required)])
def update_note(
    prediction_id: int,
    note: str,
    db: Session = Depends(get_db),
):
    return add_professional_note(db, prediction_id, note)


@router.get("/diagnosis/analytics", dependencies=[Depends(admin_required)])
def diagnosis_stats(db: Session = Depends(get_db)):
    return diagnosis_analytics(db)


@router.get("/diagnosis/export", dependencies=[Depends(admin_required)])
def export_csv(db: Session = Depends(get_db)):

    csv_file = export_diagnosis_csv(db)

    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=diagnosis_report.csv"},
    )
