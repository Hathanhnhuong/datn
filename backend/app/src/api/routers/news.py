from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import os
from PIL import Image
from src.db.models import News
from uuid import uuid4
from src.db.database import get_db
from src.schemas.news_schema import NewsCreate, NewsUpdate, NewsStatus
from src.services.news_service import (
    create_news,
    get_admin_news,
    get_news_detail,
    update_news,
    soft_delete_news,
    toggle_status,
)

router = APIRouter(prefix="/api/admin/news", tags=["Admin News"])
public_router = APIRouter(prefix="/api/news", tags=["Public News"]) 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # src/api/routers
SRC_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))  # src/
STATIC_DIR = os.path.join(SRC_DIR, "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads", "thumbnails")

os.makedirs(UPLOAD_DIR, exist_ok=True)
# =========================
# CREATE
# =========================


@router.post("/")
def admin_create(data: NewsCreate, db: Session = Depends(get_db)):
    admin_id = 1
    return create_news(db, data, admin_id)

# =========================
# LIST
# =========================


@router.get("/")
def admin_list(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    return get_admin_news(db, search, category, status, page, limit)

# =========================
# DETAIL
# =========================


@router.get("/{news_id}")
def admin_detail(news_id: int, db: Session = Depends(get_db)):
    news = get_news_detail(db, news_id)
    if not news:
        raise HTTPException(404, "Not found")
    return news

# =========================
# UPDATE
# =========================


@router.put("/{news_id}")
def admin_update(news_id: int, data: NewsUpdate,
                 db: Session = Depends(get_db)):
    news = update_news(db, news_id, data)
    if not news:
        raise HTTPException(404, "Not found")
    return news

# =========================
# DELETE
# =========================


@router.delete("/{news_id}")
def admin_delete(news_id: int, db: Session = Depends(get_db)):
    news = soft_delete_news(db, news_id)
    if not news:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# =========================
# STATUS TOGGLE
# =========================


@router.patch("/{news_id}/status")
def admin_toggle_status(news_id: int, status: NewsStatus,
                        db: Session = Depends(get_db)):
    news = toggle_status(db, news_id, status)
    if not news:
        raise HTTPException(404, "Not found")
    return news

# =========================
# UPLOAD THUMBNAIL
# =========================


@router.post("/{news_id}/thumbnail")
def upload_thumbnail(
    news_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1️⃣ Kiểm tra bài viết tồn tại
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # 2️⃣ Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image type")

    # 3️⃣ Tạo tên file duy nhất (tránh cache + ghi đè)
    file_ext = file.filename.split(".")[-1].lower()
    unique_name = f"{news_id}_{uuid4().hex}.{file_ext}"

    full_path = os.path.join(UPLOAD_DIR, unique_name)

    # 4️⃣ Resize & Save ảnh
    image = Image.open(file.file)
    image = image.convert("RGB")
    image.thumbnail((1200, 800))
    image.save(full_path, optimize=True, quality=75)

    # 5️⃣ Xóa ảnh cũ nếu có
    if news.thumbnail:
        old_file = news.thumbnail.replace("/static/", "")
        old_path = os.path.join(SRC_DIR, old_file)
        if os.path.exists(old_path):
            os.remove(old_path)

    # 6️⃣ Lưu đường dẫn vào DB
    news.thumbnail = f"/static/uploads/thumbnails/{unique_name}"

    db.commit()
    db.refresh(news)

    return {
        "message": "Thumbnail uploaded successfully",
        "thumbnail": news.thumbnail
    }
    

# =========================
# LIST NEWS (USER)
# =========================
@public_router.get("/")
def get_news(db: Session = Depends(get_db)):
    news = (
        db.query(News)
        .filter(
            News.status == "published",
            News.is_deleted == False
        )
        .order_by(News.created_at.desc())
        .all()
    )

    return news


# =========================
# NEWS DETAIL (USER)
# =========================

@public_router.get("/{slug}")
def get_news_detail(slug: str, db: Session = Depends(get_db)):

    news = db.query(News).filter(
        News.slug == slug,
        News.status == "published",
        News.is_deleted == False
    ).first()

    if not news:
        raise HTTPException(404, "News not found")

    return news