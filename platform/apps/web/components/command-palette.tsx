'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  MapPin,
  Bell,
  MessageSquare,
  FileText,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  Search,
  Droplets,
  TrendingUp,
  AlertTriangle,
  FileSearch,
  Calculator,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Navigation items
const navigationItems = [
  {
    label: 'แดชบอร์ด',
    labelEn: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    keywords: ['home', 'หน้าหลัก', 'dashboard'],
  },
  {
    label: 'พื้นที่ DMA',
    labelEn: 'DMA Areas',
    href: '/dma',
    icon: MapPin,
    keywords: ['dma', 'area', 'พื้นที่', 'แผนที่'],
  },
  {
    label: 'การแจ้งเตือน',
    labelEn: 'Alerts',
    href: '/alerts',
    icon: Bell,
    keywords: ['alert', 'notification', 'แจ้งเตือน', 'เตือน'],
  },
  {
    label: 'ถามตอบ AI',
    labelEn: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
    keywords: ['ai', 'chat', 'ถาม', 'แชท', 'waris'],
  },
  {
    label: 'รายงาน',
    labelEn: 'Reports',
    href: '/reports',
    icon: FileText,
    keywords: ['report', 'รายงาน', 'สรุป'],
  },
  {
    label: 'เอกสาร',
    labelEn: 'Documents',
    href: '/documents',
    icon: FolderOpen,
    keywords: ['document', 'file', 'เอกสาร', 'ไฟล์'],
  },
  {
    label: 'ตั้งค่า',
    labelEn: 'Settings',
    href: '/settings',
    icon: Settings,
    keywords: ['settings', 'config', 'ตั้งค่า', 'การตั้งค่า'],
  },
];

// Quick actions
const quickActions = [
  {
    label: 'วิเคราะห์น้ำสูญเสีย',
    labelEn: 'Analyze Water Loss',
    action: 'analyze',
    icon: TrendingUp,
    keywords: ['analyze', 'วิเคราะห์', 'water loss', 'น้ำสูญเสีย'],
  },
  {
    label: 'ตรวจสอบ DMA วิกฤต',
    labelEn: 'Check Critical DMA',
    action: 'critical',
    icon: AlertTriangle,
    keywords: ['critical', 'วิกฤต', 'emergency', 'ฉุกเฉิน'],
  },
  {
    label: 'ค้นหาเอกสาร',
    labelEn: 'Search Documents',
    action: 'search-docs',
    icon: FileSearch,
    keywords: ['search', 'ค้นหา', 'document', 'เอกสาร'],
  },
  {
    label: 'คำนวณน้ำสูญเสีย',
    labelEn: 'Calculate Water Loss',
    action: 'calculate',
    icon: Calculator,
    keywords: ['calculate', 'คำนวณ', 'water loss', 'น้ำสูญเสีย'],
  },
];

// Recent DMA searches (mock data)
const recentDMAs = [
  { id: 'DMA-001', name: 'ชลบุรี-01', status: 'critical' },
  { id: 'DMA-015', name: 'เชียงใหม่-03', status: 'warning' },
  { id: 'DMA-042', name: 'สุราษฎร์ธานี-01', status: 'normal' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Handle keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setIsOpen(false);
      command();
    },
    [setIsOpen]
  );

  const handleNavigation = React.useCallback(
    (href: string) => {
      runCommand(() => router.push(href));
    },
    [router, runCommand]
  );

  const handleAction = React.useCallback(
    (action: string) => {
      runCommand(() => {
        switch (action) {
          case 'analyze':
            router.push('/dma?view=analysis');
            break;
          case 'critical':
            router.push('/alerts?status=critical');
            break;
          case 'search-docs':
            router.push('/documents');
            break;
          case 'calculate':
            router.push('/reports?type=water-loss');
            break;
          default:
            break;
        }
      });
    },
    [router, runCommand]
  );

  const handleDMAClick = React.useCallback(
    (dmaId: string) => {
      runCommand(() => router.push(`/dma/${dmaId}`));
    },
    [router, runCommand]
  );

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="ค้นหาคำสั่ง"
      description="ค้นหาหน้า, คำสั่ง, หรือ DMA"
    >
      <CommandInput placeholder="ค้นหา... (พิมพ์ชื่อหน้า, คำสั่ง, หรือ DMA)" />
      <CommandList>
        <CommandEmpty>ไม่พบผลลัพธ์</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="นำทาง">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.labelEn} ${item.keywords.join(' ')}`}
                onSelect={() => handleNavigation(item.href)}
                className="gap-3"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">{item.labelEn}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="การดำเนินการ">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.action}
                value={`${action.label} ${action.labelEn} ${action.keywords.join(' ')}`}
                onSelect={() => handleAction(action.action)}
                className="gap-3"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{action.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Recent DMAs */}
        <CommandGroup heading="DMA ล่าสุด">
          {recentDMAs.map((dma) => (
            <CommandItem
              key={dma.id}
              value={`${dma.id} ${dma.name} dma พื้นที่`}
              onSelect={() => handleDMAClick(dma.id)}
              className="gap-3"
            >
              <Droplets
                className={`h-4 w-4 ${
                  dma.status === 'critical'
                    ? 'text-red-500'
                    : dma.status === 'warning'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                }`}
              />
              <span>{dma.name}</span>
              <span className="text-xs text-slate-400">{dma.id}</span>
              <span
                className={`ml-auto text-[10px] rounded-full px-2 py-0.5 ${
                  dma.status === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : dma.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {dma.status === 'critical'
                  ? 'วิกฤต'
                  : dma.status === 'warning'
                    ? 'เฝ้าระวัง'
                    : 'ปกติ'}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Theme Toggle */}
        <CommandGroup heading="การตั้งค่า">
          <CommandItem
            value="theme dark light โหมดมืด สว่าง ธีม"
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="gap-3"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-slate-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-500" />
            )}
            <span>{theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}</span>
            <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Footer hint */}
      <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium">↑↓</kbd>
            <span>เลือก</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium">↵</kbd>
            <span>เปิด</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium">esc</kbd>
            <span>ปิด</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Search className="h-3 w-3" />
          <span>WARIS Smart Search</span>
        </div>
      </div>
    </CommandDialog>
  );
}
