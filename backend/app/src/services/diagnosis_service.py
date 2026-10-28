# services/diagnosis_service.py

from sqlalchemy.orm import Session

from src.db.models import Image, ModelVersion, Prediction
from src.services.image_service import save_upload_file
from src.services.news_service import get_news_by_category
from src.services.predict import predict_skin_lesion


def diagnose_and_save(db: Session, user_id: int, file_bytes: bytes, filename: str):
    """
    1. Lưu ảnh vào ổ cứng
    2. Lưu record Image vào DB
    3. Gọi AI predict
    4. Lưu Prediction vào DB
    5. Gắn bài viết recommend   
    """

    # =========================
    # 1. SAVE IMAGE FILE
    # =========================
    image_path = save_upload_file(file_bytes, filename)

    # =========================
    # 2. SAVE IMAGE DB
    # =========================
    image = Image(user_id=user_id, image_path=image_path, original_filename=filename)
    db.add(image)
    db.commit()
    db.refresh(image)

    # =========================
    # 3. AI PREDICT
    # =========================
    result = predict_skin_lesion(file_bytes)

    # =========================
    # 4. GET ACTIVE MODEL
    # =========================
    active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()

    model_version = active_model.version if active_model else "unknown"

    # =========================
    # 5. SAVE PREDICTION DB
    # =========================
    prediction = Prediction(
        image_id=image.id,
        predicted_class=result["predicted_class"],
        confidence=result["confidence"],
        probabilities=result.get("probabilities"),
        recommendation=result["recommendation"],
        model_version=model_version,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # =========================
    # 6. RECOMMEND NEWS
    # =========================
    if result["predicted_class"] == "mel":
        articles = get_news_by_category(db, "melanoma")
    else:
        articles = get_news_by_category(db, "prevention")

    # =========================
    # 7. RETURN FULL RESULT
    # =========================
    return (
        image,
        prediction,
        {
            "predicted_class": result["predicted_class"],
            "confidence": result["confidence"],
            "probabilities": result.get("probabilities"),
            "recommendation": result["recommendation"],
            "recommend_articles": articles,
        },
    )
