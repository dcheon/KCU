"""
convert_to_images_by_range.py
--------------------------------------
⚡ 라벨 순서가 이미 정렬된 데이터셋용 빠른 이미지 변환기
(0~12만 cube, 12~24만 sphere, 24~36만 cone, 36~48만 cylinder)
"""

import os
import numpy as np
import cv2

DATA_DIR = "data"
OUTPUT_DIR = "data_images_byrange"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ====== 설정 ======
class_names = ["cube", "sphere", "cone", "cylinder"]
images_per_class = 120_000  # 한 클래스당 이미지 수
input_file = os.path.join(DATA_DIR, "features_npy.npy")

# ====== 데이터 로드 ======
print("✅ features_npy.npy 로드 중...")
X = np.load(input_file)
total = len(X)
print(f"✅ 총 {total:,}장 로드 완료")

# ====== 폴더 생성 ======
for name in class_names:
    os.makedirs(os.path.join(OUTPUT_DIR, name), exist_ok=True)

# ====== 변환 시작 ======
print("🚀 변환 시작...")
for i in range(total):
    class_idx = i // images_per_class
    if class_idx >= len(class_names):
        break
    class_name = class_names[class_idx]
    img = X[i]
    img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype("uint8")
    save_path = os.path.join(OUTPUT_DIR, class_name, f"img_{i:06d}.png")
    cv2.imwrite(save_path, img)

    if (i + 1) % 5000 == 0 or i == total - 1:
        print(f"✅ {i+1:,}/{total:,} ({(i+1)/total*100:.1f}%)")

print("\n🎉 변환 완료! 폴더별 요약:")
for name in class_names:
    count = len(os.listdir(os.path.join(OUTPUT_DIR, name)))
    print(f"📁 {name:<10}: {count:,} 장")

print("\n✅ 모든 변환이 완료되었습니다.")
