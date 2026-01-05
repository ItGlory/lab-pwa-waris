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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Sample suggested prompts
const suggestedPrompts = [
  'วิเคราะห์แนวโน้มน้ำสูญเสียของ DMA ชลบุรี-01',
  'สรุปการแจ้งเตือนที่มีความรุนแรงสูงวันนี้',
  'เปรียบเทียบประสิทธิภาพ DMA ทุกพื้นที่',
  'แนะนำการลดน้ำสูญเสียสำหรับพื้นที่วิกฤต',
];

// Mock streaming response generator
async function* streamMockResponse(prompt: string): AsyncGenerator<string> {
  const responses: Record<string, string[]> = {
    default: [
      'สวัสดีครับ ผมเป็น WARIS AI Assistant',
      ' ระบบวิเคราะห์น้ำสูญเสียอัจฉริยะ\n\n',
      'จากการวิเคราะห์ข้อมูลล่าสุด พบว่า:\n\n',
      '**สรุปภาพรวม:**\n',
      '- พื้นที่ DMA ทั้งหมด: 65 พื้นที่\n',
      '- อัตราน้ำสูญเสียเฉลี่ย: 15.5%\n',
      '- พื้นที่สถานะวิกฤต: 3 พื้นที่\n',
      '- พื้นที่ต้องเฝ้าระวัง: 8 พื้นที่\n\n',
      '**คำแนะนำ:**\n',
      '1. ควรตรวจสอบ DMA ชลบุรี-01 เป็นลำดับแรก เนื่องจากมีน้ำสูญเสียสูงถึง 28%\n',
      '2. พิจารณาติดตั้งเซ็นเซอร์เพิ่มเติมในพื้นที่ที่มีแนวโน้มเพิ่มขึ้น\n',
      '3. วางแผนซ่อมบำรุงท่อส่งน้ำในช่วงที่มีการใช้น้ำต่ำ\n\n',
      'หากต้องการรายละเอียดเพิ่มเติม สามารถถามได้ครับ',
    ],
    วิเคราะห์: [
      '📊 **การวิเคราะห์ข้อมูล DMA ชลบุรี-01**\n\n',
      '**ข้อมูลพื้นฐาน:**\n',
      '- รหัส: DMA-CBR-01\n',
      '- สาขา: สำนักงานประปาชลบุรี\n',
      '- พื้นที่: 12.5 ตร.กม.\n',
      '- จำนวนผู้ใช้น้ำ: 8,450 ราย\n\n',
      '**สถานะปัจจุบัน:**\n',
      '- ⚠️ สถานะ: วิกฤต\n',
      '- อัตราน้ำสูญเสีย: 28.5%\n',
      '- แรงดันเฉลี่ย: 2.8 บาร์\n\n',
      '**แนวโน้ม (7 วันล่าสุด):**\n',
      '- น้ำสูญเสียเพิ่มขึ้น 3.2% จากสัปดาห์ก่อน\n',
      '- พบความผิดปกติของแรงดันในช่วงกลางคืน\n',
      '- มีการแจ้งเตือนรั่วไหลสะสม 5 ครั้ง\n\n',
      '**คำแนะนำ:**\n',
      '1. ตรวจสอบจุดรั่วไหลบริเวณ ซอย 5-7\n',
      '2. ปรับแรงดันน้ำในช่วง 22:00-05:00\n',
      '3. ติดตามข้อมูลอย่างใกล้ชิดใน 48 ชั่วโมงข้างหน้า',
    ],
    สรุป: [
      '🔔 **สรุปการแจ้งเตือนความรุนแรงสูงวันนี้**\n\n',
      '**พบการแจ้งเตือน 3 รายการ:**\n\n',
      '1. **DMA ชลบุรี-01** (วิกฤต)\n',
      '   - น้ำสูญเสียสูงผิดปกติ 28%\n',
      '   - เวลา: 08:30 น.\n\n',
      '2. **DMA เชียงใหม่-03** (สูง)\n',
      '   - แรงดันน้ำลดลงผิดปกติ 1.8 บาร์\n',
      '   - เวลา: 07:15 น.\n\n',
      '3. **DMA ขอนแก่น-02** (ปานกลาง)\n',
      '   - อัตราการไหลเพิ่มขึ้น 40% ช่วงกลางคืน\n',
      '   - เวลา: 03:00 น. (รับทราบแล้ว)\n\n',
      '**การดำเนินการที่แนะนำ:**\n',
      '- ส่งทีมตรวจสอบ DMA ชลบุรี-01 ทันที\n',
      '- ประสานงานกับสาขาเชียงใหม่เรื่องแรงดัน',
    ],
    เปรียบเทียบ: [
      '📈 **การเปรียบเทียบประสิทธิภาพ DMA**\n\n',
      '**Top 5 พื้นที่ที่มีประสิทธิภาพดีที่สุด:**\n\n',
      '| อันดับ | DMA | น้ำสูญเสีย | สถานะ |\n',
      '|--------|-----|------------|-------|\n',
      '| 1 | ภูเก็ต-02 | 8.2% | ✅ ปกติ |\n',
      '| 2 | สมุทรสาคร-01 | 9.5% | ✅ ปกติ |\n',
      '| 3 | ระยอง-03 | 10.1% | ✅ ปกติ |\n',
      '| 4 | นนทบุรี-05 | 11.3% | ✅ ปกติ |\n',
      '| 5 | ปทุมธานี-02 | 11.8% | ✅ ปกติ |\n\n',
      '**พื้นที่ที่ต้องปรับปรุง:**\n\n',
      '| อันดับ | DMA | น้ำสูญเสีย | สถานะ |\n',
      '|--------|-----|------------|-------|\n',
      '| 1 | ชลบุรี-01 | 28.5% | 🔴 วิกฤต |\n',
      '| 2 | เชียงใหม่-03 | 22.1% | 🟡 เฝ้าระวัง |\n',
      '| 3 | สุราษฎร์ธานี-01 | 18.2% | 🟡 เฝ้าระวัง |',
    ],
    แนะนำ: [
      '💡 **คำแนะนำการลดน้ำสูญเสียสำหรับพื้นที่วิกฤต**\n\n',
      '**สำหรับ DMA ชลบุรี-01 (น้ำสูญเสีย 28.5%):**\n\n',
      '**ระยะสั้น (1-2 สัปดาห์):**\n',
      '1. ดำเนินการตรวจหาจุดรั่วด้วยอุปกรณ์ Acoustic Leak Detection\n',
      '2. ปรับลดแรงดันในช่วงกลางคืนเพื่อลดอัตราการรั่วไหล\n',
      '3. ตรวจสอบมิเตอร์วัดน้ำที่อายุเกิน 8 ปี\n\n',
      '**ระยะกลาง (1-3 เดือน):**\n',
      '1. เปลี่ยนท่อที่มีอายุมากกว่า 30 ปีในโซน A\n',
      '2. ติดตั้งเซ็นเซอร์ตรวจจับการรั่วเพิ่มเติม 5 จุด\n',
      '3. ปรับปรุงระบบวาล์วควบคุมแรงดัน\n\n',
      '**ประมาณการผลลัพธ์:**\n',
      '- คาดว่าจะลดน้ำสูญเสียได้ 8-12%\n',
      '- ประหยัดค่าใช้จ่ายประมาณ 2.5 ล้านบาท/ปี\n',
      '- ระยะเวลาคืนทุน: 18 เดือน',
    ],
  };

  // Find matching response based on keywords
  let selectedResponse = responses.default;
  for (const [keyword, response] of Object.entries(responses)) {
    if (prompt.includes(keyword)) {
      selectedResponse = response;
      break;
    }
  }

  // Simulate streaming with delays
  for (const chunk of selectedResponse) {
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
    yield chunk;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    // Create assistant message placeholder
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    // Stream the response
    try {
      for await (const chunk of streamMockResponse(userMessage.content)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ถามตอบ AI</h1>
          <p className="text-muted-foreground">AI Chat Assistant</p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-2">
            <Trash2 className="h-4 w-4" />
            ล้างประวัติ
          </Button>
        )}
      </div>

      {/* Chat Container */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            WARIS AI Assistant
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Online
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">สวัสดีครับ! ผมพร้อมช่วยเหลือ</h2>
                <p className="mt-2 text-center text-muted-foreground">
                  ถามคำถามเกี่ยวกับน้ำสูญเสีย วิเคราะห์ข้อมูล DMA หรือขอคำแนะนำได้เลยครับ
                </p>

                {/* Suggested Prompts */}
                <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto justify-start whitespace-normal p-3 text-left text-sm"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <Sparkles className="mr-2 h-4 w-4 shrink-0 text-primary" />
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar
                      className={cn(
                        'h-8 w-8 shrink-0',
                        message.role === 'assistant' && 'bg-primary text-white'
                      )}
                    >
                      <AvatarFallback
                        className={message.role === 'assistant' ? 'bg-primary text-white' : ''}
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
                        'group relative max-w-[80%] rounded-2xl px-4 py-3',
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-900'
                      )}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.content && message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-10 top-0 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
                          <div className="flex items-center gap-1">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">กำลังคิด...</span>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์คำถามของคุณที่นี่..."
                disabled={isLoading}
                className="flex-1 bg-white"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                ส่ง
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              WARIS AI อาจให้ข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลสำคัญก่อนนำไปใช้งาน
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
