'use client';

import * as React from 'react';
import {
  Upload,
  FileSpreadsheet,
  Database,
  Cloud,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  FileText,
  Trash2,
  Play,
  Pause,
  Settings,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatThaiDate, formatFileSize } from '@/lib/formatting';
import { cn } from '@/lib/utils';

interface ETLStatus {
  status: string;
  last_sync: string | null;
  last_sync_th: string | null;
  records_processed: number;
  next_scheduled_sync: string | null;
  errors: number;
}

interface SyncHistoryItem {
  id: string;
  source_type: string;
  started_at: string;
  completed_at: string;
  records_processed: number;
  status: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  records?: number;
  errors?: string[];
  uploadedAt: string;
}

const sourceTypes = [
  { value: 'api', label: 'DMAMA API', icon: Cloud, description: 'ดึงข้อมูลจาก DMAMA REST API' },
  { value: 'database', label: 'DMAMA Database', icon: Database, description: 'เชื่อมต่อฐานข้อมูล DMAMA โดยตรง' },
  { value: 'file', label: 'File Import', icon: FileSpreadsheet, description: 'นำเข้าจากไฟล์ CSV/Excel' },
];

export default function DataImportPage() {
  const [loading, setLoading] = React.useState(true);
  const [etlStatus, setEtlStatus] = React.useState<ETLStatus | null>(null);
  const [syncHistory, setSyncHistory] = React.useState<SyncHistoryItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<string>('api');
  const [syncing, setSyncing] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch ETL status
  const fetchStatus = React.useCallback(async () => {
    try {
      const response = await fetch('/api/etl/status');
      if (response.ok) {
        const data = await response.json();
        setEtlStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch ETL status:', error);
    }
  }, []);

  // Fetch sync history
  const fetchHistory = React.useCallback(async () => {
    try {
      const response = await fetch('/api/etl/history');
      if (response.ok) {
        const data = await response.json();
        setSyncHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sync history:', error);
    }
  }, []);

  React.useEffect(() => {
    const init = async () => {
      await Promise.all([fetchStatus(), fetchHistory()]);
      setLoading(false);
    };
    init();

    // Poll for status updates
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchHistory]);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // Upload file
      try {
        const formData = new FormData();
        formData.append('file', file);

        // Update to processing
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: 'processing', progress: 30 } : f
          )
        );

        const response = await fetch('/api/etl/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id
                ? {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    records: result.stats?.estimated_records || 0,
                  }
                : f
            )
          );
          await fetchStatus();
        } else {
          const error = await response.json();
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id
                ? {
                    ...f,
                    status: 'error',
                    progress: 0,
                    errors: [error.detail?.message_th || 'เกิดข้อผิดพลาด'],
                  }
                : f
            )
          );
        }
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? {
                  ...f,
                  status: 'error',
                  progress: 0,
                  errors: ['ไม่สามารถอัปโหลดไฟล์ได้'],
                }
              : f
          )
        );
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Handle manual sync
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/etl/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_type: selectedSource }),
      });

      if (response.ok) {
        await fetchStatus();
        await fetchHistory();
        setSyncDialogOpen(false);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Remove uploaded file from list
  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      idle: { variant: 'secondary', label: 'พร้อม' },
      syncing: { variant: 'default', label: 'กำลังซิงค์' },
      processing: { variant: 'default', label: 'กำลังประมวลผล' },
      completed: { variant: 'outline', label: 'สำเร็จ' },
      error: { variant: 'destructive', label: 'ผิดพลาด' },
    };
    const { variant, label } = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
            นำเข้าข้อมูล
          </h1>
          <p className="text-muted-foreground">
            นำเข้าและซิงค์ข้อมูลจากระบบ DMAMA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchStatus}
            className="gap-2 hover:bg-[var(--pwa-cyan)]/10 hover:text-[var(--pwa-cyan)] hover:border-[var(--pwa-cyan)]/30 transition-colors group"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            รีเฟรช
          </Button>
          <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] hover:from-[var(--pwa-cyan)]/90 hover:to-[var(--pwa-blue-deep)]/90 shadow-lg shadow-[var(--pwa-cyan)]/25 transition-all hover:shadow-[var(--pwa-cyan)]/40">
                <Play className="h-4 w-4" />
                ซิงค์ข้อมูล
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>ซิงค์ข้อมูลจาก DMAMA</DialogTitle>
                <DialogDescription>
                  เลือกแหล่งข้อมูลที่ต้องการซิงค์
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>แหล่งข้อมูล</Label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTypes.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          <div className="flex items-center gap-2">
                            <source.icon className="h-4 w-4" />
                            {source.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {sourceTypes.find((s) => s.value === selectedSource)?.description}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSync} disabled={syncing} className="gap-2">
                  {syncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      กำลังซิงค์...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      เริ่มซิงค์
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium">สถานะ ETL</CardTitle>
            {etlStatus && getStatusBadge(etlStatus.status)}
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                {etlStatus?.status === 'idle' && <CheckCircle className="h-6 w-6 text-emerald-500" />}
                {etlStatus?.status === 'syncing' && <RefreshCw className="h-6 w-6 text-[var(--pwa-cyan)] animate-spin" />}
                {etlStatus?.status === 'processing' && <RefreshCw className="h-6 w-6 text-[var(--pwa-cyan)] animate-spin" />}
                {etlStatus?.status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
                {etlStatus?.status === 'completed' && <CheckCircle className="h-6 w-6 text-emerald-500" />}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {etlStatus?.records_processed.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">รายการที่ประมวลผล</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium">ซิงค์ล่าสุด</CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20">
              <Clock className="h-3.5 w-3.5 text-[var(--pwa-cyan)]" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">
              {etlStatus?.last_sync_th || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              ซิงค์ถัดไป: <span className="text-[var(--pwa-cyan)]">{etlStatus?.next_scheduled_sync || '02:00'}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {(etlStatus?.errors || 0) > 0 && <div className="absolute inset-0 animate-breathing-glow opacity-30" />}
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium">ข้อผิดพลาด</CardTitle>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${(etlStatus?.errors || 0) > 0 ? 'bg-gradient-to-br from-red-500/20 to-red-500/10 ring-red-500/20' : 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 ring-emerald-500/20'}`}>
              <AlertTriangle className={`h-3.5 w-3.5 ${(etlStatus?.errors || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-2xl font-bold ${(etlStatus?.errors || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {etlStatus?.errors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(etlStatus?.errors || 0) > 0 ? 'ตรวจสอบรายละเอียด' : 'ไม่มีข้อผิดพลาด'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg">
          <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
            <Upload className="h-4 w-4" />
            อัปโหลดไฟล์
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
            <Clock className="h-4 w-4" />
            ประวัติการซิงค์
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
            <Settings className="h-4 w-4" />
            ตั้งค่า
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          {/* Drag & Drop Zone */}
          <Card
            className={cn(
              "relative overflow-hidden border-2 border-dashed transition-all duration-300 backdrop-blur-sm",
              isDragging
                ? 'border-[var(--pwa-cyan)] bg-[var(--pwa-cyan)]/5 shadow-lg shadow-[var(--pwa-cyan)]/20'
                : 'border-border/50 bg-background/80 hover:border-[var(--pwa-cyan)]/30 hover:bg-[var(--pwa-cyan)]/5'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
            <CardContent className="flex flex-col items-center justify-center py-12 relative">
              <div className="rounded-2xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 p-5 mb-4 ring-1 ring-[var(--pwa-cyan)]/20 shadow-lg shadow-[var(--pwa-cyan)]/10 group-hover:scale-110 transition-transform">
                <Upload className="h-10 w-10 text-[var(--pwa-cyan)]" />
              </div>
              <h3 className="text-lg font-medium mb-2 bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
                ลากไฟล์มาวางที่นี่
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                รองรับไฟล์ CSV และ Excel (.xlsx, .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 hover:bg-[var(--pwa-cyan)]/10 hover:text-[var(--pwa-cyan)] hover:border-[var(--pwa-cyan)]/30 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                เลือกไฟล์
              </Button>
            </CardContent>
          </Card>

          {/* File Template Download */}
          <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--pwa-cyan)]/5 via-transparent to-[var(--pwa-blue-deep)]/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[var(--pwa-cyan)]" />
                </div>
                เทมเพลตไฟล์นำเข้า
              </CardTitle>
              <CardDescription>
                ดาวน์โหลดเทมเพลตเพื่อดูรูปแบบข้อมูลที่ถูกต้อง
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  DMA Readings Template.csv
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  DMA Master Template.xlsx
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="gap-2"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  คอลัมน์ที่จำเป็น
                </Button>
                {showDetails && (
                  <div className="mt-2 rounded-lg bg-muted p-4 text-sm">
                    <p className="font-medium mb-2">DMA Readings:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><code>dma_id</code> - รหัส DMA (ต้องมี)</li>
                      <li><code>inflow</code> หรือ <code>flow_in</code> - ปริมาณน้ำเข้า (ลบ.ม.)</li>
                      <li><code>outflow</code> หรือ <code>flow_out</code> - ปริมาณน้ำออก (ลบ.ม.)</li>
                      <li><code>reading_date</code> หรือ <code>timestamp</code> - วันที่อ่านค่า</li>
                      <li><code>pressure</code> - ความดัน (bar) - ถ้ามี</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/30 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Upload className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  ไฟล์ที่อัปโหลด
                  <Badge variant="secondary" className="ml-1 text-xs bg-gradient-to-r from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 text-[var(--pwa-cyan)] border-[var(--pwa-cyan)]/20">
                    {uploadedFiles.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อไฟล์</TableHead>
                      <TableHead>ขนาด</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>รายการ</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          {file.status === 'pending' && (
                            <Badge variant="secondary">รอดำเนินการ</Badge>
                          )}
                          {file.status === 'processing' && (
                            <div className="space-y-1">
                              <Badge variant="default">กำลังประมวลผล</Badge>
                              <Progress value={file.progress} className="h-1 w-20" />
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <Badge variant="outline" className="text-emerald-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              สำเร็จ
                            </Badge>
                          )}
                          {file.status === 'error' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              ผิดพลาด
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {file.records !== undefined ? file.records.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/30 to-transparent" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20">
                  <Clock className="h-4 w-4 text-[var(--pwa-cyan)]" />
                </div>
                ประวัติการซิงค์
              </CardTitle>
              <CardDescription>
                รายการซิงค์ข้อมูลทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส</TableHead>
                    <TableHead>แหล่งข้อมูล</TableHead>
                    <TableHead>เริ่มต้น</TableHead>
                    <TableHead>เสร็จสิ้น</TableHead>
                    <TableHead>รายการ</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        ไม่มีประวัติการซิงค์
                      </TableCell>
                    </TableRow>
                  ) : (
                    syncHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.source_type === 'api' && 'API'}
                            {item.source_type === 'database' && 'Database'}
                            {item.source_type === 'file' && 'File'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatThaiDate(item.started_at)}</TableCell>
                        <TableCell>{formatThaiDate(item.completed_at)}</TableCell>
                        <TableCell>{item.records_processed.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up-fade">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20 group-hover:scale-110 transition-transform duration-300">
                    <Cloud className="h-4 w-4 text-[var(--pwa-cyan)]" />
                  </div>
                  แหล่งข้อมูล DMAMA
                </CardTitle>
                <CardDescription>
                  ตั้งค่าการเชื่อมต่อ DMAMA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API URL</Label>
                  <Input
                    placeholder="https://dmama.pwa.co.th/api/v1"
                    defaultValue="https://dmama.pwa.co.th/api/v1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="••••••••••••" />
                </div>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  ทดสอบการเชื่อมต่อ
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-4 w-4 text-[var(--pwa-cyan)]" />
                  </div>
                  กำหนดการซิงค์
                </CardTitle>
                <CardDescription>
                  ตั้งเวลาซิงค์อัตโนมัติ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ซิงค์ประจำวัน</Label>
                  <Select defaultValue="02:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00:00">00:00</SelectItem>
                      <SelectItem value="02:00">02:00</SelectItem>
                      <SelectItem value="04:00">04:00</SelectItem>
                      <SelectItem value="06:00">06:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ซิงค์รายชั่วโมง</Label>
                  <Select defaultValue="enabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">เปิดใช้งาน</SelectItem>
                      <SelectItem value="disabled">ปิดใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  บันทึกการตั้งค่า
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
