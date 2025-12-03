# backend/router_ranking.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Score

router = APIRouter()

# -----------------------
#  응답 스키마
# -----------------------
class RankItem(BaseModel):
    rank: int          # 1위, 2위, ...
    user_id: str       # 유저 아이디
    score: float       # 점수
    date: str | None = None  # 언제 찍은 점수인지 (옵션)

# -----------------------
#  상위 10위 랭킹 API
# -----------------------
@router.get("/top10", response_model=List[RankItem])
def get_top10_ranking(db: Session = Depends(get_db)):
    """
    전체 Score 테이블에서 점수 기준 상위 10명 가져오기.
    - 점수 내림차순
    - 점수가 같으면 더 먼저 기록된 것(created_at)이 위에 오도록 정렬
    """
    scores = (
        db.query(Score)
        .order_by(Score.score.desc(), Score.created_at.asc())
        .limit(10)
        .all()
    )

    if not scores:
        # 아직 점수 기록이 하나도 없을 때
        raise HTTPException(status_code=404, detail="랭킹 데이터가 없습니다.")

    ranking: list[RankItem] = []
    for idx, s in enumerate(scores, start=1):
        ranking.append(
            RankItem(
                rank=idx,
                user_id=s.user_id,
                score=s.score,
                date=s.date,
            )
        )

    return ranking
