// src/pages/CompeteMode.jsx
import { useRef, useState } from "react";
import "../App.css"; // 스타일 필요하면 경로 맞춰서

export default function CompeteMode() {
  const [selectedShape, setSelectedShape] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [mode, setMode] = useState("default"); // 일단 내부에서만 사용
  const fileInputRef = useRef(null);

  const handleInsertImg = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
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
    <div className="content-grid">
      {/* 왼쪽 랭킹 표시 */}
      <div className="content-left">
        <div className="ranking">
            {/* db에 따라 랭킹 달라짐*/}
        </div>
      </div>

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
          {mode === "default" && (
            <a>사진을 올려야 평가를 하든 머든 하죠 이건 뭐 저랑 싸우자는 건가요?</a>
          )}
          {mode === "compete" && (
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
          onClick={handleReset}
        >
          리셋
        </button>
      </div>
    </div>
  );
}
