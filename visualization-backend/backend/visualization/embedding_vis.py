import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE

def save_embedding_vis(image_emb, text_emb, labels, save_path):

    all_embeddings = np.vstack([image_emb, text_emb])

    tsne = TSNE(
        n_components=2,
        perplexity=5,
        learning_rate=200,
        max_iter=1000,
        init='random',
        random_state=42
    )

    reduced = tsne.fit_transform(all_embeddings)

    img_pt = reduced[0]
    txt_pts = reduced[1:]

    plt.figure(figsize=(7, 7))
    plt.title("CLIP Embedding Visualization (t-SNE)", fontsize=14)

    for i, pt in enumerate(txt_pts):
        plt.scatter(pt[0], pt[1], c="blue")
        plt.text(pt[0] + 2, pt[1] + 2, labels[i], fontsize=10)

    plt.scatter(img_pt[0], img_pt[1], c="red")
    plt.text(img_pt[0] + 2, img_pt[1] + 2, "IMAGE", fontsize=12, color="red")

    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
