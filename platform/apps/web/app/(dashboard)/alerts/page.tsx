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
  X,
  ChevronDown,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatThaiDateTime } from '@/lib/formatting';
import { AlertMap } from '@/components/dashboard/alert-map';
import { dmaGeoJSON, alertMarkers } from '@/lib/mock-geojson';
import { cn } from '@/lib/utils';

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
    badge: 'bg-red-500 text-white',
  },
  high: {
    icon: AlertTriangle,
    label: 'สูง',
    variant: 'warning' as const,
    bg: 'bg-orange-500',
    color: 'text-white',
    badge: 'bg-orange-500 text-white',
  },
  medium: {
    icon: AlertTriangle,
    label: 'ปานกลาง',
    variant: 'warning' as const,
    bg: 'bg-amber-500',
    color: 'text-white',
    badge: 'bg-amber-500 text-white',
  },
  low: {
    icon: Info,
    label: 'ต่ำ',
    variant: 'secondary' as const,
    bg: 'bg-blue-500',
    color: 'text-white',
    badge: 'bg-blue-500 text-white',
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
  const [selectedAlert, setSelectedAlert] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

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
    setSelectedAlert(markerId);
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

  // Compact Alert Card for Map View
  const CompactAlertCard = ({ alert }: { alert: Alert }) => {
    const severity = severityConfig[alert.severity];
    const status = statusConfig[alert.status];
    const SeverityIcon = severity.icon;
    const isSelected = selectedAlert === alert.id;

    return (
      <div
        className={cn(
          'flex gap-3 p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors',
          isSelected && 'bg-primary/10 border-l-2 border-l-primary'
        )}
        onClick={() => setSelectedAlert(alert.id)}
      >
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${severity.bg}`}>
          <SeverityIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">{alert.title_th}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground truncate">{alert.dma_name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">การแจ้งเตือน</h1>
          {/* Compact Summary Badges */}
          <div className="hidden sm:flex items-center gap-1">
            {summaryCounts.critical > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-medium">
                <AlertCircle className="h-3 w-3" />
                {summaryCounts.critical}
              </span>
            )}
            {summaryCounts.high > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-medium">
                {summaryCounts.high}
              </span>
            )}
            {summaryCounts.medium > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium">
                {summaryCounts.medium}
              </span>
            )}
            {summaryCounts.low > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium">
                {summaryCounts.low}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-background p-0.5">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">รายการ</span>
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">แผนที่</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            <ChevronDown className={cn('h-3 w-3 ml-1 transition-transform', showFilters && 'rotate-180')} />
          </Button>
          <Button onClick={fetchAlerts} variant="ghost" size="sm" className="h-7 px-2">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg">
          <div className="relative flex-1 min-w-[150px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm bg-background"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue placeholder="ระดับ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับ</SelectItem>
              <SelectItem value="critical">วิกฤต</SelectItem>
              <SelectItem value="high">สูง</SelectItem>
              <SelectItem value="medium">ปานกลาง</SelectItem>
              <SelectItem value="low">ต่ำ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="active">รอดำเนินการ</SelectItem>
              <SelectItem value="acknowledged">รับทราบแล้ว</SelectItem>
              <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
            </SelectContent>
          </Select>
          {(search || severityFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                setSearch('');
                setSeverityFilter('all');
                setStatusFilter('all');
              }}
            >
              <X className="h-3 w-3 mr-1" />
              ล้าง
            </Button>
          )}
        </div>
      )}

      {/* Map View - Compact Layout */}
      {viewMode === 'map' && (
        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[400px]">
          {/* Map */}
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-200">
            <AlertMap
              geoJSON={dmaGeoJSON}
              markers={alertMarkers}
              height="100%"
              onMarkerClick={handleMarkerClick}
            />
          </div>

          {/* Alert Sidebar */}
          <div className="hidden lg:flex w-80 flex-col rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <span className="text-sm font-medium text-foreground">
                การแจ้งเตือน ({filteredAlerts.length})
              </span>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                  <p className="mt-2 text-sm text-muted-foreground">ไม่พบการแจ้งเตือน</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <CompactAlertCard key={alert.id} alert={alert} />
                ))
              )}
            </ScrollArea>

            {/* Selected Alert Detail */}
            {selectedAlert && (
              <div className="border-t border-border p-3 bg-muted">
                {(() => {
                  const alert = alerts.find((a) => a.id === selectedAlert);
                  if (!alert) return null;
                  const severity = severityConfig[alert.severity];
                  return (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{alert.title_th}</p>
                          <p className="text-xs text-muted-foreground">{alert.dma_name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedAlert(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description_th}</p>
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1"
                            onClick={() => handleAction(alert.id, 'acknowledge')}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            รับทราบ
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs flex-1 bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => handleAction(alert.id, 'resolve')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            แก้ไขแล้ว
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Summary Cards - Only in List View */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-red-500 text-white border-0">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-100">วิกฤต</p>
                    <p className="text-2xl font-bold">{summaryCounts.critical}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-500 text-white border-0">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-100">สูง</p>
                    <p className="text-2xl font-bold">{summaryCounts.high}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-500 text-white border-0">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-100">ปานกลาง</p>
                    <p className="text-2xl font-bold">{summaryCounts.medium}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500 text-white border-0">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-100">ต่ำ</p>
                    <p className="text-2xl font-bold">{summaryCounts.low}</p>
                  </div>
                  <Info className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                รายการแจ้งเตือน
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filteredAlerts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                  <p className="mt-3 font-medium">ไม่พบการแจ้งเตือน</p>
                  <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือนที่ตรงกับเงื่อนไข</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAlerts.map((alert) => {
                    const severity = severityConfig[alert.severity];
                    const status = statusConfig[alert.status];
                    const SeverityIcon = severity.icon;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={alert.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-background p-3 transition-shadow hover:shadow-sm sm:flex-row sm:items-start"
                      >
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${severity.bg}`}>
                          <SeverityIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-sm text-foreground">{alert.title_th}</h3>
                            <Badge variant={severity.variant} className="text-[10px] h-5">
                              {severity.label}
                            </Badge>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.color}`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{alert.description_th}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/70">
                            <Link
                              href={`/dma/${alert.dma_id}`}
                              className="flex items-center gap-0.5 text-blue-600 hover:underline"
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
                        <div className="flex shrink-0 gap-2">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleAction(alert.id, 'acknowledge')}
                            >
                              <Check className="h-3 w-3" />
                              รับทราบ
                            </Button>
                          )}
                          {alert.status !== 'resolved' && (
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1 bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleAction(alert.id, 'resolve')}
                            >
                              <CheckCircle className="h-3 w-3" />
                              แก้ไข
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
        </>
      )}
    </div>
  );
}
