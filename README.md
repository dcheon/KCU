# KCU - Shape Hunter

도형 분류 AI 게임 프로젝트

## 🎮 프로젝트 개요

Shape Hunter는 사용자가 업로드한 이미지에서 도형을 AI로 분류하고, 랭킹 시스템과 1:1 대결 기능을 제공하는 웹 애플리케이션입니다.

### 주요 기능
- **AI 도형 분류**: CLIP 모델을 사용한 6가지 도형 인식 (구, 정육면체, 원기둥, 원뿔, 피라미드, 도넛)
- **게임 모드**:
  - 기본 모드: 이미지 업로드 후 AI 분석 결과 확인
  - 경쟁 모드: 실시간 1:1 매칭 대결
  - 데일리 모드: 일일 챌린지
- **랭킹 시스템**: 상위 10명 리더보드
- **사용자 인증**: JWT 기반 로그인/회원가입

## 🛠️ 기술 스택

### Backend (FastAPI)
- Python 3.x
- FastAPI + Uvicorn
- SQLAlchemy (SQLite)
- CLIP (OpenAI) - 이미지 분류
- PyTorch + Transformers
- JWT 인증

### Frontend (React)
- React 19.2
- React Router DOM
- Vite
- CSS (커스텀 스타일)

## 📁 프로젝트 구조

```
KCU/
├── BE/
│   ├── backend/
│   │   ├── auth/              # 인증 라우터
│   │   ├── visualization/     # AI 분석 라우터
│   │   ├── main.py           # FastAPI 메인
│   │   ├── database.py       # DB 설정
│   │   ├── models.py         # SQLAlchemy 모델
│   │   ├── router_matchmaking.py  # 매칭 시스템
│   │   ├── router_ranking.py      # 랭킹 시스템
│   │   └── router_score.py        # 점수 저장
│   └── requirements.txt
└── FE/
    └── my-react-app/
        ├── src/
        │   ├── config/
        │   │   └── api.js    # API 설정
        │   ├── pages/        # 페이지 컴포넌트
        │   └── styles/       # CSS 스타일
        └── package.json
```

## 🚀 시작하기

### 1. Backend 실행

```powershell
# BE 디렉토리로 이동
cd BE

# 가상환경 생성 (선택사항)
python -m venv venv
.\venv\Scripts\Activate.ps1

# 패키지 설치
pip install -r requirements.txt

# 데이터베이스 초기화 (자동)
# 서버 실행
uvicorn backend.main:app --reload

# 서버가 http://127.0.0.1:8000 에서 실행됩니다
# API 문서: http://127.0.0.1:8000/docs
```

### 2. Frontend 실행

```powershell
# FE 디렉토리로 이동
cd FE/my-react-app

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 서버가 http://localhost:5173 에서 실행됩니다
```

## 📡 API 엔드포인트

### 인증 (Auth)
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `GET /auth/me` - 현재 사용자 정보

### 도형 분석 (Visualization)
- `POST /visualize/visualize` - 이미지 업로드 & AI 분석

### 랭킹 (Ranking)
- `GET /ranking/top10` - 상위 10명 랭킹

### 매칭 (Matchmaking)
- `POST /match/join` - 매칭 큐 참가
- `GET /match/status/{match_id}` - 매칭 상태 조회
- `GET /match/queue` - 대기 중인 유저 목록
- `POST /match/result` - 매치 결과 저장

### 점수 (Score)
- `POST /score/save` - 점수 저장

## 🔧 설정

### API URL 변경
FE의 API 기본 URL은 `src/config/api.js`에서 관리됩니다:

```javascript
export const API_BASE_URL = "http://127.0.0.1:8000";
```

배포 시 환경에 맞게 수정하세요.

### CORS 설정
BE의 `main.py`에서 CORS 설정을 변경할 수 있습니다:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 💾 데이터베이스

SQLite 파일 (`shape.db`)이 BE 디렉토리에 자동 생성됩니다.

### 테이블 구조
- **users**: 사용자 정보
- **scores**: 점수 기록 (user_id, date, score)
- **match_results**: 매치 결과 (match_id, winner_id, loser_id)

## 🎯 사용 방법

1. **회원가입/로그인**: 우측 상단에서 계정 생성
2. **기본 모드**: 이미지 업로드 → AI 분석 결과 확인
3. **경쟁 모드**: 로그인 후 이미지 업로드 → 도형 선택 → 매칭 대기 → 대결
4. **랭킹 확인**: 홈 페이지에서 Leaderboard 클릭

## 📝 개발 노트

### FE-BE 연동 완료 사항
✅ API 설정 중앙화 (`config/api.js`)  
✅ 로그인/회원가입 JWT 인증 연동  
✅ 도형 분석 API 연동  
✅ 랭킹 시스템 API 연동  
✅ 1:1 매칭 시스템 기본 구현  
✅ 점수 저장 API 추가  

### TODO
- [ ] WebSocket 기반 실시간 매칭 알림
- [ ] 매치 결과 승패 판정 로직 완성
- [ ] 데일리 모드 구현
- [ ] 프로필 페이지 기능 추가
- [ ] 이미지 저장 및 히스토리 기능

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

---

**개발자**: KCU 팀  
**최종 업데이트**: 2025-12-03