import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dmaId: string }> }
) {
  const { dmaId } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/analyze/${dmaId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI analysis fetch error:', error);
    // Return mock data
    const now = new Date();

    return NextResponse.json({
      dma_id: dmaId,
      analysis_timestamp: now.toISOString(),
      anomalies: [
        {
          is_anomaly: Math.random() > 0.7,
          probability: 0.65,
          confidence: 0.85,
          details: { loss_percentage: 15.2, pressure: 3.2 },
        },
      ],
      patterns: {
        dominant_pattern: 'high_usage',
        dominant_pattern_th: 'การใช้น้ำสูง',
        confidence: 0.78,
      },
      forecast: {
        dates: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() + i + 1);
          return date.toISOString().split('T')[0];
        }),
        predictions: [152, 148, 155, 160, 158, 165, 170],
        lower_bound: [127, 123, 130, 135, 133, 140, 145],
        upper_bound: [177, 173, 180, 185, 183, 190, 195],
        confidence: 0.95,
      },
      classification: {
        loss_type: 'physical',
        loss_type_th: 'น้ำสูญเสียทางกายภาพ',
        probability: 0.78,
        confidence: 0.82,
        feature_importance: {
          loss_percentage: 0.35,
          pressure: 0.25,
          flow_in: 0.20,
          hour: 0.12,
          flow_out: 0.08,
        },
      },
      recommendations: [
        {
          type: 'monitoring',
          priority: 'medium',
          message: 'ควรตรวจสอบเพิ่มเติม',
          message_en: 'Further monitoring recommended',
          action: 'ติดตามค่าน้ำสูญเสียอย่างใกล้ชิด',
        },
        {
          type: 'inspection',
          priority: 'low',
          message: 'แนะนำให้ตรวจสอบมิเตอร์',
          message_en: 'Meter inspection recommended',
          action: 'ตรวจสอบความถูกต้องของมิเตอร์ในพื้นที่',
        },
      ],
    });
  }
}
