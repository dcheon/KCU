// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import "../styles/app.css"; // 필요하면

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>메인 홈페이지</h1>
      <p>모드를 선택하세요.</p>

      <div className="home-button-group">
        <button onClick={() => navigate("/app")}>
          기본 모드로 들어가기
        </button>

        <button onClick={() => navigate("/app/compete")}>
          깔쌈 모드로 들어가기
        </button>

        <button onClick={() => navigate("/app/option")}>
          옵션 페이지로 들어가기
        </button>
      </div>
    </div>
  );
}
