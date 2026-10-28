from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


# ===== ENUMS =====

class NewsCategory(str, Enum):
    melanoma = "melanoma"
    prevention = "prevention"
    general = "general"


class NewsStatus(str, Enum):
    draft = "draft"
    published = "published"


# ===== CREATE =====

class NewsCreate(BaseModel):
    title: str
    content: str
    category: Optional[NewsCategory] = NewsCategory.general
    status: Optional[NewsStatus] = NewsStatus.draft


# ===== UPDATE =====

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[NewsCategory] = None
    status: Optional[NewsStatus] = None


# ===== RESPONSE =====

class NewsResponse(BaseModel):
    id: int
    title: str
    slug: Optional[str]
    content: str
    thumbnail: Optional[str]
    category: NewsCategory
    status: NewsStatus
    created_at: datetime

    class Config:
        from_attributes = True