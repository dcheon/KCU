# backend/auth/router_auth.py

from datetime import datetime, timedelta
import hashlib
from typing import Optional, Dict

from fastapi import APIRouter, HTTPException, status, Depends, Body
from pydantic import BaseModel
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

# -----------------------
#  JWT 설정
# -----------------------
SECRET_KEY = "super-secret-key-change-this"  # ⚠️ 나중에 길고 랜덤한 문자열로 바꿔줘
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 스키마 (토큰을 어디서 받는지 문서용)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# FastAPI Router 객체
router = APIRouter()

# -----------------------
#  비밀번호 해시 함수 (SHA-256)
# -----------------------
def hash_password(plain_password: str) -> str:
    return hashlib.sha256(plain_password.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# -----------------------
#  Pydantic 모델들
# -----------------------
class SignUpRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserPublic(BaseModel):
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str

# 메모리 DB (이메일 → 유저 dict)
fake_users_db: Dict[str, Dict] = {}


# -----------------------
#  JWT 토큰 관련 함수
# -----------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    # sub(Subject)에 email 같은 값 넣기
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="유효하지 않은 인증 정보입니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = fake_users_db.get(email)
    if user is None:
        raise credentials_exception

    return UserPublic(email=email)


# -----------------------
#  라우터 엔드포인트
#  (main.py 에서 prefix="/auth"로 include 예정)
#  결과 URL:
#    - POST /auth/signup
#    - POST /auth/login
#    - GET  /auth/me
# -----------------------

@router.get("/")
def root():
    return {"message": "Auth Router + JWT 동작 중"}

@router.post("/signup", response_model=Token)
def signup(payload: SignUpRequest):
    email = payload.email
    password = payload.password

    if email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 이메일입니다.",
        )

    hashed_pw = hash_password(password)
    fake_users_db[email] = {
        "email": email,
        "password": hashed_pw,
    }

    # 회원가입 성공 시 바로 JWT 발급
    access_token = create_access_token(data={"sub": email})
    return Token(access_token=access_token, email=email)

@router.post("/login", response_model=Token)
def login(payload: LoginRequest = Body(...)):
    email = payload.email
    password = payload.password

    user = fake_users_db.get(email)
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 틀렸습니다.",
        )

    access_token = create_access_token(data={"sub": email})
    return Token(access_token=access_token, email=email)

@router.get("/me", response_model=UserPublic)
async def read_me(current_user: UserPublic = Depends(get_current_user)):
    # 토큰이 유효하면 현재 로그인된 유저 정보 반환
    return current_user
