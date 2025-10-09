import cv2
import numpy as np

def shape_similarity(img1_path, img2_path):
    img1 = cv2.imread(img1_path, 0)
    img2 = cv2.imread(img2_path, 0)
    if img1 is None or img2 is None:
        print("⚠️ 이미지 경로를 확인하세요.")
        return
    img1 = cv2.resize(img1, (128, 128))
    img2 = cv2.resize(img2, (128, 128))
    diff = cv2.absdiff(img1, img2)
    score = 100 - np.mean(diff) / 255 * 100
    print(f"🔸 {img1_path} vs {img2_path} → 유사도: {score:.2f}%")
    return score

if __name__ == "__main__":
    shape_similarity('test_images/cube1.jpg', 'test_images/cube2.jpg')
