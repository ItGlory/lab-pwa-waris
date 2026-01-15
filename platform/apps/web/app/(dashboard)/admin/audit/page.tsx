'use client';

import * as React from 'react';
import {
  Shield,
  Activity,
  Users,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Settings,
  Database,
  FileText,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Calendar,
  User,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  MoreHorizontal,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  Lock,
  Unlock,
  Key,
  UserPlus,
  UserMinus,
  FileUp,
  FileDown,
  MessageSquare,
  Bot,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Interfaces
interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'analyst' | 'viewer';
  };
  action: string;
  action_th: string;
  category: 'auth' | 'data' | 'system' | 'ai' | 'user' | 'config';
  resource: string;
  resource_id?: string;
  status: 'success' | 'failure' | 'warning';
  ip_address: string;
  user_agent: string;
  details?: Record<string, unknown>;
  duration_ms?: number;
}

interface SystemHealth {
  component: string;
  component_th: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  latency_ms: number;
  last_check: string;
}

interface UserSession {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  started_at: string;
  last_activity: string;
  status: 'active' | 'idle' | 'expired';
}

interface AuditStats {
  total_events: number;
  success_rate: number;
  active_users: number;
  failed_logins: number;
  api_calls: number;
  ai_queries: number;
}

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-01-15T10:45:30Z',
    user: { id: 'u-001', name: 'สมชาย มั่งมี', email: 'somchai@pwa.co.th', role: 'admin' },
    action: 'User Login',
    action_th: 'เข้าสู่ระบบ',
    category: 'auth',
    resource: 'Authentication',
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome/120.0 Windows 10',
    duration_ms: 245,
  },
  {
    id: 'log-002',
    timestamp: '2026-01-15T10:42:15Z',
    user: { id: 'u-002', name: 'สุภาพร วงศ์ไพศาล', email: 'supaporn@pwa.co.th', role: 'analyst' },
    action: 'AI Query',
    action_th: 'ถาม AI',
    category: 'ai',
    resource: 'LLM Chat',
    resource_id: 'chat-123',
    status: 'success',
    ip_address: '192.168.1.105',
    user_agent: 'Firefox/121.0 macOS',
    duration_ms: 3420,
    details: { query: 'สาเหตุน้ำสูญเสียใน DMA-001', tokens: 1250 },
  },
  {
    id: 'log-003',
    timestamp: '2026-01-15T10:40:00Z',
    user: { id: 'u-003', name: 'ประยุทธ์ ชัยชนะ', email: 'prayuth@pwa.co.th', role: 'viewer' },
    action: 'View Report',
    action_th: 'ดูรายงาน',
    category: 'data',
    resource: 'DMA Report',
    resource_id: 'report-456',
    status: 'success',
    ip_address: '192.168.1.110',
    user_agent: 'Safari/17.0 iOS',
    duration_ms: 890,
  },
  {
    id: 'log-004',
    timestamp: '2026-01-15T10:38:45Z',
    user: { id: 'u-001', name: 'สมชาย มั่งมี', email: 'somchai@pwa.co.th', role: 'admin' },
    action: 'Update Settings',
    action_th: 'แก้ไขการตั้งค่า',
    category: 'config',
    resource: 'System Config',
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome/120.0 Windows 10',
    duration_ms: 156,
    details: { changed: ['alert_threshold', 'email_notifications'] },
  },
  {
    id: 'log-005',
    timestamp: '2026-01-15T10:35:20Z',
    user: { id: 'u-004', name: 'Unknown', email: 'unknown@test.com', role: 'viewer' },
    action: 'Failed Login',
    action_th: 'เข้าสู่ระบบล้มเหลว',
    category: 'auth',
    resource: 'Authentication',
    status: 'failure',
    ip_address: '203.150.45.67',
    user_agent: 'Chrome/119.0 Windows 11',
    details: { reason: 'Invalid credentials', attempts: 3 },
  },
  {
    id: 'log-006',
    timestamp: '2026-01-15T10:32:10Z',
    user: { id: 'u-002', name: 'สุภาพร วงศ์ไพศาล', email: 'supaporn@pwa.co.th', role: 'analyst' },
    action: 'Export Data',
    action_th: 'ส่งออกข้อมูล',
    category: 'data',
    resource: 'DMA Data',
    resource_id: 'export-789',
    status: 'success',
    ip_address: '192.168.1.105',
    user_agent: 'Firefox/121.0 macOS',
    duration_ms: 2150,
    details: { format: 'CSV', records: 15000 },
  },
  {
    id: 'log-007',
    timestamp: '2026-01-15T10:30:00Z',
    user: { id: 'system', name: 'System', email: 'system@waris.local', role: 'admin' },
    action: 'ETL Sync',
    action_th: 'ซิงค์ข้อมูล ETL',
    category: 'system',
    resource: 'ETL Pipeline',
    status: 'success',
    ip_address: '127.0.0.1',
    user_agent: 'WARIS ETL Service',
    duration_ms: 45000,
    details: { records_processed: 5420, source: 'DMAMA' },
  },
  {
    id: 'log-008',
    timestamp: '2026-01-15T10:28:30Z',
    user: { id: 'u-001', name: 'สมชาย มั่งมี', email: 'somchai@pwa.co.th', role: 'admin' },
    action: 'Create User',
    action_th: 'สร้างผู้ใช้ใหม่',
    category: 'user',
    resource: 'User Management',
    resource_id: 'u-005',
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome/120.0 Windows 10',
    duration_ms: 320,
    details: { new_user: 'วิชัย สุขใจ', role: 'analyst' },
  },
  {
    id: 'log-009',
    timestamp: '2026-01-15T10:25:15Z',
    user: { id: 'u-002', name: 'สุภาพร วงศ์ไพศาล', email: 'supaporn@pwa.co.th', role: 'analyst' },
    action: 'AI Model Inference',
    action_th: 'รัน AI Model',
    category: 'ai',
    resource: 'Anomaly Detection',
    status: 'success',
    ip_address: '192.168.1.105',
    user_agent: 'Firefox/121.0 macOS',
    duration_ms: 1850,
    details: { model: 'anomaly-v2.3.1', dma_id: 'DMA-001' },
  },
  {
    id: 'log-010',
    timestamp: '2026-01-15T10:22:00Z',
    user: { id: 'system', name: 'System', email: 'system@waris.local', role: 'admin' },
    action: 'Database Backup',
    action_th: 'สำรองฐานข้อมูล',
    category: 'system',
    resource: 'PostgreSQL',
    status: 'warning',
    ip_address: '127.0.0.1',
    user_agent: 'WARIS Backup Service',
    duration_ms: 125000,
    details: { size_gb: 45.2, warning: 'Slow network transfer' },
  },
];

