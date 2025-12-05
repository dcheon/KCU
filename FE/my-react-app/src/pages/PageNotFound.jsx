import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/pages/app.css";

export default function PageNotFound() {
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
  return (
    <div className={`page ${theme === "retro" ? "theme-retro" : theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <main className="main">
        <div className="access-denied" style={{width:'80%', maxWidth:900}}>
          <h2>404 — 페이지를 찾을 수 없습니다</h2>
          <p style={{marginTop:12}}>요청하신 페이지는 존재하지 않거나 이동된 것 같습니다.</p>
          <div style={{marginTop:18}}>
            <Link to="/" className="sidebar-section">홈으로 돌아가기</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
