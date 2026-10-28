import json
from pathlib import Path

import numpy as np
import yaml
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =========================
# 1. LOAD CONFIG
# =========================
with open("../config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

IMG_SIZE = config["model"]["input_size"]

BATCH_SIZE = 32
EPOCHS_STAGE_1 = 8
EPOCHS_STAGE_2 = 20

processed_dir = Path("D:/AI_DATN/backend/processed")
model_dir = Path("../trained_models")
model_dir.mkdir(parents=True, exist_ok=True)

# =========================
# 2. DATA GENERATOR
# =========================
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode="nearest",
)

val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

train_generator = train_datagen.flow_from_directory(
    processed_dir / "train",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=True,
)

val_generator = val_datagen.flow_from_directory(
    processed_dir / "val",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False,
)

# 🔥 LẤY SỐ LỚP TỪ DATASET (QUAN TRỌNG NHẤT)
NUM_CLASSES = train_generator.num_classes
print("✅ NUM_CLASSES =", NUM_CLASSES)
print("✅ Class indices:", train_generator.class_indices)

# =========================
# 3. CLASS WEIGHT
# =========================
classes = np.unique(train_generator.classes)
class_weights = compute_class_weight(
    class_weight="balanced", classes=classes, y=train_generator.classes
)
class_weight_dict = dict(zip(classes, class_weights))
print("Class weights:", class_weight_dict)

# =========================
# 4. BUILD MODEL
# =========================
base_model = MobileNetV2(
    weights="imagenet", include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

base_model.trainable = False  # STAGE 1

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation="relu")(x)
x = Dropout(0.4)(x)
x = Dense(256, activation="relu")(x)
x = Dropout(0.3)(x)
outputs = Dense(NUM_CLASSES, activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=outputs)

# =========================
# 5. STAGE 1 - TRAIN HEAD
# =========================
model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

print("\n🔥 STAGE 1: Training classification head\n")

callbacks_stage1 = [
    EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)
]

model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS_STAGE_1,
    class_weight=class_weight_dict,
    callbacks=callbacks_stage1,
)

# =========================
# 6. STAGE 2 - FINE TUNE
# =========================
print("\n🔥🔥 STAGE 2: Fine-tuning MobileNetV2\n")

base_model.trainable = True

# 🔒 CHỈ FINE-TUNE 60 LAYER CUỐI (ỔN ĐỊNH)
for layer in base_model.layers[:-60]:
    layer.trainable = False

model.compile(
    optimizer=Adam(learning_rate=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks_stage2 = [
    EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, min_lr=1e-6),
    ModelCheckpoint(
        filepath=model_dir / "mobilenet_skin_3classes.keras",
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    ),
]

model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS_STAGE_2,
    class_weight=class_weight_dict,
    callbacks=callbacks_stage2,
)


with open("../trained_models/class_indices.json", "w") as f:
    json.dump(train_generator.class_indices, f, indent=2)

print("Saved class_indices:", train_generator.class_indices)

print("\n✅ Training completed. Best model saved!")
