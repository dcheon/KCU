// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import "../styles/pages/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <div className="home-bg-overlay">
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
              기본 모드 (Classic)
            </button>

            <button className="home-menu-btn" onClick={() => navigate("/app/compete")}>
              경쟁 모드 (Competitive)
            </button>

            <button className="home-menu-btn" onClick={() => navigate("/app/option")}>
              옵션 (Options)
            </button>
          </nav>


          <section className="home-panels">
            {/*Top left:Instructions*/}
            <article className="home-panel-card">
              <div className="home-panel-image placeholder">
                {/*Add instruction image */}
              </div>
              <div className="home-panel-body">
                <h3>Instructions</h3>
                <p>
                  {/* Add instructions */}
                </p>
              </div>
            </article>

            {/*Top right:Leaderboard*/}
            <article className="home-panel-card">
              <div className="home-panel-image placeholder">
                {/*Add Leaderboard Image*/}
              </div>
              <div className="home-panel-body">
                <h3>Leaderboard</h3>
                <p>
                  {/* Add Leaderboard Description*/}
                </p>
              </div>
            </article>

            {/*Bottom: Shape Library */}
            <article className="home-panel-card span-2">
              <div className="home-panel-body">
                <h3>Shape Library</h3>
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
    </div>
  );
}
