import numpy as np

try:
    import faiss
except ImportError:  # optional dependency
    faiss = None


class _NumpyIndex:
    def __init__(self, dim: int):
        self.dim = dim
        self.vectors = np.empty((0, dim), dtype="float32")

    @property
    def ntotal(self) -> int:
        return int(self.vectors.shape[0])

    def add(self, vectors: np.ndarray) -> None:
        vectors = np.asarray(vectors, dtype="float32")
        if vectors.ndim != 2 or vectors.shape[1] != self.dim:
            raise ValueError(f"Expected shape (n, {self.dim}), got {vectors.shape}")
        self.vectors = np.vstack([self.vectors, vectors])

    def search(self, query: np.ndarray, k: int):
        query = np.asarray(query, dtype="float32")
        if self.ntotal == 0:
            return np.full((1, k), np.inf, dtype="float32"), np.full((1, k), -1, dtype="int64")

        distances = np.sum((self.vectors - query[0]) ** 2, axis=1)
        top_k = min(k, self.ntotal)
        nearest_idx = np.argsort(distances)[:top_k]
        nearest_dist = distances[nearest_idx]

        if top_k < k:
            pad_len = k - top_k
            nearest_idx = np.concatenate([nearest_idx, np.full(pad_len, -1, dtype="int64")])
            nearest_dist = np.concatenate([nearest_dist, np.full(pad_len, np.inf, dtype="float32")])

        return nearest_dist.reshape(1, -1).astype("float32"), nearest_idx.reshape(1, -1).astype("int64")


class VectorStore:
    def __init__(self, dim: int = 384):
        self.index = faiss.IndexFlatL2(dim) if faiss is not None else _NumpyIndex(dim)
        self.metadata = []

    def add(self, embedding: list[float], meta: dict):
        self.index.add(np.array([embedding]).astype("float32"))
        self.metadata.append(meta)

    def search(self, embedding: list[float], k: int = 5):
        _, indices = self.index.search(np.array([embedding]).astype("float32"), k)
        return [self.metadata[i] for i in indices[0] if i >= 0]