const mockSystemHealth: SystemHealth[] = [
  { component: 'Web Server', component_th: 'เว็บเซิร์ฟเวอร์', status: 'healthy', uptime: '99.99%', latency_ms: 12, last_check: '2026-01-15T10:45:00Z' },
  { component: 'API Gateway', component_th: 'API Gateway', status: 'healthy', uptime: '99.95%', latency_ms: 45, last_check: '2026-01-15T10:45:00Z' },
  { component: 'PostgreSQL', component_th: 'ฐานข้อมูล PostgreSQL', status: 'healthy', uptime: '99.98%', latency_ms: 8, last_check: '2026-01-15T10:45:00Z' },
  { component: 'MongoDB', component_th: 'ฐานข้อมูล MongoDB', status: 'healthy', uptime: '99.97%', latency_ms: 15, last_check: '2026-01-15T10:45:00Z' },
  { component: 'Redis Cache', component_th: 'Redis Cache', status: 'healthy', uptime: '99.99%', latency_ms: 2, last_check: '2026-01-15T10:45:00Z' },
  { component: 'Milvus Vector DB', component_th: 'Milvus Vector DB', status: 'healthy', uptime: '99.90%', latency_ms: 25, last_check: '2026-01-15T10:45:00Z' },
  { component: 'LLM Server', component_th: 'เซิร์ฟเวอร์ LLM', status: 'healthy', uptime: '99.85%', latency_ms: 150, last_check: '2026-01-15T10:45:00Z' },
  { component: 'ETL Pipeline', component_th: 'ETL Pipeline', status: 'degraded', uptime: '98.50%', latency_ms: 250, last_check: '2026-01-15T10:45:00Z' },
];

