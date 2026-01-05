'use client';

import * as React from 'react';
import {
  FolderOpen,
  FileText,
  Download,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileImage,
  Folder,
  Clock,
  User,
  MoreVertical,
  Eye,
  Trash2,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatThaiDate, formatFileSize } from '@/lib/formatting';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'image' | 'folder';
  size?: number;
  folder: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  description?: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
  icon: React.ElementType;
}

const folders: Folder[] = [
  { id: 'regulations', name: 'ระเบียบและข้อบังคับ', count: 12, icon: FileText },
  { id: 'reports', name: 'รายงานประจำเดือน', count: 24, icon: FileSpreadsheet },
  { id: 'manuals', name: 'คู่มือการใช้งาน', count: 8, icon: File },
  { id: 'templates', name: 'แบบฟอร์ม', count: 15, icon: FileText },
  { id: 'knowledge', name: 'คลังความรู้', count: 42, icon: FolderOpen },
];

const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'ระเบียบการจัดการน้ำสูญเสีย พ.ศ. 2567',
    type: 'pdf',
    size: 2458000,
    folder: 'regulations',
    createdAt: '2024-01-15T09:00:00',
    updatedAt: '2024-01-15T09:00:00',
    author: 'ฝ่ายกฎหมาย',
    description: 'ระเบียบปฏิบัติสำหรับการจัดการน้ำสูญเสียในเขตพื้นที่ กปภ.',
  },
  {
    id: 'doc-002',
    name: 'รายงานน้ำสูญเสียประจำเดือน ธ.ค. 2567',
    type: 'xlsx',
    size: 1245000,
    folder: 'reports',
    createdAt: '2024-12-31T16:30:00',
    updatedAt: '2025-01-02T10:15:00',
    author: 'ระบบอัตโนมัติ',
  },
  {
    id: 'doc-003',
    name: 'คู่มือการใช้งานระบบ WARIS v2.0',
    type: 'pdf',
    size: 8950000,
    folder: 'manuals',
    createdAt: '2024-11-01T08:00:00',
    updatedAt: '2024-12-15T14:20:00',
    author: 'ทีมพัฒนาระบบ',
    description: 'คู่มือการใช้งานระบบวิเคราะห์น้ำสูญเสียอัจฉริยะ',
  },
  {
    id: 'doc-004',
    name: 'แบบฟอร์มรายงานการซ่อมแซมท่อ',
    type: 'docx',
    size: 156000,
    folder: 'templates',
    createdAt: '2024-06-01T09:00:00',
    updatedAt: '2024-06-01T09:00:00',
    author: 'ฝ่ายบำรุงรักษา',
  },
  {
    id: 'doc-005',
    name: 'การวิเคราะห์รูปแบบการรั่วไหลด้วย AI',
    type: 'pdf',
    size: 4520000,
    folder: 'knowledge',
    createdAt: '2024-10-15T11:30:00',
    updatedAt: '2024-10-15T11:30:00',
    author: 'ทีม AI/ML',
    description: 'เอกสารอธิบายวิธีการวิเคราะห์รูปแบบน้ำสูญเสียด้วยเทคโนโลยี AI',
  },
  {
    id: 'doc-006',
    name: 'แผนที่เขตพื้นที่ DMA ทั้งหมด',
    type: 'image',
    size: 12500000,
    folder: 'knowledge',
    createdAt: '2024-09-01T08:00:00',
    updatedAt: '2024-12-01T16:00:00',
    author: 'ฝ่าย GIS',
  },
  {
    id: 'doc-007',
    name: 'สรุปผลการดำเนินงาน Q4/2567',
    type: 'pdf',
    size: 3200000,
    folder: 'reports',
    createdAt: '2025-01-05T09:00:00',
    updatedAt: '2025-01-05T09:00:00',
    author: 'ฝ่ายวางแผน',
  },
  {
    id: 'doc-008',
    name: 'มาตรฐานการตรวจวัดน้ำสูญเสีย ISO 24512',
    type: 'pdf',
    size: 5800000,
    folder: 'regulations',
    createdAt: '2024-03-15T10:00:00',
    updatedAt: '2024-03-15T10:00:00',
    author: 'ฝ่ายมาตรฐาน',
  },
];

