from pathlib import Path

from services.predict import predict_skin_lesion

mel_dir = Path("data/processed_roi_balanced/test/mel")
nv_dir = Path("data/processed_roi_balanced/test/nv")

print("=== TEST MEL ===")
for img in mel_dir.glob("*.jpg"):
    res = predict_skin_lesion(img.read_bytes())
    print(img.name, res["predicted_class"], round(res["confidence"], 3))

print("\n=== TEST NV ===")
for img in nv_dir.glob("*.jpg"):
    res = predict_skin_lesion(img.read_bytes())
    print(img.name, res["predicted_class"], round(res["confidence"], 3))
