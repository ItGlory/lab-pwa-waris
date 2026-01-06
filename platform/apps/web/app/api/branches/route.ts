import { NextRequest, NextResponse } from 'next/server';
import branchesData from '@/lib/mock-data/branches.json';

interface Branch {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  region_id: string;
  region_name: string;
  province: string;
  dma_count: number;
  total_inflow: number;
  avg_loss_pct: number;
  status: string;
}

const branches = branchesData as Branch[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let filteredBranches = [...branches];

  // Filter by region
  if (region && region !== 'all') {
    filteredBranches = filteredBranches.filter((b) => b.region_id === region);
  }

  // Filter by status
  if (status && status !== 'all') {
    filteredBranches = filteredBranches.filter((b) => b.status === status);
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredBranches = filteredBranches.filter(
      (b) =>
        b.name_th.toLowerCase().includes(searchLower) ||
        b.name_en.toLowerCase().includes(searchLower) ||
        b.province.toLowerCase().includes(searchLower) ||
        b.code.toLowerCase().includes(searchLower)
    );
  }

  // Sort by name_th
  filteredBranches.sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'));

  return NextResponse.json({
    success: true,
    data: filteredBranches,
    meta: {
      total: filteredBranches.length,
    },
    message: 'Success',
    message_th: 'สำเร็จ',
  });
}
