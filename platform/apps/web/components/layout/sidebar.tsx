'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Bell,
  MessageSquare,
  FileText,
  FolderOpen,
  Settings,
  ChevronRight,
  ChevronDown,
  Droplets,
  Upload,
  Brain,
  Gauge,
  Shield,
  BarChart3,
  Cpu,
  Cog,
  Users,
  BookOpen,
  GraduationCap,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  label: string;
  labelEn: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'ภาพรวม',
    labelEn: 'Overview',
    icon: BarChart3,
    defaultOpen: true,
    items: [
      {
        label: 'แดชบอร์ด',
        labelEn: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        label: 'การแจ้งเตือน',
        labelEn: 'Alerts',
        href: '/alerts',
        icon: Bell,
      },
    ],
  },
  {
    id: 'water-loss',
    label: 'การจัดการน้ำสูญเสีย',
    labelEn: 'Water Loss',
    icon: Droplets,
    defaultOpen: true,
    items: [
      {
        label: 'พื้นที่ DMA',
        labelEn: 'DMA Areas',
        href: '/dma',
        icon: MapPin,
      },
      {
        label: 'รายงาน',
        labelEn: 'Reports',
        href: '/reports',
        icon: FileText,
      },
      {
        label: 'เอกสาร',
        labelEn: 'Documents',
        href: '/documents',
        icon: FolderOpen,
      },
    ],
  },
  {
    id: 'ai-analytics',
    label: 'AI & Analytics',
    labelEn: 'AI & Analytics',
    icon: Cpu,
    defaultOpen: true,
    items: [
      {
        label: 'ถามตอบ AI',
        labelEn: 'AI Chat',
        href: '/chat',
        icon: MessageSquare,
      },
      {
        label: 'AI Insights',
        labelEn: 'AI Insights',
        href: '/ai-insights',
        icon: Brain,
      },
      {
        label: 'ประเมินโมเดล',
        labelEn: 'Model Evaluation',
        href: '/model-evaluation',
        icon: Gauge,
      },
    ],
  },
  {
    id: 'system',
    label: 'ระบบ',
    labelEn: 'System',
    icon: Cog,
    defaultOpen: false,
    items: [
      {
        label: 'นำเข้าข้อมูล',
        labelEn: 'Data Import',
        href: '/data-import',
        icon: Upload,
      },
      {
        label: 'System Audit',
        labelEn: 'System Audit',
        href: '/admin/audit',
        icon: Shield,
      },
      {
        label: 'ตั้งค่า',
        labelEn: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
  {
    id: 'admin',
    label: 'ผู้ดูแลระบบ',
    labelEn: 'Administration',
    icon: Shield,
    defaultOpen: false,
    items: [
      {
        label: 'จัดการผู้ใช้',
        labelEn: 'User Management',
        href: '/admin/users',
        icon: Users,
      },
      {
        label: 'ฐานความรู้',
        labelEn: 'Knowledge Base',
        href: '/admin/knowledge-base',
        icon: BookOpen,
      },
      {
        label: 'ฝึกสอนโมเดล',
        labelEn: 'Model Training',
        href: '/admin/training',
        icon: GraduationCap,
      },
      {
        label: 'ทดสอบ POC',
        labelEn: 'POC Test',
        href: '/admin/poc-test',
        icon: FlaskConical,
      },
    ],
  },
];

// Animated notification badge with glow
function NotificationBadge({ count, pulse }: { count: number; pulse?: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'relative grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold leading-none text-white',
        'bg-gradient-to-r from-red-500 to-rose-500',
        'shadow-lg shadow-red-500/40',
        'ring-1 ring-red-400/30',
        pulse && 'notification-pulse animate-pulse'
      )}
    >
      {/* Glow effect */}
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
      )}
      <span className="relative">{count > 99 ? '99+' : count}</span>
    </span>
  );
}

