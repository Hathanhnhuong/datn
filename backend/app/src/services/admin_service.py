from sqlalchemy.orm import Session

from src.db.models import Image, ModelVersion, Prediction, User


# 👤 USERS
def get_users(db: Session):
    return db.query(User).all()


def set_user_active(db: Session, user_id: int, is_active: bool):
    user = db.query(User).get(user_id)
    user.is_active = is_active
    db.commit()
    return user


# 🖼️ CONTENT
def get_images(db: Session):
    return db.query(Image).all()


def get_predictions(db: Session):
    return db.query(Prediction).all()


# 📊 STATISTICS
def get_statistics(db: Session):
    return {
        "total_users": db.query(User).count(),
        "total_images": db.query(Image).count(),
        "mel_count": db.query(Prediction)
        .filter(Prediction.predicted_class == "mel")
        .count(),
        "nv_count": db.query(Prediction)
        .filter(Prediction.predicted_class == "nv")
        .count(),
    }


# 🤖 MODEL
def get_models(db: Session):
    return db.query(ModelVersion).all()


def activate_model(db: Session, model_id: int):
    db.query(ModelVersion).update({ModelVersion.is_active: False})
    model = db.query(ModelVersion).get(model_id)
    model.is_active = True
    db.commit()
    return model
