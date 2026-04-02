from typing import Optional

class FreeLLMService:
    @staticmethod
    def generate(system_prompt: str, user_prompt: str) -> str:
        """Local Ollama fallback - return placeholder if not running"""
        try:
            import ollama
            response = ollama.chat(model='llama3.2', messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ])
            return response['message']['content']
        except ImportError:
            return "Local LLM not available. Install Ollama: https://ollama.com"
        except Exception:
            return "Ollama not running. Start with 'ollama serve'"

    @staticmethod
    def get_completion(prompt: str, model: str = 'llama3.2') -> str:
        """Single prompt completion"""
        return FreeLLMService.generate("You are a helpful assistant.", prompt)

