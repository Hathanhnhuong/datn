from src.db.database import Base, engine

Base.metadata.create_all(bind=engine)
print("✅ Các bảng database đã được tạo thành công!")
