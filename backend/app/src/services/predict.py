# services/predict.py
import json
import os

import tensorflow as tf

from src.services.image_service import preprocess_upload_image

BASE_DIR = r"D:\AI_DATN\backend"
MODEL_DIR = os.path.join(BASE_DIR, "trained_models")

MODEL_PATH = os.path.join(MODEL_DIR, "mobilenet_v2_skin_best.keras")
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_indices_2class.json")

THRESHOLD_MEL = 0.75
THRESHOLD_WARNING = 0.60

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_INDEX_PATH, "r") as f:
    class_indices = json.load(f)

print("Model loaded")


def predict_skin_lesion(image_bytes: bytes):
    x = preprocess_upload_image(image_bytes)

    prob_nv = float(model.predict(x, verbose=0)[0][0])
    prob_mel = 1.0 - prob_nv

    if prob_mel >= THRESHOLD_MEL:
        predicted = "mel"
        confidence = prob_mel
        is_warning = True
        recommendation = "Nguy cơ Melanoma cao - cần khám da liễu"
    elif prob_mel >= THRESHOLD_WARNING:
        predicted = "nv"
        confidence = prob_nv
        is_warning = True
        recommendation = "Có dấu hiệu nghi ngờ, hãy đi kiểm tra da liễu"
    else:
        predicted = "nv"
        confidence = prob_nv
        is_warning = False
        recommendation = "Tổn thương lành tính"

    return {
        "predicted_class": predicted,
        "confidence": round(confidence, 4),
        "probabilities": {"mel": round(prob_mel, 4), "nv": round(prob_nv, 4)},
        "is_warning": is_warning,
        "recommendation": recommendation,
    }
