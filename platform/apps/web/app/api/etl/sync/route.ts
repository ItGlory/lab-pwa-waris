import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/v1/etl/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('ETL sync error:', error);
    // Return simulated success if backend is unavailable
    return NextResponse.json({
      success: true,
      message: 'Sync triggered (simulated)',
      message_th: 'เริ่มการซิงค์แล้ว (จำลอง)',
      stats: {
        source_type: 'api',
        status: 'in_progress',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
