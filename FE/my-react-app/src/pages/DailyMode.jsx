// Daily Mode
import { useRef, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";
import "../styles/pages/daily.css"; // 페이지 전용 스타일

// 매일 다른 도형을 반환하는 함수
const getDailyShape = () => {
  const shapes = [
    { name: "원", type: "circle" },
    { name: "사각형", type: "square" },
    { name: "원기둥", type: "cylinder" },
    { name: "원뿔", type: "cone" },
    { name: "삼각형", type: "triangle" },
    { name: "도넛", type: "torus" }
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

  const [result, setResult] = useState(null); // ML 결과
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------
  // 🔥 ML 결과 Top3 + 그 외 계산 함수
  // -------------------------------
  const processPredictionResult = (predictions) => {
    if (!predictions) return null;

    const sorted = [...predictions].sort(
      (a, b) => b.confidence - a.confidence
    );

    const top3 = sorted.slice(0, 3);
    const etc = sorted.slice(3).reduce((acc, p) => acc + p.confidence, 0);

    return { top3, etc };
  };

  // -------------------------------
  // 🔥 Backend로 이미지 보내기
  // -------------------------------
  const sendToBackend = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.visualize, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("백엔드 응답:", data);

      // ML 결과 처리
      const processed = processPredictionResult(data.predictions);
      setResult(processed);

    } catch (error) {
      console.error("백엔드 오류:", error);
      alert("서버 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 실행 버튼 - 오늘의 도형으로 자동 분석
  const handleExecute = async () => {
    if (!imageUrl) {
      alert("사진을 먼저 넣어주세요");
      return;
    }

    if (fileInputRef.current?.files?.[0]) {
      await sendToBackend(fileInputRef.current.files[0]);
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
              {dailyShape.type === "circle" && (
                <circle cx="100" cy="100" r="60" fill="currentColor" />
              )}
              {dailyShape.type === "square" && (
                <rect x="50" y="50" width="100" height="100" fill="currentColor" />
              )}
              {dailyShape.type === "triangle" && (
                <polygon points="100,40 40,160 160,160" fill="currentColor" />
              )}
              {dailyShape.type === "cylinder" && (
                <>
                  <ellipse cx="100" cy="60" rx="50" ry="15" fill="currentColor" />
                  <rect x="50" y="60" width="100" height="80" fill="currentColor" />
                  <ellipse cx="100" cy="140" rx="50" ry="15" fill="currentColor" />
                </>
              )}
              {dailyShape.type === "cone" && (
                <>
                  <polygon points="100,40 50,140 150,140" fill="currentColor" />
                  <ellipse cx="100" cy="140" rx="50" ry="15" fill="currentColor" />
                </>
              )}
              {dailyShape.type === "torus" && (
                <>
                  <circle cx="100" cy="100" r="60" fill="currentColor" />
                  <circle cx="100" cy="100" r="35" fill="var(--card-bg)" />
                </>
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
          {/* 로딩 상태 */}
          {isLoading && (
            <p style={{ marginTop: "15px" }}>AI가 이미지를 분석 중입니다... ⏳</p>
          )}

          {/* 결과 출력 */}
          {result && (
            <div style={{ marginTop: "20px", fontSize: "17px", lineHeight: "26px" }}>
              {(() => {
                const topShape = result.top3[0];
                const isCorrect = topShape.label === dailyShape.name;
                
                // 오늘의 도형의 confidence 찾기
                const dailyShapeData = result.top3.find(item => item.label === dailyShape.name);
                const confidence = dailyShapeData ? dailyShapeData.confidence * 100 : 0;
                
                // confidence에 따른 메시지
                let message = "";
                let messageColor = "#FF5722";
                
                if (isCorrect) {
                  if (confidence >= 70) {
                    message = `오늘의 도형인 ${dailyShape.name}이(가) 맞는것 같아요!`;
                    messageColor = "#4CAF50";
                  } else if (confidence >= 40) {
                    message = `오늘의 도형인 ${dailyShape.name}인것 같긴한데 맞을까요..?`;
                    messageColor = "#FF9800";
                  } else if (confidence >= 20) {
                    message = `오늘의 도형인 ${dailyShape.name}이(가) 어느정도 맞아는 보이네요`;
                    messageColor = "#FFC107";
                  } else {
                    message = `오늘의 도형인 ${dailyShape.name}은(는) 아닌것 같아요`;
                    messageColor = "#FF5722";
                  }
                } else {
                  message = `오늘의 도형인 ${dailyShape.name}은(는) 아닌것 같아요`;
                }
                
                return (
                  <>
                    <h3 style={{ color: messageColor }}>
                      {message}
                    </h3>
                    
                    <div style={{ marginTop: "15px" }}>
                      <strong>🔍 분석 결과:</strong>
                      {result.top3.map((item, idx) => (
                        <div key={idx} style={{ 
                          marginTop: "8px",
                          fontWeight: item.label === dailyShape.name ? "bold" : "normal",
                          color: item.label === topShape.label ? "#2196F3" : "inherit"
                        }}>
                          {idx + 1}. {item.label}: {(item.confidence * 100).toFixed(2)}%
                        </div>
                      ))}
                      <div style={{ marginTop: "10px", fontSize: "15px", opacity: 0.7 }}>
                        그 외: {(result.etc * 100).toFixed(2)}%
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {!imageUrl && (
            <a>오늘의 도형에 따라 사진을 찍어서 올려주세요</a>
          )}

          {imageUrl && !result && !isLoading && (
            <a>실행 버튼을 눌러 분석을 시작하세요</a>
          )}
        </div>
      </div>

      {/* 오른쪽 여백/추가 공간 */}
      <div className="content-right">
        <button className="shape-selection-section" onClick={handleExecute}>
          실행
        </button>
        <button className="shape-selection-section" onClick={handleReset}>
          리셋
        </button>
      </div>
    </div>
  );
}