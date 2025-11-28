// Default Mode
import { useRef, useState, useEffect } from "react";
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
      const response = await fetch("http://127.0.0.1:8000/visualize", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("🔥 백엔드 응답:", data);

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

    sendToBackend(file); // 🔥 업로드 시 자동 ML 분석
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

  const handleSelectShape = (shape) => {
    setSelectedShape(shape);
    setShowPicker(false);
  };

  // -------------------------------
  // 리셋
  // -------------------------------
  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setResult(null);
    fileInputRef.current.value = "";
  };

  return (
    <div className={`content-grid ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <div className="content-left"></div>

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
          {result && (
            <div style={{ marginTop: "20px", fontSize: "17px", lineHeight: "26px" }}>
              <h3>🔍 분석 결과</h3>

              {result.top3.map((item, idx) => (
                <div key={idx}>
                  {item.label}: {(item.confidence * 100).toFixed(2)}%
                </div>
              ))}

              <strong style={{ marginTop: "10px", display: "block" }}>
                그 외: {(result.etc * 100).toFixed(2)}%
              </strong>
            </div>
          )}

          {!imageUrl && (
            <a>사진을 올리면 이곳에 결과가 나옵니다</a>
          )}

          {selectedShape && imageUrl && (
            <div style={{ marginTop: "10px", fontWeight: 500 }}>
              선택된 도형: {selectedShape}
            </div>
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
                  <button
                    onClick={() => handleSelectShape("삼각형")}
                    className="shape-selection-section"
                  >
                    삼각형
                  </button>
                  <button
                    onClick={() => handleSelectShape("사각형")}
                    className="shape-selection-section"
                  >
                    사각형
                  </button>
                  <button
                    onClick={() => handleSelectShape("원")}
                    className="shape-selection-section"
                  >
                    원
                  </button>
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
