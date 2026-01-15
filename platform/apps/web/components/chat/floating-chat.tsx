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
import { MarkdownRenderer } from './markdown-renderer';

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
        className={cn(
          'group fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl text-white',
          'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]',
          'shadow-xl shadow-[var(--pwa-cyan)]/30',
          'hover:shadow-2xl hover:shadow-[var(--pwa-cyan)]/40 hover:scale-110',
          'transition-all duration-500 ease-out press-effect',
          'sm:bottom-6 sm:right-6 sm:h-14 sm:w-14',
          'safe-area-inset',
          'ring-2 ring-white/20 hover:ring-white/40',
          'animate-breathing-glow'
        )}
        style={{ '--tw-shadow-color': 'var(--pwa-cyan)' } as React.CSSProperties}
      >
        {/* Floating orbs */}
        <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[var(--pwa-cyan-light)]/60 blur-sm animate-float" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-white/40 blur-sm animate-float" style={{ animationDelay: '1s' }} />

        {/* Inner glow */}
        <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <MessageSquare className="relative h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
        <span className="sr-only">เปิดแชท</span>

        {/* Pulse ring effect */}
        <span className="absolute inset-0 rounded-2xl animate-ping bg-[var(--pwa-cyan)]/20" style={{ animationDuration: '3s' }} />

        {/* Subtle rotating border */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--pwa-cyan)]/50 via-transparent to-[var(--pwa-cyan-light)]/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden shadow-2xl transition-all duration-500 animate-elastic',
        'backdrop-blur-xl bg-background/95',
        // Mobile: full screen when open
        'inset-0 rounded-none border-0 safe-area-inset',
        // Tablet and up: floating window with glassmorphism
        'sm:inset-auto sm:bottom-4 sm:right-4 sm:rounded-3xl sm:border sm:border-white/10',
        'sm:ring-1 sm:ring-black/5 dark:sm:ring-white/5',
        'sm:shadow-[0_25px_50px_-12px_rgba(0,194,243,0.25)]',
        isExpanded
          ? 'sm:left-4 sm:top-4 md:left-auto md:top-auto md:h-[600px] md:w-[450px]'
          : 'sm:h-[480px] sm:w-[360px] md:h-[520px] md:w-[400px]'
      )}
    >
      {/* Header with enhanced gradient */}
      <div className="relative flex items-center justify-between overflow-hidden px-4 py-3.5">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--pwa-blue-deep)] via-[var(--pwa-navy)] to-[var(--pwa-cyan)]" />
        {/* Animated overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />
        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/50 to-transparent" />
        {/* Floating orbs */}
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--pwa-cyan)]/20 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-20 w-20 rounded-full bg-[var(--pwa-cyan-light)]/20 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm shadow-lg">
              <Sparkles className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--pwa-navy)] bg-emerald-400 shadow-lg shadow-emerald-400/50" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white drop-shadow-sm">WARIS AI</h3>
            <p className="text-xs text-white/70 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              พร้อมช่วยเหลือ
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-1">
          {/* Clear chat button */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105"
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
            className="hidden h-8 w-8 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105 sm:flex"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105 hover:rotate-90"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 modern-scrollbar" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center animate-blur-in">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-1/4 h-32 w-32 rounded-full bg-[var(--pwa-cyan)]/5 blur-3xl" />
              <div className="absolute bottom-10 right-1/4 h-24 w-24 rounded-full bg-[var(--pwa-blue-deep)]/5 blur-2xl" />
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/20 blur-xl animate-pulse" />
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--pwa-cyan-light)]/30 to-[var(--pwa-cyan)]/20 ring-1 ring-[var(--pwa-cyan)]/20 shadow-lg">
                <Bot className="h-8 w-8 text-[var(--pwa-blue-deep)] dark:text-[var(--pwa-cyan)]" />
              </div>
            </div>
            <h4 className="mt-5 font-bold text-lg text-foreground">สวัสดีครับ!</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              ถามเกี่ยวกับน้ำสูญเสียหรือ DMA ได้เลย
            </p>

            {/* Quick Prompts with stagger animation */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((qp, index) => (
                <button
                  key={qp.label}
                  type="button"
                  className={cn(
                    'h-9 rounded-xl border border-[var(--pwa-cyan)]/30 bg-[var(--pwa-cyan-light)]/10 px-4 text-xs font-medium text-[var(--pwa-blue-deep)]',
                    'hover:bg-[var(--pwa-cyan)]/20 hover:border-[var(--pwa-cyan)] hover:scale-105 hover:shadow-md hover:shadow-[var(--pwa-cyan)]/10',
                    'transition-all duration-300 press-effect shine-effect',
                    'dark:border-[var(--pwa-cyan)]/50 dark:text-[var(--pwa-cyan-light)] dark:hover:bg-[var(--pwa-cyan)]/20',
                    'animate-slide-up-fade'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5 animate-slide-up-fade',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-offset-2 ring-offset-background ring-border/50">
                  <AvatarFallback
                    className={cn(
                      'text-xs',
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white shadow-lg shadow-[var(--pwa-cyan)]/20'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    )}
                  >
                    {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 transition-all duration-300',
                    'shadow-sm hover:shadow-md',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[var(--pwa-blue-deep)] to-[var(--pwa-cyan)] text-white shadow-[var(--pwa-cyan)]/20'
                      : 'bg-muted/80 text-foreground ring-1 ring-border/30 backdrop-blur-sm'
                  )}
                >
                  {msg.content ? (
                    <MarkdownRenderer
                      content={msg.content}
                      isUserMessage={msg.role === 'user'}
                    />
                  ) : (
                    isLoading &&
                    msg.role === 'assistant' &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <div className="flex items-center gap-2 text-muted-foreground py-1">
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--pwa-cyan)]" />
                        <span className="text-xs font-medium">กำลังพิมพ์...</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="relative border-t border-border/50 bg-background/80 backdrop-blur-sm p-3">
        {/* Top glow line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            disabled={isLoading}
            className={cn(
              'flex-1 rounded-xl bg-muted/50 border-border/50',
              'focus:ring-2 focus:ring-[var(--pwa-cyan)]/30 focus:border-[var(--pwa-cyan)]',
              'transition-all duration-300',
              'placeholder:text-muted-foreground/50'
            )}
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={stopGeneration}
              className="shrink-0 press-effect rounded-xl shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-105"
              title="หยุดการตอบ"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className={cn(
                'shrink-0 rounded-xl',
                'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-cyan)]',
                'shadow-lg shadow-[var(--pwa-cyan)]/20',
                'hover:shadow-xl hover:shadow-[var(--pwa-cyan)]/30 hover:scale-105',
                'transition-all duration-300 press-effect',
                'disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100'
              )}
            >
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
