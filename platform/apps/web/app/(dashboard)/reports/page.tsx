'use client';

import * as React from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  Search,
  Clock,
  FileBarChart,
  FilePieChart,
  FileSpreadsheet,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Printer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatThaiDate } from '@/lib/formatting';

interface Report {
  id: string;
  title_th: string;
  title_en: string;
  type: 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';
  category: 'water_loss' | 'dma_performance' | 'alerts' | 'financial';
  period: string;
  created_at: string;
  file_size: string;
  status: 'ready' | 'generating' | 'error';
}

// Mock reports data
const mockReports: Report[] = [
  {
    id: 'rpt-001',
    title_th: 'รายงานน้ำสูญเสียประจำเดือน มกราคม 2567',
    title_en: 'Monthly Water Loss Report - January 2024',
    type: 'monthly',
    category: 'water_loss',
    period: '2024-01',
    created_at: '2024-01-31T10:30:00Z',
    file_size: '2.4 MB',
    status: 'ready',
  },
  {
    id: 'rpt-002',
    title_th: 'รายงานประสิทธิภาพ DMA ประจำสัปดาห์ที่ 3',
    title_en: 'Weekly DMA Performance Report - Week 3',
    type: 'weekly',
    category: 'dma_performance',
    period: '2024-W03',
    created_at: '2024-01-21T08:00:00Z',
    file_size: '1.8 MB',
    status: 'ready',
  },
  {
    id: 'rpt-003',
    title_th: 'สรุปการแจ้งเตือนประจำวัน 15 มกราคม 2567',
    title_en: 'Daily Alerts Summary - January 15, 2024',
    type: 'daily',
    category: 'alerts',
    period: '2024-01-15',
    created_at: '2024-01-15T23:59:00Z',
    file_size: '512 KB',
    status: 'ready',
  },
  {
    id: 'rpt-004',
    title_th: 'รายงานการเงินประจำปี 2566',
    title_en: 'Annual Financial Report 2023',
    type: 'annual',
    category: 'financial',
    period: '2023',
    created_at: '2024-01-10T14:00:00Z',
    file_size: '5.2 MB',
    status: 'ready',
  },
  {
    id: 'rpt-005',
    title_th: 'รายงานเปรียบเทียบน้ำสูญเสีย Q4/2566',
    title_en: 'Q4 2023 Water Loss Comparison Report',
    type: 'custom',
    category: 'water_loss',
    period: '2023-Q4',
    created_at: '2024-01-05T16:30:00Z',
    file_size: '3.1 MB',
    status: 'ready',
  },
  {
    id: 'rpt-006',
    title_th: 'รายงานน้ำสูญเสียประจำเดือน กุมภาพันธ์ 2567',
    title_en: 'Monthly Water Loss Report - February 2024',
    type: 'monthly',
    category: 'water_loss',
    period: '2024-02',
    created_at: '2024-02-01T00:00:00Z',
    file_size: '-',
    status: 'generating',
  },
];

const typeConfig = {
  daily: { label: 'รายวัน', color: 'bg-blue-100 text-blue-700' },
  weekly: { label: 'รายสัปดาห์', color: 'bg-purple-100 text-purple-700' },
  monthly: { label: 'รายเดือน', color: 'bg-emerald-100 text-emerald-700' },
  annual: { label: 'รายปี', color: 'bg-amber-100 text-amber-700' },
  custom: { label: 'กำหนดเอง', color: 'bg-slate-100 text-slate-700' },
};

const categoryConfig = {
  water_loss: { icon: FileBarChart, label: 'น้ำสูญเสีย' },
  dma_performance: { icon: FilePieChart, label: 'ประสิทธิภาพ DMA' },
  alerts: { icon: FileText, label: 'การแจ้งเตือน' },
  financial: { icon: FileSpreadsheet, label: 'การเงิน' },
};

