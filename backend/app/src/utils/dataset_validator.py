import os
import hashlib

DATASET_ROOT = r"D:\AI_DATN\backend\app\data\processed_roi_balanced"

DATASET_PATHS = [
    os.path.join(DATASET_ROOT, "train"),
    os.path.join(DATASET_ROOT, "val"),
    os.path.join(DATASET_ROOT, "test"),
]


def get_image_hash(image_bytes: bytes):
    return hashlib.md5(image_bytes).hexdigest()


def build_dataset_hashes():
    hashes = set()

    for path in DATASET_PATHS:
        if not os.path.exists(path):
            continue

        for root, _, files in os.walk(path):
            for file in files:
                if file.lower().endswith((".jpg", ".jpeg", ".png")):
                    full_path = os.path.join(root, file)

                    try:
                        with open(full_path, "rb") as f:
                            img_bytes = f.read()

                        hashes.add(get_image_hash(img_bytes))
                    except Exception:
                        pass

    print(f"Loaded {len(hashes)} dataset images")

    return hashes


# load khi server start
DATASET_HASHES = build_dataset_hashes()


def is_dataset_image(image_bytes: bytes):
    image_hash = get_image_hash(image_bytes)
    return image_hash in DATASET_HASHES