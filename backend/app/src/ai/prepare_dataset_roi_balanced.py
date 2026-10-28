import os
import random
import shutil

import cv2
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# ================= PATH CONFIG =================
RAW_DIR = "D:/AI_DATN/backend/app/data/raw/HAM10000"
IMG_DIR1 = os.path.join(RAW_DIR, "HAM10000_images_part_1")
IMG_DIR2 = os.path.join(RAW_DIR, "HAM10000_images_part_2")
CSV_PATH = os.path.join(RAW_DIR, "HAM10000_metadata.csv")

# Thư mục chứa dữ liệu 2 lớp sạch
OUTPUT_DIR = "D:/AI_DATN/backend/app/data/processed_roi_balanced"

CLASSES = ["mel", "nv"]
IMG_SIZE = 224
CROP_RATIO = 0.85
RANDOM_SEED = 42

# Thiết lập seed để kết quả tái lập được
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# ================= HELPER FUNCTIONS =================


def center_crop(img, ratio=0.85):
    """Cắt giữa ảnh để loại bỏ nhiễu rìa và đưa về kích thước chuẩn"""
    h, w, _ = img.shape
    new_h, new_w = int(h * ratio), int(w * ratio)
    start_x = (w - new_w) // 2
    start_y = (h - new_h) // 2
    crop = img[start_y : start_y + new_h, start_x : start_x + new_w]
    return cv2.resize(crop, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)


# ================= MAIN PROCESS =================

# 1. Load và lọc CSV


df = pd.read_csv(CSV_PATH)
df = df[df["dx"].isin(CLASSES)]

print("📊 Thống kê ban đầu:")
print(df["dx"].value_counts())

# 2. Cân bằng dữ liệu (Undersampling lớp NV)
# Lấy toàn bộ lớp Mel (lớp ít)
df_mel = df[df["dx"] == "mel"]
mel_count = len(df_mel)

# Lấy ngẫu nhiên lớp NV với số lượng bằng đúng lớp Mel
df_nv = df[df["dx"] == "nv"].sample(n=mel_count, random_state=RANDOM_SEED)

# Gộp lại và xáo trộn (shuffle)
balanced_df = (
    pd.concat([df_mel, df_nv])
    .sample(frac=1, random_state=RANDOM_SEED)
    .reset_index(drop=True)
)


print("\n⚖️ Thống kê sau khi cân bằng 1:1:")
print(balanced_df["dx"].value_counts())

# 3. Chia tập dữ liệu 80/10/10
train_df, temp_df = train_test_split(
    balanced_df, test_size=0.2, stratify=balanced_df["dx"], random_state=RANDOM_SEED
)

val_df, test_df = train_test_split(
    temp_df, test_size=0.5, stratify=temp_df["dx"], random_state=RANDOM_SEED
)

# 4. Tạo thư mục vật lý
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)

for split in ["train", "val", "test"]:
    for cls in CLASSES:
        os.makedirs(os.path.join(OUTPUT_DIR, split, cls), exist_ok=True)

# 5. Hàm xử lý ảnh vật lý


def process_and_save(dataframe, split_name):
    print(f"\n🚀 Đang xử lý tập {split_name}...")
    success_count = 0

    for _, row in dataframe.iterrows():
        img_id = row["image_id"]
        img_name = img_id + ".jpg"
        label = row["dx"]

        # Tìm đường dẫn gốc của ảnh
        src = os.path.join(IMG_DIR1, img_name)
        if not os.path.exists(src):
            src = os.path.join(IMG_DIR2, img_name)

        if not os.path.exists(src):
            # print(f"⚠️ Không tìm thấy: {img_name}")
            continue

        # Đọc và xử lý
        img = cv2.imread(src)
        if img is None:
            continue

        # Center Crop + Resize
        img_processed = center_crop(img, ratio=CROP_RATIO)

        # Lưu ảnh
        dst = os.path.join(OUTPUT_DIR, split_name, label, img_name)
        cv2.imwrite(dst, img_processed)
        success_count += 1

        if success_count % 200 == 0:
            print(f"--- Đã xong {success_count} ảnh...")

    print(f"✅ Hoàn thành {split_name}: {success_count} ảnh.")


# 6. Thực thi


process_and_save(train_df, "train")
process_and_save(val_df, "val")
process_and_save(test_df, "test")


print("\n🎉 TẤT CẢ ĐÃ SẴN SÀNG!")
print(f"📁 Dữ liệu lưu tại: {OUTPUT_DIR}")
