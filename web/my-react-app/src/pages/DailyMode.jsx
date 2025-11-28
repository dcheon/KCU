// Daily Mode
import { useRef, useState, useEffect } from "react";
import "../styles/pages/daily.css"; // 페이지 전용 스타일

// 매일 다른 도형을 반환하는 함수
const getDailyShape = () => {
  const shapes = [
    { name: "정사각형", type: "square" },
    { name: "정삼각형", type: "triangle" },
    { name: "원", type: "circle" }
  ];
  
  // 현재 날짜를 기준으로 인덱스 계산 (매일 자정에 바뀜)
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  const shapeIndex = daysSinceEpoch % shapes.length;
  
  return shapes[shapeIndex];
};

export default function DailyMode() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

  const [dailyShape] = useState(getDailyShape());

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

  const [selectedShape, setSelectedShape] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }

    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleInsertImg = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();      // 기본 동작(파일 열기) 막기
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleSelectShape = (shape) => {
    setSelectedShape(shape);
    console.log(`${shape} 선택됨, 여기에 모델 돌리기`);
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`content-grid ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {/* 왼쪽 오늘의 도형 */}
      <div className="content-left">
        <div className="daily-shape-box">
          <div className="daily-shape-title">오늘의 도형</div>
          <div className="daily-shape-display">
            <svg viewBox="0 0 200 200" className="shape-svg">
              {dailyShape.type === "square" && (
                <rect x="50" y="50" width="100" height="100" fill="currentColor" />
              )}
              {dailyShape.type === "triangle" && (
                <polygon points="100,40 40,160 160,160" fill="currentColor" />
              )}
              {dailyShape.type === "circle" && (
                <circle cx="100" cy="100" r="60" fill="currentColor" />
              )}
            </svg>
          </div>
          <div className="daily-shape-label">{dailyShape.name}</div>
        </div>
      </div>

      {/* 가운데 실제 콘텐츠 */}
      <div className="content-center">
        <div className="center-box">
          <div className={`img-space ${isDragging ? "img-space-dragging" : ""}`}
            id="imgSpace"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
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
                <a className="center-box-description">
                  주어진 도형에 맞게 사진을 넣어 결과값을 확인해 보세요
                </a>
              </>
            )}
          </div>
        </div>

        <div className="output-area">
          {imageUrl ? (
            <a>개발중입니다. ㅈㅅ</a>
          ) : (
            <a>사진을 올려야 평가를 하든 머든 하죠 이건 뭐 저랑 싸우자는 건가요?</a>
          )}
          {selectedShape && imageUrl && (
            <div style={{ marginTop: "10px", fontWeight: 500 }}>
              선택된 도형: {selectedShape}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 여백/추가 공간 */}
      <div className="content-right">
        <button className="shape-selection-section" onClick={() => alert('실행 기능 개발중')}>
          실행
        </button>
        <button className="shape-selection-section" onClick={handleReset}>
          리셋
        </button>
      </div>
    </div>
  );
}