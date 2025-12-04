// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/pages/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const [showModeDetail, setShowModeDetail] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    localStorage.setItem("shapehunter-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("kcu_current_user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    // Load leaderboard data from CSV
    fetch('/assets/data/leaderboard.csv')
      .then(response => response.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const data = lines.slice(1).map(line => {
          const [rank, username, score] = line.split(',');
          return { rank, username, score };
        });
        setLeaderboardData(data);
      })
      .catch(error => console.error('Failed to load leaderboard:', error));
  }, []);

  const openModeDetail = (mode) => {
    setSelectedMode(mode);
    setShowInstructions(false);
    setShowModeDetail(true);
  };

  const closeModeDetail = () => {
    setShowModeDetail(false);
    setSelectedMode("");
  };

  return (
    <div
      className={`home-root ${
        theme === "dark" ? "theme-dark" : "theme-light"
      }`}
    >
      <div className="home-bg-overlay">

        {/* Top header section for auth buttons */}
        <div className="home-authbar">
          {currentUser ? (
            <button className="home-auth-btn" onClick={() => navigate("/profile")}>
              Profile
            </button>
          ) : (
            <>
              <button className="home-auth-btn" onClick={() => navigate("/login")}>
                Log In
              </button>
              <button className="home-auth-btn primary" onClick={() => navigate("/register")}>
                Sign Up
              </button>
            </>
          )}
        </div>
        
        {/* Main content area - split into top and bottom */}
        <div className="home-content">
          {/* Top section - split into left (title) and right (image) */}
          <div className="home-top-section">
            <div className="home-title-section">
              <div className="home-logo-placeholder" />
              <h1 className="home-title">Shape 헌터</h1>
              <p className="home-subtitle">
                {/* Add Subtitle here */}
              </p>
            </div>
            <div className="home-image-section">
              <img src="/assets/img/home_drawing.png" alt="decoration" />
            </div>
          </div>

          {/* Bottom section - split into left (modes) and right (panels) */}
          <div className="home-bottom-section">
            <nav className="home-menu">
              <h2 className="home-menu-title">Modes</h2>
              <button className="home-menu-btn" onClick={() => navigate("/app")}>
                기본 모드
              </button>

              <button
                className="home-menu-btn"
                onClick={() => navigate("/app/compete")}
              >
                경쟁 모드
              </button>

              <button
                className="home-menu-btn"
                onClick={() => navigate("/app/daily")}
              >
                데일리 모드
              </button>

              <button
                className="home-menu-btn"
                onClick={() => navigate("/app/option")}
              >
                옵션
              </button>
            </nav>

            <section className="home-panels">
            {/*Top left:Instructions*/}
            <article className="home-panel-card" onClick={() => setShowInstructions(true)} style={{cursor: 'pointer'}}>
              <div className="home-panel-image placeholder">
                <img className="home-panel-image" src="/assets/img/instruction.jfif"/>
              </div>
              <div className="home-panel-body">
                <h3>Instructions (게임 설명이라는 뜻입니다)</h3>
                <p>
                  {/* Add instructions */}
                </p>
              </div>
            </article>

            {/*Top right:Leaderboard*/}
            <article className="home-panel-card" onClick={() => setShowLeaderboard(true)} style={{cursor: 'pointer'}}>
              <div className="home-panel-image placeholder">
                <img className="home-panel-image" src="/assets/img/leaderboard.jpg"/>
              </div>
              <div className="home-panel-body">
                <h3>Leaderboard (리더의 보드에요)</h3>
                <p>
                  {/* Add Leaderboard Description*/}
                </p>
              </div>
            </article>

            {/*Bottom: Shape Library */}
            <article className="home-panel-card span-2">
              <div className="home-panel-body">
                <h3>Shape Library (명예의 도형)</h3>
                <p>
                  {/*Add Shape Library Description*/}
                </p>

                <div className="home-gallery">
                  <div className="home-gallery-track">
                    {/*Placeholders*/}
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />

                    {/*Duplicate Set*/}
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                    <div className="home-gallery-images" />
                  </div>
                </div>
              </div>
            </article>
          </section>
          </div>
        </div>

        <footer className="home-footer">
          <span>© {new Date().getFullYear()} Shape Hunter</span>
        </footer>
      </div>

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="home-popup-overlay" onClick={() => setShowInstructions(false)}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInstructions(false)} className="home-popup-x-btn">
              ×
            </button>
            <h2>사용 방법</h2>
            <p>각 모드에 대한 자세한 설명을 확인하세요.</p>
            <div className="home-popup-buttons">
              <button onClick={() => openModeDetail("기본모드")} className="home-popup-btn">
                기본모드 설명
              </button>
              <button onClick={() => openModeDetail("대결모드")} className="home-popup-btn">
                대결모드 설명
              </button>
              <button onClick={() => openModeDetail("데일리모드")} className="home-popup-btn">
                데일리모드 설명
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Detail Popup */}
      {showModeDetail && (
        <div className="home-popup-overlay" onClick={closeModeDetail}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModeDetail} className="home-popup-x-btn">
              ×
            </button>
            <h2>{selectedMode} 설명</h2>
            <div className="home-popup-content">
              {selectedMode === "기본모드" && (
                <div>
                  <img src="/assets/img/example_default_1.png"/>
                  <p>가운데 사진 넣기 버튼을 클릭 후 사진을 넣어 주세요</p>
                  <p>사진을 넣고 실행 버튼을 눌러주세요</p>
                  <img src="/assets/img/example_default_2.png"/>
                  <p>본인이 생각했던 도형을 눌러 결과값을 확인해 보세요</p>
                </div>
              )}
              {selectedMode === "대결모드" && (
                <div>
                  <img src="/assets/img/example_compete_1.png"/>
                  <p>가운데 사진 넣기 버튼을 클릭 후 사진을 넣어 주세요</p>
                  <p>사진을 넣고 실행 버튼을 눌러주세요</p>
                  <img src="/assets/img/example_compete_2.png"/>
                  <p>본인이 생각했던 도형을 눌러 결과값을 확인해 보세요</p>
                </div>
              )}
              {selectedMode === "데일리모드" && (
                <div>
                  <img src="/assets/img/example_daily_1.png"/>
                  <p>가운데 사진 넣기 버튼을 클릭 후 사진을 넣어 주세요</p>
                  <p>사진을 넣고 실행 버튼을 눌러주세요</p>
                  <img src="/assets/img/example_daily_2.png"/>
                  <p>오늘의 도형에 따라 결과값을 확인해 보세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Popup */}
      {showLeaderboard && (
        <div className="home-popup-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowLeaderboard(false)} className="home-popup-x-btn">
              ×
            </button>
            <h2>리더보드</h2>
            <div className="home-popup-content">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>아이디</th>
                    <th>스코어</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.rank}</td>
                      <td>{entry.username}</td>
                      <td>{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
