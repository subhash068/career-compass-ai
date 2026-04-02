"""
TF-IDF based fallback embedding service.
Used when sentence-transformers fails to load due to network issues.
Projects to 384 dimensions to match all-MiniLM-L6-v2.
"""

from typing import List, Union
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
import pickle
import os

class FallbackEmbeddingService:
    """
    TF-IDF + SVD dimensionality reduction fallback.
    Compatible interface with SentenceTransformer.
    """
    _vectorizer = None
    _svd = None
    _is_fitted = False

    def __init__(self, n_components: int = 384, max_features: int = 10000):
        self.n_components = n_components
        self.max_features = max_features
        self.model_name = "tfidf-svd-fallback"

    def fit(self, documents: List[str]):
        """Fit on corpus to learn vocabulary and SVD components."""
        if not documents:
            raise ValueError("Need at least one document to fit")

        # TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 2)
        )
        tfidf_matrix = vectorizer.fit_transform(documents)

        # SVD dimensionality reduction 
        # Ensure we don't ask for more components than features
        actual_components = min(self.n_components, tfidf_matrix.shape[1] - 1)
        if actual_components < 1:
            actual_components = 1
            
        svd = TruncatedSVD(n_components=actual_components, random_state=42)
        self._svd = svd.fit(tfidf_matrix)

        self._vectorizer = vectorizer
        self._actual_components = actual_components
        self._is_fitted = True
        return self

    def encode(self, texts: Union[str, List[str]], **kwargs) -> np.ndarray:
        """Encode texts to 384-dim embeddings."""
        if isinstance(texts, str):
            texts = [texts]

        if not self._is_fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")

        # Transform texts
        tfidf_vectors = self._vectorizer.transform(texts)
        
        # SVD projection
        embeddings = self._svd.transform(tfidf_vectors)
        
        # Pad with zeros if actual_components < n_components
        if self._actual_components < self.n_components:
            padding = np.zeros((embeddings.shape[0], self.n_components - self._actual_components))
            embeddings = np.hstack((embeddings, padding))
        
        # Normalize to unit length (like SentenceTransformer)
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1e-10
        embeddings = embeddings / norms
        
        return embeddings

    def get_model_info(self) -> dict:
        """Get model information."""
        return {
            "model_name": self.model_name,
            "dimension": self.n_components,
            "is_fitted": self._is_fitted,
            "max_features": self.max_features
        }

# Global singleton instance
_fallback_instance = None

def get_fallback_model():
    """Get global fallback model instance."""
    global _fallback_instance
    if _fallback_instance is None:
        _fallback_instance = FallbackEmbeddingService()
        # Fit on minimal corpus for basic functionality
        sample_docs = [
            "python programming developer engineer",
            "java javascript full stack web development",
            "data science machine learning ai ml engineer",
            "devops kubernetes docker cloud architect aws azure",
            "sql database analyst business intelligence bi"
        ]
        _fallback_instance.fit(sample_docs)
    return _fallback_instance