function getFileIcon(type: Document['type']) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'xlsx':
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    case 'docx':
      return <File className="h-5 w-5 text-blue-500" />;
    case 'image':
      return <FileImage className="h-5 w-5 text-purple-500" />;
    case 'folder':
      return <Folder className="h-5 w-5 text-amber-500" />;
    default:
      return <File className="h-5 w-5 text-slate-500" />;
  }
}

function getFileTypeBadge(type: Document['type']) {
  const colors = {
    pdf: 'bg-red-100 text-red-700',
    xlsx: 'bg-emerald-100 text-emerald-700',
    docx: 'bg-blue-100 text-blue-700',
    image: 'bg-purple-100 text-purple-700',
    folder: 'bg-amber-100 text-amber-700',
  };
  const labels = {
    pdf: 'PDF',
    xlsx: 'Excel',
    docx: 'Word',
    image: 'รูปภาพ',
    folder: 'โฟลเดอร์',
  };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function DocumentsPage() {
  const [loading, setLoading] = React.useState(true);
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const [selectedFolder, setSelectedFolder] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'date' | 'size'>('date');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredDocuments = React.useMemo(() => {
    let filtered = documents;

    if (selectedFolder !== 'all') {
      filtered = filtered.filter((doc) => doc.folder === selectedFolder);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.author.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'th');
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, selectedFolder, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">เอกสาร</h1>
          <p className="text-muted-foreground">
            จัดการเอกสาร ระเบียบ และคลังความรู้
          </p>
        </div>
        <Button className="gap-2">
          <FolderOpen className="h-4 w-4" />
          อัปโหลดเอกสาร
        </Button>
      </div>

      {/* Folder Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isSelected = selectedFolder === folder.id;
          return (
            <Card
              key={folder.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() =>
                setSelectedFolder(isSelected ? 'all' : folder.id)
              }
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {folder.count} ไฟล์
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเอกสาร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="date">วันที่อัปเดต</SelectItem>
                  <SelectItem value="name">ชื่อไฟล์</SelectItem>
                  <SelectItem value="size">ขนาดไฟล์</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumb */}
      {selectedFolder !== 'all' && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedFolder('all')}
            className="text-muted-foreground hover:text-foreground"
          >
            เอกสารทั้งหมด
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {folders.find((f) => f.id === selectedFolder)?.name}
          </span>
        </div>
      )}

      {/* Documents List/Grid */}
      {viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">ไม่พบเอกสาร</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ลองเปลี่ยนเงื่อนไขการค้นหาหรือโฟลเดอร์
                  </p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="shrink-0">{getFileIcon(doc.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{doc.name}</p>
                        {getFileTypeBadge(doc.type)}
                      </div>
                      {doc.description && (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {doc.description}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatThaiDate(doc.updatedAt)}
                        </span>
                        {doc.size && <span>{formatFileSize(doc.size)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            ดูตัวอย่าง
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            ดาวน์โหลด
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            แชร์
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-slate-100 p-3">
                    {getFileIcon(doc.type)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        ดูตัวอย่าง
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        ดาวน์โหลด
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        แชร์
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3">
                  <p className="line-clamp-2 text-sm font-medium">{doc.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {getFileTypeBadge(doc.type)}
                    {doc.size && (
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatThaiDate(doc.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          แสดง {filteredDocuments.length} จาก {documents.length} เอกสาร
        </span>
        <span>
          พื้นที่ใช้งาน: {formatFileSize(documents.reduce((acc, doc) => acc + (doc.size || 0), 0))}
        </span>
      </div>
    </div>
  );
}
