import { NextRequest, NextResponse } from 'next/server';
import reportsData from '@/lib/mock-data/reports.json';

interface Report {
  id: string;
  title_th: string;
  title_en: string;
  type: string;
  category: string;
  period: string;
  created_at: string;
  file_size: string;
  status: string;
}

const reports = reportsData as Report[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');

  let filteredReports = [...reports];

  // Filter by type
  if (type && type !== 'all') {
    filteredReports = filteredReports.filter((r) => r.type === type);
  }

  // Filter by category
  if (category && category !== 'all') {
    filteredReports = filteredReports.filter((r) => r.category === category);
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredReports = filteredReports.filter(
      (r) =>
        r.title_th.toLowerCase().includes(searchLower) ||
        r.title_en.toLowerCase().includes(searchLower)
    );
  }

  // Sort by created_at descending (newest first)
  filteredReports.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Pagination
  const total = filteredReports.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const paginatedReports = filteredReports.slice(start, start + perPage);

  return NextResponse.json({
    success: true,
    data: paginatedReports,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
    message: 'Success',
    message_th: 'สำเร็จ',
  });
}
