import argparse
import json
import time
from pathlib import Path

import torch
from torch import nn, optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

def build_transforms(img_size: int, is_train: bool):
    if is_train:
        return transforms.Compose([
            transforms.RandomResizedCrop(img_size),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
    else:
        return transforms.Compose([
            transforms.Resize(int(img_size * 1.14)),
            transforms.CenterCrop(img_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])

def get_dataloaders_from_folder(data_dir: Path, img_size: int, batch_size: int, num_workers: int):
    train_dir = data_dir / "train"
    val_dir = data_dir / "val"

    if not train_dir.exists():
        raise FileNotFoundError(f"'{train_dir}' 경로가 없습니다. ImageFolder 형식으로 데이터를 준비하세요.")

    train_tf = build_transforms(img_size, is_train=True)
    val_tf = build_transforms(img_size, is_train=False)

    train_ds = datasets.ImageFolder(train_dir, transform=train_tf)

    if val_dir.exists():
        val_ds = datasets.ImageFolder(val_dir, transform=val_tf)
    else:
        # train을 90:10 으로 나눠서 val 생성
        val_len = max(1, int(0.1 * len(train_ds)))
        train_len = len(train_ds) - val_len
        train_ds, val_ds = random_split(train_ds, [train_len, val_len])
        # random_split 반환은 Subset이므로 class_to_idx가 없음 -> 아래서 처리

    # 클래스 이름/인덱스 맵핑 준비
    if hasattr(train_ds, "dataset") and hasattr(train_ds.dataset, "class_to_idx"):
        class_to_idx = train_ds.dataset.class_to_idx  # Subset인 경우 내부 원본 참조
    elif hasattr(train_ds, "class_to_idx"):
        class_to_idx = train_ds.class_to_idx
    else:
        # fallback: val_ds 또는 개별 폴더명에서 추론 불가 시 정수 인덱스만 사용
        class_to_idx = {str(i): i for i in range(len(train_ds))}

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                              num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False,
                            num_workers=num_workers, pin_memory=True)

    num_classes = len(class_to_idx)
    return train_loader, val_loader, class_to_idx, num_classes

def get_dataloaders_cifar10(img_size: int, batch_size: int, num_workers: int):
    train_tf = build_transforms(img_size, is_train=True)
    val_tf = build_transforms(img_size, is_train=False)

    train_ds = datasets.CIFAR10(root="data", train=True, download=True, transform=train_tf)
    val_ds = datasets.CIFAR10(root="data", train=False, download=True, transform=val_tf)

    class_to_idx = {name: i for i, name in enumerate(train_ds.classes)}
    num_classes = len(class_to_idx)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                              num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False,
                            num_workers=num_workers, pin_memory=True)
    return train_loader, val_loader, class_to_idx, num_classes

def build_model(num_classes: int, pretrained: bool = True):
    # torchvision 버전에 따라 weights 인자가 다를 수 있으므로 try/except
    try:
        model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1 if pretrained else None)
    except Exception:
        model = models.resnet18(pretrained=pretrained)

    # 분류 헤드 교체
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model

def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss, running_correct, total = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        preds = outputs.argmax(dim=1)
        running_correct += (preds == labels).sum().item()
        total += labels.size(0)

    return running_loss / total, running_correct / total

@torch.no_grad()
def validate(model, loader, criterion, device):
    model.eval()
    running_loss, running_correct, total = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        preds = outputs.argmax(dim=1)
        running_correct += (preds == labels).sum().item()
        total += labels.size(0)

    return running_loss / total, running_correct / total

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="data", help="ImageFolder 데이터 루트 폴더")
    parser.add_argument("--use_cifar10", action="store_true", help="CIFAR-10으로 바로 학습")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--img_size", type=int, default=224)
    parser.add_argument("--num_workers", type=int, default=2)
    parser.add_argument("--pretrained", action="store_true", help="ImageNet 전이학습 사용")
    parser.add_argument("--out_dir", type=str, default="outputs")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] device = {device} (cuda available: {torch.cuda.is_available()})")

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 데이터 준비
    if args.use_cifar10:
        train_loader, val_loader, class_to_idx, num_classes = get_dataloaders_cifar10(args.img_size, args.batch_size, args.num_workers)
    else:
        train_loader, val_loader, class_to_idx, num_classes = get_dataloaders_from_folder(Path(args.data_dir), args.img_size, args.batch_size, args.num_workers)

    print(f"[INFO] num_classes = {num_classes} | classes = {list(class_to_idx.keys())}")

    # 모델/손실/옵티마이저
    model = build_model(num_classes=num_classes, pretrained=args.pretrained).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

    best_acc, best_path = 0.0, out_dir / "best.pt"

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        scheduler.step()

        dt = time.time() - t0
        print(f"[EPOCH {epoch:03d}] "
              f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} | "
              f"val_loss={val_loss:.4f} val_acc={val_acc:.4f} | "
              f"{dt:.1f}s")

        # 베스트 저장
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save({
                "model_state": model.state_dict(),
                "num_classes": num_classes,
                "class_to_idx": class_to_idx,
                "img_size": args.img_size,
            }, best_path)
            with open(out_dir / "labels.json", "w", encoding="utf-8") as f:
                json.dump(class_to_idx, f, ensure_ascii=False, indent=2)
            print(f"[INFO] Saved new best to {best_path} (acc={best_acc:.4f})")

    print(f"[INFO] Training finished. Best val_acc={best_acc:.4f}. Checkpoints in {out_dir}")

if __name__ == "__main__":
    main()
