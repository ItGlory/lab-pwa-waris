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
  BookOpen,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Brain,
  Calculator,
  FileSearch,
  Database,
  Lightbulb,
  Target,
  Award,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/chat/markdown-renderer';

interface Source {
  title: string;
  source: string;
  score: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  context_used?: boolean;
}

interface TestQuestion {
  id: string;
  section: string;
  subsection: string;
  question: string;
  expectedAnswer?: string;
  points?: number;
  isSequential?: boolean; // For context awareness - needs previous messages
}

interface TestSection {
  id: string;
  title: string;
  title_th: string;
  icon: React.ElementType;
  points: number;
  description: string;
  type: 'ai' | 'rag';
}

// Test Sections
const testSections: TestSection[] = [
  {
    id: 'context',
    title: 'Context Awareness',
    title_th: '1.1 การสนทนาต่อเนื่องและเข้าใจบริบท',
    icon: MessageSquare,
    points: 20,
    description: 'ทดสอบความสามารถในการจดจำและเข้าใจบริบทจากบทสนทนาก่อนหน้า',
    type: 'ai',
  },
  {
    id: 'logic',
    title: 'Logic & Reasoning',
    title_th: '1.2 การคิดวิเคราะห์และตรรกะ',
    icon: Calculator,
    points: 20,
    description: 'ทดสอบความสามารถในการคิดวิเคราะห์ คำนวณ และใช้ตรรกะ',
    type: 'ai',
  },
  {
    id: 'summarize',
    title: 'Summarization',
    title_th: '1.3 การสรุปความจากบทความภายนอก',
    icon: FileSearch,
    points: 20,
    description: 'ทดสอบการสรุปใจความสำคัญจากบทความ',
    type: 'ai',
  },
  {
    id: 'fact',
    title: 'Fact Retrieval',
    title_th: '2.2 ความถูกต้องของข้อมูล',
    icon: Database,
    points: 15,
    description: 'ทดสอบการดึงข้อมูลจากเอกสาร PWA SOP',
    type: 'rag',
  },
  {
    id: 'synthesis',
    title: 'Synthesis',
    title_th: '2.3 การสังเคราะห์และประยุกต์ใช้',
    icon: Lightbulb,
    points: 15,
    description: 'ทดสอบการสังเคราะห์และประยุกต์ใช้ข้อมูลจากเอกสาร',
    type: 'rag',
  },
];