// Mock PDF content (base64 would be here in real app)
const mockPDFPages = [
  {
    page: 1,
    content: `
      <div style="font-family: 'Noto Sans Thai', sans-serif; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; color: #1e3a5f;">รายงานน้ำสูญเสียประจำเดือน</h1>
          <h2 style="font-size: 18px; color: #666; margin-top: 10px;">มกราคม 2567</h2>
          <p style="color: #888; font-size: 14px;">การประปาส่วนภูมิภาค (กปภ.)</p>
        </div>

        <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <h3 style="font-size: 16px; color: #1e3a5f; margin-bottom: 15px;">สรุปภาพรวม</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="font-size: 12px; color: #666;">พื้นที่ DMA ทั้งหมด</p>
              <p style="font-size: 24px; font-weight: bold; color: #1e3a5f;">65</p>
            </div>
            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="font-size: 12px; color: #666;">อัตราน้ำสูญเสียเฉลี่ย</p>
              <p style="font-size: 24px; font-weight: bold; color: #1e3a5f;">15.5%</p>
            </div>
          </div>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="font-size: 16px; color: #1e3a5f; margin-bottom: 15px;">สถานะพื้นที่ DMA</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 12px; text-align: left; font-size: 14px;">สถานะ</th>
              <th style="padding: 12px; text-align: center; font-size: 14px;">จำนวน</th>
              <th style="padding: 12px; text-align: center; font-size: 14px;">สัดส่วน</th>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                <span style="display: inline-block; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; margin-right: 8px;"></span>
                ปกติ
              </td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">54</td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">83.1%</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                <span style="display: inline-block; width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-right: 8px;"></span>
                เฝ้าระวัง
              </td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">8</td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">12.3%</td>
            </tr>
            <tr>
              <td style="padding: 12px;">
                <span style="display: inline-block; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></span>
                วิกฤต
              </td>
              <td style="padding: 12px; text-align: center;">3</td>
              <td style="padding: 12px; text-align: center;">4.6%</td>
            </tr>
          </table>
        </div>
      </div>
    `,
  },
  {
    page: 2,
    content: `
      <div style="font-family: 'Noto Sans Thai', sans-serif; padding: 40px;">
        <h3 style="font-size: 16px; color: #1e3a5f; margin-bottom: 20px;">พื้นที่ที่ต้องให้ความสำคัญ</h3>

        <div style="margin-bottom: 30px;">
          <div style="padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 15px;">
            <h4 style="font-size: 14px; color: #dc2626; margin-bottom: 10px;">🔴 DMA ชลบุรี-01</h4>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">อัตราน้ำสูญเสีย: <strong>28.5%</strong></p>
            <p style="font-size: 13px; color: #666;">ปัญหา: พบการรั่วไหลของท่อส่งน้ำหลายจุด</p>
          </div>

          <div style="padding: 20px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 15px;">
            <h4 style="font-size: 14px; color: #d97706; margin-bottom: 10px;">🟡 DMA เชียงใหม่-03</h4>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">อัตราน้ำสูญเสีย: <strong>22.1%</strong></p>
            <p style="font-size: 13px; color: #666;">ปัญหา: แรงดันน้ำผิดปกติในช่วงกลางคืน</p>
          </div>

          <div style="padding: 20px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="font-size: 14px; color: #d97706; margin-bottom: 10px;">🟡 DMA สุราษฎร์ธานี-01</h4>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">อัตราน้ำสูญเสีย: <strong>18.2%</strong></p>
            <p style="font-size: 13px; color: #666;">ปัญหา: เซ็นเซอร์บางจุดไม่ส่งข้อมูล</p>
          </div>
        </div>

        <h3 style="font-size: 16px; color: #1e3a5f; margin-bottom: 20px;">ข้อเสนอแนะ</h3>
        <ol style="font-size: 14px; color: #374151; line-height: 1.8; padding-left: 20px;">
          <li>ดำเนินการตรวจซ่อมท่อส่งน้ำใน DMA ชลบุรี-01 เป็นลำดับแรก</li>
          <li>ติดตั้งเซ็นเซอร์ตรวจจับการรั่วเพิ่มเติมในพื้นที่เสี่ยง</li>
          <li>ปรับปรุงระบบควบคุมแรงดันใน DMA เชียงใหม่-03</li>
          <li>จัดทำแผนซ่อมบำรุงเชิงป้องกันสำหรับปีงบประมาณถัดไป</li>
        </ol>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>จัดทำโดย: ระบบ WARIS - Water Loss Intelligent Analysis and Reporting System</p>
          <p>วันที่ออกรายงาน: 31 มกราคม 2567</p>
        </div>
      </div>
    `,
  },
];

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Report[]>(mockReports);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [previewReport, setPreviewReport] = React.useState<Report | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [zoom, setZoom] = React.useState(100);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !search ||
      report.title_th.toLowerCase().includes(search.toLowerCase()) ||
      report.title_en.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handlePreview = (report: Report) => {
    setPreviewReport(report);
    setCurrentPage(1);
    setZoom(100);
  };

  const handleDownload = (report: Report) => {
    // In real app, this would trigger a file download
    console.log('Downloading:', report.id);
    alert(`กำลังดาวน์โหลด: ${report.title_th}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">รายงาน</h1>
          <p className="text-muted-foreground">Reports</p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          สร้างรายงานใหม่
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = reports.filter((r) => r.category === key).length;
          return (
            <Card key={key} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหารายงาน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ประเภทรายงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="daily">รายวัน</SelectItem>
                <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                <SelectItem value="monthly">รายเดือน</SelectItem>
                <SelectItem value="annual">รายปี</SelectItem>
                <SelectItem value="custom">กำหนดเอง</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                <SelectItem value="water_loss">น้ำสูญเสีย</SelectItem>
                <SelectItem value="dma_performance">ประสิทธิภาพ DMA</SelectItem>
                <SelectItem value="alerts">การแจ้งเตือน</SelectItem>
                <SelectItem value="financial">การเงิน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            รายการรายงาน
            <Badge variant="secondary" className="ml-2">
              {filteredReports.length} รายการ
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">ไม่พบรายงาน</h2>
              <p className="mt-2 text-muted-foreground">ไม่มีรายงานที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const typeInfo = typeConfig[report.type];
                const categoryInfo = categoryConfig[report.category];
                const CategoryIcon = categoryInfo.icon;

                return (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                  >
                    {/* Icon */}
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <CategoryIcon className="h-6 w-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{report.title_th}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{categoryInfo.label}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatThaiDate(report.created_at)}
                        </span>
                        {report.status === 'ready' && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{report.file_size}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                      {report.status === 'ready' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handlePreview(report)}
                          >
                            <Eye className="h-4 w-4" />
                            ดูตัวอย่าง
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            onClick={() => handleDownload(report)}
                          >
                            <Download className="h-4 w-4" />
                            ดาวน์โหลด
                          </Button>
                        </>
                      ) : report.status === 'generating' ? (
                        <Badge variant="secondary" className="animate-pulse">
                          กำลังสร้าง...
                        </Badge>
                      ) : (
                        <Badge variant="destructive">เกิดข้อผิดพลาด</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{previewReport.title_th}</h3>
                  <p className="text-xs text-muted-foreground">{previewReport.file_size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border bg-slate-50 px-2 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-sm">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  พิมพ์
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDownload(previewReport)}
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewReport(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              <div
                className="mx-auto bg-white shadow-lg"
                style={{
                  width: `${(21 * zoom) / 100}cm`,
                  minHeight: `${(29.7 * zoom) / 100}cm`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
                dangerouslySetInnerHTML={{
                  __html: mockPDFPages[currentPage - 1]?.content || '',
                }}
              />
            </div>

            {/* Modal Footer - Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                ก่อนหน้า
              </Button>
              <span className="text-sm text-muted-foreground">
                หน้า {currentPage} จาก {mockPDFPages.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === mockPDFPages.length}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
