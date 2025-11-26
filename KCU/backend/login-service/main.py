from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import hashlib  # 🔹 추가: 표준 라이브러리 해시 사용

app = FastAPI()

# -----------------------
#  비밀번호 해시 함수 (SHA-256 사용)
# -----------------------
def hash_password(plain_password: str) -> str:
    # 평문 비밀번호를 SHA-256으로 해시해서 16진수 문자열로 반환
    return hashlib.sha256(plain_password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 입력 비밀번호를 다시 해시해서 DB에 저장된 값과 비교
    return hash_password(plain_password) == hashed_password


class SignUpRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    email: str


# key: email, value: {"email": ..., "password": hashed_pw}
fake_users_db: dict[str, dict] = {}


@app.get("/")
def root():
    return {"message": "로그인 서버 동작 중"}


@app.post("/signup", response_model=UserPublic)
def signup(payload: SignUpRequest):
    email = payload.email
    password = payload.password

    print("SIGNUP 요청:", email, password)

    if email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 이메일입니다.",
        )

    # 🔹 여기서 SHA-256 해시 사용
    hashed_pw = hash_password(password)
    fake_users_db[email] = {
        "email": email,
        "password": hashed_pw,
    }

    print("현재 fake_users_db:", fake_users_db)

    return UserPublic(email=email)


@app.post("/login")
def login(payload: LoginRequest):
    email = payload.email
    password = payload.password

    print("LOGIN 요청:", email, password)
    print("현재 fake_users_db:", fake_users_db)

    user = fake_users_db.get(email)
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 틀렸습니다.",
        )

    return {"message": "로그인 성공"}
