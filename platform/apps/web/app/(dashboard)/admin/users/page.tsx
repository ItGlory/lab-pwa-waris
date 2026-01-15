'use client';

import * as React from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'analyst' | 'viewer';
  level: 'hq' | 'regional' | 'branch';
  department: string;
  location: string;
  status: 'active' | 'inactive' | 'pending' | 'locked';
  avatar?: string;
  created_at: string;
  last_login?: string;
  permissions: string[];
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  locked: number;
  by_role: {
    admin: number;
    analyst: number;
    viewer: number;
  };
  by_level: {
    hq: number;
    regional: number;
    branch: number;
  };
}

// Mock data
const mockUsers: User[] = [
  {
    id: 'u-001',
    name: 'สมชาย มั่งมี',
    email: 'somchai@pwa.co.th',
    phone: '02-123-4567',
    role: 'admin',
    level: 'hq',
    department: 'IT Department',
    location: 'สำนักงานใหญ่ กรุงเทพฯ',
    status: 'active',
    created_at: '2025-06-15T08:00:00Z',
    last_login: '2026-01-15T10:45:00Z',
    permissions: ['all'],
  },
  {
    id: 'u-002',
    name: 'สุภาพร วงศ์ไพศาล',
    email: 'supaporn@pwa.co.th',
    phone: '02-234-5678',
    role: 'analyst',
    level: 'hq',
    department: 'Data Analytics',
    location: 'สำนักงานใหญ่ กรุงเทพฯ',
    status: 'active',
    created_at: '2025-07-20T09:00:00Z',
    last_login: '2026-01-15T10:42:00Z',
    permissions: ['view_dma', 'edit_dma', 'view_reports', 'export_data', 'ai_chat'],
  },
  {
    id: 'u-003',
    name: 'ประยุทธ์ ชัยชนะ',
    email: 'prayuth@pwa.co.th',
    phone: '02-345-6789',
    role: 'viewer',
    level: 'regional',
    department: 'Operations',
    location: 'เขต 1 นนทบุรี',
    status: 'active',
    created_at: '2025-08-10T10:00:00Z',
    last_login: '2026-01-15T10:40:00Z',
    permissions: ['view_dma', 'view_reports'],
  },
  {
    id: 'u-004',
    name: 'วิชัย สุขใจ',
    email: 'wichai@pwa.co.th',
    phone: '02-456-7890',
    role: 'analyst',
    level: 'regional',
    department: 'Water Loss Management',
    location: 'เขต 2 สมุทรปราการ',
    status: 'active',
    created_at: '2025-09-05T11:00:00Z',
    last_login: '2026-01-15T10:15:00Z',
    permissions: ['view_dma', 'edit_dma', 'view_reports', 'ai_chat'],
  },
  {
    id: 'u-005',
    name: 'มานี รักดี',
    email: 'manee@pwa.co.th',
    phone: '034-123-456',
    role: 'viewer',
    level: 'branch',
    department: 'Customer Service',
    location: 'สาขานครปฐม',
    status: 'active',
    created_at: '2025-10-01T08:30:00Z',
    last_login: '2026-01-14T16:30:00Z',
    permissions: ['view_dma', 'view_reports'],
  },
  {
    id: 'u-006',
    name: 'สมศักดิ์ ใจดี',
    email: 'somsak@pwa.co.th',
    role: 'viewer',
    level: 'branch',
    department: 'Maintenance',
    location: 'สาขาราชบุรี',
    status: 'inactive',
    created_at: '2025-10-15T09:00:00Z',
    permissions: ['view_dma'],
  },
  {
    id: 'u-007',
    name: 'อนันต์ พิทักษ์',
    email: 'anan@pwa.co.th',
    role: 'analyst',
    level: 'hq',
    department: 'Engineering',
    location: 'สำนักงานใหญ่ กรุงเทพฯ',
    status: 'pending',
    created_at: '2026-01-10T14:00:00Z',
    permissions: [],
  },
  {
    id: 'u-008',
    name: 'พิมพ์ใจ สว่าง',
    email: 'pimjai@pwa.co.th',
    role: 'viewer',
    level: 'regional',
    department: 'Finance',
    location: 'เขต 3 ปทุมธานี',
    status: 'locked',
    created_at: '2025-11-20T10:00:00Z',
    permissions: ['view_reports'],
  },
];

const mockStats: UserStats = {
  total: 8,
  active: 5,
  inactive: 1,
  pending: 1,
  locked: 1,
  by_role: {
    admin: 1,
    analyst: 3,
    viewer: 4,
  },
  by_level: {
    hq: 3,
    regional: 3,
    branch: 2,
  },
};

const roleLabels = {
  admin: { label: 'Admin', label_th: 'ผู้ดูแลระบบ', color: 'from-red-500 to-red-600' },
  analyst: { label: 'Analyst', label_th: 'นักวิเคราะห์', color: 'from-blue-500 to-blue-600' },
  viewer: { label: 'Viewer', label_th: 'ผู้ดู', color: 'from-gray-500 to-gray-600' },
};

const levelLabels = {
  hq: { label: 'HQ', label_th: 'สำนักงานใหญ่', icon: Building2 },
  regional: { label: 'Regional', label_th: 'เขต', icon: MapPin },
  branch: { label: 'Branch', label_th: 'สาขา', icon: MapPin },
};

