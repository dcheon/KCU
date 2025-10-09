"""
evaluate_model.py
---------------------------------
학습된 CNN 이미지 분류 모델을 평가 및 시각화하는 스크립트
- 정확도 및 손실 그래프 출력
- 검증 세트 정확도 계산
- 혼동 행렬 시각화
- 샘플 예측 결과 표시
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

# ================================================================
# 1️⃣ 설정
# ================================================================
MODEL_PATH = "model/hybrid_vector_model.keras"
CLASS_INDICES_PATH = "model/class_indices.json"
DATA_DIR = "data_images"   # 🔹 학습에 사용한 이미지 폴더
IMG_SIZE = (128, 128)
BATCH_SIZE = 32

# ================================================================
# 2️⃣ 모델 및 클래스 로드
# ================================================================
print("🧠 모델 로드 중...")
model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_INDICES_PATH, "r", encoding="utf-8") as f:
    class_indices = json.load(f)
idx_to_class = {v: k for k, v in class_indices.items()}
print(f"✅ 클래스 매핑: {idx_to_class}")

# ================================================================
# 3️⃣ 검증용 데이터 제너레이터 구성
# ================================================================
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

val_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# ================================================================
# 4️⃣ 검증 세트 평가
# ================================================================
print("\n📊 검증 세트 평가 중...")
val_loss, val_acc = model.evaluate(val_gen)
print(f"✅ 검증 정확도: {val_acc*100:.2f}%")
print(f"✅ 검증 손실: {val_loss:.4f}")

# ================================================================
# 5️⃣ 혼동 행렬(Confusion Matrix)
# ================================================================
print("\n📈 혼동 행렬 계산 중...")
Y_pred = model.predict(val_gen)
y_pred = np.argmax(Y_pred, axis=1)
cm = confusion_matrix(val_gen.classes, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=idx_to_class.values())

plt.figure(figsize=(6,6))
disp.plot(cmap='Blues', xticks_rotation=30, colorbar=False)
plt.title("Confusion Matrix")
plt.tight_layout()
plt.show()

# ================================================================
# 6️⃣ 샘플 예측 테스트
# ================================================================
print("\n🧩 샘플 예측 테스트")

for i in range(3):
    img_path, label_idx = val_gen.filepaths[i], val_gen.classes[i]
    img = tf.keras.preprocessing.image.load_img(img_path, target_size=IMG_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    img_batch = np.expand_dims(img_array, axis=0)
    pred = model.predict(img_batch)
    pred_idx = np.argmax(pred)
    prob = np.max(pred)

    plt.imshow(img_array)
    plt.axis("off")
    plt.title(f"예측: {idx_to_class[pred_idx]} ({prob*100:.2f}%)\n실제: {idx_to_class[label_idx]}")
    plt.show()

print("\n✅ 평가 완료 — 그래프와 혼동 행렬, 예측 결과가 위에 표시되었습니다.")
