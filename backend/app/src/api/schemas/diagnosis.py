from pydantic import BaseModel


class CameraDiagnosisRequest(BaseModel):
    image_base64: str
    filename: str | None = "camera_capture.jpg"
