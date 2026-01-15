'use client';

import * as React from 'react';
import {
  BookOpen,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  File,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  FolderPlus,
  Folder,
  Tag,
  Calendar,
  User,
  Database,
  Zap,
  ChevronRight,
  ChevronLeft,
  FileUp,
  FileCheck,
  FileX,
  Bot,
  Sparkles,
  Link2,
  ExternalLink,
  Copy,
  Settings2,
  BarChart3,
  Hash,
  Layers,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Play,
  Terminal,
  FileQuestion,
  BookMarked,
  Send,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Interfaces
interface Document {
  id: string;
  title: string;
  title_th: string;
  filename: string;
  file_type: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'md';
  file_size: number;
  category: string;
  tags: string[];
  status: 'indexed' | 'processing' | 'failed' | 'pending';
  chunks: number;
  vectors: number;
  uploaded_by: string;
  uploaded_at: string;
  last_indexed: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  name_th: string;
  count: number;
  icon: string;
}

interface KBStats {
  total_documents: number;
  total_chunks: number;
  total_vectors: number;
  storage_used_mb: number;
  indexed: number;
  processing: number;
  failed: number;
  pending: number;
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    title: 'Water Loss Management Guidelines',
    title_th: 'แนวทางการจัดการน้ำสูญเสีย',
    filename: 'water-loss-guidelines-2024.pdf',
    file_type: 'pdf',
    file_size: 2450000,
    category: 'guidelines',
    tags: ['น้ำสูญเสีย', 'NRW', 'แนวปฏิบัติ'],
    status: 'indexed',
    chunks: 156,
    vectors: 156,
    uploaded_by: 'สมชาย มั่งมี',
    uploaded_at: '2025-12-15T10:00:00Z',
    last_indexed: '2026-01-10T08:30:00Z',
    description: 'คู่มือแนวทางการจัดการน้ำสูญเสียฉบับปรับปรุง 2024',
  },
  {
    id: 'doc-002',
    title: 'DMA Management Manual',
    title_th: 'คู่มือการจัดการ DMA',
    filename: 'dma-manual-v3.pdf',
    file_type: 'pdf',
    file_size: 5200000,
    category: 'manuals',
    tags: ['DMA', 'คู่มือ', 'การจัดการ'],
    status: 'indexed',
    chunks: 312,
    vectors: 312,
    uploaded_by: 'สุภาพร วงศ์ไพศาล',
    uploaded_at: '2025-11-20T09:00:00Z',
    last_indexed: '2026-01-08T14:00:00Z',
    description: 'คู่มือการจัดการพื้นที่จ่ายน้ำย่อย (DMA) ฉบับที่ 3',
  },
  {
    id: 'doc-003',
    title: 'SCADA System Documentation',
    title_th: 'เอกสารระบบ SCADA',
    filename: 'scada-docs.docx',
    file_type: 'docx',
    file_size: 1800000,
    category: 'technical',
    tags: ['SCADA', 'ระบบ', 'เทคนิค'],
    status: 'indexed',
    chunks: 89,
    vectors: 89,
    uploaded_by: 'วิชัย สุขใจ',
    uploaded_at: '2025-10-05T11:00:00Z',
    last_indexed: '2026-01-05T10:00:00Z',
  },
  {
    id: 'doc-004',
    title: 'Leak Detection Procedures',
    title_th: 'ขั้นตอนการตรวจหารอยรั่ว',
    filename: 'leak-detection-procedures.pdf',
    file_type: 'pdf',
    file_size: 890000,
    category: 'procedures',
    tags: ['รอยรั่ว', 'การตรวจสอบ', 'ขั้นตอน'],
    status: 'processing',
    chunks: 0,
    vectors: 0,
    uploaded_by: 'สมชาย มั่งมี',
    uploaded_at: '2026-01-14T15:30:00Z',
    last_indexed: '2026-01-14T15:30:00Z',
  },
  {
    id: 'doc-005',
    title: 'Meter Reading Standards',
    title_th: 'มาตรฐานการอ่านมิเตอร์',
    filename: 'meter-standards.xlsx',
    file_type: 'xlsx',
    file_size: 450000,
    category: 'standards',
    tags: ['มิเตอร์', 'มาตรฐาน', 'การอ่าน'],
    status: 'indexed',
    chunks: 45,
    vectors: 45,
    uploaded_by: 'มานี รักดี',
    uploaded_at: '2025-09-10T08:00:00Z',
    last_indexed: '2026-01-03T09:00:00Z',
  },
  {
    id: 'doc-006',
    title: 'Pipe Network Analysis Report',
    title_th: 'รายงานวิเคราะห์โครงข่ายท่อ',
    filename: 'pipe-network-analysis.pdf',
    file_type: 'pdf',
    file_size: 3200000,
    category: 'reports',
    tags: ['ท่อ', 'โครงข่าย', 'วิเคราะห์'],
    status: 'failed',
    chunks: 0,
    vectors: 0,
    uploaded_by: 'ประยุทธ์ ชัยชนะ',
    uploaded_at: '2026-01-12T14:00:00Z',
    last_indexed: '2026-01-12T14:05:00Z',
    description: 'ไฟล์เสียหาย ไม่สามารถประมวลผลได้',
  },
  {
    id: 'doc-007',
    title: 'PWA Regulations 2024',
    title_th: 'ระเบียบ กปภ. 2567',
    filename: 'pwa-regulations-2024.pdf',
    file_type: 'pdf',
    file_size: 1500000,
    category: 'regulations',
    tags: ['ระเบียบ', 'กปภ', '2567'],
    status: 'pending',
    chunks: 0,
    vectors: 0,
    uploaded_by: 'สมชาย มั่งมี',
    uploaded_at: '2026-01-15T09:00:00Z',
    last_indexed: '',
  },
];

