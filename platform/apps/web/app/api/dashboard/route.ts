import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/summary`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform backend response to match frontend expected format
    const transformed = {
      summary: {
        total_dmas: data.data.total_dmas,
        active_dmas: data.data.active_dmas,
        total_inflow: data.data.total_inflow,
        total_outflow: data.data.total_outflow,
        total_loss: data.data.total_loss,
        avg_loss_percentage: data.data.avg_loss_percentage,
        target_loss_percentage: 15.0,
      },
      kpis: {
        water_inflow: data.data.kpis.find((k: { title: string }) => k.title === 'Water Inflow') || data.data.kpis[0],
        water_outflow: data.data.kpis.find((k: { title: string }) => k.title === 'Water Outflow') || data.data.kpis[1],
        water_loss: data.data.kpis.find((k: { title: string }) => k.title === 'Water Loss') || data.data.kpis[2],
        loss_percentage: data.data.kpis.find((k: { title: string }) => k.title === 'Loss Percentage') || data.data.kpis[3],
      },
      status_distribution: data.data.status_distribution,
      alerts: data.data.alerts,
      regional_summary: data.data.regional_summary,
      last_updated: data.data.last_updated,
    };

    return NextResponse.json({
      success: true,
      data: transformed,
      message: 'Success',
      message_th: 'สำเร็จ',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard',
        message_th: 'ไม่สามารถดึงข้อมูล Dashboard ได้',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
