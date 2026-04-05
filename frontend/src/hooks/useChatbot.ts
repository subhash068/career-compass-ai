import { useCallback } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { chatbotApi } from '@/api/chatbot.api';
import { ChatMessage } from '@/types';

export const useChatbot = () => {
  const { messages, sessionId, isLoading, addMessage, setSessionId, setLoading, clearMessages } = useChat();

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);

    try {
      const response = await chatbotApi.sendQuery({
        message,
        session_id: sessionId || undefined,
      });

      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const err = error as any;
      if (err?.response?.data) {
        console.error('Chat API error detail:', err.response.data);
      }
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err?.response?.data?.detail
          ? `Sorry, chat failed: ${err.response.data.detail}`
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoading, sessionId, addMessage, setSessionId, setLoading]);

  return {
    messages,
    sessionId,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
