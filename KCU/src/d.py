import os

folder = "C:\\Users\\cheon\\OneDrive\\Desktop\\important\\Project\\KCU_4Jo\\KCU\\KCU\\data\\train\\cube"  # 폴더 경로 수정하세요
prefix = "cube"
ext = ".jpg"  # 파일 확장자 (.png, .jpeg 등으로 변경 가능)

files = sorted([f for f in os.listdir(folder) if f.endswith(ext)])

for i, filename in enumerate(files, start=1):
    new_name = f"{prefix}{i:04d}{ext}"  # tetra0001, tetra0002, ...
    src = os.path.join(folder, filename)
    dst = os.path.join(folder, new_name)
    os.rename(src, dst)

print("이름 변경 완료!")
