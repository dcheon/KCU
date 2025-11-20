// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import DefaultMode from "./pages/DefaultMode";
import CompeteMode from "./pages/CompeteMode";
import Option from "./pages/Option";
import LogIn from "./pages/LogIn";
import AccessDenied from "./pages/AccessDenied";
import Home from "./pages/Home"; // ★ 새로 만들 파일

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1) 메인 홈페이지: 헤더/사이드바 없는 상태 */}
        <Route path="/" element={<Home />} />

        {/* 2) /app 아래는 Layout(헤더+사이드바+메인) 사용 */}
        <Route path="/app" element={<Layout />}>
          {/* /app/default → 기본 모드 */}
          <Route index element={<DefaultMode />} />

          {/* /app/compete → 경쟁 모드 */}
          <Route path="compete" element={<CompeteMode />} />

          {/* /app/option → 옵션 */}
          <Route path="option" element={<Option />} />
        </Route>

        {/* 3) 로그인 페이지 */}
        <Route path="/login" element={<LogIn />} />

        {/* 4) 공사중 페이지 */}
        <Route path="/access_denied" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
