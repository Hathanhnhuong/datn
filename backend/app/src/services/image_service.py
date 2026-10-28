# services/image_service.py
import io
import os
import uuid

import cv2
import numpy as np
from PIL import Image

IMG_SIZE = 224
UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload_file(contents: bytes, filename: str) -> str:
    ext = filename.split(".")[-1]
    new_name = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    return file_path


def center_crop(img: np.ndarray, ratio: float = 0.85) -> np.ndarray:
    h, w, _ = img.shape
    crop_h, crop_w = int(h * ratio), int(w * ratio)
    start_x = (w - crop_w) // 2
    start_y = (h - crop_h) // 2
    cropped = img[start_y : start_y + crop_h, start_x : start_x + crop_w]
    resized = cv2.resize(cropped, (IMG_SIZE, IMG_SIZE))
    return resized


def preprocess_upload_image(contents: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img_np = np.array(img)
    img_np = center_crop(img_np)
    img_np = img_np.astype(np.float32) / 255.0
    img_np = np.expand_dims(img_np, axis=0)
    return img_np
