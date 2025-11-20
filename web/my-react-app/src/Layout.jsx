// src/Layout.jsx
import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import './App.css';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // ✅ /app 영역 안에서만 이동하도록 경로 수정
  const handleDefaultMode = () => {
    navigate("/app");               // /app/default → DefaultMode
  };

  const handleCompeteMode = () => {
    navigate("/app/compete");       // /app/compete → CompeteMode
  };

  const handleOption = () => {
    navigate("/app/option");        // /app/option → OptionPage
  };

  return (
    <>
      {/* 상단 헤더 */}
      <header className="main-header">
        <div className="left-section">
          <button className="toggle-btn" onClick={handleToggleSidebar}>
            ≡
          </button>
          <Link to="/">
            <img
              src="/assets/img/icon.jpg"
              alt="로고"
              className="logo-img"
            />
          </Link>
        </div>

        <div className="center-section">
          <h1 className="logo-text">우리가 친해질 수 있을까요?</h1>
        </div>

        <div className="right-section">
          <nav>
            <a href="#"></a>
          </nav>
        </div>
      </header>

      <div className="page">
        {/* 왼쪽 사이드바 */}
        <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`} id="sidebar">
          <button className="sidebar-section" onClick={handleDefaultMode}>
            기본모드
          </button>
          <button className="sidebar-section" onClick={handleCompeteMode}>
            깔쌈버전
          </button>
          <button className="sidebar-section" onClick={handleOption}>
            설정
          </button>
        </aside>

        {/* 메인 영역 */}
        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;