const mockUserSessions: UserSession[] = [
  {
    id: 'sess-001',
    user: { id: 'u-001', name: 'สมชาย มั่งมี', email: 'somchai@pwa.co.th', role: 'Admin' },
    device: 'Desktop',
    browser: 'Chrome 120',
    ip_address: '192.168.1.100',
    location: 'กรุงเทพฯ',
    started_at: '2026-01-15T08:30:00Z',
    last_activity: '2026-01-15T10:45:00Z',
    status: 'active',
  },
  {
    id: 'sess-002',
    user: { id: 'u-002', name: 'สุภาพร วงศ์ไพศาล', email: 'supaporn@pwa.co.th', role: 'Analyst' },
    device: 'MacBook',
    browser: 'Firefox 121',
    ip_address: '192.168.1.105',
    location: 'นนทบุรี',
    started_at: '2026-01-15T09:00:00Z',
    last_activity: '2026-01-15T10:42:00Z',
    status: 'active',
  },
  {
    id: 'sess-003',
    user: { id: 'u-003', name: 'ประยุทธ์ ชัยชนะ', email: 'prayuth@pwa.co.th', role: 'Viewer' },
    device: 'iPhone',
    browser: 'Safari 17',
    ip_address: '192.168.1.110',
    location: 'ปทุมธานี',
    started_at: '2026-01-15T10:00:00Z',
    last_activity: '2026-01-15T10:40:00Z',
    status: 'active',
  },
  {
    id: 'sess-004',
    user: { id: 'u-005', name: 'วิชัย สุขใจ', email: 'wichai@pwa.co.th', role: 'Analyst' },
    device: 'Desktop',
    browser: 'Edge 120',
    ip_address: '192.168.1.115',
    location: 'สมุทรปราการ',
    started_at: '2026-01-15T09:30:00Z',
    last_activity: '2026-01-15T10:15:00Z',
    status: 'idle',
  },
];

const mockStats: AuditStats = {
  total_events: 15420,
  success_rate: 98.5,
  active_users: 4,
  failed_logins: 12,
  api_calls: 45230,
  ai_queries: 1250,
};

