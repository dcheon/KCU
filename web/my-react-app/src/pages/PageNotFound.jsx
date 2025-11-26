import React from "react";
import { Link } from "react-router-dom";
import "../styles/app.css";

export default function PageNotFound() {
  return (
    <div className="page">
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
