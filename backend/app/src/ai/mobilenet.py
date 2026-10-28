# src/ai/mobilenet.py
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model


def create_mobilenet(num_classes: int = 7, input_shape=(224, 224, 3), pretrained=True):
    """
    Tạo mô hình MobileNetV2 với Keras (TensorFlow backend).
    """
    base_model = MobileNetV2(
        weights="imagenet" if pretrained else None,
        include_top=False,
        input_shape=input_shape,
    )

    # Đóng băng base model (transfer learning)
    base_model.trainable = True

    for layer in base_model.layers[:-30]:
    layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation="relu")(x)
    predictions = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    return model
