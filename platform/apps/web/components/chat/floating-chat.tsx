'use client';

import * as React from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  MessageSquare,
  Minimize2,
  Maximize2,
  Sparkles,
  StopCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/use-chat';

// Quick prompts for easy access
const quickPrompts = [
  { label: 'วิเคราะห์ DMA', prompt: 'วิเคราะห์สถานะน้ำสูญเสียล่าสุด' },
  { label: 'สรุปแจ้งเตือน', prompt: 'สรุปการแจ้งเตือนวันนี้' },
  { label: 'คำแนะนำ', prompt: 'แนะนำการลดน้ำสูญเสีย' },
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, stopGeneration, clearMessages } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Scroll to bottom when messages change
  React.useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-all sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="sr-only">เปิดแชท</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300',
        // Mobile: full screen when open
        'inset-0 rounded-none border-0',
        // Tablet and up: floating window
        'sm:inset-auto sm:bottom-4 sm:right-4 sm:rounded-2xl sm:border sm:border-slate-200',
        isExpanded
          ? 'sm:left-4 sm:top-4 md:left-auto md:top-auto md:h-[600px] md:w-[450px]'
          : 'sm:h-[450px] sm:w-[340px] md:h-[500px] md:w-[380px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-blue-600 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">WARIS AI</h3>
            <p className="text-xs text-white/80">พร้อมช่วยเหลือ</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear chat button */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white"
              onClick={clearMessages}
              title="ล้างการสนทนา"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {/* Hide expand on mobile since it's already fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white sm:flex"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100">
              <Bot className="h-7 w-7 text-blue-600" />
            </div>
            <h4 className="mt-4 font-semibold text-slate-900">สวัสดีครับ!</h4>
            <p className="mt-1 text-sm text-slate-500">
              ถามเกี่ยวกับน้ำสูญเสียหรือ DMA ได้เลย
            </p>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback
                    className={cn(
                      'text-xs',
                      msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  )}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {isLoading &&
                    msg.role === 'assistant' &&
                    msg.id === messages[messages.length - 1]?.id &&
                    !msg.content && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">กำลังพิมพ์...</span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border-slate-200"
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={stopGeneration}
              className="shrink-0"
              title="หยุดการตอบ"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
