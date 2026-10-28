"""ai/inference_2class.py"""

import json
import os
from io import BytesIO

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

# ================= CONFIG =================
BASE_DIR = r"D:\AI_DATN\backend"
MODEL_DIR = os.path.join(BASE_DIR, "trained_models")

MODEL_PATH = os.path.join(MODEL_DIR, "mobilenet_v2_skin_best.keras")
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_indices_2class.json")

IMG_SIZE = (224, 224)
CROP_RATIO = 0.85

THRESHOLD_MEL = 0.85
WARNING_LOW = 0.65
WARNING_HIGH = 0.85

# ================= LOAD MODEL =================
model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_INDEX_PATH, "r") as f:
    class_indices = json.load(f)
print("MODEL PATH:", MODEL_PATH)
print("Model loaded")
print("CLASS INDICES:", class_indices)


# ================= TTA PREDICT =================
def predict_with_tta(img_array):
    preds = []
    preds.append(model.predict(img_array, verbose=0)[0][0])
    preds.append(model.predict(np.flip(img_array, axis=2), verbose=0)[0][0])
    preds.append(model.predict(np.flip(img_array, axis=1), verbose=0)[0][0])

    pred = float(np.median(preds))
    pred = min(max(pred, 0.02), 0.98)
    return pred


# ================= PREDICT FUNCTION =================
def predict_skin_lesion(image_bytes: bytes):
    img = image.load_img(BytesIO(image_bytes))
    img_array = image.img_to_array(img)

    h, w, _ = img_array.shape
    crop_h, crop_w = int(h * CROP_RATIO), int(w * CROP_RATIO)
    start_x = (w - crop_w) // 2
    start_y = (h - crop_h) // 2
    img_array = img_array[start_y : start_y + crop_h, start_x : start_x + crop_w]

    img_array = tf.image.resize(img_array, IMG_SIZE).numpy()
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # sigmoid output = prob(nv) because class_indices is {'mel': 0, 'nv': 1}
    pred = predict_with_tta(img_array)
    prob_nv = float(pred)
    prob_mel = 1.0 - prob_nv

    if prob_mel >= THRESHOLD_MEL:
        predicted_class = "mel"
        confidence = prob_mel
    else:
        predicted_class = "nv"
        confidence = prob_nv

    is_warning = prob_mel >= WARNING_LOW

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence, 4),
        "probabilities": {"mel": round(prob_mel, 4), "nv": round(prob_nv, 4)},
        "is_warning": is_warning,
        "recommendation": (
            "Canh bao: ket qua nghi ngo (borderline), nen theo doi them hoac kham da lieu."
            if is_warning and predicted_class == "nv"
            else "Canh bao: nguy co Melanoma cao, can kham bac si ngay."
            if predicted_class == "mel"
            else "Hinh anh co xu huong lanh tinh, tiep tuc theo doi dinh ky."
        ),
    }
