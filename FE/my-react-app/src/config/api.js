// API 설정 파일
export const API_BASE_URL = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
  me: `${API_BASE_URL}/auth/me`,

  // Visualization
  visualize: `${API_BASE_URL}/visualize/visualize`,

  // Ranking
  top10: `${API_BASE_URL}/ranking/top10`,

  // Matchmaking
  matchJoin: `${API_BASE_URL}/match/join`,
  matchStatus: (matchId) => `${API_BASE_URL}/match/status/${matchId}`,
  matchQueue: `${API_BASE_URL}/match/queue`,
  matchResult: `${API_BASE_URL}/match/result`,

  // Score (추가 예정)
  saveScore: `${API_BASE_URL}/score/save`,
};

// 공통 fetch 헬퍼 함수
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  
  const headers = {
    ...options.headers,
  };

  // FormData가 아닌 경우에만 Content-Type 설정
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "서버 오류" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
