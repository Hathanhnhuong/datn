# src/api/schemas/models.py
from pydantic import BaseModel


class PredictionOut(BaseModel):
    id: int
    image_path: str
    predicted_class: str
    confidence: float

    class Config:
        from_attributes = True
