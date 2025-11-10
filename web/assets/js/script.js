// 메인 메뉴
const insertImg = document.getElementById("insertImg");
const imgSpace = document.getElementById("imgSpace");

// 도형 선택
const tetrahedron = document.getElementById("tetrahedron");
const cube = document.getElementById("cube");
const sphere = document.getElementById("sphere");

const predicted = null; // 모델 예상치
const graph = null; // 예상치 기반 그림으로 표시

// 사이드바 메뉴
const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");
const defaultMode = document.getElementById("defaultMode");
const ggalSsamMode = document.getElementById("ggalSsamMode");
const option = documetn.getElementById("option");

insertImg.addEventListener("click", () => {
  // TODO
  // 여기다가 사진 넣고 박스 안에 넣기
  
});

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

defaultMode.addEventListener("click", () => {
  // TODO
  // 기본모드로 페이지 전환
  // 메인 블럭 따로 나눠놔서 거기에다가 띄워도 되고
  
});

ggalSsamMode.addEventListener("click", () => {
  // TODO
  // 깔쌈모드로 페이지 전환
  
});

option.addEventListener("click", () => {
  // TODO
  // 옵션 페이지 띄우기/전환
  // 옵션 설정한거 저장
  
});


// 도형 선택 머신러닝 모델 돌려야 돼요!
tetrahedron.addEventListener("click", () => {
  // predicted = run.tetrahedron();

});

cube.addEventListener("click", () => {
  // run.cube();
});

sphere.addEventListener("click", () => {
  // run.sphere();
});
