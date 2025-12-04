# backend/visualization/router_visualize.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import numpy as np
import torch
from transformers import CLIPModel, CLIPProcessor
import tempfile

router = APIRouter()

LABELS = ["sphere", "cube", "cylinder", "cone", "pyramid", "torus"]

# 영어 -> 한글 변환 매핑
LABEL_KOR = {
    "sphere": "원",
    "cube": "사각형",
    "cylinder": "원기둥",
    "cone": "원뿔",
    "pyramid": "삼각형",
    "torus": "도넛"
}

# CLIP 모델은 서버 시작 시 1번만 로드
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


@router.post("/visualize")
async def visualize(file: UploadFile = File(...)):
    """
    FE에서 요청하는: /visualize/visualize
    반환 형식: predictions = [{label, confidence}, ...]
    """

    # 1) 파일 저장
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(await file.read())
            img_path = tmp.name
    except Exception:
        raise HTTPException(status_code=400, detail="이미지를 저장할 수 없습니다.")

    # 2) 이미지 로드
    image = Image.open(img_path).convert("RGB")

    # 3) CLIP 입력 생성
    prompts = [f"a photo of a {label}" for label in LABELS]

    inputs = processor(
        text=prompts,
        images=image,
        return_tensors="pt",
        padding=True
    )

    # 4) CLIP 실행
    with torch.no_grad():
        output = model(**inputs)

    # 5) softmax → 확률 계산
    probs = output.logits_per_image.softmax(dim=1)[0].tolist()

    # 6) FE에서 기대하는 predictions 포맷 (한글로 변환)
    predictions = [
        {"label": LABEL_KOR[LABELS[i]], "confidence": float(probs[i])}
        for i in range(len(LABELS))
    ]

    return {"predictions": predictions}
