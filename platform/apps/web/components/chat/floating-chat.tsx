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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Quick prompts for easy access
const quickPrompts = [
  { label: 'วิเคราะห์ DMA', prompt: 'วิเคราะห์สถานะน้ำสูญเสียล่าสุด' },
  { label: 'สรุปแจ้งเตือน', prompt: 'สรุปการแจ้งเตือนวันนี้' },
  { label: 'คำแนะนำ', prompt: 'แนะนำการลดน้ำสูญเสีย' },
];

// Mock streaming response
async function* streamResponse(prompt: string): AsyncGenerator<string> {
  const responses: Record<string, string[]> = {
    default: [
      'สวัสดีครับ ',
      'ผมเป็น WARIS AI Assistant\n\n',
      '**สรุปสถานะ:**\n',
      '- พื้นที่ปกติ: 54 DMA\n',
      '- เฝ้าระวัง: 8 DMA\n',
      '- วิกฤต: 3 DMA\n\n',
      'มีอะไรให้ช่วยเพิ่มเติมครับ?',
    ],
    วิเคราะห์: [
      '📊 **วิเคราะห์สถานะล่าสุด**\n\n',
      'อัตราน้ำสูญเสียเฉลี่ย: **15.5%**\n\n',
      '**พื้นที่ต้องเฝ้าระวัง:**\n',
      '1. DMA ชลบุรี-01: 28.5% 🔴\n',
      '2. DMA เชียงใหม่-03: 22.1% 🟡\n',
      '3. DMA สุราษฎร์ธานี-01: 18.2% 🟡',
    ],
    สรุป: [
      '🔔 **การแจ้งเตือนวันนี้**\n\n',
      '- วิกฤต: 1 รายการ\n',
      '- สูง: 1 รายการ\n',
      '- ปานกลาง: 2 รายการ\n\n',
      'ควรตรวจสอบ DMA ชลบุรี-01 ก่อน',
    ],
    แนะนำ: [
      '💡 **คำแนะนำ**\n\n',
      '1. ตรวจจุดรั่วใน DMA วิกฤต\n',
      '2. ปรับแรงดันช่วงกลางคืน\n',
      '3. เปลี่ยนท่อเก่าอายุ 30+ ปี\n\n',
      'คาดลดน้ำสูญเสียได้ 8-12%',
    ],
  };

  let selected = responses.default;
  for (const [key, val] of Object.entries(responses)) {
    if (prompt.includes(key)) {
      selected = val;
      break;
    }
  }

  for (const chunk of selected) {
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 60));
    yield chunk;
  }
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      for await (const chunk of streamResponse(userMsg.content)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90 hover:scale-105 transition-transform sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        size="icon"
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="sr-only">เปิดแชท</span>
      </Button>
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
      <div className="flex items-center justify-between border-b bg-primary px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">WARIS AI</h3>
            <p className="text-xs text-white/80">พร้อมช่วยเหลือ</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h4 className="mt-4 font-semibold text-slate-900">สวัสดีครับ!</h4>
            <p className="mt-1 text-sm text-slate-500">
              ถามเกี่ยวกับน้ำสูญเสียหรือ DMA ได้เลย
            </p>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((qp, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  {qp.label}
                </Button>
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
                      msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-slate-200'
                    )}
                  >
                    {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-white'
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
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
