import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axiosClient from '@/api/axiosClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AdminChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
const response = await axiosClient.post('/api/admin/chat', { 
        message: userMessage.content 
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply || "Sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response from admin AI. Ensure you're logged in as admin.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble. Check you're logged in as admin.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card border rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-2 bg-primary/5">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Admin AI Assistant</h3>
        <div className="ml-auto text-xs text-muted-foreground">
          Commands: create user, list users, skills, questions
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-muted/50 to-background">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">
              Ask admin AI about users, skills, domains, learning paths
            </p>
            <p className="text-sm mt-1">
              "list users" | "create user john@test.com admin" | "skills python"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted border'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-background">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about admin tasks: create user, list skills, manage questions..."
          className="flex-1 min-h-[44px] resize-none focus-visible:ring-primary"
          disabled={isLoading}
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="h-11 w-11 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

