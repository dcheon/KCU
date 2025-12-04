// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS, apiFetch } from "../config/api";
import "../styles/pages/app.css";
import "../styles/pages/register.css";

export default function Register() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); 
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
  // ⭐ FastAPI 회원가입 연동
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("아이디(또는 이메일)과 비밀번호를 모두 입력하세요.");
      return;
    }

    try {
      const result = await apiFetch(API_ENDPOINTS.signup, {
        method: "POST",
        body: JSON.stringify({
          email: identifier,
          password: password
        }),
      });

      // ⭐ 회원가입 성공 → 자동 로그인 금지
      // JWT 저장하지 않음
      // kcu_current_user 저장하지 않음

      alert("회원가입이 완료되었습니다. 로그인해주세요!");

      // 로그인 페이지로 이동
      navigate("/login");

    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "서버 연결 오류");
    }
  };

  return (
    <div className={`login-page ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <div className="login-card" role="form" aria-label="회원가입 폼">
        <h2>회원가입</h2>

        <label>
          이메일(아이디)
          <input
            className="login-input"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="이메일"
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
            회원가입
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <Link className="login-link" to="/login">로그인</Link>
            <a className="login-link" onClick={() => navigate("/")}>홈으로</a>
          </div>
        </div>
      </div>
    </div>
  );
}
