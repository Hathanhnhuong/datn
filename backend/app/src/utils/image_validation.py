import imghdr

import cv2
import numpy as np

MAX_IMAGE_SIZE_MB = 5
MIN_WIDTH = 224
MIN_HEIGHT = 224
MIN_BRIGHTNESS = 20
MAX_BRIGHTNESS = 220
MIN_LAPLACIAN_VAR = 10.0
MIN_SKIN_SCORE_REJECT = 0.02
MIN_SKIN_SCORE_WARNING = 0.08


def decode_image(image_bytes: bytes) -> np.ndarray | None:
    nparr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def validate_image_bytes(
    image_bytes: bytes, content_type: str | None = None
) -> tuple[bool, str]:
    if not image_bytes:
        return False, "Empty image payload"

    if len(image_bytes) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        return False,
    f"Hình ảnh quá lớn. Kích thước tối đa là {MAX_IMAGE_SIZE_MB}MB"

    if content_type and content_type not in {"image/jpeg", "image/png", "image/jpg"}:
        return False, "Định dạng không được hỗ trợ. Chỉ hỗ trợ JPG/PNG"

    detected_type = imghdr.what(None, h=image_bytes)
    if detected_type not in {"jpeg", "png"}:
        return False, "Hình ảnh không hợp lệ. Chỉ hỗ trợ định dạng JPG/PNG"

    img = decode_image(image_bytes)
    if img is None:
        return False, "Không thể giải mã hình ảnh"

    h, w = img.shape[:2]
    if w < MIN_WIDTH or h < MIN_HEIGHT:
        return False, 
    f"Hình ảnh quá nhỏ. Kích thước tối thiểu là {MIN_WIDTH}x{MIN_HEIGHT}"

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = float(gray.mean())
    if brightness < MIN_BRIGHTNESS:
        return False, "Hình ảnh quá tối. Vui lòng cải thiện ánh sáng"
    if brightness > MAX_BRIGHTNESS:
        return False, "Hình ảnh quá sáng. Vui lòng giảm độ sáng."

    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if blur_score < MIN_LAPLACIAN_VAR:
        return False,
    "Hình ảnh bị mờ. Vui lòng giữ máy ảnh ổn định và điều chỉnh tiêu cự"

    return True, "ok"


def assess_skin_region(image_bytes: bytes) -> tuple[bool, str, float]:
    img = decode_image(image_bytes)
    if img is None:
        return False, "Cannot decode image", 0.0

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv_lower = np.array([0, 20, 50], dtype=np.uint8)
    hsv_upper = np.array([25, 255, 255], dtype=np.uint8)
    hsv_mask = cv2.inRange(hsv, hsv_lower, hsv_upper)

    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb_lower = np.array([0, 133, 77], dtype=np.uint8)
    ycrcb_upper = np.array([255, 173, 127], dtype=np.uint8)
    ycrcb_mask = cv2.inRange(ycrcb, ycrcb_lower, ycrcb_upper)

    # Use union for a more tolerant skin estimate.
    skin_mask = cv2.bitwise_or(hsv_mask, ycrcb_mask)
    total_pixels = float(img.shape[0] * img.shape[1])
    skin_score = float(cv2.countNonZero(skin_mask)) / total_pixels

    if skin_score < MIN_SKIN_SCORE_REJECT:
        return (
            False,
            "Hình ảnh không giống vùng tổn thương da. Vui lòng chụp cận cảnh hơn vùng da.",
            skin_score,
        )

    if skin_score < MIN_SKIN_SCORE_WARNING:
        return True, "Low skin-region confidence", skin_score

    return True, "ok", skin_score
