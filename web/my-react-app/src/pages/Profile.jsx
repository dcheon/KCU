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

  const [showDeletePopup, setShowDeletePopup] = useState(false);

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

  const handleDeleteAccount = () => {
    // TODO: Call backend API to delete account
    localStorage.removeItem("kcu_current_user");
    setShowDeletePopup(false);
    navigate("/");
  };

  // Placeholder stats - replace with actual data from backend
  const gameStats = {
    totalGames: 42,
    competeHighestRank: 3, // Set to null or undefined for NaN
    dailyBestStreak: 7
  };

  return (
    <div className={`page center-login-page ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <main className="main">
        <div className="login-card">
          <h2>프로필</h2>
          {user ? (
            <>
              <p><strong>아이디/이메일:</strong> {user.identifier}</p>
              <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <p style={{margin: 0}}><strong>게임 횟수:</strong> {gameStats.totalGames}회</p>
                <p style={{margin: 0}}><strong>대결모드 최고 랭킹:</strong> {gameStats.competeHighestRank ?? 'NaN'}</p>
                <p style={{margin: 0}}><strong>데일리모드 최대 연승:</strong> {gameStats.dailyBestStreak} streak</p>
              </div>
              <div style={{display:'flex', gap:12, marginTop:12}}>
                <button className="login-btn" onClick={() => navigate('/app')}>앱으로</button>
                <button className="login-btn" onClick={handleLogout}>로그아웃</button>
              </div>
              <div style={{marginTop: '1rem'}}>
                <button 
                  className="login-btn" 
                  onClick={() => setShowDeletePopup(true)}
                  style={{backgroundColor: '#d32f2f', borderColor: '#d32f2f'}}
                >
                  계정 탈퇴
                </button>
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

      {/* Delete Account Popup */}
      {showDeletePopup && (
        <div className="home-popup-overlay" onClick={() => setShowDeletePopup(false)}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px', width: 'auto', maxHeight: 'none', padding: 0}}>
            <button onClick={() => setShowDeletePopup(false)} className="home-popup-x-btn" style={{top: '0.5rem', right: '0.5rem'}}>
              ×
            </button>
            <img src="/assets/img/delete_account.webp" style={{width: '100%', height: 'auto', display: 'block', borderRadius: '12px'}}/>
          </div>
        </div>
      )}
    </div>
  );
}
