"""
Script tải và chuẩn bị dữ liệu HAM10000
Dataset được tải từ Kaggle
"""

import os

DATA_DIR = "data/raw/HAM10000"


def main():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    print("Vui lòng tải HAM10000 từ Kaggle và giải nén vào:", DATA_DIR)


if __name__ == "__main__":
    main()