const permissions = [
  { id: 'view_dma', label: 'ดูข้อมูล DMA', label_en: 'View DMA' },
  { id: 'edit_dma', label: 'แก้ไขข้อมูล DMA', label_en: 'Edit DMA' },
  { id: 'view_reports', label: 'ดูรายงาน', label_en: 'View Reports' },
  { id: 'export_data', label: 'ส่งออกข้อมูล', label_en: 'Export Data' },
  { id: 'ai_chat', label: 'ใช้ AI Chat', label_en: 'AI Chat' },
  { id: 'manage_users', label: 'จัดการผู้ใช้', label_en: 'Manage Users' },
  { id: 'manage_system', label: 'จัดการระบบ', label_en: 'System Admin' },
];

export default function UserManagementPage() {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<User[]>([]);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [levelFilter, setLevelFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const usersPerPage = 10;

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'viewer' as User['role'],
    level: 'branch' as User['level'],
    department: '',
    location: '',
    permissions: [] as string[],
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setStats(mockStats);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesLevel = levelFilter === 'all' || user.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesLevel && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      level: user.level,
      department: user.department,
      location: user.location,
      permissions: user.permissions,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'viewer',
      level: 'branch',
      department: '',
      location: '',
      permissions: ['view_dma', 'view_reports'],
    });
    setIsAddDialogOpen(true);
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'locked':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: User['role']) => {
    const config = roleLabels[role];
    return (
      <Badge className={`bg-gradient-to-r ${config.color} text-white border-0`}>
        {role === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
        {role === 'analyst' && <Shield className="h-3 w-3 mr-1" />}
        {role === 'viewer' && <Eye className="h-3 w-3 mr-1" />}
        {config.label_th}
      </Badge>
    );
  };

  const getLevelBadge = (level: User['level']) => {
    const config = levelLabels[level];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label_th}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'ไม่เคยเข้าใช้';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return formatDate(timestamp);
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                User Management
              </span>
            </h1>
            <p className="text-muted-foreground">
              จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ
            </p>
          </div>
          <Button
            onClick={handleAddUser}
            className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25"
          >
            <UserPlus className="h-4 w-4" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">ผู้ใช้ทั้งหมด</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/10">
                    <UserX className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Locked</p>
                    <p className="text-2xl font-bold text-red-600">{stats.locked}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10">
                    <Lock className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Role & Level Distribution */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ตามบทบาท (Role)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
                    <span className="text-sm">Admin: {stats.by_role.admin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                    <span className="text-sm">Analyst: {stats.by_role.analyst}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
                    <span className="text-sm">Viewer: {stats.by_role.viewer}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ตามระดับ (Level)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">สำนักงานใหญ่: {stats.by_level.hq}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">เขต: {stats.by_level.regional}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">สาขา: {stats.by_level.branch}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="backdrop-blur-sm bg-background/80 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อ, email, แผนก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="บทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกบทบาท</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ระดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกระดับ</SelectItem>
                  <SelectItem value="hq">สำนักงานใหญ่</SelectItem>
                  <SelectItem value="regional">เขต</SelectItem>
                  <SelectItem value="branch">สาขา</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <CardContent className="relative p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-4 font-medium text-sm">ผู้ใช้</th>
                    <th className="text-left p-4 font-medium text-sm">บทบาท / ระดับ</th>
                    <th className="text-left p-4 font-medium text-sm">แผนก / สถานที่</th>
                    <th className="text-left p-4 font-medium text-sm">สถานะ</th>
                    <th className="text-left p-4 font-medium text-sm">เข้าใช้ล่าสุด</th>
                    <th className="text-left p-4 font-medium text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-slide-up-fade"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/20">
                            <span className="text-sm font-bold text-purple-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {getRoleBadge(user.role)}
                          <div className="mt-1">{getLevelBadge(user.level)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">{user.department}</p>
                          <p className="text-xs text-muted-foreground">{user.location}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(user.last_login)}
                        </span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="h-4 w-4 mr-2" />
                              รีเซ็ตรหัสผ่าน
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'locked' ? (
                              <DropdownMenuItem>
                                <Unlock className="h-4 w-4 mr-2" />
                                ปลดล็อค
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" />
                                ล็อคบัญชี
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              ลบผู้ใช้
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
                แสดง {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} จาก {filteredUsers.length} ผู้ใช้
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
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-500" />
                เพิ่มผู้ใช้ใหม่
              </DialogTitle>
              <DialogDescription>
                กรอกข้อมูลผู้ใช้ใหม่และกำหนดสิทธิ์การเข้าถึง
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="สมชาย ใจดี"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="somchai@pwa.co.th"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="02-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">แผนก</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="IT Department"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>บทบาท</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (ผู้ดูแลระบบ)</SelectItem>
                      <SelectItem value="analyst">Analyst (นักวิเคราะห์)</SelectItem>
                      <SelectItem value="viewer">Viewer (ผู้ดู)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ระดับ</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: User['level']) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hq">สำนักงานใหญ่</SelectItem>
                      <SelectItem value="regional">เขต</SelectItem>
                      <SelectItem value="branch">สาขา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">สถานที่</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="กรุงเทพฯ"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>สิทธิ์การเข้าถึง</Label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== perm.id) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600">
                <Save className="h-4 w-4" />
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-500" />
                แก้ไขข้อมูลผู้ใช้
              </DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลและสิทธิ์การเข้าถึงของ {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">เบอร์โทร</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">แผนก</Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>บทบาท</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ระดับ</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: User['level']) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hq">สำนักงานใหญ่</SelectItem>
                      <SelectItem value="regional">เขต</SelectItem>
                      <SelectItem value="branch">สาขา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">สถานที่</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>สิทธิ์การเข้าถึง</Label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== perm.id) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600">
                <Save className="h-4 w-4" />
                บันทึกการแก้ไข
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
