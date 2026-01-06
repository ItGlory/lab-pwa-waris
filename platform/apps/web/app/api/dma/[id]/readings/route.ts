import { NextRequest, NextResponse } from 'next/server';
import readingsData from '@/lib/mock-data/readings.json';

type ReadingsData = {
  [key: string]: {
    base_inflow: number;
    base_loss_pct: number;
    readings: Array<{
      date: string;
      inflow: number;
      outflow: number;
      loss: number;
      loss_pct: number;
      pressure: number;
    }>;
  };
};

const readings = readingsData as ReadingsData;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';

  const dmaReadings = readings[id];

  if (!dmaReadings) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'DMA readings not found',
          message_th: 'ไม่พบข้อมูลการอ่านค่า DMA',
        },
      },
      { status: 404 }
    );
  }

  // Filter readings by period
  let days = 30;
  switch (period) {
    case '7d':
      days = 7;
      break;
    case '14d':
      days = 14;
      break;
    case '30d':
      days = 30;
      break;
    default:
      days = 30;
  }

  const filteredReadings = dmaReadings.readings.slice(0, days);

  return NextResponse.json({
    success: true,
    data: {
      dma_id: id,
      period,
      base_inflow: dmaReadings.base_inflow,
      base_loss_pct: dmaReadings.base_loss_pct,
      readings: filteredReadings,
    },
    message: 'Success',
    message_th: 'สำเร็จ',
  });
}