// POC Test Questions from docs/poc-challenge/test.md
const pocTestQuestions: TestQuestion[] = [
  // ===========================================
  // Section 1: AI Capabilities (60 points)
  // ===========================================

  // 1.1 Context Awareness (20 points) - Sequential questions
  {
    id: 'ctx-1',
    section: 'context',
    subsection: '1.1 Context Awareness',
    question: 'ช่วยร่างบันทึกข้อความเชิญผู้เชี่ยวชาญมาบรรยายเรื่อง AI ในองค์กร ในวันศุกร์ที่ 16 มกราคม 2568 ณ ห้องประชุม EIC',
    points: 4,
    isSequential: true,
  },
  {
    id: 'ctx-2',
    section: 'context',
    subsection: '1.1 Context Awareness',
    question: 'ขอเปลี่ยนโทนให้ดูเป็นกันเองมากขึ้น และสั้นลงหน่อย',
    expectedAnswer: 'ควรปรับภาษาให้ไม่เป็นทางการมากนัก และลดความยาวลง',
    points: 4,
    isSequential: true,
  },
  {
    id: 'ctx-3',
    section: 'context',
    subsection: '1.1 Context Awareness',
    question: 'เปลี่ยนเวลาเป็นช่วงบ่ายแทน',
    expectedAnswer: 'ต้องจดจำว่าเป็นบันทึกข้อความเดิม และเปลี่ยนเวลาเป็นช่วงบ่าย',
    points: 4,
    isSequential: true,
  },
  {
    id: 'ctx-4',
    section: 'context',
    subsection: '1.1 Context Awareness',
    question: 'สรุปภาพหน่อยว่าใคร ต้องทำอะไร ที่ไหน เมื่อไหร่',
    expectedAnswer: 'สรุปข้อมูล: ใคร, ทำอะไร, ที่ไหน, เมื่อไหร่ จากบันทึกที่ร่างไว้',
    points: 4,
    isSequential: true,
  },
  {
    id: 'ctx-5',
    section: 'context',
    subsection: '1.1 Context Awareness',
    question: 'ช่วยดึงข้อมูลวันที่ เวลา และสถานที่ จากจดหมาย มาแสดงเป็นรูปแบบตาราง (Table)',
    expectedAnswer: 'แสดงตาราง: วันที่ | เวลา | สถานที่',
    points: 4,
    isSequential: true,
  },

  // 1.2 Logic & Reasoning (20 points)
  {
    id: 'logic-1',
    section: 'logic',
    subsection: '1.2 Logic & Reasoning',
    question: 'ถ้าวันนี้เป็นวันจันทร์ อีก 45 วัน จะเป็นวันอะไร?',
    expectedAnswer: 'วันพฤหัสบดี (45 mod 7 = 3 วัน)',
    points: 4,
  },
  {
    id: 'logic-2',
    section: 'logic',
    subsection: '1.2 Logic & Reasoning',
    question: 'วิเคราะห์ข้อดี-ข้อเสีย ของการทำงาน 4 วันต่อสัปดาห์ แบบตาราง',
    expectedAnswer: 'ตารางเปรียบเทียบข้อดี (Work-life balance, ลดค่าใช้จ่าย) vs ข้อเสีย (งานอาจล่าช้า, ต้องทำงานหนักขึ้น)',
    points: 4,
  },
  {
    id: 'logic-3',
    section: 'logic',
    subsection: '1.2 Logic & Reasoning',
    question: 'สมชายวิ่งแข่งคนลำดับที่ 2 ตอนนี้สมชายอยู่อันดับที่เท่าไหร่?',
    expectedAnswer: 'อันดับที่ 2 (แซงคนอันดับ 2 = เข้าแทนที่อันดับ 2)',
    points: 4,
  },
  {
    id: 'logic-4',
    section: 'logic',
    subsection: '1.2 Logic & Reasoning',
    question: 'จงเขียนแผนการท่องเที่ยวเชียงใหม่ 1 วัน แบบเน้นวัดและของกิน',
    expectedAnswer: 'แผนการเที่ยว: เช้า-วัดพระธาตุดอยสุเทพ, กลางวัน-ข้าวซอย, บ่าย-วัดในเมืองเก่า, เย็น-ถนนคนเดิน',
    points: 4,
  },
  {
    id: 'logic-5',
    section: 'logic',
    subsection: '1.2 Logic & Reasoning',
    question: '25 + 25 * 0 + 1 ได้เท่าไหร่?',
    expectedAnswer: '26 (ลำดับการคำนวณ: 25*0=0, 25+0+1=26)',
    points: 4,
  },

  // 1.3 Summarization (20 points)
  {
    id: 'sum-1',
    section: 'summarize',
    subsection: '1.3 Summarization',
    question: 'สรุปใจความสำคัญจากบทความ https://www.pwa.co.th/news/view/130338 เป็นข้อๆ ไม่เกิน 5 บรรทัด',
    expectedAnswer: 'สรุปประเด็นสำคัญ 3-5 ข้อจากบทความข่าว กปภ.',
    points: 10,
  },
  {
    id: 'sum-2',
    section: 'summarize',
    subsection: '1.3 Summarization',
    question: 'ขอ 3 คำสำคัญ (Keywords) ของบทความที่เพิ่งสรุป',
    expectedAnswer: 'Keywords ที่เกี่ยวข้องกับเนื้อหาบทความ เช่น กปภ., บริการน้ำประปา, ภูมิภาค',
    points: 10,
    isSequential: true,
  },

  // ===========================================
  // Section 2: RAG Capabilities (40 points)
  // ===========================================

  // 2.2 Fact Retrieval (15 points)
  {
    id: 'fact-1',
    section: 'fact',
    subsection: '2.2 Fact Retrieval',
    question: 'น้ำสูญเสียคืออะไร?',
    expectedAnswer: 'น้ำที่จ่ายเข้าระบบแล้ว ไม่ก่อให้เกิดรายได้ แบ่งเป็น 2 ประเภท: (1) น้ำสูญเสียเชิงกายภาพ - ท่อแตกรั่ว (2) น้ำสูญเสียเชิงพาณิชย์ - มาตรวัดน้ำชำรุด/คลาดเคลื่อน',
    points: 3,
  },
  {
    id: 'fact-2',
    section: 'fact',
    subsection: '2.2 Fact Retrieval',
    question: 'DMA คืออะไร?',
    expectedAnswer: 'District Metering Area - การแบ่งพื้นที่ย่อยในสาขาเพื่อจำกัดขอบเขตและง่ายต่อการเฝ้าระวัง ติดตั้งอุปกรณ์วัดปริมาณน้ำเข้า-ออกและแรงดันน้ำ ส่งข้อมูลแบบ Real Time',
    points: 3,
  },
  {
    id: 'fact-3',
    section: 'fact',
    subsection: '2.2 Fact Retrieval',
    question: 'MNF คืออะไร?',
    expectedAnswer: 'Minimum Night Flow - ค่าการจ่ายน้ำช่วงเวลากลางคืน ใช้เป็นข้อมูลหลักในการวิเคราะห์น้ำสูญเสียในแต่ละพื้นที่ย่อย',
    points: 3,
  },
  {
    id: 'fact-4',
    section: 'fact',
    subsection: '2.2 Fact Retrieval',
    question: 'หากพบปัญหามาตรวัดน้ำหลักมีปริมาณน้ำคลาดเคลื่อนเกินกว่าเท่าไรจึงต้องดำเนินการแก้ไข?',
    expectedAnswer: '±4% (จากเอกสาร PWA67_10-3.pdf)',
    points: 3,
  },
  {
    id: 'fact-5',
    section: 'fact',
    subsection: '2.2 Fact Retrieval',
    question: 'ขั้นตอนที่ 3 ของการปฏิบัติงานกระบวนการจัดการน้ำสูญเสียเชิงกายภาพ คืออะไร?',
    expectedAnswer: 'วิเคราะห์ข้อมูล MNF, Flow, Pressure (ทุกวันทำการ) - เป็นข้อมูลหลักที่นำมาติดตามวิเคราะห์น้ำสูญเสียในแต่ละพื้นที่ย่อย',
    points: 3,
  },

  // 2.3 Synthesis & Application (15 points)
  {
    id: 'synth-1',
    section: 'synthesis',
    subsection: '2.3 Synthesis',
    question: 'สรุปขั้นตอนการบริหารจัดการน้ำสูญเสียเชิงกายภาพ',
    expectedAnswer: '9 ขั้นตอน: 1.กำหนดเป้าหมาย MNF → 2.ติดตามเฝ้าระวัง DMA → 3.วิเคราะห์ข้อมูล → 4.ตรวจสอบความผิดปกติ → 5.Step Test → 6.ALC → 7.ซ่อมแซม → 8.บันทึกข้อมูล Smart 1662 → 9.ควบคุมแรงดัน',
    points: 5,
  },
  {
    id: 'synth-2',
    section: 'synthesis',
    subsection: '2.3 Synthesis',
    question: 'หากพบ Step test ที่มีน้ำสูญเสียสูง ต้องดำเนินการอย่างไรต่อ?',
    expectedAnswer: 'ดำเนินการสำรวจหาท่อแตกท่อรั่วเชิงรุก (ALC - Active Leak Control) หรืออาจได้รับการแจ้งจากประชาชนผ่าน Call center 1662 หลังดำเนินการเสร็จให้บันทึกข้อมูลผ่าน Smart 1662',
    points: 5,
  },
  {
    id: 'synth-3',
    section: 'synthesis',
    subsection: '2.3 Synthesis',
    question: 'ช่วยบอกจุดควบคุมแต่ละขั้นตอน ของการบริหารจัดการน้ำสูญเสียเชิงกายภาพ',
    expectedAnswer: 'CP1: อุปกรณ์ส่งสัญญาณมีความพร้อมในการใช้งานตลอดเวลา, CP2: พื้นที่ที่มีอัตราการใช้น้ำปริมาณมาก และจุดที่มีการแตกรั่วบ่อย',
    points: 5,
  },
];

