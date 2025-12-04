// Compete Mode (최종 완성본)
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiFetch } from "../config/api";
import "../styles/pages/compete.css"; // 페이지 전용 스타일

// 도형 데이터
const SHAPES = [
  { ko: "원", clip: "sphere" },
  { ko: "사각형", clip: "cube" },
  { ko: "원기둥", clip: "cylinder" },
  { ko: "원뿔", clip: "cone" },
  { ko: "삼각형", clip: "pyramid" },
  { ko: "도넛", clip: "torus" }
];

const API = "http://localhost:8000";

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

  // 랭킹 상세 정보 상태
  const [showRankingDetail, setShowRankingDetail] = useState(false);
  const [selectedRankingItem, setSelectedRankingItem] = useState(null);

  // 대결 결과 상태
  const [opponentImage, setOpponentImage] = useState(null);
  const [opponentConfidence, setOpponentConfidence] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleMessage, setBattleMessage] = useState("");

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

  // -------- 대결 결과 결정 --------
  const determineBattleResult = (myConf, opponentConf) => {
    const diff = myConf - opponentConf;
    
    if (diff > 0.15) {
      setBattleResult("WIN");
      setBattleMessage("🎉 승리! 상대방보다 더 정확하게 맞췄어요!");
    } else if (diff > 0.05) {
      setBattleResult("WIN");
      setBattleMessage("✨ 승리! 간신히 이겼네요!");
    } else if (diff >= -0.05) {
      setBattleResult("DRAW");
      setBattleMessage("🤝 동점! 정확도가 거의 같아요!");
    } else if (diff >= -0.15) {
      setBattleResult("LOSE");
      setBattleMessage("💔 패배... 거의 비겼는데 아쉬워요!");
    } else {
      setBattleResult("LOSE");
      setBattleMessage("😢 패배... 상대방이 훨씬 정확했어요!");
    }
  };

  // -------- 임의의 상대방 이미지 생성 (시뮬레이션) --------
  const generateOpponentImage = () => {
    // 무작위 이미지 서비스 활용
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/300/300?random=${randomId}`;
  };

  // -------- CLIP 분석 + DB 저장 --------
  const analyzeAndSubmit = async (shapeObj) => {
    try {
      if (!lastFile) {
        alert("이미지를 먼저 업로드 해 주세요.");
        return;
      }

      const formData = new FormData();
      formData.append("file", lastFile);

      const res = await fetch(`${API}/visualize/visualize`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("API 응답 데이터:", data);
      console.log("선택한 도형:", shapeObj);

      const target = data.predictions.find(
        (p) => p.label === shapeObj.ko
      );

      console.log("찾은 타겟:", target);

      const myConfidence = target?.confidence ?? 0;
      console.log("내 점수:", myConfidence);
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

      // 상대방 정보 생성 (시뮬레이션)
      const opponentConf = Math.random() * 0.8 + 0.2; // 0.2 ~ 1.0
      setOpponentImage(generateOpponentImage());
      setOpponentConfidence(opponentConf);
      determineBattleResult(myConfidence, opponentConf);

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

  // -------- 랭킹 항목 클릭 핸들러 --------
  const handleRankingClick = (item) => {
    if (item) {
      setSelectedRankingItem(item);
      setShowRankingDetail(true);
    }
  };

  // -------- 실행 버튼 --------
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

  // -------- 리셋 --------
  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setLastFile(null);
    setConfidence(null);
    setSelectedShape(null);
    setOpponentImage(null);
    setOpponentConfidence(null);
    setBattleResult(null);
    setBattleMessage("");
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
            {Array.from({ length: 10 }).map((_, index) => {
              const item = ranking[index];
              return (
                <div 
                  key={index} 
                  className={`ranking-item ${item ? 'ranking-item-clickable' : ''}`}
                  onClick={() => handleRankingClick(item)}
                >
                  {item ? (
                    <>
                      {item.rank}. {item.user_id}
                    </>
                  ) : (
                    <>
                      {index + 1}. -
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 중앙 */}
      <div className="content-center">
        <div className="center-box">
          {confidence !== null && battleResult ? (
            // 대결 화면 표시
            <div className="vs-container">
              {/* 내 사진 */}
              <div className="my-side">
                <img src={imageUrl} alt="내 사진" className="battle-img" />
                <div className="score-display">
                  {(confidence * 100).toFixed(1)}%
                </div>
                <div className="label">나</div>
              </div>

              {/* VS */}
              <div className="vs-text">VS</div>

              {/* 상대 사진 */}
              <div className="opponent-side">
                <img src={opponentImage} alt="상대 사진" className="battle-img" />
                <div className="score-display">
                  {(opponentConfidence * 100).toFixed(1)}%
                </div>
                <div className="label">상대</div>
              </div>
            </div>
          ) : (
            // 이미지 업로드 영역
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
          )}
        </div>

        <div className="output-area">
          {confidence !== null && battleResult ? (
            // 대결 결과만 표시
            <div className="battle-result-only">
              <div className={`battle-message ${battleResult.toLowerCase()}`}>
                {battleMessage}
              </div>
              {selectedShape && (
                <div style={{ marginTop: 12, fontSize: 14 }}>
                  선택 도형: {selectedShape.ko}
                </div>
              )}
            </div>
          ) : (
            <a className="center-box-description">사진을 넣어 대결하세요!</a>
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
                  <div className="shape-row">
                    <button
                      onClick={() => handleShapeSelect(SHAPES[0])}
                      className="shape-selection-section"
                    >
                      원
                    </button>
                    <button
                      onClick={() => handleShapeSelect(SHAPES[1])}
                      className="shape-selection-section"
                    >
                      사각형
                    </button>
                    <button
                      onClick={() => handleShapeSelect(SHAPES[2])}
                      className="shape-selection-section"
                    >
                      원기둥
                    </button>
                  </div>
                  <div className="shape-row">
                    <button
                      onClick={() => handleShapeSelect(SHAPES[3])}
                      className="shape-selection-section"
                    >
                      원뿔
                    </button>
                    <button
                      onClick={() => handleShapeSelect(SHAPES[4])}
                      className="shape-selection-section"
                    >
                      삼각형
                    </button>
                    <button
                      onClick={() => handleShapeSelect(SHAPES[5])}
                      className="shape-selection-section"
                    >
                      도넛
                    </button>
                  </div>
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

      {/* 랭킹 상세 정보 모달 */}
      {showRankingDetail && selectedRankingItem && (
        <div className="shape-picker-overlay" onClick={() => setShowRankingDetail(false)}>
          <div className="shape-picker ranking-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h3>랭킹 상세 정보</h3>
            <div className="ranking-detail-content">
              <div className="ranking-detail-row">
                <span className="detail-label">순위:</span>
                <span className="detail-value">{selectedRankingItem.rank}위</span>
              </div>
              <div className="ranking-detail-row">
                <span className="detail-label">사용자:</span>
                <span className="detail-value">{selectedRankingItem.user_id}</span>
              </div>
              <div className="ranking-detail-row">
                <span className="detail-label">점수:</span>
                <span className="detail-value">{(selectedRankingItem.score * 100).toFixed(2)}%</span>
              </div>
              {selectedRankingItem.shape && (
                <div className="ranking-detail-row">
                  <span className="detail-label">도형:</span>
                  <span className="detail-value">{selectedRankingItem.shape}</span>
                </div>
              )}
              {selectedRankingItem.date && (
                <div className="ranking-detail-row">
                  <span className="detail-label">날짜:</span>
                  <span className="detail-value">{new Date(selectedRankingItem.date).toLocaleString('ko-KR')}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowRankingDetail(false)}
              className="shape-selection-section"
              style={{ marginTop: 16 }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
