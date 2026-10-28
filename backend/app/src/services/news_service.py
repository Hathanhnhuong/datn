import re
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.db.models import News
from src.schemas.news_schema import NewsStatus


# =========================
# SLUG GENERATOR
# =========================


def generate_slug(title: str):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    return slug


def generate_unique_slug(db: Session, title: str):
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 1

    while db.query(News).filter(News.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


# =========================
# CREATE
# =========================


def create_news(db: Session, data, admin_id: int):
    slug = generate_unique_slug(db, data.title)

    news = News(
        title=data.title,
        slug=slug,
        content=data.content,
        category=data.category,
        status=data.status,
        created_by=admin_id,
    )

    db.add(news)
    db.commit()
    db.refresh(news)
    return news


# =========================
# FULLTEXT SEARCH (ADMIN)
# =========================


def get_admin_news(db: Session, search=None, category=None, status=None, 
                   page: int = 1, limit: int = 5):
    query = db.query(News).filter(News.is_deleted == False)

    if search:
        query = query.filter(
            text("MATCH(title, content) AGAINST (:keyword IN NATURAL LANGUAGE MODE)")
        ).params(keyword=search)

    if category:
        query = query.filter(News.category == category)

    if status:
        query = query.filter(News.status == status)

    total = query.count()

    offset = (page - 1) * limit

    items = (
        query.order_by(News.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }
# DETAIL
# =========================


def get_news_detail(db: Session, news_id: int):
    return db.query(News).filter(News.id == news_id).first()


# =========================
# UPDATE
# =========================


def update_news(db: Session, news_id: int, data):
    news = get_news_detail(db, news_id)
    if not news:
        return None

    update_data = data.dict(exclude_unset=True)

    if "title" in update_data:
        news.slug = generate_unique_slug(db, update_data["title"])

    for key, value in update_data.items():
        setattr(news, key, value)

    db.commit()
    db.refresh(news)
    return news


# =========================
# SOFT DELETE
# =========================


def soft_delete_news(db: Session, news_id: int):
    news = get_news_detail(db, news_id)
    if not news:
        return None

    news.is_deleted = True
    db.commit()
    return news


# =========================
# TOGGLE STATUS
# =========================


def toggle_status(db: Session, news_id: int, status: NewsStatus):
    news = get_news_detail(db, news_id)
    if not news:
        return None

    news.status = status
    db.commit()
    db.refresh(news)
    return news


def get_news_by_category(db: Session, category: str, limit: int = 5):
    return (
        db.query(News)
        .filter(
            News.category == category,
            News.status == "published",
            News.is_deleted == False,
        )
        .order_by(News.created_at.desc())
        .limit(limit)
        .all()
    )
