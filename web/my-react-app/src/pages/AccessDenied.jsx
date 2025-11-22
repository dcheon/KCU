// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import "../App.css"; // 필요하면

export default function AccessDenied() {

  return (
    <div className="home-container bg-white">
      <div className="access-denied">
        <img 
        src="/assets/img/access_denied.jpg"
        className="access-denied-img"
        />
        <p>죄송합니다. 현재 개발중인 기능입니다.</p>
      </div>
    </div>
  );
}
