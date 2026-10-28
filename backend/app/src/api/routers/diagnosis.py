# api/routers/diagnosis.py

import base64
import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from src.api.routers.auth import get_current_user
from src.api.schemas.diagnosis import CameraDiagnosisRequest
from src.db.database import get_db
from src.services.diagnosis_service import diagnose_and_save
from src.utils.image_validation import assess_skin_region, validate_image_bytes

router = APIRouter(prefix="/api/diagnosis", tags=["Diagnosis"])


@router.post("/upload")
async def upload_and_diagnose(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    contents = await file.read()

    valid, reason = validate_image_bytes(contents, file.content_type)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    skin_ok, skin_msg, skin_score = assess_skin_region(contents)
    if not skin_ok:
        raise HTTPException(status_code=400, detail=skin_msg)

    user_id = current_user["id"]

    image, prediction, result = diagnose_and_save(
        db=db,
        user_id=user_id,
        file_bytes=contents,
        filename=file.filename,
    )

    return {
        "image_id": image.id,
        "prediction_id": prediction.id,
        "skin_score": round(skin_score, 4),
        "input_warning": skin_msg if skin_msg != "ok" else None,
        **result,
    }


@router.post("/capture")
async def capture_and_diagnose(
    payload: CameraDiagnosisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    image_base64 = payload.image_base64.strip()
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        contents = base64.b64decode(image_base64, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 image payload") from exc

    valid, reason = validate_image_bytes(contents)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    skin_ok, skin_msg, skin_score = assess_skin_region(contents)
    if not skin_ok:
        raise HTTPException(status_code=400, detail=skin_msg)

    filename = payload.filename or "camera_capture.jpg"
    filename = os.path.basename(filename)
    if "." not in filename:
        filename = f"{filename}.jpg"

    user_id = current_user["id"]

    image, prediction, result = diagnose_and_save(
        db=db,
        user_id=user_id,
        file_bytes=contents,
        filename=filename,
    )

    return {
        "image_id": image.id,
        "prediction_id": prediction.id,
        "skin_score": round(skin_score, 4),
        "input_warning": skin_msg if skin_msg != "ok" else None,
        **result,
    }