export default function SystemAuditPage() {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = React.useState<SystemHealth[]>([]);
  const [sessions, setSessions] = React.useState<UserSession[]>([]);
  const [stats, setStats] = React.useState<AuditStats | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const logsPerPage = 10;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(mockAuditLogs);
      setSystemHealth(mockSystemHealth);
      setSessions(mockUserSessions);
      setStats(mockStats);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_th.includes(searchQuery) ||
      log.user.name.includes(searchQuery) ||
      log.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const getCategoryIcon = (category: AuditLog['category']) => {
    switch (category) {
      case 'auth':
        return <Key className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'system':
        return <Server className="h-4 w-4" />;
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'config':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: AuditLog['category']) => {
    switch (category) {
      case 'auth':
        return 'from-purple-500 to-purple-600';
      case 'data':
        return 'from-blue-500 to-blue-600';
      case 'system':
        return 'from-gray-500 to-gray-600';
      case 'ai':
        return 'from-emerald-500 to-teal-500';
      case 'user':
        return 'from-amber-500 to-orange-500';
      case 'config':
        return 'from-pink-500 to-rose-500';
    }
  };

  const getStatusBadge = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            สำเร็จ
          </Badge>
        );
      case 'failure':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
            <XCircle className="h-3 w-3 mr-1" />
            ล้มเหลว
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
            <AlertTriangle className="h-3 w-3 mr-1" />
            เตือน
          </Badge>
        );
    }
  };

  const getHealthStatusBadge = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            ปกติ
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <AlertTriangle className="h-3 w-3 mr-1" />
            ช้าลง
          </Badge>
        );
      case 'down':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <XCircle className="h-3 w-3 mr-1" />
            ล่ม
          </Badge>
        );
    }
  };

  const getSessionStatusBadge = (status: UserSession['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <Activity className="h-3 w-3 mr-1" />
            ออนไลน์
          </Badge>
        );
      case 'idle':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            ไม่เคลื่อนไหว
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            หมดอายุ
          </Badge>
        );
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    return formatTime(timestamp);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 ring-1 ring-red-500/20 shadow-lg shadow-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                System Audit
              </span>
            </h1>
            <p className="text-muted-foreground">
              ติดตามกิจกรรมและตรวจสอบความปลอดภัยของระบบ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{stats.total_events.toLocaleString()}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.success_rate}%</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{stats.active_users}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Failed Logins</p>
                    <p className="text-2xl font-bold text-red-500">{stats.failed_logins}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10">
                    <Lock className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--pwa-cyan)]/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">API Calls</p>
                    <p className="text-2xl font-bold">{(stats.api_calls / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-teal-500/10">
                    <Zap className="h-5 w-5 text-[var(--pwa-cyan)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '250ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">AI Queries</p>
                    <p className="text-2xl font-bold">{stats.ai_queries.toLocaleString()}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <Bot className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList className="backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg">
            <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Server className="h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Users className="h-4 w-4" />
              Active Sessions
            </TabsTrigger>
          </TabsList>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-4 animate-blur-in">
            {/* Filters */}
            <Card className="backdrop-blur-sm bg-background/80 border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหา action, user, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="หมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="data">Data Access</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="ai">AI/ML</SelectItem>
                      <SelectItem value="user">User Mgmt</SelectItem>
                      <SelectItem value="config">Config</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="success">สำเร็จ</SelectItem>
                      <SelectItem value="failure">ล้มเหลว</SelectItem>
                      <SelectItem value="warning">เตือน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <CardContent className="relative p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left p-4 font-medium text-sm">เวลา</th>
                        <th className="text-left p-4 font-medium text-sm">ผู้ใช้</th>
                        <th className="text-left p-4 font-medium text-sm">Action</th>
                        <th className="text-left p-4 font-medium text-sm">หมวดหมู่</th>
                        <th className="text-left p-4 font-medium text-sm">สถานะ</th>
                        <th className="text-left p-4 font-medium text-sm">IP</th>
                        <th className="text-left p-4 font-medium text-sm">Duration</th>
                        <th className="text-left p-4 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.map((log, index) => (
                        <tr
                          key={log.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-slide-up-fade"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="p-4">
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-sm text-muted-foreground">
                                  {formatTimeAgo(log.timestamp)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {formatTime(log.timestamp)}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                                <User className="h-4 w-4 text-purple-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{log.user.name}</p>
                                <p className="text-xs text-muted-foreground">{log.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sm">{log.action_th}</p>
                              <p className="text-xs text-muted-foreground">{log.resource}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${getCategoryColor(log.category)} text-white`}>
                                {getCategoryIcon(log.category)}
                              </div>
                              <span className="text-sm capitalize">{log.category}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(log.status)}
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-xs text-muted-foreground">
                              {log.ip_address}
                            </span>
                          </td>
                          <td className="p-4">
                            {log.duration_ms && (
                              <span className="text-sm">
                                {log.duration_ms < 1000
                                  ? `${log.duration_ms}ms`
                                  : `${(log.duration_ms / 1000).toFixed(1)}s`}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  ดูรายละเอียด
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    แสดง {(currentPage - 1) * logsPerPage + 1} - {Math.min(currentPage * logsPerPage, filteredLogs.length)} จาก {filteredLogs.length} รายการ
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="animate-blur-in">
            <div className="grid gap-4 md:grid-cols-2">
              {systemHealth.map((component, index) => (
                <Card
                  key={component.component}
                  className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    component.status === 'healthy' ? 'from-emerald-500/5 to-emerald-600/5' :
                    component.status === 'degraded' ? 'from-amber-500/5 to-orange-500/5' :
                    'from-red-500/5 to-red-600/5'
                  } opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          component.status === 'healthy' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' :
                          component.status === 'degraded' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10' :
                          'bg-gradient-to-br from-red-500/20 to-red-600/10'
                        }`}>
                          <Server className={`h-5 w-5 ${
                            component.status === 'healthy' ? 'text-emerald-500' :
                            component.status === 'degraded' ? 'text-amber-500' :
                            'text-red-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{component.component}</p>
                          <p className="text-xs text-muted-foreground">{component.component_th}</p>
                        </div>
                      </div>
                      {getHealthStatusBadge(component.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="font-bold text-emerald-600">{component.uptime}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Latency</p>
                        <p className={`font-bold ${component.latency_ms < 100 ? 'text-emerald-600' : component.latency_ms < 200 ? 'text-amber-600' : 'text-red-600'}`}>
                          {component.latency_ms}ms
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Last Check</p>
                        <p className="font-medium text-xs">
                          {formatTimeAgo(component.last_check)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Sessions Tab */}
          <TabsContent value="sessions" className="animate-blur-in">
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/20">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  ผู้ใช้ที่กำลังออนไลน์ในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-border/50 transition-all animate-slide-up-fade"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                          <User className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.user.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {session.user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            {getDeviceIcon(session.device)}
                            <span>{session.device}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{session.browser}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                            <span>•</span>
                            <span className="font-mono">{session.ip_address}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Last Activity</p>
                          <p className="text-sm">{formatTimeAgo(session.last_activity)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {getSessionStatusBadge(session.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                <LogOut className="h-4 w-4 mr-2" />
                                Force Logout
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
