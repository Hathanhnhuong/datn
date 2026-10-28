from src.core.security import hash_password
from src.db.database import SessionLocal
from src.db.models import User

db = SessionLocal()
admin = User(
    username="admin",
    email="admin@test.com",
    password_hash=hash_password("123456"),
    role="admin",
)
db.add(admin)
db.commit()
