'use client';

import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Filter,
  Search,
  ChevronRight,
  RefreshCw,
  List,
  Map as MapIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatThaiDateTime } from '@/lib/formatting';
import { AlertMap } from '@/components/dashboard/alert-map';
import { dmaGeoJSON, alertMarkers } from '@/lib/mock-geojson';

interface Alert {
  id: string;
  dma_id: string;
  dma_name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  title_th: string;
  title_en: string;
  description_th: string;
  triggered_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    label: 'วิกฤต',
    variant: 'critical' as const,
    bg: 'bg-red-500',
    color: 'text-white',
  },
  high: {
    icon: AlertTriangle,
    label: 'สูง',
    variant: 'warning' as const,
    bg: 'bg-orange-500',
    color: 'text-white',
  },
  medium: {
    icon: AlertTriangle,
    label: 'ปานกลาง',
    variant: 'warning' as const,
    bg: 'bg-amber-500',
    color: 'text-white',
  },
  low: {
    icon: Info,
    label: 'ต่ำ',
    variant: 'secondary' as const,
    bg: 'bg-blue-500',
    color: 'text-white',
  },
};

const statusConfig = {
  active: {
    icon: Bell,
    label: 'รอดำเนินการ',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
  acknowledged: {
    icon: Clock,
    label: 'รับทราบแล้ว',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  resolved: {
    icon: CheckCircle,
    label: 'แก้ไขแล้ว',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');

  const fetchAlerts = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/alerts?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, statusFilter]);

  React.useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAction = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, action }),
      });
      const data = await response.json();
      if (data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  status: action === 'acknowledge' ? 'acknowledged' : 'resolved',
                  acknowledged_at:
                    action === 'acknowledge' ? new Date().toISOString() : alert.acknowledged_at,
                  resolved_at: action === 'resolve' ? new Date().toISOString() : alert.resolved_at,
                }
              : alert
          )
        );
      }
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const handleMarkerClick = (markerId: string) => {
    // Find the alert and scroll to it or show details
    console.log('Marker clicked:', markerId);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      alert.title_th.toLowerCase().includes(searchLower) ||
      alert.dma_name.toLowerCase().includes(searchLower) ||
      alert.description_th.toLowerCase().includes(searchLower)
    );
  });

  // Summary counts
  const summaryCounts = {
    critical: alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length,
    high: alerts.filter((a) => a.severity === 'high' && a.status === 'active').length,
    medium: alerts.filter((a) => a.severity === 'medium' && a.status === 'active').length,
    low: alerts.filter((a) => a.severity === 'low' && a.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">การแจ้งเตือน</h1>
          <p className="text-muted-foreground">Alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
              รายการ
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4" />
              แผนที่
            </Button>
          </div>
          <Button onClick={fetchAlerts} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">วิกฤต</p>
                <p className="text-3xl font-bold">{summaryCounts.critical}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/20">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100">สูง</p>
                <p className="text-3xl font-bold">{summaryCounts.high}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/20">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">ปานกลาง</p>
                <p className="text-3xl font-bold">{summaryCounts.medium}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/20">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">ต่ำ</p>
                <p className="text-3xl font-bold">{summaryCounts.low}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/20">
                <Info className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              แผนที่การแจ้งเตือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertMap
              geoJSON={dmaGeoJSON}
              markers={alertMarkers}
              height="500px"
              onMarkerClick={handleMarkerClick}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาการแจ้งเตือน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ระดับความรุนแรง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับ</SelectItem>
                <SelectItem value="critical">วิกฤต</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="low">ต่ำ</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="active">รอดำเนินการ</SelectItem>
                <SelectItem value="acknowledged">รับทราบแล้ว</SelectItem>
                <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              รายการแจ้งเตือน
              <Badge variant="secondary" className="ml-2">
                {filteredAlerts.length} รายการ
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <h2 className="mt-4 text-xl font-semibold">ไม่พบการแจ้งเตือน</h2>
                <p className="mt-2 text-muted-foreground">ไม่มีการแจ้งเตือนที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const severity = severityConfig[alert.severity];
                  const status = statusConfig[alert.status];
                  const SeverityIcon = severity.icon;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={alert.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-start"
                    >
                      {/* Severity Icon */}
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${severity.bg}`}
                      >
                        <SeverityIcon className={`h-5 w-5 ${severity.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{alert.title_th}</h3>
                          <Badge variant={severity.variant}>{severity.label}</Badge>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.description_th}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <Link
                            href={`/dma/${alert.dma_id}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {alert.dma_name}
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatThaiDateTime(alert.triggered_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 gap-2 sm:flex-col">
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleAction(alert.id, 'acknowledge')}
                          >
                            <Check className="h-4 w-4" />
                            รับทราบ
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => handleAction(alert.id, 'resolve')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            แก้ไขแล้ว
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
