# FE-BE 연동 가이드

## 📋 연동 완료 내역

### 1. API 설정 중앙화
- 파일: `FE/my-react-app/src/config/api.js`
- 모든 API 엔드포인트를 한 곳에서 관리
- 공통 인증 헤더 처리 (`apiFetch` 함수)

### 2. 인증 시스템 연동
**엔드포인트**:
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인  
- `GET /auth/me` - 사용자 정보 조회

**FE 페이지**:
- `LogIn.jsx` - JWT 토큰 발급 및 저장
- `Register.jsx` - 회원가입 후 로그인 페이지로 이동

**저장 데이터**:
```javascript
localStorage.setItem("access_token", result.access_token);
localStorage.setItem("token_type", result.token_type);
localStorage.setItem("kcu_current_user", JSON.stringify({ identifier }));
```

### 3. 도형 분석 AI 연동
**엔드포인트**: `POST /visualize/visualize`

**FE 페이지**: `DefaultMode.jsx`

**사용법**:
```javascript
const formData = new FormData();
formData.append("file", imageFile);

const response = await fetch(API_ENDPOINTS.visualize, {
  method: "POST",
  body: formData,
});

const data = await response.json();
// data.predictions: [{ label: "sphere", confidence: 0.85 }, ...]
```

**응답 형식**:
```json
{
  "predictions": [
    { "label": "sphere", "confidence": 0.85 },
    { "label": "cube", "confidence": 0.10 },
    ...
  ]
}
```

### 4. 랭킹 시스템 연동
**엔드포인트**: `GET /ranking/top10`

**FE 페이지**: `Home.jsx`

**응답 형식**:
```json
[
  { "rank": 1, "user_id": "user@example.com", "score": 95.5, "date": "2025-12-03" },
  { "rank": 2, "user_id": "player2@example.com", "score": 90.2, "date": "2025-12-03" },
  ...
]
```

### 5. 매칭 시스템 연동
**엔드포인트**:
- `POST /match/join` - 매칭 큐 참가
- `GET /match/status/{match_id}` - 매칭 상태 조회
- `POST /match/result` - 매치 결과 저장

**FE 페이지**: `CompeteMode.jsx`

**매칭 플로우**:
1. 사용자가 이미지 업로드 + 도형 선택
2. `POST /match/join` 호출
3. 응답 확인:
   - `status: "waiting"` → 대기 중
   - `status: "matched"` → 매칭 성공, `match_id`와 `opponent_id` 수신
4. AI 분석 실행
5. 점수 비교 후 `POST /match/result` 호출

### 6. 점수 저장 시스템
**엔드포인트**: `POST /score/save`

**요청 형식**:
```json
{
  "user_id": "user@example.com",
  "score": 85.5,
  "date": "2025-12-03",
  "image_path": "/uploads/image123.jpg"
}
```

## 🔧 환경 설정

### BE 서버 주소 변경
`FE/my-react-app/src/config/api.js`:
```javascript
export const API_BASE_URL = "http://127.0.0.1:8000";  // 개발
// export const API_BASE_URL = "https://api.yourdomain.com";  // 프로덕션
```

### CORS 설정 (BE)
`BE/backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # FE 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 테스트 방법

### 1. BE 서버 실행
```powershell
cd BE
uvicorn backend.main:app --reload
```

### 2. API 문서 확인
브라우저에서 `http://127.0.0.1:8000/docs` 접속

### 3. FE 개발 서버 실행
```powershell
cd FE/my-react-app
npm run dev
```

### 4. 기능 테스트
1. **회원가입**: http://localhost:5173/register
2. **로그인**: http://localhost:5173/login
3. **기본 모드**: http://localhost:5173/app
4. **경쟁 모드**: http://localhost:5173/app/compete
5. **랭킹**: 홈페이지의 Leaderboard 클릭

## 🐛 문제 해결

### CORS 오류
- BE의 `allow_origins`에 FE 주소 추가 확인
- 브라우저 개발자 도구 네트워크 탭에서 Preflight 요청 확인

### 인증 오류
- `localStorage`에 `access_token` 저장 확인
- API 요청 시 `Authorization: Bearer {token}` 헤더 확인

### 이미지 업로드 오류
- FormData 사용 시 `Content-Type` 헤더를 설정하지 않음 (자동 설정)
- 파일 크기 제한 확인

### 404 오류
- API 엔드포인트 경로 확인 (`/visualize/visualize` vs `/visualize`)
- BE 서버 실행 상태 확인

## 📝 다음 단계

### 구현 필요 기능
1. **WebSocket 실시간 매칭**
   - 대기 중 상대방 매칭 시 자동 알림
   - Socket.IO 또는 FastAPI WebSocket 사용

2. **매치 결과 판정**
   - 양쪽 플레이어 점수 비교
   - 승자/패자 결정 로직
   - DB에 결과 저장

3. **데일리 모드**
   - 날짜별 고정 도형
   - 일일 최고 점수 기록

4. **프로필 페이지**
   - 사용자 통계 (총 게임 수, 승률, 평균 점수)
   - 게임 히스토리
   - 계정 설정

5. **이미지 저장**
   - 서버에 이미지 파일 저장
   - 썸네일 생성
   - 갤러리 기능

## 🎯 API 사용 예제

### 로그인 후 토큰 사용
```javascript
import { apiFetch, API_ENDPOINTS } from '../config/api';

// 자동으로 Authorization 헤더 추가됨
const userData = await apiFetch(API_ENDPOINTS.me);
console.log(userData);
```

### 점수 저장
```javascript
const result = await apiFetch(API_ENDPOINTS.saveScore, {
  method: "POST",
  body: JSON.stringify({
    user_id: currentUser.identifier,
    score: 85.5,
    date: new Date().toISOString().split('T')[0],
  }),
});
```

---

**참고**: 모든 API 호출은 `apiFetch` 헬퍼 함수 사용을 권장합니다. 자동으로 인증 토큰을 헤더에 추가하고 에러 처리를 통일합니다.