function POCTestPageContent() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [expandedSources, setExpandedSources] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState('overview');
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [testScores, setTestScores] = React.useState<Record<string, number>>({});
  const [completedQuestions, setCompletedQuestions] = React.useState<Set<string>>(new Set());
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Calculate total scores
  const totalPoints = 100;
  const aiPoints = 60;
  const ragPoints = 40;
  const currentScore = Object.values(testScores).reduce((sum, score) => sum + score, 0);
  const aiScore = Object.entries(testScores)
    .filter(([key]) => ['context', 'logic', 'summarize'].some(s => key.startsWith(s)))
    .reduce((sum, [, score]) => sum + score, 0);
  const ragScore = Object.entries(testScores)
    .filter(([key]) => ['fact', 'synth'].some(s => key.startsWith(s)))
    .reduce((sum, [, score]) => sum + score, 0);

  // Get questions by section
  const getQuestionsBySection = (sectionId: string) => {
    return pocTestQuestions.filter(q => q.section === sectionId);
  };

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendRAGQuery = async (userMessage: string, retries = 3): Promise<{
    answer: string;
    sources: Source[];
    context_used: boolean;
  }> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

        const response = await fetch('/api/v1/knowledge/chat/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            conversation_history: messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            category: 'standards',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Retry on 5xx errors
          if (response.status >= 500 && attempt < retries - 1) {
            console.warn(`Server error ${response.status}, retrying (${attempt + 1}/${retries})...`);
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;

        // Retry on network errors or aborted requests
        if (attempt < retries - 1 && (
          (error as Error).name === 'AbortError' ||
          (error as Error).message?.includes('fetch')
        )) {
          console.warn(`Request failed, retrying (${attempt + 1}/${retries})...`);
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
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

    try {
      const result = await sendRAGQuery(userMessage.content);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        sources: result.sources,
        context_used: result.context_used,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('RAG query error:', error);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'ขออภัย ไม่สามารถเชื่อมต่อกับระบบ RAG ได้ในขณะนี้ กรุณาตรวจสอบว่า Knowledge Base ถูก index แล้ว',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleTestQuestion = (question: TestQuestion) => {
    setInput(question.question);
    setActiveTab('chat');
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

  const toggleSources = (messageId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 bg-emerald-100';
    if (score >= 0.6) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
            ทดสอบ POC - Proof of Concept
          </h1>
          <p className="text-muted-foreground">
            ทดสอบความสามารถระบบ AI (60 คะแนน) และ RAG (40 คะแนน) ตามข้อกำหนด POC Challenge
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Score Display */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)]/10 to-[var(--pwa-blue-deep)]/5 border">
            <Award className="h-5 w-5 text-[var(--pwa-cyan)]" />
            <div className="text-sm">
              <span className="font-bold text-lg">{currentScore}</span>
              <span className="text-muted-foreground">/{totalPoints}</span>
              <span className="ml-2 text-xs text-muted-foreground">คะแนน</span>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="gap-2 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              ล้างประวัติ
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="ai-test" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Test (60)
          </TabsTrigger>
          <TabsTrigger value="rag-test" className="gap-2">
            <Database className="h-4 w-4" />
            RAG Test (40)
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            แชท
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Score Summary Cards */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  สรุปคะแนน POC Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Total Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">คะแนนรวม</span>
                    <span>{currentScore}/{totalPoints} คะแนน</span>
                  </div>
                  <Progress value={(currentScore / totalPoints) * 100} className="h-3" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* AI Score */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">ส่วนที่ 1: AI Capabilities</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-purple-600">{aiScore}</span>
                      <span className="text-muted-foreground">/{aiPoints} คะแนน</span>
                    </div>
                    <Progress value={(aiScore / aiPoints) * 100} className="h-2 mt-2" />
                  </div>

                  {/* RAG Score */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)]/10 to-[var(--pwa-blue-deep)]/5 border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-[var(--pwa-cyan)]" />
                      <span className="font-semibold">ส่วนที่ 2: RAG Capabilities</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-[var(--pwa-cyan)]">{ragScore}</span>
                      <span className="text-muted-foreground">/{ragPoints} คะแนน</span>
                    </div>
                    <Progress value={(ragScore / ragPoints) * 100} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Documents */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  เอกสารที่ใช้ทดสอบ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="font-medium text-sm">PWA67_10-3.pdf</p>
                  <p className="text-xs text-muted-foreground">น้ำสูญเสียเชิงพาณิชย์</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="font-medium text-sm">PWA67_10-4.pdf</p>
                  <p className="text-xs text-muted-foreground">น้ำสูญเสียเชิงกายภาพ</p>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href="/admin/knowledge-base" target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    Knowledge Base
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Test Sections Overview */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  หัวข้อการทดสอบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {testSections.map((section) => {
                    const questions = getQuestionsBySection(section.id);
                    const completedCount = questions.filter(q => completedQuestions.has(q.id)).length;
                    const SectionIcon = section.icon;

                    return (
                      <Card
                        key={section.id}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          section.type === 'ai' ? 'hover:border-purple-400' : 'hover:border-[var(--pwa-cyan)]'
                        )}
                        onClick={() => {
                          setActiveTab(section.type === 'ai' ? 'ai-test' : 'rag-test');
                          setActiveSection(section.id);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center mb-3',
                            section.type === 'ai' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-cyan-100 text-[var(--pwa-cyan)] dark:bg-cyan-900/30'
                          )}>
                            <SectionIcon className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-sm">{section.title_th}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant={section.type === 'ai' ? 'secondary' : 'outline'} className="text-xs">
                              {section.points} คะแนน
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {completedCount}/{questions.length} ข้อ
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Test Tab */}
        <TabsContent value="ai-test" className="flex-1 mt-4">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Section List */}
            <Card className="lg:col-span-1">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  ส่วนที่ 1: AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  <div className="space-y-2 p-2">
                    {testSections.filter(s => s.type === 'ai').map((section) => {
                      const questions = getQuestionsBySection(section.id);
                      const completedCount = questions.filter(q => completedQuestions.has(q.id)).length;
                      const SectionIcon = section.icon;

                      return (
                        <Card
                          key={section.id}
                          className={cn(
                            'cursor-pointer transition-all',
                            activeSection === section.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-purple-300'
                          )}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <SectionIcon className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{section.title_th}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={(completedCount / questions.length) * 100} className="h-1 flex-1" />
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {completedCount}/{questions.length}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {section.points}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="lg:col-span-2">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  {activeSection
                    ? testSections.find(s => s.id === activeSection)?.title_th || 'คำถามทดสอบ'
                    : 'เลือกหัวข้อเพื่อดูคำถาม'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  <div className="p-4 space-y-3">
                    {activeSection ? (
                      getQuestionsBySection(activeSection).map((question, idx) => (
                        <Card
                          key={question.id}
                          className={cn(
                            'transition-all hover:border-purple-400 cursor-pointer',
                            completedQuestions.has(question.id) && 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10'
                          )}
                          onClick={() => handleTestQuestion(question)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold',
                                completedQuestions.has(question.id)
                                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                  : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                              )}>
                                {completedQuestions.has(question.id) ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{question.question}</p>
                                {question.expectedAnswer && (
                                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
                                    <span className="font-medium text-emerald-600">คำตอบที่ถูกต้อง:</span>{' '}
                                    {question.expectedAnswer}
                                  </p>
                                )}
                                {question.isSequential && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    ต่อเนื่องจากคำถามก่อน
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {question.points} คะแนน
                                </Badge>
                                <Button size="sm" variant="ghost" className="text-purple-500">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">เลือกหัวข้อทางซ้ายเพื่อดูคำถาม</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RAG Test Tab */}
        <TabsContent value="rag-test" className="flex-1 mt-4">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Section List */}
            <Card className="lg:col-span-1">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  ส่วนที่ 2: RAG Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  <div className="space-y-2 p-2">
                    {testSections.filter(s => s.type === 'rag').map((section) => {
                      const questions = getQuestionsBySection(section.id);
                      const completedCount = questions.filter(q => completedQuestions.has(q.id)).length;
                      const SectionIcon = section.icon;

                      return (
                        <Card
                          key={section.id}
                          className={cn(
                            'cursor-pointer transition-all',
                            activeSection === section.id ? 'border-[var(--pwa-cyan)] bg-cyan-50 dark:bg-cyan-900/20' : 'hover:border-cyan-300'
                          )}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                <SectionIcon className="h-4 w-4 text-[var(--pwa-cyan)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{section.title_th}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={(completedCount / questions.length) * 100} className="h-1 flex-1" />
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {completedCount}/{questions.length}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {section.points}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Knowledge Base Link */}
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-2">เอกสารที่ใช้ทดสอบ:</p>
                      <div className="space-y-1 text-xs">
                        <p>• PWA67_10-3.pdf (น้ำสูญเสียเชิงพาณิชย์)</p>
                        <p>• PWA67_10-4.pdf (น้ำสูญเสียเชิงกายภาพ)</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2 gap-2" asChild>
                        <a href="/admin/knowledge-base" target="_blank">
                          <ExternalLink className="h-3 w-3" />
                          Knowledge Base
                        </a>
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="lg:col-span-2">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  {activeSection
                    ? testSections.find(s => s.id === activeSection)?.title_th || 'คำถามทดสอบ'
                    : 'เลือกหัวข้อเพื่อดูคำถาม'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  <div className="p-4 space-y-3">
                    {activeSection && testSections.find(s => s.id === activeSection)?.type === 'rag' ? (
                      getQuestionsBySection(activeSection).map((question, idx) => (
                        <Card
                          key={question.id}
                          className={cn(
                            'transition-all hover:border-[var(--pwa-cyan)] cursor-pointer',
                            completedQuestions.has(question.id) && 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10'
                          )}
                          onClick={() => handleTestQuestion(question)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold',
                                completedQuestions.has(question.id)
                                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                  : 'bg-cyan-100 text-[var(--pwa-cyan)] dark:bg-cyan-900/30'
                              )}>
                                {completedQuestions.has(question.id) ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{question.question}</p>
                                {question.expectedAnswer && (
                                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
                                    <span className="font-medium text-emerald-600">คำตอบที่ถูกต้อง:</span>{' '}
                                    {question.expectedAnswer}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {question.points} คะแนน
                                </Badge>
                                <Button size="sm" variant="ghost" className="text-[var(--pwa-cyan)]">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Database className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">เลือกหัวข้อทางซ้ายเพื่อดูคำถาม</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 mt-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent font-semibold">
                  POC RAG Test
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  Knowledge Base + LLM
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10">
                      <BookOpen className="h-8 w-8 text-[var(--pwa-cyan)]" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">ทดสอบระบบ RAG</h2>
                    <p className="mt-2 text-center text-muted-foreground text-sm max-w-md">
                      ถามคำถามจากเอกสาร PWA67_10-3.pdf และ PWA67_10-4.pdf
                      <br />
                      ระบบจะดึงข้อมูลจาก Knowledge Base มาช่วยตอบ
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('rag-test')}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        คำถาม RAG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('ai-test')}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        คำถาม AI
                      </Button>
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
                            message.role === 'assistant'
                              ? 'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]'
                              : ''
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
                            'group relative max-w-[85%] rounded-2xl px-4 py-3',
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white'
                              : 'bg-muted/80'
                          )}
                        >
                          <MarkdownRenderer
                                            content={message.content}
                                            isUserMessage={message.role === 'user'}
                                          />

                          {/* Sources Section for Assistant */}
                          {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                            <Collapsible
                              open={expandedSources.has(message.id)}
                              onOpenChange={() => toggleSources(message.id)}
                              className="mt-3"
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-between text-xs hover:bg-background/50"
                                >
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    แหล่งอ้างอิง ({message.sources.length})
                                  </span>
                                  {expandedSources.has(message.id) ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 space-y-2">
                                {message.sources.map((source, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg bg-background/50 p-2 text-xs border"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium truncate flex-1">
                                        {source.title || 'เอกสาร'}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className={cn('ml-2 text-[10px]', getScoreColor(source.score))}
                                      >
                                        {(source.score * 100).toFixed(0)}%
                                      </Badge>
                                    </div>
                                    <p className="text-muted-foreground truncate">
                                      {source.source}
                                    </p>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {/* Context indicator */}
                          {message.role === 'assistant' && message.context_used !== undefined && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              {message.context_used ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  ใช้ข้อมูลจาก Knowledge Base
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 text-amber-500" />
                                  ไม่พบข้อมูลในฐานความรู้
                                </>
                              )}
                            </div>
                          )}

                          {/* Copy button */}
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

                          {/* Loading indicator */}
                          {isLoading &&
                            message.role === 'assistant' &&
                            message.id === messages[messages.length - 1]?.id &&
                            !message.content && (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-[var(--pwa-cyan)]" />
                                <span className="text-sm text-muted-foreground">กำลังค้นหาและประมวลผล...</span>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="พิมพ์คำถามเพื่อทดสอบ RAG..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="gap-2 bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]"
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
                  POC Test Mode - ตอบจาก Knowledge Base เท่านั้น
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wrapper component to prevent hydration mismatch by rendering only on client
export default function POCTestPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a minimal loading skeleton during SSR/hydration
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="flex-1 bg-muted/50 animate-pulse rounded-xl" />
      </div>
    );
  }

  return <POCTestPageContent />;
}
