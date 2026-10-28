from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from src.api.routers import admin, auth
from src.api.routers.admin import router as admin_router
from src.api.routers.diagnosis import router as diagnosis_router
from src.api.routers.news import router as news_router
from src.api.routers.news import router as admin_news_router
from src.api.routers.news import public_router


# ================= INIT APP =================
app = FastAPI(
    title="Skin Lesion Diagnosis API",
    version="1.0.0"
)

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= STATIC FOLDER =================
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

# ================= STATIC FOLDER =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = os.path.join(BASE_DIR, "static")

os.makedirs(STATIC_DIR, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static"
)
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))  # app/

# =========================
# STATIC FOLDER
# =========================

STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOADS_DIR = os.path.join(ROOT_DIR, "uploads")

os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Mount static
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
# Mount uploads (QUAN TRỌNG)


# Include routers

# ================= ROUTERS =================
app.include_router(auth.router)
app.include_router(admin_router)
app.include_router(diagnosis_router)
app.include_router(news_router)

app.include_router(admin_news_router)
app.include_router(public_router)

# ================= ROOT =================
@app.get("/")
def root():
    return {"message": "Skin Diagnosis API is running"}