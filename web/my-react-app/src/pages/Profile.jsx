import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/app.css";
import "../styles/pages/register.css"; // reuse card styles

export default function Profile() {
  const navigate = useNavigate();

  const raw = localStorage.getItem("kcu_current_user");
  const user = raw ? JSON.parse(raw) : null;

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

  const handleLogout = () => {
    localStorage.removeItem("kcu_current_user");
    navigate("/");
  };

  return (
    <div className={`page center-login-page ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <main className="main">
        <div className="login-card">
          <h2>프로필</h2>
          {user ? (
            <>
              <p><strong>아이디/이메일:</strong> {user.identifier}</p>
              <div style={{display:'flex', gap:12, marginTop:12}}>
                <button className="login-btn" onClick={() => navigate('/app')}>앱으로</button>
                <button className="login-btn" onClick={handleLogout}>로그아웃</button>
              </div>
            </>
          ) : (
            <>
              <p>로그인된 사용자가 없습니다.</p>
              <div style={{display:'flex', gap:12, marginTop:12}}>
                <button className="login-btn" onClick={() => navigate('/login')}>로그인</button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
