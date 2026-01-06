import { NextRequest, NextResponse } from 'next/server';

interface AlertData {
  id: string;
  dma_id: string;
  dma_name: string;
  type: string;
  severity: string;
  status: string;
  title_th: string;
  title_en: string;
  description_th: string;
  triggered_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

const alerts: AlertData[] = [
  {
    id: 'alert-001',
    dma_id: 'dma-001',
    dma_name: 'DMA ชลบุรี-01',
    type: 'high_loss',
    severity: 'critical',
    status: 'active',
    title_th: 'น้ำสูญเสียสูงผิดปกติ',
    title_en: 'Abnormally High Water Loss',
    description_th: 'ตรวจพบน้ำสูญเสีย 28% สูงกว่าเกณฑ์ปกติ (15%)',
    triggered_at: '2024-01-15T08:30:00Z',
    acknowledged_at: null,
    resolved_at: null,
  },
  {
    id: 'alert-002',
    dma_id: 'dma-003',
    dma_name: 'DMA เชียงใหม่-03',
    type: 'pressure_drop',
    severity: 'high',
    status: 'active',
    title_th: 'แรงดันน้ำลดลงผิดปกติ',
    title_en: 'Abnormal Pressure Drop',
    description_th: 'แรงดันน้ำลดลง 1.8 บาร์ ภายใน 2 ชั่วโมง',
    triggered_at: '2024-01-15T07:15:00Z',
    acknowledged_at: null,
    resolved_at: null,
  },
  {
    id: 'alert-003',
    dma_id: 'dma-005',
    dma_name: 'DMA ขอนแก่น-02',
    type: 'flow_anomaly',
    severity: 'medium',
    status: 'acknowledged',
    title_th: 'พบความผิดปกติของอัตราการไหล',
    title_en: 'Flow Rate Anomaly Detected',
    description_th: 'อัตราการไหลเพิ่มขึ้น 40% ในช่วงกลางคืน',
    triggered_at: '2024-01-15T03:00:00Z',
    acknowledged_at: '2024-01-15T06:30:00Z',
    resolved_at: null,
  },
  {
    id: 'alert-004',
    dma_id: 'dma-002',
    dma_name: 'DMA สุราษฎร์ธานี-01',
    type: 'sensor_offline',
    severity: 'low',
    status: 'active',
    title_th: 'เซ็นเซอร์ไม่ส่งข้อมูล',
    title_en: 'Sensor Offline',
    description_th: 'เซ็นเซอร์ FM-002 ไม่ส่งข้อมูลมากกว่า 30 นาที',
    triggered_at: '2024-01-15T09:45:00Z',
    acknowledged_at: null,
    resolved_at: null,
  },
  {
    id: 'alert-005',
    dma_id: 'dma-004',
    dma_name: 'DMA นครราชสีมา-01',
    type: 'trend_warning',
    severity: 'medium',
    status: 'active',
    title_th: 'แนวโน้มน้ำสูญเสียเพิ่มขึ้น',
    title_en: 'Increasing Water Loss Trend',
    description_th: 'น้ำสูญเสียเพิ่มขึ้น 3% ใน 7 วันที่ผ่านมา',
    triggered_at: '2024-01-14T16:00:00Z',
    acknowledged_at: null,
    resolved_at: null,
  },
];


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');
  const dmaId = searchParams.get('dma_id');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');

  let filteredAlerts = [...alerts];

  if (severity) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.severity === severity);
  }
  if (status) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.status === status);
  }
  if (dmaId) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.dma_id === dmaId);
  }

  filteredAlerts.sort(
    (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
  );

  const total = filteredAlerts.length;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + perPage);

  return NextResponse.json({
    success: true,
    data: paginatedAlerts,
    meta: { page, per_page: perPage, total, total_pages: totalPages },
    message: 'Success',
    message_th: 'สำเร็จ',
    timestamp: new Date().toISOString(),
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, action } = body;

  const alertIndex = alerts.findIndex((a) => a.id === id);
  if (alertIndex === -1) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Alert not found', message_th: 'ไม่พบการแจ้งเตือน' },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  const updatedAlert = { ...alerts[alertIndex] };
  if (action === 'acknowledge') {
    updatedAlert.status = 'acknowledged';
    updatedAlert.acknowledged_at = new Date().toISOString();
  } else if (action === 'resolve') {
    updatedAlert.status = 'resolved';
    updatedAlert.resolved_at = new Date().toISOString();
  }

  return NextResponse.json({
    success: true,
    data: updatedAlert,
    message: action === 'acknowledge' ? 'Alert acknowledged' : 'Alert resolved',
    message_th: action === 'acknowledge' ? 'รับทราบการแจ้งเตือนแล้ว' : 'แก้ไขการแจ้งเตือนแล้ว',
    timestamp: new Date().toISOString(),
  });
}
