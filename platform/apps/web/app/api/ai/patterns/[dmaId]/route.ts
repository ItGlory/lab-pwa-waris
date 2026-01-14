import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dmaId: string }> }
) {
  const { dmaId } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/patterns/${dmaId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI patterns fetch error:', error);
    // Return mock data
    return NextResponse.json({
      success: true,
      dma_id: dmaId,
      data: {
        patterns: [
          { id: 'high_usage', label: 'high_usage', label_th: 'การใช้น้ำสูง', percentage: 35.2, count: 352 },
          { id: 'peak_hours', label: 'peak_hours', label_th: 'ชั่วโมงเร่งด่วน', percentage: 28.5, count: 285 },
          { id: 'low_usage', label: 'low_usage', label_th: 'การใช้น้ำต่ำ', percentage: 20.3, count: 203 },
          { id: 'weekend', label: 'weekend', label_th: 'วันหยุดสุดสัปดาห์', percentage: 16.0, count: 160 },
        ],
        total_readings: 1000,
      },
    });
  }
}
