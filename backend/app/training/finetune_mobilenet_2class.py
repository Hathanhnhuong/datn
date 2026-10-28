import json
import os
import tensorflow as tf

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import (
    BatchNormalization,
    Concatenate,
    Dense,
    Dropout,
    GlobalAveragePooling2D,
    GlobalMaxPooling2D,
    Input,
)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =========================
# REPRODUCIBILITY
# =========================
SEED = 42
tf.random.set_seed(SEED)

# =========================
# PATH CONFIG
# =========================
BASE_DIR = r"D:\AI_DATN\backend"
DATA_DIR = os.path.join(BASE_DIR, "app", "data", "processed_roi_balanced")

TRAIN_DIR = os.path.join(DATA_DIR, "train")
VAL_DIR = os.path.join(DATA_DIR, "val")

MODEL_DIR = os.path.join(BASE_DIR, "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)

# =========================
# CONFIG
# =========================
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

EPOCHS_HEAD = 15
EPOCHS_FINE = 25

# =========================
# DATA AUGMENTATION
# =========================
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=15,
    width_shift_range=0.05,
    height_shift_range=0.05,
    zoom_range=0.1,
    horizontal_flip=True,

    # thêm augmentation ánh sáng
    brightness_range=(0.8, 1.2),

    fill_mode="nearest",
)

val_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_gen = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=True,
    seed=SEED,
)

val_gen = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False,
)

# =========================
# SAVE CLASS INDICES
# =========================
class_index_path = os.path.join(MODEL_DIR, "class_indices_2class.json")

with open(class_index_path, "w") as f:
    json.dump(train_gen.class_indices, f)

print("CLASS INDICES:", train_gen.class_indices)
# {'mel': 0, 'nv': 1}

# =========================
# CLASS WEIGHT
# =========================
class_weight = {
    0: 1.05,  # melanoma
    1: 1.0,  # nevus
}

print("CLASS WEIGHT:", class_weight)

# =========================
# MODEL
# =========================


def build_skin_model():

    base_model = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(224, 224, 3),
    )

    base_model.trainable = False

    inputs = Input(shape=(224, 224, 3))

    x = base_model(inputs, training=False)

    # dual pooling (giữ nguyên logic của bạn)
    x = Concatenate()([
        GlobalAveragePooling2D()(x),
        GlobalMaxPooling2D()(x),
    ])

    x = BatchNormalization()(x)

    x = Dense(128, activation="relu")(x)

    x = Dropout(0.4)(x)

    outputs = Dense(1, activation="sigmoid")(x)

    model = Model(inputs, outputs)

    return model, base_model


model, base_model = build_skin_model()

# =========================
# COMPILE PHASE 1
# =========================
model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss="binary_crossentropy",
    metrics=[
        tf.keras.metrics.BinaryAccuracy(name="acc"),
        tf.keras.metrics.Recall(name="recall"),
        tf.keras.metrics.AUC(name="auc"),
    ],
)

# =========================
# CALLBACKS
# =========================
callbacks = [

    ModelCheckpoint(
        os.path.join(MODEL_DIR, "mobilenet_v2_skin_best.keras"),
        monitor="val_auc",
        mode="max",
        save_best_only=True,
        verbose=1,
    ),

    EarlyStopping(
        monitor="val_auc",
        mode="max",
        patience=6,
        restore_best_weights=True,
    ),

    ReduceLROnPlateau(
        monitor="val_auc",
        mode="max",
        factor=0.3,
        patience=3,
        min_lr=1e-7,
        verbose=1,
    ),
]

# =========================
# PHASE 1 - TRAIN HEAD
# =========================
print("🚀 Phase 1: Train Head")

model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_HEAD,
    class_weight=class_weight,
    callbacks=callbacks,
)

# =========================
# PHASE 2 - FINE TUNE
# =========================
print("🔓 Phase 2: Fine-tuning")

base_model.trainable = True

# freeze toàn bộ backbone trừ 20 layer cuối
for layer in base_model.layers[:-20]:
    layer.trainable = False

# compile lại với LR thấp
model.compile(
    optimizer=Adam(learning_rate=1e-5),
    loss="binary_crossentropy",
    metrics=[
        tf.keras.metrics.BinaryAccuracy(name="acc"),
        tf.keras.metrics.Recall(name="recall"),
        tf.keras.metrics.AUC(name="auc"),
    ],
)

model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FINE,
    class_weight=class_weight,
    callbacks=callbacks,
)

# =========================
# SAVE FINAL MODEL
# =========================
final_model_path = os.path.join(MODEL_DIR, "mobilenet_v2_skin_final.keras")

model.save(final_model_path)

print("✅ TRAINING DONE")
print("MODEL SAVED:", final_model_path)