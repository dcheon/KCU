// src/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import './styles/pages/app.css';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState("default");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

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
          <h1 className="logo-text">우리가 친해질 수 있을까요?</h1>
        </div>

        <div className="right-section">
          {currentUser ? (
            <button className="toggle-btn header-btn" onClick={() => navigate('/profile')}>프로필</button>
          ) : (
            <button className="toggle-btn header-btn" onClick={handleLogin}>Sign in</button>
          )}
          <nav>
            <a href="#"></a>
          </nav>
        </div>
      </header>

      <div className={`page bg-${mode} ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
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
