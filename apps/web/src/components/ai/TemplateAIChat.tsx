'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import { Loader2, Send, Bot, User, BookOpen, X } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';
import { useTranslations } from 'next-intl';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
}

interface TemplateAIChatProps {
  className?: string;
  defaultOpen?: boolean;
}

export function TemplateAIChat({ className = '', defaultOpen = false }: TemplateAIChatProps) {
  const t = useTranslations('Dashboard.AIChat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      interface ChatResponse {
        content: string;
        model: string;
        provider: string;
        usage: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          input_tokens?: number;
          output_tokens?: number;
        };
        finish_reason: string;
      }

      const response = await apiClient.post<ChatResponse>('/api/v1/ai/chat/template', {
        messages: apiMessages,
        provider: 'auto',
        max_tokens: 2000,
      });

      if (!response.data) {
        throw new Error('No data received from AI service');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date(),
        provider: response.data.provider,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err) || t('errors.sendFailed');
      setError(errorMessage);

      // Add error message to chat
      const errorMsg: Message = {
        role: 'assistant',
        content: `${t('errors.errorPrefix')}: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg h-14 w-14 p-0"
          variant="gradient"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Full chat interface when open
  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] ${className}`}>
      <Card variant="glass" className="flex flex-col h-full shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 glass-effect bg-[#13131A]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white">{t('title')}</h3>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                disabled={isLoading}
                className="text-xs text-gray-400 hover:bg-[#252532] hover:text-white"
              >
                {t('clear')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} disabled={isLoading} className="text-gray-400 hover:bg-[#252532] hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0A0F] custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <p className="font-medium text-white">{t('welcome.title')}</p>
                <p className="text-sm mt-2 text-gray-400">{t('welcome.description')}</p>
                <div className="mt-4 text-left space-y-2">
                  <p className="text-xs font-semibold text-white">{t('welcome.examples')}:</p>
                  <ul className="text-xs space-y-1 text-gray-400">
                    <li>• {t('welcome.example1')}</li>
                    <li>• {t('welcome.example2')}</li>
                    <li>• {t('welcome.example3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/50">
                  <Bot className="h-4 w-4 text-blue-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'glass-effect bg-[#1C1C26] border border-gray-800 text-gray-300'
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-300">
                  <p className="whitespace-pre-wrap break-words m-0">{message.content}</p>
                </div>
                {message.provider && message.role === 'assistant' && (
                  <p className="text-xs mt-2 text-gray-400 capitalize">
                    {t('via')} {message.provider}
                  </p>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full glass-effect bg-[#1C1C26] border border-gray-800 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/50">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
              <div className="glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 glass-effect bg-[#13131A]">
          {error && (
            <div className="mb-2 p-2 glass-effect bg-red-500/10 border border-red-500/50 rounded text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <div className="form-input-glow flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('inputPlaceholder')}
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading} variant="gradient">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
