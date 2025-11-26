// src/pages/LogIn.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/app.css"; // global styles (Layout uses this too)
import "../styles/pages/login.css";

export default function LogIn() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // 아이디 또는 이메일
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password.trim()) {
      setError("아이디(또는 이메일)과 비밀번호를 모두 입력하세요.");
      return;
    }

    // Simple client-side authentication using localStorage (mock)
    const users = JSON.parse(localStorage.getItem("kcu_users") || "[]");
    const matched = users.find(
      (u) => u.identifier === identifier && u.password === password
    );
    if (!matched) {
      setError("등록된 사용자 정보가 없습니다. 회원가입 후 시도하세요.");
      return;
    }

    // Persist current user (mock session)
    localStorage.setItem(
      "kcu_current_user",
      JSON.stringify({ identifier: matched.identifier })
    );

    navigate("/app");
  };

  return (
    <div className="login-page">
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
            <div style={{display:'flex', gap:12}}>
              <Link className="login-link" to="/register">회원가입</Link>
              <a className="login-link" onClick={() => navigate('/')}>홈으로</a>
            </div>
        </div>
      </div>
    </div>
  );
}
