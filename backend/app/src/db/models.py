"""db/models.py"""

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Index,
    Text,
)
from sqlalchemy.sql import expression, func

from src.db.database import Base
from sqlalchemy.orm import relationship
import enum


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    role = Column(
        Enum("admin", "user", name="user_role"), default="user", nullable=False
    )

    is_active = Column(Boolean, nullable=False,
                       server_default=expression.true())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_path = Column(String(255), nullable=False)
    original_filename = Column(String(255))

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)

    predicted_class = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)

    probabilities = Column(JSON)
    recommendation = Column(String(255))

    model_version = Column(String(50))

    professional_note = Column(Text, nullable=True)

    predicted_at = Column(DateTime(timezone=True), server_default=func.now())

    image = relationship("Image")

    __table_args__ = (
        Index("idx_predicted_at", "predicted_at"),
        Index("idx_predicted_class", "predicted_class"),
        Index("idx_confidence", "confidence"),
    )


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)

    version = Column(String(50), nullable=False)
    model_path = Column(String(255), nullable=False)

    trained_at = Column(DateTime(timezone=True), server_default=func.now())
    val_accuracy = Column(Float)

    description = Column(String(500))
    is_active = Column(Boolean, default=True)


# ===== ENUM DEFINITIONS =====


class NewsCategory(str, enum.Enum):
    melanoma = "melanoma"
    prevention = "prevention"
    general = "general"


class NewsStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


# ===== MODEL =====


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    slug = Column(String(255), unique=True, index=True)

    content = Column(Text, nullable=False)

    thumbnail = Column(String(255), nullable=True)

    category = Column(
        Enum("melanoma", "prevention", "general", name="news_category"),
        default="general",
    )

    status = Column(
        Enum("draft", "published", name="news_status"),
        default="draft",
        nullable=False,
    )

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now())

    author = relationship("User")

    __table_args__ = (
        Index("ft_title_content", "title", "content", mysql_prefix="FULLTEXT"),
    )