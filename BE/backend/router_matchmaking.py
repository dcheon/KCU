# backend/router_matchmaking.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from uuid import uuid4
from datetime import datetime
import asyncio

from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import MatchResult

router = APIRouter()

# -----------------------
#  매칭 관련 데이터 구조
# -----------------------

class Match(BaseModel):
    match_id: str
    players: List[str]
    created_at: datetime

class JoinRequest(BaseModel):
    user_id: str  # 매칭을 신청하는 유저 ID

class JoinResponse(BaseModel):
    status: str            # "waiting" 또는 "matched"
    match_id: str | None = None
    opponent_id: str | None = None
    message: str

class MatchStatusResponse(BaseModel):
    match_id: str
    players: List[str]
    created_at: datetime

class QueueStatus(BaseModel):
    waiting_users: List[str]

# 매치 결과 저장용
class MatchResultRequest(BaseModel):
    match_id: str
    winner_id: str
    loser_id: str

class MatchResultResponse(BaseModel):
    id: int
    match_id: str
    winner_id: str
    loser_id: str
    created_at: datetime


# 전역 상태 (메모리 기반 매칭 큐 + 진행 중 매치)
waiting_queue: List[str] = []          # 아직 짝이 안 잡힌 유저들
active_matches: Dict[str, Match] = {}  # match_id -> Match

# 동시성 제어용 Lock (여러 요청이 동시에 들어올 때를 대비)
queue_lock = asyncio.Lock()


# -----------------------
#  1:1 실시간 매칭 엔드포인트
# -----------------------

@router.post("/join", response_model=JoinResponse)
async def join_match(req: JoinRequest):
    """
    실시간 매칭 큐에 참가하는 엔드포인트.
    - 대기 중인 유저가 없으면: 큐에 넣고 'waiting' 상태 반환
    - 이미 누군가 대기 중이면: 둘이 매칭시켜서 'matched' 상태 반환
    """
    user_id = req.user_id

    async with queue_lock:
        # 이미 이 유저가 큐에 있는지 체크 (중복 방지)
        if user_id in waiting_queue:
            return JoinResponse(
                status="waiting",
                match_id=None,
                opponent_id=None,
                message="이미 매칭 대기 중입니다."
            )

        # 대기 중인 유저가 없으면 -> 큐에 넣고 대기 상태
        if not waiting_queue:
            waiting_queue.append(user_id)
            return JoinResponse(
                status="waiting",
                match_id=None,
                opponent_id=None,
                message="상대를 기다리는 중입니다."
            )

        # 이미 누군가 대기 중이면 -> 둘이 매칭
        opponent_id = waiting_queue.pop(0)

        match_id = str(uuid4())
        match = Match(
            match_id=match_id,
            players=[opponent_id, user_id],
            created_at=datetime.utcnow(),
        )
        active_matches[match_id] = match

        return JoinResponse(
            status="matched",
            match_id=match_id,
            opponent_id=opponent_id,
            message="매칭이 성사되었습니다."
        )


@router.get("/status/{match_id}", response_model=MatchStatusResponse)
async def get_match_status(match_id: str):
    """
    현재 매치 상태를 조회하는 엔드포인트.
    - active_matches 에 있는 매치만 조회 (아직 결과 저장 전 상태라고 가정)
    """
    match = active_matches.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="해당 match_id의 매치를 찾을 수 없습니다.")

    return MatchStatusResponse(
        match_id=match.match_id,
        players=match.players,
        created_at=match.created_at,
    )


@router.get("/queue", response_model=QueueStatus)
async def get_queue_status():
    """
    현재 매칭 대기 중인 유저 리스트를 반환 (디버깅/관리용).
    운영에서는 제거해도 되는 API.
    """
    return QueueStatus(waiting_users=list(waiting_queue))


# -----------------------
#  매치 결과 DB 저장 엔드포인트
# -----------------------

@router.post("/result", response_model=MatchResultResponse)
async def save_match_result(
    req: MatchResultRequest,
    db: Session = Depends(get_db)
):
    """
    게임이 끝난 후, 매치 결과를 DB에 저장하는 엔드포인트.
    - match_id: 매칭 당시 부여받은 UUID
    - winner_id: 이긴 사람 user_id
    - loser_id: 진 사람 user_id
    """
    # (선택) active_matches 에 존재하는 match_id 인지 확인
    match = active_matches.get(req.match_id)
    if not match:
        # 이미 지워졌거나 잘못된 match_id 일 수 있음 -> 여기서는 그냥 경고만
        # 필요하면 404로 막아도 됨
        raise HTTPException(status_code=404, detail="유효하지 않은 match_id 입니다.")

    # winner_id / loser_id 가 실제 매치에 참여한 유저인지 체크
    if req.winner_id not in match.players or req.loser_id not in match.players:
        raise HTTPException(status_code=400, detail="winner_id / loser_id 가 매치 참가자가 아닙니다.")

    # DB에 결과 저장
    result = MatchResult(
        match_id=req.match_id,
        winner_id=req.winner_id,
        loser_id=req.loser_id,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    # 매치가 끝났으니 active_matches 에서 제거 (선택)
    del active_matches[req.match_id]

    return MatchResultResponse(
        id=result.id,
        match_id=result.match_id,
        winner_id=result.winner_id,
        loser_id=result.loser_id,
        created_at=result.created_at,
    )
