import { NextRequest, NextResponse } from 'next/server';

const dmas = [
  {
    id: 'dma-001',
    code: 'DMA-CBR-001',
    name_th: 'DMA ชลบุรี-01',
    name_en: 'Chonburi DMA-01',
    branch_id: 'branch-001',
    branch_name: 'สาขาชลบุรี',
    region_id: 'reg-003',
    region_name: 'เขต 3 (ภาคตะวันออก)',
    area_km2: 12.5,
    population: 45000,
    connections: 8500,
    pipe_length_km: 156.8,
    current_inflow: 12500,
    current_outflow: 9000,
    current_loss: 3500,
    loss_percentage: 28.0,
    avg_pressure: 2.8,
    status: 'critical',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 'dma-002',
    code: 'DMA-SNI-001',
    name_th: 'DMA สุราษฎร์ธานี-01',
    name_en: 'Surat Thani DMA-01',
    branch_id: 'branch-002',
    branch_name: 'สาขาสุราษฎร์ธานี',
    region_id: 'reg-005',
    region_name: 'เขต 5 (ภาคใต้)',
    area_km2: 8.2,
    population: 32000,
    connections: 6200,
    pipe_length_km: 98.5,
    current_inflow: 8500,
    current_outflow: 7055,
    current_loss: 1445,
    loss_percentage: 17.0,
    avg_pressure: 3.2,
    status: 'warning',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 'dma-003',
    code: 'DMA-CNX-003',
    name_th: 'DMA เชียงใหม่-03',
    name_en: 'Chiang Mai DMA-03',
    branch_id: 'branch-003',
    branch_name: 'สาขาเชียงใหม่',
    region_id: 'reg-001',
    region_name: 'เขต 1 (ภาคเหนือ)',
    area_km2: 15.8,
    population: 52000,
    connections: 9800,
    pipe_length_km: 178.2,
    current_inflow: 14200,
    current_outflow: 12212,
    current_loss: 1988,
    loss_percentage: 14.0,
    avg_pressure: 2.5,
    status: 'normal',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 'dma-004',
    code: 'DMA-NMA-001',
    name_th: 'DMA นครราชสีมา-01',
    name_en: 'Nakhon Ratchasima DMA-01',
    branch_id: 'branch-004',
    branch_name: 'สาขานครราชสีมา',
    region_id: 'reg-004',
    region_name: 'เขต 4 (ภาคตะวันออกเฉียงเหนือ)',
    area_km2: 10.5,
    population: 38000,
    connections: 7200,
    pipe_length_km: 125.6,
    current_inflow: 10500,
    current_outflow: 9135,
    current_loss: 1365,
    loss_percentage: 13.0,
    avg_pressure: 3.0,
    status: 'normal',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 'dma-005',
    code: 'DMA-KKN-002',
    name_th: 'DMA ขอนแก่น-02',
    name_en: 'Khon Kaen DMA-02',
    branch_id: 'branch-005',
    branch_name: 'สาขาขอนแก่น',
    region_id: 'reg-004',
    region_name: 'เขต 4 (ภาคตะวันออกเฉียงเหนือ)',
    area_km2: 9.8,
    population: 35000,
    connections: 6800,
    pipe_length_km: 112.4,
    current_inflow: 9200,
    current_outflow: 8188,
    current_loss: 1012,
    loss_percentage: 11.0,
    avg_pressure: 3.1,
    status: 'normal',
    last_updated: '2024-01-15T10:00:00Z',
  },
];

interface DMAData {
  id: string;
  status: string;
  loss_percentage: number;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dma = dmas.find((d: DMAData) => d.id === id);

  if (!dma) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'DMA not found', message_th: 'ไม่พบ DMA' },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  const detailedDMA = {
    ...dma,
    predictions: {
      anomaly: {
        status: dma.status === 'critical' ? 'anomaly' : dma.status === 'warning' ? 'warning' : 'normal',
        confidence: 0.85,
        description_th:
          dma.status === 'critical'
            ? 'ตรวจพบความผิดปกติของอัตราการไหล'
            : dma.status === 'warning'
              ? 'ตรวจพบแนวโน้มน้ำสูญเสียเพิ่มขึ้น'
              : 'ไม่พบความผิดปกติ',
      },
      pattern: {
        type: 'seasonal',
        confidence: 0.78,
        description_th: 'รูปแบบการใช้น้ำตามฤดูกาล - สูงในช่วงหน้าร้อน',
      },
      classification: {
        physical_loss_pct: 65,
        commercial_loss_pct: 35,
        confidence: 0.72,
        description_th: 'น้ำสูญเสียส่วนใหญ่เป็นการรั่วไหลทางกายภาพ',
      },
      forecast: {
        trend: dma.loss_percentage > 15 ? 'increasing' : 'stable',
        next_7_days: dma.loss_percentage * 1.02,
        next_30_days: dma.loss_percentage * 1.05,
        confidence: 0.81,
        description_th:
          dma.loss_percentage > 15
            ? 'คาดว่าน้ำสูญเสียจะเพิ่มขึ้นหากไม่ดำเนินการแก้ไข'
            : 'คาดว่าน้ำสูญเสียจะคงที่',
      },
    },
  };

  return NextResponse.json({
    success: true,
    data: detailedDMA,
    message: 'Success',
    message_th: 'สำเร็จ',
    timestamp: new Date().toISOString(),
  });
}
