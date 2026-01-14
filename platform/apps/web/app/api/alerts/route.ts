import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const dmaId = searchParams.get('dma_id');
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    // Build query string for backend
    const backendParams = new URLSearchParams();
    if (severity) backendParams.set('severity', severity);
    if (status) backendParams.set('status', status);
    if (dmaId) backendParams.set('dma_id', dmaId);
    backendParams.set('page', page);
    backendParams.set('per_page', perPage);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/alerts?${backendParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
      meta: data.meta,
      message: 'Success',
      message_th: 'สำเร็จ',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        meta: { page: 1, per_page: 20, total: 0, total_pages: 0 },
        message: error instanceof Error ? error.message : 'Failed to fetch alerts',
        message_th: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    const endpoint =
      action === 'acknowledge'
        ? `${API_BASE_URL}/api/v1/alerts/${id}/acknowledge`
        : `${API_BASE_URL}/api/v1/alerts/${id}/resolve`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
      message: action === 'acknowledge' ? 'Alert acknowledged' : 'Alert resolved',
      message_th: action === 'acknowledge' ? 'รับทราบการแจ้งเตือนแล้ว' : 'แก้ไขการแจ้งเตือนแล้ว',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Alert update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update alert',
          message_th: 'ไม่สามารถอัพเดทการแจ้งเตือนได้',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