const mockCategories: Category[] = [
  { id: 'guidelines', name: 'Guidelines', name_th: 'แนวทาง', count: 5, icon: 'book' },
  { id: 'manuals', name: 'Manuals', name_th: 'คู่มือ', count: 8, icon: 'file-text' },
  { id: 'technical', name: 'Technical', name_th: 'เทคนิค', count: 12, icon: 'settings' },
  { id: 'procedures', name: 'Procedures', name_th: 'ขั้นตอน', count: 6, icon: 'list' },
  { id: 'standards', name: 'Standards', name_th: 'มาตรฐาน', count: 4, icon: 'check' },
  { id: 'reports', name: 'Reports', name_th: 'รายงาน', count: 15, icon: 'bar-chart' },
  { id: 'regulations', name: 'Regulations', name_th: 'ระเบียบ', count: 3, icon: 'shield' },
];

const mockStats: KBStats = {
  total_documents: 53,
  total_chunks: 4250,
  total_vectors: 4250,
  storage_used_mb: 256,
  indexed: 48,
  processing: 2,
  failed: 1,
  pending: 2,
};

// KM-specific interfaces
interface KMDocument {
  id: string;
  title: string;
  filename: string;
  category: string;
  keywords: string[];
  updated: string;
  faq_count: number;
  word_count: number;
  status: 'valid' | 'warning' | 'error';
  issues: string[];
}

interface KMValidationResult {
  total_files: number;
  valid_files: number;
  warning_files: number;
  error_files: number;
  total_faq: number;
  total_words: number;
  issues: Array<{
    file: string;
    type: 'error' | 'warning';
    message: string;
  }>;
}

interface SearchResult {
  title: string;
  file_path: string;
  content: string;
  score: number;
  is_faq: boolean;
  question?: string;
}

