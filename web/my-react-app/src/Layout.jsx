// src/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import './styles/pages/app.css';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState("default");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

  useEffect(() => {
    // load current user from localStorage (mock session)
    try {
      const raw = localStorage.getItem("kcu_current_user");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch (err) {
      // ignore
    }

    // theme storage listener
    const handleStorage = () => {
      const newTheme = localStorage.getItem("shapehunter-theme") || "light";
      setTheme(newTheme);
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 100);

    const handleWindowDragOver = (e) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleDefaultMode = () => {
    setMode("default");
    navigate("/app");               // /app/default → DefaultMode
  };

  const handleCompeteMode = () => {
    // handleDeveloping();
    setMode("compete");
    navigate("/app/compete");       // /app/compete → CompeteMode
  };

  const handleDailyMode = () => {
    // handleDeveloping();
    setMode("daily");
    navigate("/app/daily");       // /app/compete → CompeteMode
  };

  const handleOption = () => {
    // handleDeveloping();
    setMode("option");
    navigate("/app/option");        // /app/option → OptionPage
  };

  const handleLogin = () => {
    // handleDeveloping();     // 개발중
    navigate("/login");
  };

  const handleDeveloping = () => {
    navigate("/access_denied");        // 개발중
  };

  // 현재 경로에 따라 헤더 제목 결정
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/app/compete')) return '대결모드';
    if (path.includes('/app/daily')) return '데일리샷';
    if (path.includes('/app/option')) return '우리가 친해질 수 있을까요';
    if (path.includes('/app')) return '기본모드';
    return '우리가 친해질 수 있을까요';
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
              src="/assets/img/icon.png"
              alt="로고"
              className="logo-img"
            />
          </Link>
        </div>

        <div className="center-section">
          <h1 className="logo-text">{getHeaderTitle()}</h1>
        </div>

        <div className="right-section">
          {currentUser ? (
            <button className="toggle-btn header-btn" onClick={() => navigate('/profile')}>프로필</button>
          ) : (
            <button className="toggle-btn header-btn" onClick={handleLogin}>Log In</button>
          )}
          <nav>
            <a href="#"></a>
          </nav>
        </div>
      </header>

      <div className={`page bg-${mode} ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={handleCloseSidebar}
          />
        )}

        {/* 왼쪽 사이드바 */}
        <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`} id="sidebar">
          <button className="sidebar-section" onClick={handleDefaultMode}>
            기본모드
          </button>
          <button className="sidebar-section" onClick={handleCompeteMode}>
            대결모드
          </button>
          <button className="sidebar-section" onClick={handleDailyMode}>
            데일리샷
          </button>
          <button className="sidebar-section" onClick={handleOption}>
            설정
          </button>
        </aside>

        {/* 메인 영역 */}
        <main className="main">
          <Outlet context={{ mode }}/>
        </main>
      </div>
    </>
  );
}

export default Layout;
