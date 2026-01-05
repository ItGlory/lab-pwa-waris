'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Droplets, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDMAs, type DMA } from '@/hooks/use-dmas';
import { formatNumber, formatPercent } from '@/lib/formatting';
import { cn } from '@/lib/utils';

const regions = [
  { id: 'all', name: 'ทุกเขต' },
  { id: 'reg-001', name: 'เขต 1 (ภาคเหนือ)' },
  { id: 'reg-002', name: 'เขต 2 (ภาคกลาง)' },
  { id: 'reg-003', name: 'เขต 3 (ภาคตะวันออก)' },
  { id: 'reg-004', name: 'เขต 4 (ภาคตะวันออกเฉียงเหนือ)' },
  { id: 'reg-005', name: 'เขต 5 (ภาคใต้)' },
];

const statusOptions = [
  { id: 'all', name: 'ทุกสถานะ' },
  { id: 'normal', name: 'ปกติ' },
  { id: 'warning', name: 'เฝ้าระวัง' },
  { id: 'critical', name: 'วิกฤต' },
];

function getStatusVariant(status: string): 'success' | 'warning' | 'critical' {
  switch (status) {
    case 'normal':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'critical';
    default:
      return 'success';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'normal':
      return 'ปกติ';
    case 'warning':
      return 'เฝ้าระวัง';
    case 'critical':
      return 'วิกฤต';
    default:
      return status;
  }
}

export default function DMAListPage() {
  const [search, setSearch] = React.useState('');
  const [region, setRegion] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [sortField, setSortField] = React.useState<keyof DMA>('loss_percentage');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useDMAs({
    region: region !== 'all' ? region : undefined,
    status: status !== 'all' ? (status as 'normal' | 'warning' | 'critical') : undefined,
    search: search || undefined,
  });

  const sortedDMAs = React.useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [data?.data, sortField, sortDirection]);

  const handleSort = (field: keyof DMA) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Summary statistics
  const summary = React.useMemo(() => {
    if (!data?.data) return { total: 0, normal: 0, warning: 0, critical: 0, avgLoss: 0 };
    const dmas = data.data;
    return {
      total: dmas.length,
      normal: dmas.filter((d) => d.status === 'normal').length,
      warning: dmas.filter((d) => d.status === 'warning').length,
      critical: dmas.filter((d) => d.status === 'critical').length,
      avgLoss: dmas.reduce((acc, d) => acc + d.loss_percentage, 0) / (dmas.length || 1),
    };
  }, [data?.data]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">พื้นที่จ่ายน้ำย่อย (DMA)</h1>
          <p className="text-muted-foreground">
            จัดการและตรวจสอบข้อมูล DMA ทั้งหมด
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DMA ทั้งหมด</p>
                <p className="text-2xl font-bold">{isLoading ? '-' : summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-100">ปกติ</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '-' : summary.normal}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-100">เฝ้าระวัง</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '-' : summary.warning}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-100">วิกฤต</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '-' : summary.critical}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-100">เฉลี่ยสูญเสีย</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '-' : formatPercent(summary.avgLoss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหา DMA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกเขต" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* DMA Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">DMA</TableHead>
                  <TableHead>สาขา / เขต</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('loss_percentage')}
                    >
                      น้ำสูญเสีย
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('current_loss')}
                    >
                      ปริมาณสูญเสีย
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDMAs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <p className="text-muted-foreground">ไม่พบข้อมูล DMA</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDMAs.map((dma) => (
                    <TableRow key={dma.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{dma.name_th}</p>
                          <p className="text-xs text-muted-foreground">{dma.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{dma.branch_name}</p>
                          <p className="text-xs text-muted-foreground">{dma.region_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'text-lg font-bold',
                            dma.status === 'normal'
                              ? 'text-green-700 dark:text-green-400'
                              : dma.status === 'warning'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-red-700 dark:text-red-400'
                          )}
                        >
                          {formatPercent(dma.loss_percentage)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatNumber(dma.current_loss)} ลบ.ม./วัน
                          </p>
                          <p className="text-xs text-muted-foreground">
                            จาก {formatNumber(dma.current_inflow)} ลบ.ม.
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(dma.status)}>
                          {getStatusText(dma.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dma/${dma.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
