import cv2
import numpy as np


def is_skin_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return False

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower = np.array([0, 20, 70], dtype="uint8")
    upper = np.array([20, 255, 255], dtype="uint8")

    mask = cv2.inRange(hsv, lower, upper)
    skin_pix = cv2.countNonZero(mask)
    total_pix = img.shape[0] * img.shape[1]

    return (skin_pix / total_pix) > 0.3
