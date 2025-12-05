// Default Mode
import { useRef, useState, useEffect } from "react";
import { API_ENDPOINTS, apiFetch } from "../config/api";
import "../styles/pages/default.css";

export default function DefaultMode() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shapehunter-theme") || "light";
  });

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

  // -------------------------------
  // 이미지 업로드 처리
  // -------------------------------
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

    // 자동 분석 제거 - 실행 버튼으로 도형 선택 후 분석
  };

  const handleInsertImg = () => fileInputRef.current?.click();

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // -------------------------------
  // 도형 선택
  // -------------------------------
  const [showPicker, setShowPicker] = useState(false);
  const [pickerError, setPickerError] = useState("");

  const openPickerChecked = () => {
    setPickerError("");
    if (!imageUrl) {
      setPickerError("사진을 먼저 넣어주세요");
      setShowPicker(true);
      return;
    }
    setShowPicker(true);
  };

  const handleSelectShape = async (shape) => {
    setSelectedShape(shape);
    setShowPicker(false);
    
    // 도형 선택 후 이미지 분석 실행
    if (imageUrl && fileInputRef.current?.files?.[0]) {
      await sendToBackend(fileInputRef.current.files[0]);
    }
  };

  // -------------------------------
  // 리셋
  // -------------------------------
  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setResult(null);
    setSelectedShape(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`content-grid ${theme === "retro" ? "theme-retro" : theme === "christmas" ? "theme-christmas" : theme === "dark" ? "theme-dark" : "theme-light"}`}>
     <div className="content-left">
      <div className="mode-panel">
        <div className="mode-panel-top">
          <div className="mode-title">Geome Battle</div>
          <span className="mode-pill">Default Mode</span>
        </div>

        <div className="mode-subtitle">
          사진 업로드 → 도형 선택 → AI 판별 결과 확인
        </div>

        <div className="mode-steps">
          <div className="mode-step">
            <span className="step-num">1</span>
            <span className="step-text">사진 업로드</span>
          </div>
          <div className="mode-step">
            <span className="step-num">2</span>
            <span className="step-text">도형 선택</span>
          </div>
          <div className="mode-step">
            <span className="step-num">3</span>
            <span className="step-text">결과 확인</span>
          </div>
        </div>
      </div>
    </div>


      <div className="content-center">
        <div className="center-box">
          <div
            className={`img-space ${isDragging ? "img-space-dragging" : ""}`}
            id="imgSpace"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {imageUrl ? (
              <img
                src={imageUrl}
                alt="업로드 이미지"
                className="uploaded-img"
                onLoad={() => URL.revokeObjectURL(imageUrl)}
              />
            ) : (
              <>
                <button id="insertImg" onClick={handleInsertImg}>
                  사진 넣기
                </button>
                <a className="center-box-description">
                  사진을 넣어 결과값을 확인해 보세요
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
          {result && selectedShape && (
            <div style={{ marginTop: "20px", fontSize: "17px", lineHeight: "26px" }}>
              {(() => {
                const topShape = result.top3[0];
                const isCorrect = topShape.label === selectedShape;
                
                return (
                  <>
                    <h3 style={{ color: isCorrect ? "#4CAF50" : "#FF5722" }}>
                      {isCorrect 
                        ? `${selectedShape}이(가) 맞네요! 🎉` 
                        : `${selectedShape}은(는) 아닌것 같아요ㅠㅠ 😢`}
                    </h3>
                    
                    <div style={{ marginTop: "15px" }}>
                      <strong>🔍 분석 결과:</strong>
                      {result.top3.map((item, idx) => (
                        <div key={idx} style={{ 
                          marginTop: "8px",
                          fontWeight: item.label === selectedShape ? "bold" : "normal",
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
            <a>사진을 올리면 이곳에 결과가 나옵니다</a>
          )}

          {imageUrl && !selectedShape && (
            <a>실행 버튼을 눌러 도형을 선택해주세요</a>
          )}
        </div>
      </div>

      <div className="content-right">
        <button className="shape-selection-section" onClick={openPickerChecked}>
          실행
        </button>
        <button className="shape-selection-section" onClick={handleReset}>
          리셋
        </button>
      </div>

      {showPicker && (
        <div className="shape-picker-overlay" onClick={() => setShowPicker(false)}>
          <div className="shape-picker" onClick={(e) => e.stopPropagation()}>
            {pickerError ? (
              <>
                <h3>{pickerError}</h3>
                <button onClick={() => setShowPicker(false)} className="shape-selection-section">
                  확인
                </button>
              </>
            ) : (
              <>
                <h3>도형을 선택하세요</h3>
                <div className="shape-picker-buttons">
                  <div className="shape-row">
                    <button
                      onClick={() => handleSelectShape("원")}
                      className="shape-selection-section"
                    >
                      원
                    </button>
                    <button
                      onClick={() => handleSelectShape("사각형")}
                      className="shape-selection-section"
                    >
                      사각형
                    </button>
                    <button
                      onClick={() => handleSelectShape("원기둥")}
                      className="shape-selection-section"
                    >
                      원기둥
                    </button>
                  </div>
                  <div className="shape-row">
                    <button
                      onClick={() => handleSelectShape("원뿔")}
                      className="shape-selection-section"
                    >
                      원뿔
                    </button>
                    <button
                      onClick={() => handleSelectShape("삼각형")}
                      className="shape-selection-section"
                    >
                      삼각형
                    </button>
                    <button
                      onClick={() => handleSelectShape("도넛")}
                      className="shape-selection-section"
                    >
                      도넛
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowPicker(false)} className="shape-selection-section">
                  취소
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
