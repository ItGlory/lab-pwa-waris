import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionId = searchParams.get('region');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    // Build query string for backend
    const backendParams = new URLSearchParams();
    if (regionId) backendParams.set('region_id', regionId);
    if (status) backendParams.set('status', status);
    if (search) backendParams.set('search', search);
    backendParams.set('page', page);
    backendParams.set('per_page', perPage);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/dma?${backendParams.toString()}`,
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
    console.error('DMA API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        meta: { page: 1, per_page: 20, total: 0, total_pages: 0 },
        message: error instanceof Error ? error.message : 'Failed to fetch DMAs',
        message_th: 'ไม่สามารถดึงข้อมูล DMA ได้',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
