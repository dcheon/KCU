
import cv2
import numpy as np
from PIL import Image

def save_heatmap(attn_map, img_path, out_path):
    image = Image.open(img_path).convert("RGB")

    cam = attn_map
    cam = cv2.resize(cam, image.size)
    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

    heat = cv2.applyColorMap((cam * 255).astype("uint8"), cv2.COLORMAP_JET)
    result = cv2.addWeighted(np.array(image), 0.6, heat, 0.4, 0)
    
    cv2.imwrite(out_path, result)
