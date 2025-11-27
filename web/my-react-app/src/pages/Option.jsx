import { useState, useEffect } from "react";
import "../styles/pages/default.css"; // 기본 테마 스타일 재사용

export default function Option() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("shapehunter-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`content-grid ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
        <div className="content-left"></div>
        <div className="content-center">
            <h2>설정</h2>
            <div style={{marginTop: 16}}>
              <button 
                className="shape-selection-section" 
                onClick={toggleTheme}
                style={{maxWidth: 200}}
              >
                {theme === "dark" ? "🌙 다크 모드" : "☀️ 라이트 모드"}
              </button>
            </div>
            <p>배경화면 변경</p>
            <p>소리 설정</p>
            <p>계정 탈퇴</p>
            <p>로그아웃</p>
            <p>뭐 넣지</p>
            <p>돈 주세요</p>
        </div>
    </div>
  );
}