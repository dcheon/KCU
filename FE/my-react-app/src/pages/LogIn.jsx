// src/pages/LogIn.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS, apiFetch } from "../config/api";
import "../styles/pages/app.css";
import "../styles/pages/login.css";

export default function LogIn() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // username 또는 email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 테마 유지
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

  useEffect(() => {
    const handleStorage = () => {
      const newTheme = localStorage.getItem("shapehunter-theme") || "light";
      setTheme(newTheme);
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 100);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // ---------------------------
  // ⭐ FastAPI 로그인 연동 부분
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("아이디(또는 이메일)과 비밀번호를 모두 입력하세요.");
      return;
    }

    try {
      const result = await apiFetch(API_ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify({
          email: identifier,
          password: password
        })
      });

      // ⭐ FastAPI가 보내준 JWT 저장
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("token_type", result.token_type);

      // 필요한 경우 사용자 정보도 저장 가능
      localStorage.setItem("kcu_current_user", JSON.stringify({ identifier: result.email }));

      // 로그인 성공 후 이동
      navigate("/app");

    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "서버 연결 오류");
    }
  };

  return (
    <div className={`login-page ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <div className="login-card" role="form" aria-label="로그인 폼">
        <h2>로그인</h2>

        <label>
          아이디 또는 이메일
          <input
            className="login-input"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="아이디 또는 이메일"
          />
        </label>

        <label>
          비밀번호
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <div className="login-actions">
          <button className="login-btn" onClick={handleSubmit}>
            로그인
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <Link className="login-link" to="/register">회원가입</Link>
            <a className="login-link" onClick={() => navigate("/")}>홈으로</a>
          </div>
        </div>
      </div>
    </div>
  );
}
