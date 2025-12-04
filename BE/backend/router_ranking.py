# backend/router_ranking.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Score

# ✅ Swagger에도 보이도록
router = APIRouter(include_in_schema=True)


# -----------------------
#  응답 스키마
# -----------------------
class RankItem(BaseModel):
    rank: int          # 1위, 2위, ...
    user_id: str       # 유저 아이디
    score: float       # 점수 (0~1 사이 확률)
    date: str | None = None  # 언제 찍은 점수인지 (옵션)

    class Config:
        orm_mode = True


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

    ranking: list[RankItem] = []
    for idx, s in enumerate(scores, start=1):
        ranking.append(
            RankItem(
                rank=idx,
                user_id=s.user_id,
                score=s.score,
                # date 컬럼이 datetime 이면 문자열로 변환
                date=str(s.date) if getattr(s, "date", None) else None,
            )
        )

    # ✅ 데이터가 없어도 [] 반환 (404 X)
    return ranking
