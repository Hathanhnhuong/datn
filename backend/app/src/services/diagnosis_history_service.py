from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.db.models import Prediction, Image
import csv
import io


# ==============================
# HISTORY + ADVANCED FILTER
# ==============================
def get_diagnosis_history(
    db: Session,
    page: int = 1,
    limit: int = 10,
    start_date: str = None,
    end_date: str = None,
    label: str = None,
    min_confidence: float = None,
):

    query = db.query(Prediction).join(Image)

    if start_date:
        query = query.filter(
            Prediction.predicted_at >= datetime.fromisoformat(start_date)
        )

    if end_date:
        query = query.filter(
            Prediction.predicted_at <= datetime.fromisoformat(end_date)
        )

    if label:
        query = query.filter(Prediction.predicted_class == label)

    if min_confidence is not None:
        query = query.filter(Prediction.confidence <= min_confidence)

    total = query.count()

    predictions = (
        query.order_by(Prediction.predicted_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    results = []
    for p in predictions:
        results.append(
            {
                "id": p.id,
                "image_url": p.image.image_path,
                "predicted_class": p.predicted_class,
                "confidence": p.confidence,
                "probabilities": p.probabilities,
                "recommendation": p.recommendation,
                "professional_note": p.professional_note,
                "predicted_at": p.predicted_at,
            }
        )

    return {
        "items": results,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


# ==============================
# ADD / UPDATE NOTE
# ==============================
def add_professional_note(db: Session, prediction_id: int, note: str):

    prediction = db.query(Prediction).get(prediction_id)

    if not prediction:
        return None

    prediction.professional_note = note
    db.commit()
    db.refresh(prediction)

    return {"message": "Note updated successfully"}


# ==============================
# ANALYTICS
# ==============================
def diagnosis_analytics(db: Session):

    total = db.query(Prediction).count()

    low_conf = (
        db.query(Prediction)
        .filter(Prediction.confidence < 0.7)
        .count()
    )

    avg_conf = db.query(
        func.avg(Prediction.confidence)
    ).scalar() or 0

    # ===== By day =====
    by_day_query = (
        db.query(
            func.date(Prediction.predicted_at).label("date"),
            func.count().label("count")
        )
        .group_by(func.date(Prediction.predicted_at))
        .all()
    )

    by_day = [
        {"date": str(r.date), "count": r.count}
        for r in by_day_query
    ]

    # ===== Ratio =====
    ratio_query = (
        db.query(
            Prediction.predicted_class,
            func.count()
        )
        .group_by(Prediction.predicted_class)
        .all()
    )

    ratio = [
        {"label": r[0], "count": r[1]}
        for r in ratio_query
    ]

    return {
        "total": total,
        "low_confidence": low_conf,
        "avg_confidence": float(avg_conf),
        "by_day": by_day,
        "ratio": ratio
    }


# ==============================
# EXPORT CSV
# ==============================
def export_diagnosis_csv(db: Session):

    predictions = db.query(Prediction).join(Image).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(
        [
            "ID",
            "Image Path",
            "Predicted Class",
            "Confidence",
            "Recommendation",
            "Professional Note",
            "Date",
        ]
    )

    for p in predictions:
        writer.writerow(
            [
                p.id,
                p.image.image_path,
                p.predicted_class,
                p.confidence,
                p.recommendation,
                p.professional_note,
                p.predicted_at,
            ]
        )

    output.seek(0)
    return output