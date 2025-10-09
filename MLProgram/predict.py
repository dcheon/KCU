import os
import numpy as np
import tensorflow as tf
import pandas as pd

def detect_data_type(test_dir):
    for f in os.listdir(test_dir):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            return "image"
        if f.lower().endswith(('.npy', '.csv')):
            return "vector"
    return None

def find_model():
    model_dir = "model"
    for f in os.listdir(model_dir):
        if f.endswith(".keras"):
            return os.path.join(model_dir, f)
    raise FileNotFoundError("❌ 모델(.keras)을 찾을 수 없습니다!")

def predict_image_model(model_path, test_dir):
    model = tf.keras.models.load_model(model_path)
    print(f"✅ CNN 모델 로드 완료: {model_path}")

    for img_file in os.listdir(test_dir):
        if not img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        img_path = os.path.join(test_dir, img_file)
        img = tf.keras.preprocessing.image.load_img(img_path, target_size=(128, 128))
        x = tf.keras.preprocessing.image.img_to_array(img)
        x = np.expand_dims(x, axis=0) / 255.0  # ✅ normalize
        preds = model.predict(x, verbose=0)[0]
        pred_idx = np.argmax(preds)
        confidence = preds[pred_idx] * 100
        print(f"📸 {img_file} → 클래스 {pred_idx}, 확률 {confidence:.2f}%")

def predict_vector_model(model_path, test_dir):
    model = tf.keras.models.load_model(model_path)
    print(f"✅ MLP 모델 로드 완료: {model_path}")

    feature_path = os.path.join(test_dir, "features_npy.npy")
    if os.path.exists(feature_path):
        X_test = np.load(feature_path).astype("float32")
    else:
        csv_files = [f for f in os.listdir(test_dir) if f.endswith(".csv")]
        if not csv_files:
            raise FileNotFoundError("❌ test_images 폴더에 .npy 또는 .csv 파일이 없습니다.")
        X_test = pd.read_csv(os.path.join(test_dir, csv_files[0])).values.astype("float32")

    # ✅ normalize
    X_test /= np.max(X_test)

    preds = model.predict(X_test, verbose=0)
    pred_idx = np.argmax(preds, axis=1)
    confidence = np.max(preds, axis=1) * 100

    print("✅ 벡터 테스트 결과:")
    for i in range(min(10, len(pred_idx))):
        print(f"▶ 샘플 {i}: 클래스 {pred_idx[i]}, 확률 {confidence[i]:.2f}%")

test_dir = "test_images"
if not os.path.exists(test_dir):
    raise FileNotFoundError("❌ test_images 폴더가 없습니다!")

data_type = detect_data_type(test_dir)
model_path = find_model()

if data_type == "image":
    predict_image_model(model_path, test_dir)
elif data_type == "vector":
    predict_vector_model(model_path, test_dir)
else:
    raise ValueError("❌ test_images 폴더에서 데이터 타입을 인식할 수 없습니다.")

print("🎯 예측 완료!")