// Mock KM data
const mockKMDocuments: KMDocument[] = [
  {
    id: 'km-001',
    title: 'พื้นฐานน้ำสูญเสีย (NRW Basics)',
    filename: '01-nrw-basics.md',
    category: 'water-loss',
    keywords: ['NRW', 'น้ำสูญเสีย', 'Real Losses', 'Apparent Losses'],
    updated: '2567-01-15',
    faq_count: 8,
    word_count: 1250,
    status: 'valid',
    issues: [],
  },
  {
    id: 'km-002',
    title: 'น้ำสูญเสียทางกายภาพ (Physical Loss)',
    filename: '02-physical-loss.md',
    category: 'water-loss',
    keywords: ['Real Losses', 'รั่ว', 'ท่อแตก', 'ILI'],
    updated: '2567-01-15',
    faq_count: 6,
    word_count: 980,
    status: 'valid',
    issues: [],
  },
  {
    id: 'km-003',
    title: 'น้ำสูญเสียเชิงพาณิชย์ (Commercial Loss)',
    filename: '03-commercial-loss.md',
    category: 'water-loss',
    keywords: ['Apparent Losses', 'มิเตอร์', 'ลักน้ำ'],
    updated: '2567-01-15',
    faq_count: 5,
    word_count: 870,
    status: 'warning',
    issues: ['FAQ count < 5 recommended'],
  },
  {
    id: 'km-004',
    title: 'พื้นฐาน DMA (DMA Basics)',
    filename: '01-dma-basics.md',
    category: 'dma-management',
    keywords: ['DMA', 'พื้นที่จ่ายน้ำ', 'District Metered Area'],
    updated: '2567-01-15',
    faq_count: 7,
    word_count: 1100,
    status: 'valid',
    issues: [],
  },
  {
    id: 'km-005',
    title: 'การติดตาม DMA (DMA Monitoring)',
    filename: '02-monitoring.md',
    category: 'dma-management',
    keywords: ['MNF', 'SCADA', 'Data Logger'],
    updated: '2567-01-15',
    faq_count: 4,
    word_count: 920,
    status: 'warning',
    issues: ['Missing cross-references'],
  },
  {
    id: 'km-006',
    title: 'คำศัพท์ภาษาพูด (Colloquial Terms)',
    filename: '03-colloquial-terms.md',
    category: 'glossary',
    keywords: ['คำพูด', 'synonym', 'mapping'],
    updated: '2567-01-15',
    faq_count: 10,
    word_count: 750,
    status: 'valid',
    issues: [],
  },
  {
    id: 'km-007',
    title: 'การแก้ไขปัญหา (Troubleshooting)',
    filename: '01-troubleshooting.md',
    category: 'scenarios',
    keywords: ['แก้ปัญหา', 'decision tree', 'วิเคราะห์'],
    updated: '2567-01-15',
    faq_count: 12,
    word_count: 1450,
    status: 'valid',
    issues: [],
  },
  {
    id: 'km-008',
    title: 'คำแนะนำตามสถานการณ์ (Recommendations)',
    filename: '02-recommendations.md',
    category: 'scenarios',
    keywords: ['คำแนะนำ', 'suggestion', 'แนะนำ'],
    updated: '2567-01-15',
    faq_count: 5,
    word_count: 1080,
    status: 'valid',
    issues: [],
  },
];

const mockKMValidation: KMValidationResult = {
  total_files: 19,
  valid_files: 17,
  warning_files: 2,
  error_files: 0,
  total_faq: 88,
  total_words: 14947,
  issues: [
    { file: '03-commercial-loss.md', type: 'warning', message: 'FAQ count is less than recommended (5)' },
    { file: '02-monitoring.md', type: 'warning', message: 'Missing cross-references to related documents' },
  ],
};

const mockSearchResults: SearchResult[] = [
  {
    title: 'พื้นฐานน้ำสูญเสีย (NRW Basics)',
    file_path: 'docs/km/water-loss/01-nrw-basics.md',
    content: 'NRW (Non-Revenue Water) หรือ น้ำสูญเสีย คือปริมาณน้ำที่ผลิตได้แต่ไม่สามารถจำหน่ายและเก็บเงินได้...',
    score: 0.92,
    is_faq: false,
  },
  {
    title: 'FAQ: NRW คืออะไร?',
    file_path: 'docs/km/water-loss/01-nrw-basics.md',
    content: 'NRW (Non-Revenue Water) คือน้ำที่ผลิตได้แต่ไม่สามารถจำหน่ายได้...',
    score: 0.95,
    is_faq: true,
    question: 'NRW คืออะไร? น้ำสูญเสียหมายถึงอะไร?',
  },
  {
    title: 'คำศัพท์: NRW',
    file_path: 'docs/km/glossary/01-thai-english.md',
    content: 'NRW (Non-Revenue Water) = น้ำสูญเสีย, น้ำไม่ก่อรายได้',
    score: 0.88,
    is_faq: false,
  },
];

