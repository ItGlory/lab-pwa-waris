import { NextResponse } from 'next/server';

const dashboardSummary = {
  summary: {
    total_dmas: 200,
    active_dmas: 195,
    total_inflow: 2850000,
    total_outflow: 2422500,
    total_loss: 427500,
    avg_loss_percentage: 15.0,
    target_loss_percentage: 12.0,
  },
  kpis: {
    water_inflow: {
      value: 2850000,
      unit: 'ลบ.ม./วัน',
      trend: { direction: 'up', value: 2.5, label: 'เพิ่มขึ้น 2.5%' },
    },
    water_outflow: {
      value: 2422500,
      unit: 'ลบ.ม./วัน',
      trend: { direction: 'up', value: 1.8, label: 'เพิ่มขึ้น 1.8%' },
    },
    water_loss: {
      value: 427500,
      unit: 'ลบ.ม./วัน',
      trend: { direction: 'up', value: 5.2, label: 'เพิ่มขึ้น 5.2%' },
      status: 'warning',
    },
    loss_percentage: {
      value: 15.0,
      unit: '%',
      trend: { direction: 'up', value: 0.8, label: 'เพิ่มขึ้น 0.8%' },
      status: 'warning',
      target: 12.0,
    },
  },
  status_distribution: { normal: 120, warning: 60, critical: 20 },
  alerts: {
    total: 45,
    active: 28,
    acknowledged: 12,
    resolved_today: 5,
    by_severity: { critical: 3, high: 8, medium: 17, low: 17 },
  },
  regional_summary: [
    { region_id: 'reg-001', region_name: 'เขต 1 (ภาคเหนือ)', dma_count: 45, avg_loss_percentage: 13.5, status: 'normal' },
    { region_id: 'reg-002', region_name: 'เขต 2 (ภาคกลาง)', dma_count: 52, avg_loss_percentage: 16.8, status: 'warning' },
    { region_id: 'reg-003', region_name: 'เขต 3 (ภาคตะวันออก)', dma_count: 35, avg_loss_percentage: 14.2, status: 'normal' },
    { region_id: 'reg-004', region_name: 'เขต 4 (ภาคตะวันออกเฉียงเหนือ)', dma_count: 48, avg_loss_percentage: 12.8, status: 'normal' },
    { region_id: 'reg-005', region_name: 'เขต 5 (ภาคใต้)', dma_count: 20, avg_loss_percentage: 17.5, status: 'warning' },
  ],
  last_updated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: dashboardSummary,
    message: 'Success',
    message_th: 'สำเร็จ',
    timestamp: new Date().toISOString(),
  });
}
