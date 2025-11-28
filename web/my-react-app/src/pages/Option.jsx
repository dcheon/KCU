import { useState, useEffect } from "react";
import "../styles/pages/default.css"; // 기본 테마 스타일 재사용

export default function Option() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("shapehunter-sound") !== "false";
  });

  const [soundVolume, setSoundVolume] = useState(() => {
    return parseInt(localStorage.getItem("shapehunter-volume")) || 50;
  });

  useEffect(() => {
    localStorage.setItem("shapehunter-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("shapehunter-sound", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("shapehunter-volume", soundVolume.toString());
  }, [soundVolume]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleVolumeChange = (e) => {
    setSoundVolume(parseInt(e.target.value));
  };

  return (
    <div className={`content-grid ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
        <div className="content-left"></div>
        <div className="content-center">
            <h2>설정</h2>
            <div style={{marginTop: 16}}>
              <p>배경화면 변경</p>
              <button 
                className="shape-selection-section" 
                onClick={toggleTheme}
                style={{maxWidth: 200}}
              >
                {theme === "dark" ? "🌙 다크 모드" : "☀️ 라이트 모드"}
              </button>
            </div>
            <div style={{marginTop: 16}}>
              <p>소리 설정</p>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: 400}}>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={soundVolume}
                  onChange={handleVolumeChange}
                  style={{
                    flex: 1,
                    background: `linear-gradient(to right, ${theme === 'dark' ? '#fff' : '#333'} 0%, ${theme === 'dark' ? '#fff' : '#333'} ${soundVolume}%, ${theme === 'dark' ? '#444' : '#ddd'} ${soundVolume}%, ${theme === 'dark' ? '#444' : '#ddd'} 100%)`
                  }}
                />
                <span style={{minWidth: '50px', textAlign: 'right'}}>{soundVolume}%</span>
              </div>
            </div>

            <button
                className="shape-selection-section" 
                onClick={toggleTheme}
                style={{maxWidth: 300}}>
              ☕커피 마시게 돈 주세요
            </button>
        </div>
    </div>
  );
}