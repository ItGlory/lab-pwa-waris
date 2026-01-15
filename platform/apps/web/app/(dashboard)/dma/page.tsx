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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
            พื้นที่จ่ายน้ำย่อย (DMA)
          </h1>
          <p className="text-muted-foreground">
            จัดการและตรวจสอบข้อมูล DMA ทั้งหมด
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <MapPin className="h-5 w-5 text-[var(--pwa-cyan)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DMA ทั้งหมด</p>
                <p className="text-2xl font-bold">{isLoading ? '-' : summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300 animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300 animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 animate-breathing-glow opacity-50" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white border-0 shadow-lg shadow-[var(--pwa-cyan)]/25 hover:shadow-[var(--pwa-cyan)]/40 hover:scale-[1.02] transition-all duration-300 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-cyan-100">เฉลี่ยสูญเสีย</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '-' : formatPercent(summary.avgLoss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--pwa-cyan)]/5 via-transparent to-[var(--pwa-blue-deep)]/5" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20">
              <Filter className="h-3.5 w-3.5 text-[var(--pwa-cyan)]" />
            </div>
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[var(--pwa-cyan)]" />
              <Input
                placeholder="ค้นหา DMA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 focus:border-[var(--pwa-cyan)]/50 focus:ring-[var(--pwa-cyan)]/20 transition-all"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[200px] bg-background/50 border-border/50 hover:border-[var(--pwa-cyan)]/30 transition-colors">
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
              <SelectTrigger className="w-[150px] bg-background/50 border-border/50 hover:border-[var(--pwa-cyan)]/30 transition-colors">
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
      <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/30 to-transparent" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 hover:bg-muted/50">
                  <TableHead className="w-[250px]">DMA</TableHead>
                  <TableHead>สาขา / เขต</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-[var(--pwa-cyan)]/10 hover:text-[var(--pwa-cyan)] transition-colors"
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
                      className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-[var(--pwa-cyan)]/10 hover:text-[var(--pwa-cyan)] transition-colors"
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
                  sortedDMAs.map((dma, index) => (
                    <TableRow
                      key={dma.id}
                      className={cn(
                        "group transition-all duration-200 hover:bg-gradient-to-r hover:from-[var(--pwa-cyan)]/5 hover:to-transparent",
                        dma.status === 'critical' && 'bg-red-500/5',
                        "animate-slide-up-fade"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            dma.status === 'normal' && 'bg-emerald-500',
                            dma.status === 'warning' && 'bg-amber-500',
                            dma.status === 'critical' && 'bg-red-500 animate-pulse'
                          )} />
                          <div>
                            <p className="font-medium group-hover:text-[var(--pwa-cyan)] transition-colors">{dma.name_th}</p>
                            <p className="text-xs text-muted-foreground">{dma.code}</p>
                          </div>
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
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : dma.status === 'warning'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
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
                        <Badge
                          variant={getStatusVariant(dma.status)}
                          className={cn(
                            "transition-all",
                            dma.status === 'normal' && 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                            dma.status === 'warning' && 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
                            dma.status === 'critical' && 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-700 dark:text-red-300 border-red-500/30 animate-pulse'
                          )}
                        >
                          {getStatusText(dma.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--pwa-cyan)]/10 hover:text-[var(--pwa-cyan)]"
                        >
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
