import { useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바
  const [mode, setMode] = useState("default");  // 모드
  const [selectedShape, setSelectedShape] = useState(null); // 선택된 도형
  const [imageUrl, setImageUrl] = useState(null); //image

  const fileInputRef = useRef(null); // 사진 업로드용 숨겨진 input

  // ===== 원래 insertImg 클릭 =====
  const handleInsertImg = () => {
    // 숨겨둔 파일 선택창 열기
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택됐을 때
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  // ===== 사이드바 토글 =====
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // ===== 모드 변경 =====
  const handleDefaultMode = () => {
    setMode("default");
    console.log("기본모드로 전환");
  };

  const handleGgalSsamMode = () => {
    setMode("ggalssam");
    console.log("깔쌈모드로 전환");
  };

  const handleOption = () => {
    setMode("option");
    console.log("옵션 모드로 전환");
  };

  // ===== 도형 선택 (머신러닝 자리) =====
  const handleSelectShape = (shape) => {
    setSelectedShape(shape);
    // 여기에 모델 호출 넣으면 됨
    console.log(`${shape} 선택됨, 여기에 모델 돌리기`);
  };
  
  return (
    <>
      {/* 상단 헤더 */}
      <header className="main-header">
        <div className="left-section">
          {/* 사이드바 토글 버튼 */}
          <button className="toggle-btn" onClick={handleToggleSidebar}>
            ≡
          </button>
          {/* 왼쪽 로고 */}
          <img
            src="/assets/img/icon.jpg"
            alt="로고"
            className="logo-img"
          />
        </div>

        {/* 중앙 문구 */}
        <div className="center-section">
          <h1 className="logo-text">우리가 친해질 수 있을까요?</h1>
        </div>

        {/* 오른쪽 섹션 (비워둠) */}
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
          <button className="sidebar-section" onClick={handleGgalSsamMode}>
            깔쌈버전
          </button>
          <button className="sidebar-section" onClick={handleOption}>
            설정
          </button>
        </aside>

        {/* 메인 영역 */}
        <main className="main">
          <div className="content-grid">
            {/* 왼쪽 여백 */}
            <div className="content-left"></div>

            {/* 가운데 실제 콘텐츠 */}
            <div className="content-center">
              <div className="center-box">
                <div className="img-space" id="imgSpace">
                  {/* 숨겨진 파일 입력 */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  {/* 이미지가 있으면 표시, 없으면 버튼/텍스트 표시 */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="업로드 이미지"
                      className="uploaded-img"
                      onLoad={() => URL.revokeObjectURL(imageUrl)} // 메모리 정리
                    />
                  ) : (
                    <>
                      <button id="insertImg" onClick={handleInsertImg}>
                        사진 넣기
                      </button>
                      <a>
                        유저 이미지 들어갈 곳 + ML 예상치를 그림으로 표현(이건
                        힘들지 않을까요)
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="output-area">
                {/* 모드에 따라 출력 달리하기도 가능 */}
                {mode === "default" && (
                  <a>사진을 올려야 평가를 하든 머든 하죠 이건 뭐 저랑 싸우자는 건가요?</a>
                )}
                {mode === "ggalssam" && (
                  <a>깔쌈짬뽕한거를 올려야 예쁜게 나와요</a>
                )}
                {mode === "option" && (
                  <a>일단 옵션페이지는 안 만들었는데 그래도 이 버튼이 작동한다는걸 알려주기위해 나타남</a>
                )}
                {selectedShape && (
                  <div style={{ marginTop: "10px", fontWeight: 500 }}>
                    선택된 도형: {selectedShape}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽 여백/추가 공간 */}
            <div className="content-right">
              <button
                className="shape-selection-section"
                onClick={() => handleSelectShape("tetrahedron")}
              >
                삼각형
              </button>
              <button
                className="shape-selection-section"
                onClick={() => handleSelectShape("cube")}
              >
                사각형
              </button>
              <button
                className="shape-selection-section"
                onClick={() => handleSelectShape("sphere")}
              >
                원
              </button>
              <button
                className="shape-selection-section"
                onClick={() => {
                  URL.revokeObjectURL(imageUrl);
                  setImageUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; 
                  }
                }}
                >
                  리셋
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;