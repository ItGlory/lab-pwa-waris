'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
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
import { navGroups } from '@/components/layout/sidebar';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Keywords for each navigation item (to enhance search)
const navKeywords: Record<string, string[]> = {
  '/': ['home', 'หน้าหลัก', 'dashboard'],
  '/dma': ['dma', 'area', 'พื้นที่', 'แผนที่'],
  '/alerts': ['alert', 'notification', 'แจ้งเตือน', 'เตือน'],
  '/chat': ['ai', 'chat', 'ถาม', 'แชท', 'waris'],
  '/reports': ['report', 'รายงาน', 'สรุป'],
  '/documents': ['document', 'file', 'เอกสาร', 'ไฟล์'],
  '/settings': ['settings', 'config', 'ตั้งค่า', 'การตั้งค่า'],
  '/data-import': ['import', 'upload', 'นำเข้า', 'อัพโหลด'],
  '/ai-insights': ['ai', 'insights', 'วิเคราะห์', 'ข้อมูลเชิงลึก'],
  '/model-evaluation': ['model', 'evaluation', 'ประเมิน', 'โมเดล'],
  '/admin/audit': ['audit', 'security', 'ตรวจสอบ', 'ความปลอดภัย'],
  '/admin/users': ['user', 'management', 'ผู้ใช้', 'จัดการ', 'admin'],
  '/admin/knowledge-base': ['knowledge', 'base', 'ฐานความรู้', 'เอกสาร', 'ความรู้'],
  '/admin/training': ['train', 'model', 'ฝึก', 'สอน', 'โมเดล', 'learning'],
};

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

        {/* Navigation - Grouped */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <CommandGroup
              key={group.id}
              heading={
                <span className="flex items-center gap-2">
                  <GroupIcon className="h-3.5 w-3.5" />
                  {group.label}
                </span>
              }
            >
              {group.items.map((item) => {
                const Icon = item.icon;
                const keywords = navKeywords[item.href] || [];
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.labelEn} ${keywords.join(' ')}`}
                    onSelect={() => handleNavigation(item.href)}
                    className="gap-3 group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30 transition-all duration-200 group-data-[selected=true]:bg-[var(--pwa-cyan)]/10 group-data-[selected=true]:ring-[var(--pwa-cyan)]/30">
                      <Icon className="h-4 w-4 text-muted-foreground transition-colors group-data-[selected=true]:text-[var(--pwa-cyan)]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground/70">{item.labelEn}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}

        <CommandSeparator className="bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Quick Actions */}
        <CommandGroup heading="การดำเนินการ">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.action}
                value={`${action.label} ${action.labelEn} ${action.keywords.join(' ')}`}
                onSelect={() => handleAction(action.action)}
                className="gap-3 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20 transition-all duration-200 group-data-[selected=true]:bg-amber-500/20 group-data-[selected=true]:ring-amber-500/40">
                  <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator className="bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Recent DMAs */}
        <CommandGroup heading="DMA ล่าสุด">
          {recentDMAs.map((dma) => {
            const statusStyles = {
              critical: {
                bg: 'bg-red-500/10',
                ring: 'ring-red-500/20',
                text: 'text-red-600 dark:text-red-400',
                badge: 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-700 dark:text-red-300 ring-1 ring-red-500/30',
              },
              warning: {
                bg: 'bg-amber-500/10',
                ring: 'ring-amber-500/20',
                text: 'text-amber-600 dark:text-amber-400',
                badge: 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30',
              },
              normal: {
                bg: 'bg-emerald-500/10',
                ring: 'ring-emerald-500/20',
                text: 'text-emerald-600 dark:text-emerald-400',
                badge: 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30',
              },
            };
            const style = statusStyles[dma.status as keyof typeof statusStyles];

            return (
              <CommandItem
                key={dma.id}
                value={`${dma.id} ${dma.name} dma พื้นที่`}
                onSelect={() => handleDMAClick(dma.id)}
                className="gap-3 group"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.bg} ring-1 ${style.ring} transition-all duration-200`}>
                  <Droplets className={`h-4 w-4 ${style.text}`} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{dma.name}</span>
                  <span className="text-xs text-muted-foreground/70">{dma.id}</span>
                </div>
                <span className={`text-[10px] font-semibold rounded-full px-2.5 py-1 ${style.badge}`}>
                  {dma.status === 'critical'
                    ? 'วิกฤต'
                    : dma.status === 'warning'
                      ? 'เฝ้าระวัง'
                      : 'ปกติ'}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator className="bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Theme Toggle */}
        <CommandGroup heading="การตั้งค่า">
          <CommandItem
            value="theme dark light โหมดมืด สว่าง ธีม"
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="gap-3 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20 transition-all duration-200 group-data-[selected=true]:bg-violet-500/20">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-500 transition-transform group-data-[selected=true]:rotate-180 duration-500" />
              ) : (
                <Moon className="h-4 w-4 text-violet-500 transition-transform group-data-[selected=true]:-rotate-12 duration-500" />
              )}
            </div>
            <span className="font-medium">{theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}</span>
            <CommandShortcut className="ml-auto rounded-lg bg-muted/50 px-2 py-0.5 ring-1 ring-border/30">⌘J</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Footer hint with glassmorphism */}
      <div className="relative flex items-center justify-between border-t border-border/50 bg-muted/30 backdrop-blur-sm px-4 py-2.5 text-xs text-muted-foreground">
        {/* Top glow line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/20 to-transparent" />

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-lg bg-background/80 px-2 py-1 text-[10px] font-semibold ring-1 ring-border/50 shadow-sm">↑↓</kbd>
            <span>เลือก</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-lg bg-background/80 px-2 py-1 text-[10px] font-semibold ring-1 ring-border/50 shadow-sm">↵</kbd>
            <span>เปิด</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-lg bg-background/80 px-2 py-1 text-[10px] font-semibold ring-1 ring-border/50 shadow-sm">esc</kbd>
            <span>ปิด</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--pwa-cyan)]">
          <Search className="h-3.5 w-3.5" />
          <span className="font-semibold">WARIS Smart Search</span>
        </div>
      </div>
    </CommandDialog>
  );
}
