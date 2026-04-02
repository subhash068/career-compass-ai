import openai
import os
from .free_llm import FreeLLMService
from .cloud_llm import CloudLLMService
openai.api_key = os.getenv("OPENAI_API_KEY")
class LLMService:
    @staticmethod
    def generate(system_prompt: str, user_prompt: str) -> str:
        """Cloud Groq → Local Ollama → OpenAI"""
        # 1. Cloud Groq (fastest, free tier)
        if os.getenv("GROQ_API_KEY"):
            try:
                return CloudLLMService().generate(system_prompt, user_prompt)
            except Exception:
                pass
        
        # 2. Local Ollama (free, offline)
        try:
            return FreeLLMService.generate(system_prompt, user_prompt)
        except Exception:
            pass
        
        # 3. OpenAI fallback
        if openai.api_key:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
            )
            return response.choices[0].message.content
        
        return "No LLM available. Set GROQ_API_KEY, run 'ollama serve', or add OPENAI_API_KEY"
    @staticmethod
    def get_completion(prompt: str, model: str = 'llama3.2') -> str:
        """Same priority: Cloud → Local → OpenAI"""
        if os.getenv("GROQ_API_KEY"):
            try:
                return CloudLLMService().get_completion(prompt)
            except Exception:
                pass
        
        try:
            return FreeLLMService.get_completion(prompt, model)
        except Exception:
            pass
        
        if openai.api_key:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
            )
            return response.choices[0].message.content
        
        return "LLM service unavailable"