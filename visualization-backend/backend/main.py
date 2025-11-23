from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
import tempfile
import numpy as np
from PIL import Image

from backend.database import Base, engine, get_db
from backend.models import Score, Daily
from backend.visualization.embedding_vis import save_embedding_vis
from backend.visualization.heatmap import save_heatmap

# ---------- DB 테이블 생성 -----------
Base.metadata.create_all(bind=engine)

# ---------- FastAPI 앱 설정 ----------
app = FastAPI()

# CORS: 프론트엔드(현서 코드)에서 호출 가능하게
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 나중에 특정 도메인만 허용해도 됨
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- CLIP 관련 LABELS (현실 사진 기준) ----------
LABELS = [
    "a photo of a round ball or sphere-shaped object",
    "a photo of a box or cube-shaped object",
    "a photo of a can or cylinder-shaped object",
    "a photo of a cone-shaped object like an ice cream cone",
    "a photo of a pyramid-shaped geometric object",
    "a photo of a doughnut or torus-shaped object",
]

# ---------- Pydantic 요청/응답 모델 ----------

class SubmitScoreIn(BaseModel):
    user_id: str
    score: float
    image_path: str | None = None  # 나중에 이미지 경로 저장용 (없으면 null)


# ===== 1. 시각화 + CLIP 분석 API (/visualize) =====

@app.post("/visualize")
async def visualize(file: UploadFile = File(...)):
    """
    1) 업로드 이미지 받아서
    2) CLIP으로 label별 점수 계산하고
    3) embedding_vis.png, heatmap.png 생성
    4) 점수(scores)와 이미지 경로를 JSON으로 반환
    """

    # 1) 이미지 임시 파일로 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        img_path = tmp.name

    # 2) CLIP 로드 (함수 안에서 로드: import 에러 시 앱 안 죽게)
    import torch
    from transformers import CLIPModel, CLIPProcessor

    model = CLIPModel.from_pretrained(
        "openai/clip-vit-base-patch32",
        output_attentions=True,
    )
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    # 3) 입력 준비
    image = Image.open(img_path).convert("RGB")
    prompts = [label for label in LABELS]

    inputs = processor(
        text=prompts,
        images=image,
        return_tensors="pt",
        padding=True,
    )

    # 4) 모델 추론
    with torch.no_grad():
        out = model(**inputs)

    # 5) 임베딩, 점수 계산
    image_emb = out.image_embeds.cpu().numpy()
    text_emb = out.text_embeds.cpu().numpy()

    logits = out.logits_per_image  # (1, num_labels)
    probs = logits.softmax(dim=1)[0].cpu().numpy()  # numpy array

    scores = {LABELS[i]: float(probs[i]) for i in range(len(LABELS))}

    # 6) Attention 기반 heatmap 계산
    with torch.no_grad():
        vision_out = model.vision_model(
            pixel_values=inputs["pixel_values"],
            output_attentions=True,
        )

    last_attn = vision_out.attentions[-1]       # (B, heads, tokens, tokens)
    attn_mean = last_attn.mean(dim=1)[0]        # (tokens, tokens)
    cls_attn = attn_mean[0, 1:]                 # CLS → patch token

    num_patches = cls_attn.shape[0]             # ex) 49
    size = int(num_patches**0.5)                # ex) 7x7
    attn_map = cls_attn.reshape(size, size).cpu().numpy()

    # 7) 시각화 이미지 저장
    emb_path = "static/embedding_vis.png"
    heat_path = "static/heatmap.png"

    save_embedding_vis(image_emb, text_emb, LABELS, emb_path)
    save_heatmap(attn_map, img_path, heat_path)

    return {
        "embedding_image": emb_path,
        "heatmap_image": heat_path,
        "scores": scores,
    }


# ===== 2. 점수 저장 API (/submit_score) =====

@app.post("/submit_score")
def submit_score(payload: SubmitScoreIn, db: Session = Depends(get_db)):
    """
    도원이 쪽에서 로그인 처리해서 user_id를 넘겨준다고 하면,
    프론트에서 /submit_score로 user_id + score를 보내게 하면 됨.
    """
    today_str = date.today().isoformat()

    db_score = Score(
        user_id=payload.user_id,
        date=today_str,
        score=payload.score,
        image_path=payload.image_path or "",
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)

    return {
        "status": "ok",
        "id": db_score.id,
        "date": db_score.date,
    }


# ===== 3. 오늘 랭킹 조회 API (/rankings/today) =====

@app.get("/rankings/today")
def get_today_rankings(db: Session = Depends(get_db)):
    today_str = date.today().isoformat()

    rows = (
        db.query(Score)
        .filter(Score.date == today_str)
        .order_by(Score.score.desc())
        .limit(10)
        .all()
    )

    rankings = [
        {
            "rank": idx + 1,
            "user_id": r.user_id,
            "score": r.score,
            "created_at": r.created_at,
        }
        for idx, r in enumerate(rows)
    ]

    return {"date": today_str, "rankings": rankings}


# ===== 4. 특정 날짜 랭킹 조회 API (/rankings/{date_str}) =====

@app.get("/rankings/{date_str}")
def get_rankings_by_date(date_str: str, db: Session = Depends(get_db)):
    rows = (
        db.query(Score)
        .filter(Score.date == date_str)
        .order_by(Score.score.desc())
        .limit(10)
        .all()
    )

    rankings = [
        {
            "rank": idx + 1,
            "user_id": r.user_id,
            "score": r.score,
            "created_at": r.created_at,
        }
        for idx, r in enumerate(rows)
    ]

    return {"date": date_str, "rankings": rankings}


# ===== 5. Daily 도형 API =====

class DailyIn(BaseModel):
    shape: str


@app.post("/daily")
def set_daily_shape(payload: DailyIn, db: Session = Depends(get_db)):
    """
    오늘의 도형 설정.
    이미 있으면 업데이트, 없으면 새로 생성.
    """
    today_str = date.today().isoformat()

    existing = db.query(Daily).filter(Daily.date == today_str).first()
    if existing:
        existing.shape = payload.shape
    else:
        existing = Daily(date=today_str, shape=payload.shape)
        db.add(existing)
    db.commit()

    return {"status": "ok", "date": today_str, "shape": existing.shape}


@app.get("/daily")
def get_daily_shape(db: Session = Depends(get_db)):
    """
    오늘의 도형 조회. 없으면 shape=None 리턴.
    """
    today_str = date.today().isoformat()

    row = db.query(Daily).filter(Daily.date == today_str).first()
    return {
        "date": today_str,
        "shape": row.shape if row else None,
    }