// NavItem component for rendering individual navigation items
function NavItemLink({
  item,
  isActive,
  collapsed,
  onNavigate,
  hasNotification,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  hasNotification: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl py-2',
        collapsed ? 'justify-center px-3' : 'px-3 pl-10',
        'text-white/70 transition-all duration-300',
        'hover:bg-white/10 hover:text-white',
        'press-effect touch-target',
        isActive && [
          'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-cyan)]/20',
          'text-white font-medium',
          'shadow-lg shadow-[var(--pwa-cyan)]/20',
          'ring-1 ring-[var(--pwa-cyan)]/30',
        ]
      )}
    >
      {/* Active indicator with glow */}
      {isActive && (
        <>
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--pwa-cyan)] to-[var(--pwa-cyan-light)] shadow-lg shadow-[var(--pwa-cyan)]/50" />
          <span className="absolute inset-0 rounded-xl bg-[var(--pwa-cyan)]/5 opacity-50" />
        </>
      )}

      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-all duration-300',
          'group-hover:scale-110',
          isActive && 'text-[var(--pwa-cyan-light)] drop-shadow-sm'
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-sm">{item.label}</span>
          <NotificationBadge count={item.badge ?? 0} pulse={hasNotification} />
        </>
      )}

      {/* Collapsed badge indicator with glow */}
      {collapsed && hasNotification && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--pwa-navy)] shadow-lg shadow-red-500/50 animate-pulse" />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex items-center gap-2 font-medium"
        >
          {item.label}
          <NotificationBadge count={item.badge ?? 0} />
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// NavGroup component for rendering collapsible groups
function NavGroupSection({
  group,
  collapsed,
  pathname,
  onNavigate,
  alertCount,
}: {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
  alertCount: number;
}) {
  const GroupIcon = group.icon;

  // Check if any item in group is active
  const hasActiveItem = group.items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(item.href))
  );

  // Calculate group badge (sum of all item badges)
  const groupBadge = group.items.reduce((sum, item) => {
    if (item.href === '/alerts') return sum + alertCount;
    return sum + (item.badge ?? 0);
  }, 0);

  // Use defaultOpen only for initial state to prevent hydration mismatch
  // hasActiveItem will be handled by useEffect after hydration
  const [isOpen, setIsOpen] = React.useState(group.defaultOpen ?? false);

  // Auto-expand when an item becomes active (runs after hydration)
  React.useEffect(() => {
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }, [hasActiveItem]);

  // Items with badges applied
  const itemsWithBadge = group.items.map((item) =>
    item.href === '/alerts' ? { ...item, badge: alertCount } : item
  );

  // Collapsed view - show only group icon with tooltip containing all items
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'group relative flex w-full items-center justify-center rounded-xl p-3',
              'text-white/70 transition-all duration-300',
              'hover:bg-white/10 hover:text-white',
              hasActiveItem && [
                'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-cyan)]/20',
                'text-white',
                'ring-1 ring-[var(--pwa-cyan)]/30',
              ]
            )}
          >
            <GroupIcon className="h-5 w-5" />
            {groupBadge > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--pwa-navy)] shadow-lg shadow-red-500/50 animate-pulse" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-0">
          <div className="flex flex-col py-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
              {group.label}
            </div>
            {itemsWithBadge.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent',
                    isActive && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {(item.badge ?? 0) > 0 && (
                    <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded view - collapsible group with items
  // Use stable ID to prevent hydration mismatch
  const contentId = `nav-group-${group.id}-content`;
  const triggerId = `nav-group-${group.id}-trigger`;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          id={triggerId}
          aria-controls={contentId}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
            'text-white/60 transition-all duration-300',
            'hover:bg-white/5 hover:text-white/80',
            hasActiveItem && 'text-white/90'
          )}
        >
          <GroupIcon className="h-4 w-4" />
          <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
            {group.label}
          </span>
          {groupBadge > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500/20 px-1.5 text-[10px] font-bold text-red-400">
              {groupBadge > 99 ? '99+' : groupBadge}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90'
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="flex flex-col gap-0.5 pb-2">
          {itemsWithBadge.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const hasNotification = (item.badge ?? 0) > 0;

            return (
              <NavItemLink
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={collapsed}
                onNavigate={onNavigate}
                hasNotification={hasNotification}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  alertCount?: number;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
  alertCount = 0,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col',
        'bg-gradient-to-b from-[var(--pwa-navy)] via-[#0a2447] to-[#061830]',
        'border-r border-white/5 text-white',
        'transition-all duration-300 ease-in-out',
        'backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[var(--pwa-cyan)]/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-10 h-32 w-32 rounded-full bg-[var(--pwa-blue-deep)]/15 blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-20 -left-10 h-24 w-24 rounded-full bg-[var(--pwa-cyan-light)]/10 blur-2xl animate-float" style={{ animationDelay: '6s' }} />
      </div>

      {/* Logo */}
      <div
        className={cn(
          'relative flex h-16 items-center border-b border-white/10 px-4',
          collapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div
            className={cn(
              'relative flex items-center justify-center rounded-xl',
              'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]',
              'shadow-lg shadow-[var(--pwa-cyan)]/30',
              'transition-all duration-500 group-hover:shadow-[var(--pwa-cyan)]/50 group-hover:scale-110 group-hover:rotate-3',
              'ring-1 ring-white/20',
              'h-10 w-10'
            )}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Droplets className="relative h-5 w-5 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left animate-fade-in">
              <span className="text-lg font-bold tracking-tight text-[var(--pwa-cyan-light)] drop-shadow-sm">
                WARIS
              </span>
              <span className="text-[10px] font-medium text-white/50">
                Water Loss Analytics
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <ScrollArea className="relative flex-1 px-2 py-4">
        <nav className="relative flex flex-col gap-2">
          {navGroups.map((group) => (
            <NavGroupSection
              key={group.id}
              group={group}
              collapsed={collapsed}
              pathname={pathname}
              onNavigate={onNavigate}
              alertCount={alertCount}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Gradient separator */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Collapse Toggle */}
      <div className="relative p-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'w-full text-white/70 transition-all duration-300',
            'hover:bg-white/10 hover:text-white',
            'ring-1 ring-white/5 hover:ring-white/20',
            'rounded-xl'
          )}
          onClick={() => onCollapse?.(!collapsed)}
        >
          <div
            className={cn(
              'transition-transform duration-500 ease-out',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        </Button>
      </div>

      {/* Version info with subtle glow */}
      {!collapsed && (
        <div className="relative border-t border-white/5 px-4 py-2">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/20 to-transparent" />
          <p className="text-[10px] text-white/30 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            v1.0.0 - PWA Edition
          </p>
        </div>
      )}
    </aside>
  );
}

// Export navGroups for use in other components (e.g., command palette)
export { navGroups };
export type { NavGroup, NavItem };
