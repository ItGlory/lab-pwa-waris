import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/models`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI models fetch error:', error);
    // Return mock data if backend unavailable
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'anomaly_detection',
          name: 'Anomaly Detection',
          name_th: 'ตรวจจับความผิดปกติ',
          version: '1.0.0',
          status: 'active',
          last_trained: '2026-01-15T02:00:00Z',
          metrics: { f1_score: 0.87, precision: 0.85, recall: 0.89 },
        },
        {
          id: 'pattern_recognition',
          name: 'Pattern Recognition',
          name_th: 'จดจำรูปแบบ',
          version: '1.0.0',
          status: 'active',
          last_trained: '2026-01-15T02:00:00Z',
          metrics: { silhouette_score: 0.72, accuracy: 0.81 },
        },
        {
          id: 'classification',
          name: 'Water Loss Classification',
          name_th: 'แยกแยะประเภทน้ำสูญเสีย',
          version: '1.0.0',
          status: 'active',
          last_trained: '2026-01-15T02:00:00Z',
          metrics: { accuracy: 0.84, auc_roc: 0.89 },
        },
        {
          id: 'timeseries',
          name: 'Time Series Forecasting',
          name_th: 'พยากรณ์แนวโน้ม',
          version: '1.0.0',
          status: 'active',
          last_trained: '2026-01-15T02:00:00Z',
          metrics: { mape: 12.5, rmse: 25.3 },
        },
      ],
    });
  }
}
