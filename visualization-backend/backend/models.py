from sqlalchemy import Column, Integer, String, Float, TIMESTAMP
from sqlalchemy.sql import func
from backend.database import Base

class User(Base):
    """
    로그인 시스템은 도원이가 만들었으니까,
    여기서는 user_id만 받아서 저장하는 용도로만 쓴다고 생각하면 됨.
    (실제 User 테이블은 로그인 쪽에서 쓰거나, 안 써도 됨)
    """
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())


class Daily(Base):
    """
    날짜별 '오늘의 도형' 저장
    예: date="2025-11-22", shape="sphere"
    """
    __tablename__ = "daily"

    date = Column(String, primary_key=True, index=True)
    shape = Column(String, nullable=False)


class Score(Base):
    """
    유저가 해당 날짜에 찍어서 얻은 점수 기록
    - user_id: 누가
    - date: 언제 (YYYY-MM-DD 문자열)
    - score: 몇 점
    - image_path: (선택) 나중에 이미지 파일 경로나 URL 저장할 수도 있음
    """
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, index=True)
    date = Column(String, index=True)  # "2025-11-22" 같은 문자열
    score = Column(Float)
    image_path = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
