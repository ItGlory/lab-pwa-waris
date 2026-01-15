'use client';

import * as React from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Settings2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/chat/markdown-renderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
}

interface ChatStatus {
  llm_available: boolean;
  active_provider: string;
  openrouter: {
    available: boolean;
    healthy: boolean;
    default_model: string;
  };
  ollama: {
    available: boolean;
    healthy: boolean;
    default_model: string;
  };
}

const suggestedPrompts = [
  'วิเคราะห์แนวโน้มน้ำสูญเสียของ DMA ชลบุรี-01',
  'สรุปการแจ้งเตือนที่มีความรุนแรงสูงวันนี้',
  'เปรียบเทียบประสิทธิภาพ DMA ทุกพื้นที่',
  'แนะนำการลดน้ำสูญเสียสำหรับพื้นที่วิกฤต',
];

export default function ChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<ChatStatus | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch LLM status on mount
  React.useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/chat/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch chat status:', error);
      }
    }
    fetchStatus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamResponse = async (userMessage: string, assistantId: string) => {
    try {
      // Build conversation history
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              }
              if (data.done) {
                return;
              }
              if (data.error) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: `เกิดข้อผิดพลาด: ${data.error}` }
                      : msg
                  )
                );
                return;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: 'ขออภัย ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              }
            : msg
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        provider: status?.active_provider,
      },
    ]);

    await streamResponse(userMessage.content, assistantId);
    setIsLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const getProviderBadge = () => {
    if (!status) return null;

    const provider = status.active_provider;
    const isHealthy =
      provider === 'openrouter'
        ? status.openrouter?.healthy
        : status.ollama?.healthy;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isHealthy ? 'default' : 'secondary'}
            className={cn(
              'ml-2 gap-1',
              isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            )}
          >
            {isHealthy ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {provider === 'openrouter' ? 'OpenRouter' : 'Ollama'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            โมเดล:{' '}
            {provider === 'openrouter'
              ? status.openrouter?.default_model
              : status.ollama?.default_model}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
            ถามตอบ AI
          </h1>
          <p className="text-muted-foreground">
            AI Chat Assistant - Thai 70B+ LLM
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            className="gap-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            ล้างประวัติ
          </Button>
        )}
      </div>

      {/* Chat Container */}
      <Card className="relative flex flex-1 flex-col overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/30 to-transparent" />
        <CardHeader className="border-b border-border/50 py-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--pwa-cyan)]/5 to-transparent" />
          <CardTitle className="flex items-center gap-2 text-base font-medium relative">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white shadow-lg shadow-[var(--pwa-cyan)]/30 animate-breathing-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent font-semibold">
              WARIS AI Assistant
            </span>
            {getProviderBadge()}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 relative" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 animate-blur-in">
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20 shadow-lg shadow-[var(--pwa-cyan)]/20">
                  <MessageSquare className="h-10 w-10 text-[var(--pwa-cyan)]" />
                </div>
                <h2 className="mt-4 text-xl font-semibold bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
                  สวัสดีครับ! ผมพร้อมช่วยเหลือ
                </h2>
                <p className="mt-2 text-center text-muted-foreground">
                  ถามคำถามเกี่ยวกับน้ำสูญเสีย วิเคราะห์ข้อมูล DMA หรือขอคำแนะนำได้เลยครับ
                </p>

                {/* Provider Info */}
                {status && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50 ring-1 ring-border/50">
                    <Settings2 className="h-4 w-4 text-[var(--pwa-cyan)]" />
                    <span>
                      ใช้ {status.active_provider === 'openrouter' ? 'OpenRouter' : 'Ollama'} -{' '}
                      {status.active_provider === 'openrouter'
                        ? status.openrouter?.default_model
                        : status.ollama?.default_model}
                    </span>
                  </div>
                )}

                {/* Suggested Prompts */}
                <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="group h-auto justify-start whitespace-normal p-3 text-left text-sm border-border/50 hover:border-[var(--pwa-cyan)]/30 hover:bg-[var(--pwa-cyan)]/5 transition-all animate-slide-up-fade"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <Sparkles className="mr-2 h-4 w-4 shrink-0 text-[var(--pwa-cyan)] group-hover:scale-110 transition-transform" />
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 animate-slide-up-fade',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Avatar
                      className={cn(
                        'h-8 w-8 shrink-0 ring-2 ring-offset-2 ring-offset-background',
                        message.role === 'assistant'
                          ? 'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] ring-[var(--pwa-cyan)]/30'
                          : 'ring-border/50'
                      )}
                    >
                      <AvatarFallback
                        className={message.role === 'assistant' ? 'bg-transparent text-white' : ''}
                      >
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'group relative max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white shadow-[var(--pwa-cyan)]/20'
                          : 'bg-muted/80 text-foreground backdrop-blur-sm border border-border/50'
                      )}
                    >
                      <MarkdownRenderer
                        content={message.content}
                        isUserMessage={message.role === 'user'}
                      />
                      {message.content && message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-10 top-0 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--pwa-cyan)]/10 hover:text-[var(--pwa-cyan)]"
                          onClick={() => handleCopy(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {isLoading &&
                        message.role === 'assistant' &&
                        message.id === messages[messages.length - 1]?.id &&
                        !message.content && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-[var(--pwa-cyan)]" />
                            <span className="text-sm text-muted-foreground">กำลังคิด...</span>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-gradient-to-r from-background via-background to-background p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/20 to-transparent" />
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์คำถามของคุณที่นี่..."
                disabled={isLoading}
                className="flex-1 bg-background/50 border-border/50 focus:border-[var(--pwa-cyan)]/50 focus:ring-[var(--pwa-cyan)]/20 transition-all"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="gap-2 bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] hover:from-[var(--pwa-cyan)]/90 hover:to-[var(--pwa-blue-deep)]/90 shadow-lg shadow-[var(--pwa-cyan)]/25 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                ส่ง
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <span className="text-[var(--pwa-cyan)]">WARIS AI</span> - ข้อมูลที่ได้รับอาจไม่ถูกต้อง กรุณาตรวจสอบก่อนนำไปใช้
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
