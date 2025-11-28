from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite 파일: 프로젝트 루트에 shape.db 생성
SQLALCHEMY_DATABASE_URL = "sqlite:///./shape.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite에서 필수 옵션
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


# FastAPI 의 Depends() 로 쓰는 DB 세션 dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()