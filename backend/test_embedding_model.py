"""
Test script to verify sentence-transformers/all-MiniLM-L6-v2 model is working
"""
import sys
import os

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)


def test_embedding_model():
    """Test that embedding model initialization and fallbacks work correctly"""
    with open("test_output.log", "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("Testing Embedding Service Resiliency\n")
        f.write("=" * 60 + "\n")
        
        from ai.config.ai_settings import AISettings
        from ai.embeddings.embedding_service import EmbeddingService
        
        try:
            # Test 1: Load base model
            f.write("\n[1] Testing default model loading...\n")
            EmbeddingService._model = None
            EmbeddingService._model_name = None
            AISettings.HF_HUB_OFFLINE = False
            AISettings.EMBEDDING_USE_FALLBACK = True
            
            service_model = EmbeddingService.get_model()
            service_info = EmbeddingService.get_model_info()
            f.write(f"✅ Loaded: {service_info['model_name']}\n")
            
            # Test 2: Test Offline mode directly
            f.write("\n[2] Testing Offline Fallback...\n")
            EmbeddingService._model = None
            EmbeddingService._model_name = None
            AISettings.HF_HUB_OFFLINE = True
            
            offline_model = EmbeddingService.get_model()
            offline_info = EmbeddingService.get_model_info()
            f.write(f"✅ Loaded (Offline): {offline_info['model_name']}\n")
            if "fallback" in offline_info['model_name']:
                f.write("✅ Offline fallback successfully triggered.\n")
            else:
                f.write("❌ Offline fallback failed.\n")
                
            # Test 3: Test bad model retry & fallback
            f.write("\n[3] Testing Invalid Model Retry -> Fallback...\n")
            EmbeddingService._model = None
            EmbeddingService._model_name = None
            AISettings.HF_HUB_OFFLINE = False
            AISettings.EMBEDDING_RETRY_COUNT = 2
            AISettings.EMBEDDING_TIMEOUT = 1
            
            # We manually ask get_model to load a non-existent model
            try:
                EmbeddingService.get_model("invalid-model-name-nonexistent")
                bad_info = EmbeddingService.get_model_info()
                f.write(f"✅ Fallback loaded after retries: {bad_info['model_name']}\n")
            except Exception as e:
                f.write(f"❌ Fallback failed to catch bad model: {e}\n")
                
        except Exception as e:
            f.write(f"❌ Test failed with exception: {str(e)}\n")

if __name__ == "__main__":
    test_embedding_model()
