// Compete Mode (최종 완성본)
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/compete.css";

const API = "http://127.0.0.1:8000";

// CLIP 라벨과 한글 이름 매핑
const SHAPES = [
  { ko: "구", clip: "sphere" },
  { ko: "큐브", clip: "cube" },
  { ko: "원기둥", clip: "cylinder" },
  { ko: "원뿔", clip: "cone" },
  { ko: "피라미드", clip: "pyramid" },
  { ko: "토러스", clip: "torus" },
];

export default function CompeteMode() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("shapehunter-theme") || "light"
  );

  useEffect(() => {
    const handleStorage = () => {
      setTheme(localStorage.getItem("shapehunter-theme") || "light");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ---------------- 상태 ----------------
  const [selectedShape, setSelectedShape] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [lastFile, setLastFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const [confidence, setConfidence] = useState(null);
  const [ranking, setRanking] = useState([]);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState("");

  // ==========================================================
  // 🟩 페이지 진입 시 자동으로 랭킹 불러오기
  // ==========================================================
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch(`${API}/ranking/top10`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setRanking(data);
        } else {
          setRanking([]);
        }
      } catch (e) {
        console.error("랭킹 로드 오류:", e);
        setRanking([]);
      }
    };

    fetchRanking();
  }, []);

  // ---------------- 이미지 처리 ----------------
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
    setLastFile(file);
    setConfidence(null);
    setSelectedShape(null);
  };

  const handleFileChange = (e) => processFile(e.target.files?.[0]);
  const handleInsertImg = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // ---------------- CLIP 분석 + DB 저장 ----------------
  const analyzeAndSubmit = async (shapeObj) => {
    try {
      if (!lastFile) {
        alert("이미지를 먼저 업로드 해 주세요.");
        return;
      }

      const formData = new FormData();
      formData.append("file", lastFile);

      const res = await fetch(`${API}/visualize`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const target = data.predictions.find(
        (p) => p.label === shapeObj.clip
      );

      const myConfidence = target?.confidence ?? 0;
      setConfidence(myConfidence);

      const user = JSON.parse(localStorage.getItem("kcu_current_user"));

      await fetch(`${API}/compete/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.identifier,
          shape: shapeObj.clip,
          confidence: myConfidence,
        }),
      });

      const rankRes = await fetch(`${API}/ranking/top10`);
      const rankData = await rankRes.json();
      setRanking(rankData);

    } catch (err) {
      console.error(err);
      alert("분석 중 오류가 발생했습니다.");
    }
  };

  const handleShapeSelect = (shape) => {
    setSelectedShape(shape);
    setShowPicker(false);
    analyzeAndSubmit(shape);
  };

  // ---------------- 실행 버튼 ----------------
  const handleExecute = () => {
    const user = localStorage.getItem("kcu_current_user");
    if (!user) {
      setPickerType("login");
      setShowPicker(true);
      return;
    }

    if (!imageUrl || !lastFile) {
      setPickerType("image");
      setShowPicker(true);
      return;
    }

    setPickerType("shape");
    setShowPicker(true);
  };

  // ---------------- 리셋 ----------------
  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setLastFile(null);
    setConfidence(null);
    setSelectedShape(null);
    setRanking([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------- 렌더링 ----------------
  return (
    <div
      className={`content-grid compete-grid ${
        theme === "dark" ? "theme-dark" : "theme-light"
      }`}
    >

      {/* 좌측 랭킹 */}
      <div className="content-left">
        <div className="ranking">
          <div className="ranking-title">랭킹 Top10</div>
          <div className="ranking-list">
            {ranking.length === 0 ? (
              <div className="ranking-item">아직 기록이 없습니다.</div>
            ) : (
              ranking.map((item) => (
                <div key={item.rank} className="ranking-item">
                  {item.rank}. {item.user_id}
                  <span className="ranking-score">
                    {(item.score * 100).toFixed(1)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 중앙 */}
      <div className="content-center">
        <div className="center-box">
          <div
            className={`img-space ${isDragging ? "img-space-dragging" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {imageUrl ? (
              <img src={imageUrl} className="uploaded-img" alt="업로드 이미지" />
            ) : (
              <>
                <button id="insertImg" onClick={handleInsertImg}>
                  사진 넣기
                </button>
                <a className="center-box-description">
                  사진을 넣어 점수를 확인하세요!
                </a>
              </>
            )}
          </div>
        </div>

        <div className="output-area">
          {confidence !== null && (
            <div>
              <h3>내 점수</h3>
              <div>{(confidence * 100).toFixed(2)}%</div>
              {selectedShape && (
                <div style={{ marginTop: 8 }}>
                  선택 도형: {selectedShape.ko} ({selectedShape.clip})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 버튼 */}
      <div className="content-right">
        <button className="shape-selection-section" onClick={handleExecute}>
          실행
        </button>
        <button className="shape-selection-section" onClick={handleReset}>
          리셋
        </button>
      </div>

      {/* 모달 */}
      {showPicker && (
        <div className="shape-picker-overlay" onClick={() => setShowPicker(false)}>
          <div className="shape-picker" onClick={(e) => e.stopPropagation()}>

            {pickerType === "login" && (
              <>
                <h3>로그인이 필요합니다</h3>
                <button
                  onClick={() => navigate("/login")}
                  className="shape-selection-section"
                >
                  로그인하러 가기
                </button>
                <button
                  onClick={() => setShowPicker(false)}
                  className="shape-selection-section"
                >
                  취소
                </button>
              </>
            )}

            {pickerType === "image" && (
              <>
                <h3>사진을 먼저 넣어주세요</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="shape-selection-section"
                >
                  확인
                </button>
              </>
            )}

            {pickerType === "shape" && (
              <>
                <h3>어떤 도형으로 대결하실 건가요?</h3>
                <div className="shape-picker-buttons">
                  {SHAPES.map((shape) => (
                    <button
                      key={shape.clip}
                      onClick={() => handleShapeSelect(shape)}
                      className="shape-selection-section"
                    >
                      {shape.ko}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowPicker(false)}
                  className="shape-selection-section"
                  style={{ marginTop: 12 }}
                >
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
