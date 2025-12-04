# backend/router_compete.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database import get_db
from backend.models import Score

router = APIRouter()

class SubmitScoreRequest(BaseModel):
    user_id: str
    shape: str          # sphere / cube / ...
    confidence: float   # 0~1


@router.post("/submit")
def submit_score(req: SubmitScoreRequest, db: Session = Depends(get_db)):

    today = datetime.utcnow().strftime("%Y-%m-%d")

    new_score = Score(
        user_id=req.user_id,
        date=today,         # ★ 반드시 추가
        score=req.confidence,
        image_path=None     # 필요 시 파일 저장 가능
    )

    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    return {
        "message": "점수 저장 완료",
        "score": new_score.score,
        "date": new_score.date,
    }
