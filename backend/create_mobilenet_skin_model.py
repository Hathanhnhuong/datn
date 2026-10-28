from pathlib import Path
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.layers import Dropout, BatchNormalization
from tensorflow.keras.models import Model
import tensorflow as tf

# ===== CONFIG (KHỚP VỚI 2 LỚP) =====
NUM_CLASSES = 2
INPUT_SIZE = 224
# Trỏ về file em vừa train xong
MODEL_PATH = Path("D:\AI_DATN\backend\trained_models\mobilenet_v2_skin_best.keras")

CLASSES = ["mel", "nv"]


def create_model():
    # Load base model
    base = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(INPUT_SIZE, INPUT_SIZE, 3),
    )

    # Xây dựng lại đúng cấu trúc em đã dùng khi train
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.4)(x)
    outputs = Dense(NUM_CLASSES, activation="softmax")(x)

    model = Model(inputs=base.input, outputs=outputs)

    # Dùng Nadam hoặc Adam cho đồng bộ
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Recall(name="recall")],
    )
    return model


if __name__ == "__main__":
    # Đảm bảo thư mục tồn tại
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Nếu em đã có file .keras từ quá trình train,
    # em không cần chạy hàm save này nữa.
    # Nhưng nếu muốn tạo khung model trống:
    model = create_model()
    print("✅ Cấu trúc Model 2 lớp đã sẵn sàng!")
    print(f"📍 Số lớp: {len(CLASSES)} {CLASSES}")
