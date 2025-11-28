import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/pages/app.css";
import "../styles/pages/register.css";

export default function Register() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // 아이디 또는 이메일
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password.trim() || !confirm.trim()) {
      setError("모든 항목을 입력하세요.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호와 확인이 일치하지 않습니다.");
      return;
    }

    // Mock registration: save to localStorage (for demo only)
    const users = JSON.parse(localStorage.getItem("kcu_users") || "[]");
    // simple uniqueness check by identifier
    if (users.some((u) => u.identifier === identifier)) {
      setError("이미 존재하는 아이디(또는 이메일)입니다.");
      return;
    }
    users.push({ identifier, password });
    localStorage.setItem("kcu_users", JSON.stringify(users));

    // After signup, navigate to login
    navigate("/login");
  };

  return (
    <div className={`page center-login-page ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <main className="main">
        <div className="login-card">
          <h2>회원가입</h2>
          <form onSubmit={handleSubmit} className="login-form">
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
            <label>
              비밀번호 확인
              <input
                className="login-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호 확인"
              />
            </label>
            {error && <div className="login-error">{error}</div>}
            <div className="login-actions">
              <button type="submit" className="login-btn">가입하기</button>
              <Link to="/login" className="login-link">로그인으로</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
