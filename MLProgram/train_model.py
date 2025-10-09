import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils import class_weight
import json

# ============================================================
# 0️⃣ 데이터 경로 지정 (🔹 여기만 변경!)
# ============================================================
data_dir = "data_images"  # ✅ 새로 만든 이미지 폴더 경로

# -----------------------------
# 1️⃣ 데이터 타입 자동 감지
# -----------------------------
def detect_data_type(data_dir):
    for root, _, files in os.walk(data_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                return "image"
            if f.lower().endswith(('.npy', '.csv')):
                return "vector"
    return None

data_type = detect_data_type(data_dir)
if not data_type:
    raise ValueError(f"❌ {data_dir} 폴더에 .jpg/.png 또는 .npy/.csv 파일이 없습니다!")

print(f"📂 데이터 타입 감지됨: {data_type}")

# -----------------------------
# 2️⃣ 이미지 데이터 (CNN)
# -----------------------------
def train_image_model():
    print("🧠 CNN 기반 이미지 분류 모델 학습 중...")

    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        validation_split=0.2
    )

    train_gen = datagen.flow_from_directory(
        data_dir,
        target_size=(128, 128),
        batch_size=32,
        class_mode='categorical',
        subset='training'
    )
    val_gen = datagen.flow_from_directory(
        data_dir,
        target_size=(128, 128),
        batch_size=32,
        class_mode='categorical',
        subset='validation'
    )

    os.makedirs("model", exist_ok=True)
    with open('model/class_indices.json', 'w', encoding='utf-8') as f:
        json.dump(train_gen.class_indices, f, ensure_ascii=False, indent=2)

    print("🧩 클래스 인덱스 매핑:", train_gen.class_indices)

    model = models.Sequential([
        layers.Conv2D(32, (3,3), activation='relu', input_shape=(128,128,3)),
        layers.MaxPooling2D(2,2),
        layers.Conv2D(64, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Conv2D(128, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(train_gen.num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    labels = train_gen.classes
    weights = class_weight.compute_class_weight(
    class_weight='balanced',
    classes=np.unique(labels),
    y=labels
    )
    class_weights = dict(enumerate(weights))
    print("⚖️ 클래스 가중치 적용:", class_weights)


    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=15,
        class_weight=class_weights
    )

    model.save('model/cube_classifier.keras')
    print("✅ CNN 이미지 모델 학습 완료!")

# -----------------------------
# 3️⃣ 벡터 데이터 (MLP)
# -----------------------------
def train_vector_model():
    print("🧩 MLP 기반 피처 벡터 모델 학습 중... (생략 가능)")

# -----------------------------
# 4️⃣ 자동 실행
# -----------------------------
if data_type == "image":
    train_image_model()
elif data_type == "vector":
    train_vector_model()
else:
    raise ValueError("❌ 데이터 타입을 인식하지 못했습니다.")

print("✅ 전체 학습 프로세스 완료!")
