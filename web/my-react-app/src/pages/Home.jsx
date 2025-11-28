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

  useEffect(() => {
    localStorage.setItem("shapehunter-theme", theme);
  }, [theme]);

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

        <div className="home-authbar">
          <button className="home-auth-btn" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="home-auth-btn primary" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
        
        <header className="home-header">
          <div className="home-logo-placeholder" />
          <h1 className="home-title">Shape 헌터</h1>
          <p className="home-subtitle">
            {/* Add Subtitle here */}
          </p>
        </header>

        <main className="home-main">
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
        </main>

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
                  <tr>
                    <td>1</td>
                    <td>user001</td>
                    <td>9500</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>user002</td>
                    <td>9200</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>user003</td>
                    <td>8800</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>user004</td>
                    <td>8500</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>user005</td>
                    <td>8200</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>user006</td>
                    <td>7900</td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>user007</td>
                    <td>7600</td>
                  </tr>
                  <tr>
                    <td>8</td>
                    <td>user008</td>
                    <td>7300</td>
                  </tr>
                  <tr>
                    <td>9</td>
                    <td>user009</td>
                    <td>7000</td>
                  </tr>
                  <tr>
                    <td>10</td>
                    <td>user010</td>
                    <td>6700</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
