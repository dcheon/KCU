import argparse
import json
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms, models
from torch import nn

def load_checkpoint(ckpt_path: Path, map_path: Path | None = None, device: str = "cpu"):
    ckpt = torch.load(ckpt_path, map_location=device)
    class_to_idx = ckpt.get("class_to_idx")
    num_classes = ckpt.get("num_classes")
    img_size = ckpt.get("img_size", 224)

    # id->label 맵
    if isinstance(class_to_idx, dict):
        idx_to_class = {v: k for k, v in class_to_idx.items()}
    else:
        idx_to_class = {i: str(i) for i in range(num_classes or 0)}

    # 모델 구성 (train과 동일 아키텍처)
    try:
        model = models.resnet18(weights=None)
    except Exception:
        model = models.resnet18(pretrained=False)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    model.load_state_dict(ckpt["model_state"], strict=True)
    model.eval().to(device)

    # 변환
    tf = transforms.Compose([
        transforms.Resize(int(img_size * 1.14)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])

    return model, tf, idx_to_class

@torch.no_grad()
def predict(model, tf, idx_to_class, image_path: Path, device: str = "cpu", topk: int = 5):
    img = Image.open(image_path).convert("RGB")
    x = tf(img).unsqueeze(0).to(device)
    logits = model(x)
    probs = torch.softmax(logits, dim=1)
    values, indices = probs.topk(min(topk, logits.shape[1]), dim=1)
    values = values[0].cpu().tolist()
    indices = indices[0].cpu().tolist()
    return [(idx_to_class[i], float(v)) for i, v in zip(indices, values)]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=str, required=True, help="학습된 체크포인트(.pt)")
    parser.add_argument("--label_map", type=str, default=None, help="labels.json 경로(선택)")
    parser.add_argument("--image", type=str, required=True, help="예측할 이미지 경로")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--topk", type=int, default=5)
    args = parser.parse_args()

    device = args.device if (args.device == "cpu" or torch.cuda.is_available()) else "cpu"
    model, tf, idx_to_class = load_checkpoint(Path(args.checkpoint), Path(args.label_map) if args.label_map else None, device)
    preds = predict(model, tf, idx_to_class, Path(args.image), device, args.topk)

    print("[PREDICTIONS]")
    for label, prob in preds:
        print(f"{label:>15s}: {prob:.4f}")

if __name__ == "__main__":
    main()
