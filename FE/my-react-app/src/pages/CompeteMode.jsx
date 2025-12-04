// Compete Mode
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiFetch } from "../config/api";
import "../styles/pages/compete.css"; // 페이지 전용 스타일

export default function CompeteMode() {
  const navigate = useNavigate();
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
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState(""); // "login", "image", "shape"
  
  // 매칭 관련 상태
  const [isMatching, setIsMatching] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null); // { match_id, opponent_id }
  const [matchResult, setMatchResult] = useState(null); // ML 분석 결과

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

  const handleSelectShape = (shape) => {
    setSelectedShape(shape);
    console.log(`${shape} 선택됨, 여기에 모델 돌리기`);
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

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExecute = () => {
    // 로그인 체크 - Layout.jsx와 동일한 키 사용
    const currentUser = localStorage.getItem("kcu_current_user");
    if (!currentUser) {
      setPickerType("login");
      setShowPicker(true);
      return;
    }

    // 이미지 체크
    if (!imageUrl) {
      setPickerType("image");
      setShowPicker(true);
      return;
    }

    // 도형 선택
    setPickerType("shape");
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  const handleShapeSelect = (shape) => {
    setSelectedShape(shape);
    console.log(`${shape} 선택됨, 여기에 모델 돌리기`);
    closePicker();
    
    // 매칭 시작
    startMatching();
  };

  // 매칭 시작
  const startMatching = async () => {
    const currentUser = JSON.parse(localStorage.getItem("kcu_current_user") || "{}");
    const userId = currentUser.identifier;

    if (!userId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    setIsMatching(true);

    try {
      const result = await apiFetch(API_ENDPOINTS.matchJoin, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });

      if (result.status === "matched") {
        setMatchInfo({
          match_id: result.match_id,
          opponent_id: result.opponent_id,
        });
        alert(`매칭 성공! 상대: ${result.opponent_id}`);
        
        // 이미지 분석 시작
        if (imageUrl && fileInputRef.current?.files?.[0]) {
          await analyzeImage(fileInputRef.current.files[0]);
        }
      } else {
        alert("상대를 기다리는 중입니다...");
        // 실제로는 폴링이나 WebSocket으로 매칭 완료 대기
      }
    } catch (error) {
      console.error("매칭 오류:", error);
      alert("매칭 중 오류가 발생했습니다.");
    } finally {
      setIsMatching(false);
    }
  };

  // 이미지 분석
  const analyzeImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_ENDPOINTS.visualize, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMatchResult(data.predictions);
      
      // 점수 계산 (예: 선택한 도형의 confidence)
      const selectedShapeData = data.predictions.find(
        p => p.label.toLowerCase() === selectedShape.toLowerCase()
      );
      
      if (selectedShapeData) {
        const score = selectedShapeData.confidence * 100;
        alert(`분석 완료! 점수: ${score.toFixed(2)}점`);
        
        // TODO: 상대방 점수와 비교하여 승패 결정
        // saveMatchResult(matchInfo.match_id, winner_id, loser_id);
      }
    } catch (error) {
      console.error("이미지 분석 오류:", error);
      alert("이미지 분석 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={`content-grid ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {/* 왼쪽 랭킹 표시 */}
        <div className="content-left">
            <div className="ranking">
                <div className="ranking-title">랭킹</div>

                <div className="ranking-list">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="ranking-item">
                        {/* 여기 나중에 랭킹 데이터 들어갈 자리 */}
                        {i+1}.
                        </div>
                    ))}
            </div>
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
                  사진을 넣어 더 나은 점수를 얻으세요
                </a>
              </>
            )}
          </div>
        </div>

        <div className="output-area">
          {imageUrl ? (
            <a>실행 버튼을 눌러주세요</a>
          ) : (
            <a>사진을 먼저 올려주세요</a>
          )}
          {(selectedShape && imageUrl) && (
            <div style={{ marginTop: "10px", fontWeight: 500 }}>
              선택된 도형: {selectedShape}
            </div>
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

      {/* 팝업 모달 */}
      {showPicker && (
        <div className="shape-picker-overlay" onClick={closePicker}>
          <div className="shape-picker" onClick={(e) => e.stopPropagation()}>
            {pickerType === "login" && (
              <>
                <h3>로그인이 필요한 시스템 입니다</h3>
                <div style={{marginTop: 16}}>
                  <button 
                    onClick={() => navigate("/login")} 
                    className="shape-selection-section"
                  >
                    로그인하러 가기
                  </button>
                  <button 
                    onClick={closePicker} 
                    className="shape-selection-section"
                    style={{marginTop: 8}}
                  >
                    취소
                  </button>
                </div>
              </>
            )}
            
            {pickerType === "image" && (
              <>
                <h3>사진을 먼저 넣어주세요</h3>
                <div style={{marginTop: 16}}>
                  <button 
                    onClick={closePicker} 
                    className="shape-selection-section"
                  >
                    확인
                  </button>
                </div>
              </>
            )}
            
            {pickerType === "shape" && (
              <>
                <h3>어떤 도형으로 대결하실 건가요?</h3>
                <div className="shape-picker-buttons">
                  <div className="shape-row">
                    <button 
                      onClick={() => handleShapeSelect('원')} 
                      className="shape-selection-section"
                    >
                      원
                    </button>
                    <button 
                      onClick={() => handleShapeSelect('사각형')} 
                      className="shape-selection-section"
                    >
                      사각형
                    </button>
                    <button 
                      onClick={() => handleShapeSelect('원기둥')} 
                      className="shape-selection-section"
                    >
                      원기둥
                    </button>
                  </div>
                  <div className="shape-row">
                    <button 
                      onClick={() => handleShapeSelect('원뿔')} 
                      className="shape-selection-section"
                    >
                      원뿔
                    </button>
                    <button 
                      onClick={() => handleShapeSelect('삼각형')} 
                      className="shape-selection-section"
                    >
                      삼각형
                    </button>
                    <button 
                      onClick={() => handleShapeSelect('도넛')} 
                      className="shape-selection-section"
                    >
                      도넛
                    </button>
                  </div>
                </div>
                <div style={{marginTop: 12}}>
                  <button 
                    onClick={closePicker} 
                    className="shape-selection-section"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}