export default function KnowledgeBasePage() {
  const [loading, setLoading] = React.useState(true);
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [stats, setStats] = React.useState<KBStats | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isReindexing, setIsReindexing] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const docsPerPage = 10;

  // KM-specific state
  const [kmDocuments, setKMDocuments] = React.useState<KMDocument[]>([]);
  const [kmValidation, setKMValidation] = React.useState<KMValidationResult | null>(null);
  const [searchQuery2, setSearchQuery2] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [isIndexing, setIsIndexing] = React.useState(false);
  const [kmCategoryFilter, setKMCategoryFilter] = React.useState<string>('all');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDocuments(mockDocuments);
      setCategories(mockCategories);
      setStats(mockStats);
      setKMDocuments(mockKMDocuments);
      setKMValidation(mockKMValidation);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleKMSearch = async () => {
    if (!searchQuery2.trim()) return;
    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSearchResults(mockSearchResults);
    setIsSearching(false);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setKMValidation(mockKMValidation);
    setIsValidating(false);
  };

  const handleIndexKM = async () => {
    setIsIndexing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsIndexing(false);
  };

  const filteredKMDocs = kmDocuments.filter((doc) =>
    kmCategoryFilter === 'all' || doc.category === kmCategoryFilter
  );

  const kmCategories = [...new Set(kmDocuments.map((d) => d.category))];

  const getKMStatusBadge = (status: KMDocument['status']) => {
    switch (status) {
      case 'valid':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title_th.includes(searchQuery) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.includes(searchQuery));

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDocuments.length / docsPerPage);
  const paginatedDocs = filteredDocuments.slice(
    (currentPage - 1) * docsPerPage,
    currentPage * docsPerPage
  );

  const handleReindex = async () => {
    setIsReindexing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsReindexing(false);
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileIcon = (type: Document['file_type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xlsx':
        return <FileText className="h-5 w-5 text-emerald-500" />;
      case 'txt':
      case 'md':
        return <File className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'indexed':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Indexed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 animate-pulse">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/10">
                <BookOpen className="h-5 w-5 text-amber-500" />
              </div>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Knowledge Base
              </span>
            </h1>
            <p className="text-muted-foreground">
              จัดการคลังความรู้สำหรับ RAG System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReindex}
              disabled={isReindexing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isReindexing ? 'animate-spin' : ''}`} />
              Re-index All
            </Button>
            <Button
              onClick={() => {
                setIsUploadDialogOpen(true);
                simulateUpload();
              }}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
            >
              <Upload className="h-4 w-4" />
              อัปโหลดเอกสาร
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">เอกสารทั้งหมด</p>
                    <p className="text-2xl font-bold">{stats.total_documents}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Chunks</p>
                    <p className="text-2xl font-bold">{stats.total_chunks.toLocaleString()}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                    <Layers className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Vectors</p>
                    <p className="text-2xl font-bold">{stats.total_vectors.toLocaleString()}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                    <Database className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Indexed</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.indexed}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                    <FileCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Storage</p>
                    <p className="text-2xl font-bold">{stats.storage_used_mb} MB</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-teal-500/10">
                    <Database className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg">
            <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <FileText className="h-4 w-4" />
              เอกสาร
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Folder className="h-4 w-4" />
              หมวดหมู่
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Settings2 className="h-4 w-4" />
              ตั้งค่า RAG
            </TabsTrigger>
            <TabsTrigger value="km-docs" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <BookMarked className="h-4 w-4" />
              KM Docs
            </TabsTrigger>
            <TabsTrigger value="km-test" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <MessageSquare className="h-4 w-4" />
              ทดสอบ RAG
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 animate-blur-in">
            {/* Filters */}
            <Card className="backdrop-blur-sm bg-background/80 border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาเอกสาร, ชื่อไฟล์, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="หมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name_th}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="indexed">Indexed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <CardContent className="relative p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left p-4 font-medium text-sm">เอกสาร</th>
                        <th className="text-left p-4 font-medium text-sm">หมวดหมู่</th>
                        <th className="text-left p-4 font-medium text-sm">สถานะ</th>
                        <th className="text-left p-4 font-medium text-sm">Chunks</th>
                        <th className="text-left p-4 font-medium text-sm">อัปโหลดโดย</th>
                        <th className="text-left p-4 font-medium text-sm">วันที่</th>
                        <th className="text-left p-4 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDocs.map((doc, index) => (
                        <tr
                          key={doc.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-slide-up-fade cursor-pointer"
                          style={{ animationDelay: `${index * 30}ms` }}
                          onClick={() => handleViewDocument(doc)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                                {getFileIcon(doc.file_type)}
                              </div>
                              <div>
                                <p className="font-medium">{doc.title_th}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{doc.filename}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(doc.file_size)}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="gap-1">
                              <Folder className="h-3 w-3" />
                              {categories.find((c) => c.id === doc.category)?.name_th || doc.category}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(doc.status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <span>{doc.chunks > 0 ? doc.chunks.toLocaleString() : '-'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{doc.uploaded_by}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(doc.uploaded_at)}
                            </span>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDocument(doc)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  ดูรายละเอียด
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  ดาวน์โหลด
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Re-index
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    แสดง {(currentPage - 1) * docsPerPage + 1} - {Math.min(currentPage * docsPerPage, filteredDocuments.length)} จาก {filteredDocuments.length} เอกสาร
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {currentPage} / {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="animate-blur-in">
            <div className="grid gap-4 md:grid-cols-3">
              {categories.map((category, index) => (
                <Card
                  key={category.id}
                  className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer animate-slide-up-fade"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform">
                          <Folder className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name_th}</p>
                          <p className="text-sm text-muted-foreground">{category.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{category.count}</p>
                        <p className="text-xs text-muted-foreground">เอกสาร</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Category Card */}
              <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/50 border-dashed border-2 border-border/50 hover:border-amber-500/50 transition-all cursor-pointer">
                <CardContent className="relative p-4 flex items-center justify-center h-full min-h-[100px]">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-amber-500 transition-colors">
                    <FolderPlus className="h-8 w-8" />
                    <span className="text-sm font-medium">เพิ่มหมวดหมู่ใหม่</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="animate-blur-in">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-500" />
                    Chunking Settings
                  </CardTitle>
                  <CardDescription>
                    ตั้งค่าการแบ่ง chunks สำหรับเอกสาร
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chunk Size</Label>
                    <Input type="number" defaultValue="1000" />
                    <p className="text-xs text-muted-foreground">จำนวนตัวอักษรต่อ chunk</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Chunk Overlap</Label>
                    <Input type="number" defaultValue="200" />
                    <p className="text-xs text-muted-foreground">จำนวนตัวอักษรที่ซ้อนทับกัน</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-500" />
                    Embedding Settings
                  </CardTitle>
                  <CardDescription>
                    ตั้งค่า Vector Embedding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Embedding Model</Label>
                    <Select defaultValue="bge-m3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bge-m3">BGE-M3 (Multilingual)</SelectItem>
                        <SelectItem value="text-embedding-3">OpenAI text-embedding-3</SelectItem>
                        <SelectItem value="cohere">Cohere Embed v3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vector Dimension</Label>
                    <Input type="number" defaultValue="1024" disabled />
                    <p className="text-xs text-muted-foreground">กำหนดโดยโมเดล embedding</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-500" />
                    Retrieval Settings
                  </CardTitle>
                  <CardDescription>
                    ตั้งค่าการค้นหาเอกสาร
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Top K Results</Label>
                    <Input type="number" defaultValue="5" />
                    <p className="text-xs text-muted-foreground">จำนวน chunks ที่ดึงมาใช้</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Similarity Threshold</Label>
                    <Input type="number" step="0.1" defaultValue="0.7" />
                    <p className="text-xs text-muted-foreground">คะแนนความคล้ายขั้นต่ำ (0-1)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-amber-500" />
                    LLM Integration
                  </CardTitle>
                  <CardDescription>
                    ตั้งค่าการเชื่อมต่อกับ LLM
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Context Window</Label>
                    <Input type="number" defaultValue="4096" />
                    <p className="text-xs text-muted-foreground">จำนวน tokens สำหรับ context</p>
                  </div>
                  <div className="space-y-2">
                    <Label>System Prompt Template</Label>
                    <Textarea
                      defaultValue="คุณคือผู้เชี่ยวชาญด้านน้ำสูญเสียของ กปภ. ตอบคำถามโดยอ้างอิงจากข้อมูลที่ให้มา"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-4">
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500">
                <Sparkles className="h-4 w-4" />
                บันทึกการตั้งค่า
              </Button>
            </div>
          </TabsContent>

          {/* KM Documents Tab */}
          <TabsContent value="km-docs" className="space-y-4 animate-blur-in">
            {/* KM Stats */}
            {kmValidation && (
              <div className="grid gap-4 md:grid-cols-6">
                <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">ไฟล์ทั้งหมด</p>
                        <p className="text-2xl font-bold">{kmValidation.total_files}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                        <FileText className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Valid</p>
                        <p className="text-2xl font-bold text-emerald-600">{kmValidation.valid_files}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Warnings</p>
                        <p className="text-2xl font-bold text-amber-600">{kmValidation.warning_files}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Errors</p>
                        <p className="text-2xl font-bold text-red-600">{kmValidation.error_files}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">FAQ ทั้งหมด</p>
                        <p className="text-2xl font-bold">{kmValidation.total_faq}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                        <HelpCircle className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">คำทั้งหมด</p>
                        <p className="text-2xl font-bold">{kmValidation.total_words.toLocaleString()}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                        <Hash className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* KM Actions */}
            <Card className="backdrop-blur-sm bg-background/80 border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={kmCategoryFilter} onValueChange={setKMCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="หมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                        {kmCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleValidate}
                      disabled={isValidating}
                      className="gap-2"
                    >
                      <ShieldCheck className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
                      {isValidating ? 'กำลังตรวจสอบ...' : 'Validate All'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleIndexKM}
                      disabled={isIndexing}
                      className="gap-2"
                    >
                      <Database className={`h-4 w-4 ${isIndexing ? 'animate-spin' : ''}`} />
                      {isIndexing ? 'กำลัง Index...' : 'Re-index for RAG'}
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500">
                      <Plus className="h-4 w-4" />
                      สร้างเอกสารใหม่
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Alert */}
            {kmValidation && kmValidation.issues.length > 0 && (
              <Card className="backdrop-blur-sm bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-600">พบปัญหาที่ต้องแก้ไข ({kmValidation.issues.length})</p>
                      <ul className="mt-2 space-y-1">
                        {kmValidation.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            <span className="font-medium">{issue.file}:</span> {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KM Documents Table */}
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <CardContent className="relative p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left p-4 font-medium text-sm">เอกสาร</th>
                        <th className="text-left p-4 font-medium text-sm">หมวดหมู่</th>
                        <th className="text-left p-4 font-medium text-sm">Keywords</th>
                        <th className="text-left p-4 font-medium text-sm">FAQ</th>
                        <th className="text-left p-4 font-medium text-sm">คำ</th>
                        <th className="text-left p-4 font-medium text-sm">สถานะ</th>
                        <th className="text-left p-4 font-medium text-sm">อัปเดต</th>
                        <th className="text-left p-4 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKMDocs.map((doc, index) => (
                        <tr
                          key={doc.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-slide-up-fade"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                                <FileText className="h-5 w-5 text-emerald-500" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-xs text-muted-foreground">{doc.filename}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="gap-1">
                              <Folder className="h-3 w-3" />
                              {doc.category}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {doc.keywords.slice(0, 3).map((kw, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {kw}
                                </Badge>
                              ))}
                              {doc.keywords.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{doc.keywords.length - 3}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-sm">
                              <HelpCircle className="h-4 w-4 text-blue-500" />
                              <span>{doc.faq_count}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{doc.word_count.toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            {getKMStatusBadge(doc.status)}
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">{doc.updated}</span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  ดูเนื้อหา
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  เปิดใน Editor
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Validate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Re-index
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAG Test Tab */}
          <TabsContent value="km-test" className="space-y-4 animate-blur-in">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Search Input */}
              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    ทดสอบค้นหา RAG
                  </CardTitle>
                  <CardDescription>
                    ทดสอบการค้นหาจาก Knowledge Base
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>คำถามหรือคำค้นหา</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="เช่น NRW คืออะไร? หรือ วิธีลดน้ำสูญเสีย"
                        value={searchQuery2}
                        onChange={(e) => setSearchQuery2(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleKMSearch()}
                      />
                      <Button
                        onClick={handleKMSearch}
                        disabled={isSearching || !searchQuery2.trim()}
                        className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        ค้นหา
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">ตัวอย่างคำถาม</Label>
                    <div className="flex flex-wrap gap-2">
                      {['NRW คืออะไร', 'วิธีลดน้ำสูญเสีย', 'DMA มีประโยชน์อย่างไร', 'ILI คำนวณอย่างไร'].map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSearchQuery2(q);
                          }}
                        >
                          <FileQuestion className="h-3 w-3 mr-1" />
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CLI Commands */}
              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-emerald-500" />
                    CLI Commands
                  </CardTitle>
                  <CardDescription>
                    คำสั่งจัดการ KM ผ่าน Terminal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">$</span>
                      <span>python km_cli.py validate</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto text-zinc-400 hover:text-zinc-100">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-zinc-500 text-xs pl-4">ตรวจสอบเอกสารทั้งหมด</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">$</span>
                      <span>python km_cli.py index</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto text-zinc-400 hover:text-zinc-100">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-zinc-500 text-xs pl-4">Index เอกสารสำหรับ RAG</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">$</span>
                      <span>python km_cli.py search &quot;คำค้นหา&quot;</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto text-zinc-400 hover:text-zinc-100">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-zinc-500 text-xs pl-4">ค้นหาความรู้</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">$</span>
                      <span>python km_cli.py stats</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto text-zinc-400 hover:text-zinc-100">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-zinc-500 text-xs pl-4">แสดงสถิติ</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    ผลการค้นหา ({searchResults.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border/50 hover:border-blue-500/50 transition-colors animate-slide-up-fade"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {result.is_faq ? (
                              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                                <HelpCircle className="h-3 w-3 mr-1" />
                                FAQ
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                Document
                              </Badge>
                            )}
                            <span className="text-sm font-medium">{result.title}</span>
                          </div>
                          {result.is_faq && result.question && (
                            <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                              Q: {result.question}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">{result.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            📁 {result.file_path}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            result.score > 0.9 ? 'text-emerald-500' :
                            result.score > 0.7 ? 'text-amber-500' :
                            'text-gray-500'
                          }`}>
                            {(result.score * 100).toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground">relevance</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Document Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedDocument && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                      {getFileIcon(selectedDocument.file_type)}
                    </div>
                    <div>
                      <span>{selectedDocument.title_th}</span>
                      <p className="text-sm font-normal text-muted-foreground mt-0.5">
                        {selectedDocument.title}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status & Basic Info */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(selectedDocument.status)}
                    <Badge variant="outline" className="gap-1">
                      <Folder className="h-3 w-3" />
                      {categories.find((c) => c.id === selectedDocument.category)?.name_th || selectedDocument.category}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      {selectedDocument.file_type.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Description */}
                  {selectedDocument.description && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">คำอธิบาย</Label>
                      <p className="text-sm bg-muted/30 rounded-lg p-3">
                        {selectedDocument.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* File Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/20 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <FileText className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ชื่อไฟล์</p>
                            <p className="text-sm font-medium truncate max-w-[180px]" title={selectedDocument.filename}>
                              {selectedDocument.filename}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/20 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                            <Database className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ขนาดไฟล์</p>
                            <p className="text-sm font-medium">{formatFileSize(selectedDocument.file_size)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/20 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Layers className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Chunks</p>
                            <p className="text-sm font-medium">
                              {selectedDocument.chunks > 0 ? selectedDocument.chunks.toLocaleString() : '-'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/20 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Zap className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vectors</p>
                            <p className="text-sm font-medium">
                              {selectedDocument.vectors > 0 ? selectedDocument.vectors.toLocaleString() : '-'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground">ประวัติ</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                          <Upload className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">อัปโหลดโดย {selectedDocument.uploaded_by}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(selectedDocument.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      {selectedDocument.last_indexed && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Indexed ล่าสุด</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(selectedDocument.last_indexed)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    ดาวน์โหลด
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Re-index
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบ
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-500" />
                อัปโหลดเอกสาร
              </DialogTitle>
              <DialogDescription>
                เพิ่มเอกสารใหม่เข้าสู่คลังความรู้
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <FileUp className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="font-medium">ลากไฟล์มาวางที่นี่</p>
                  <p className="text-sm text-muted-foreground">หรือคลิกเพื่อเลือกไฟล์</p>
                  <p className="text-xs text-muted-foreground">รองรับ PDF, DOCX, XLSX, TXT (สูงสุด 50MB)</p>
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>กำลังอัปโหลด...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Select defaultValue="manuals">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name_th}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags (คั่นด้วยคอมม่า)</Label>
                <Input placeholder="น้ำสูญเสีย, DMA, คู่มือ" />
              </div>

              <div className="space-y-2">
                <Label>คำอธิบาย</Label>
                <Textarea placeholder="รายละเอียดเกี่ยวกับเอกสาร..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500">
                <Upload className="h-4 w-4" />
                อัปโหลด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
