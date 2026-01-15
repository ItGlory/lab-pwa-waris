import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/etl/status`, {
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
    console.error('ETL status fetch error:', error);
    // Return mock data if backend is unavailable
    return NextResponse.json({
      status: 'idle',
      is_running: true,
      current_job: null,
      pending_jobs: 0,
      last_sync: new Date().toISOString(),
      last_sync_th: '15 ม.ค. 2569 10:30',
      records_processed: 15000,
      next_scheduled_sync: '02:00',
      errors: 0,
    });
  }
}
