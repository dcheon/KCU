# 이미지 분류( Image Classification ) 스타터 프로젝트

이 저장소는 **VS Code + Python** 환경에서 바로 시작할 수 있는 *이미지 분류* 예제 프로젝트입니다.  
초보자도 단계별로 따라 할 수 있도록 구성했습니다.

## 1) 필수 설치
- Python 3.10 이상
- VS Code (확장: *Python*, *Pylance*, *Jupyter* 권장)
- (선택) NVIDIA GPU가 있다면 CUDA에 맞는 PyTorch 설치

## 2) 프로젝트 열기 & 가상환경 만들기

터미널에서 프로젝트 폴더로 이동한 뒤:

### Windows
```powershell
python -m venv .venv
.venv\Scripts\activate
```

### macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
```

가상환경 활성화 후 라이브러리 설치:
```bash
pip install -r requirements.txt
```

> GPU를 사용하려면 환경에 맞는 PyTorch를 설치하세요. (처음엔 CPU만으로도 충분합니다.)

## 3) 빠른 시작 (CIFAR-10 예제)
데이터를 별도로 준비하지 않고도 **CIFAR-10**(자동 다운로드)으로 바로 학습해볼 수 있습니다.
```bash
python src/train.py --use_cifar10 --epochs 3
```

학습 결과(가중치, 로그)는 `outputs/`에 저장됩니다.

## 4) 내 데이터로 학습하기 (ImageFolder 형식)
아래처럼 폴더를 구성하세요:
```
data/
  train/
    classA/
      a001.jpg
      a002.jpg
      ...
    classB/
      b001.jpg
      ...
  val/
    classA/
    classB/
```

그 다음:
```bash
python src/train.py --data_dir data --epochs 10 --batch_size 32
```

## 5) 추론(예측) 실행
단일 이미지에 대해 예측하려면(모델이 학습된 후):
```bash
python src/infer.py --checkpoint outputs/best.pt --label_map outputs/labels.json --image path/to/image.jpg
```

## 6) 자주 쓰는 옵션
- `--epochs`: 에폭 수 (기본: 5)
- `--batch_size`: 배치 크기 (기본: 32)
- `--lr`: 학습률 (기본: 1e-3)
- `--img_size`: 입력 이미지 크기 (기본: 224)
- `--num_workers`: DataLoader의 워커 수 (기본: 2; Windows는 0 권장)

## 7) 폴더 구조
```
image-classification-starter/
├─ src/
│  ├─ train.py       # 학습 스크립트 (CIFAR-10 또는 ImageFolder 지원)
│  └─ infer.py       # 단일 이미지 추론
├─ outputs/          # 체크포인트, 로그 저장
├─ requirements.txt  # 필요한 파이썬 패키지
└─ README.md
```

## 8) 다음 단계 아이디어
- 전이학습(ResNet50, ViT 등)으로 성능 향상
- 데이터 증강(Augmentation) 강화
- WandB/TensorBoard로 실험 관리
- 하이퍼파라미터 서치 적용
