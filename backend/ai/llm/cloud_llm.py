from typing import Optional
import os

class CloudLLMService:
    @staticmethod
    def generate(system_prompt: str, user_prompt: str) -> str:
        """Groq cloud LLM"""
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            return "GROQ_API_KEY not set. Get free key: https://groq.com"
        
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            chat = client.chat.completions.create(
                model="llama3-groq-70b-8192-tool-use-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
            )
            return chat.choices[0].message.content
        except ImportError:
            return "pip install groq to use Groq LLM"
        except Exception as e:
            return f"Groq error: {str(e)}"

    @staticmethod
    def get_completion(prompt: str) -> str:
        return CloudLLMService.generate("You are a helpful assistant.", prompt)

