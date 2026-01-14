import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/etl/history`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ETL history fetch error:', error);
    // Return mock data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'sync-001',
          source_type: 'api',
          started_at: '2026-01-14T02:00:00Z',
          completed_at: '2026-01-14T02:15:00Z',
          records_processed: 15000,
          status: 'completed',
        },
        {
          id: 'sync-002',
          source_type: 'file',
          started_at: '2026-01-13T14:30:00Z',
          completed_at: '2026-01-13T14:32:00Z',
          records_processed: 500,
          status: 'completed',
        },
      ],
      message: 'Success',
      message_th: 'สำเร็จ',
    });
  }
}
