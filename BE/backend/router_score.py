# backend/router_score.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database import get_db
from backend.models import Score

router = APIRouter()

# -----------------------
#  요청/응답 스키마
# -----------------------
class SaveScoreRequest(BaseModel):
    user_id: str
    score: float
    date: str | None = None  # "YYYY-MM-DD" 형식, 없으면 오늘 날짜 사용
    image_path: str | None = None

class SaveScoreResponse(BaseModel):
    id: int
    user_id: str
    score: float
    date: str
    created_at: datetime

# -----------------------
#  점수 저장 API
# -----------------------
@router.post("/save", response_model=SaveScoreResponse)
def save_score(
    req: SaveScoreRequest,
    db: Session = Depends(get_db)
):
    """
    게임 후 점수를 저장하는 엔드포인트
    - user_id: 유저 ID
    - score: 획득한 점수
    - date: 점수 기록 날짜 (선택, 없으면 오늘)
    - image_path: 이미지 경로 (선택)
    """
    # 날짜가 없으면 오늘 날짜 사용
    score_date = req.date or datetime.now().strftime("%Y-%m-%d")
    
    # DB에 점수 저장
    new_score = Score(
        user_id=req.user_id,
        score=req.score,
        date=score_date,
        image_path=req.image_path,
    )
    
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    
    return SaveScoreResponse(
        id=new_score.id,
        user_id=new_score.user_id,
        score=new_score.score,
        date=new_score.date,
        created_at=new_score.created_at,
    )
