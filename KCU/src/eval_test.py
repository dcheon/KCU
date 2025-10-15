# src/eval_test.py
import argparse, json
from pathlib import Path
import torch
from torch import nn
from torchvision import datasets, transforms, models

def build_tf(img_size):
    return transforms.Compose([
        transforms.Resize(int(img_size*1.14)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])

@torch.no_grad()
def evaluate(model, loader, device):
    model.eval()
    correct, total = 0, 0
    # 혼동행렬용 카운터(라벨 수가 작을 때 간단히)
    num_classes = loader.dataset.class_to_idx.__len__()
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits = model(x)
        pred = logits.argmax(1)
        correct += (pred == y).sum().item()
        total += y.size(0)
        for t,p in zip(y, pred):
            cm[t.long(), p.long()] += 1
    return correct/total, cm

def load_model(ckpt_path, num_classes, device, img_size):
    try:
        model = models.resnet18(weights=None)
    except:
        model = models.resnet18(pretrained=False)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    ckpt = torch.load(ckpt_path, map_location=device)
    model.load_state_dict(ckpt["model_state"], strict=True)
    return model.to(device)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data_dir", type=str, default="data")
    ap.add_argument("--checkpoint", type=str, required=True)
    ap.add_argument("--img_size", type=int, default=224)
    ap.add_argument("--batch_size", type=int, default=32)
    ap.add_argument("--num_workers", type=int, default=0)  # Windows는 0 권장
    args = ap.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tf = build_tf(args.img_size)

    test_dir = Path(args.data_dir)/"test"
    if not test_dir.exists():
        raise FileNotFoundError(f"'{test_dir}'가 없습니다. data/test/클래스명/이미지 형태로 준비하세요.")

    test_ds = datasets.ImageFolder(test_dir, transform=tf)
    test_loader = torch.utils.data.DataLoader(
        test_ds, batch_size=args.batch_size, shuffle=False,
        num_workers=args.num_workers, pin_memory=torch.cuda.is_available()
    )

    num_classes = len(test_ds.classes)
    model = load_model(Path(args.checkpoint), num_classes, device, args.img_size)

    acc, cm = evaluate(model, test_loader, device)
    print(f"[TEST] accuracy = {acc:.4f}")
    print("[TEST] confusion matrix (rows=true, cols=pred):")
    # 라벨 이름 출력
    print("labels:", test_ds.classes)
    print(cm.cpu().numpy())

if __name__ == "__main__":
    main()
