import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-105',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:scale-105',
        outline: 'text-foreground hover:scale-105',
        // Status Badges - High contrast as per design docs
        success:
          'border-emerald-500 bg-emerald-500 text-white font-bold dark:border-emerald-600 dark:bg-emerald-600 dark:text-white hover:scale-105',
        warning:
          'border-amber-500 bg-amber-500 text-white font-bold dark:border-amber-600 dark:bg-amber-600 dark:text-white hover:scale-105',
        critical:
          'border-red-500 bg-red-500 text-white font-bold dark:border-red-600 dark:bg-red-600 dark:text-white hover:scale-105',
        info:
          'border-blue-500 bg-blue-500 text-white font-bold dark:border-blue-600 dark:bg-blue-600 dark:text-white hover:scale-105',
        // Alert Severity Badges
        high:
          'border-orange-500 bg-orange-500 text-white font-bold dark:border-orange-600 dark:bg-orange-600 dark:text-white hover:scale-105',
        medium:
          'border-amber-500 bg-amber-500 text-white font-bold dark:border-amber-600 dark:bg-amber-600 dark:text-white hover:scale-105',
        low:
          'border-blue-500 bg-blue-500 text-white font-bold dark:border-blue-600 dark:bg-blue-600 dark:text-white hover:scale-105',
        // PWA Brand Variants
        pwa: 'border-transparent bg-[var(--pwa-cyan)] text-white font-bold hover:scale-105 hover:shadow-md hover:shadow-[var(--pwa-cyan)]/30',
        'pwa-secondary':
          'border-transparent bg-[var(--pwa-blue-deep)] text-white font-bold hover:scale-105 hover:shadow-md hover:shadow-[var(--pwa-blue-deep)]/30',
        // Gradient Variants
        gradient:
          'border-transparent bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white font-bold hover:scale-105 hover:shadow-md hover:shadow-[var(--pwa-cyan)]/30',
        'gradient-success':
          'border-transparent bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:scale-105 hover:shadow-md hover:shadow-emerald-500/30',
        'gradient-warning':
          'border-transparent bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:scale-105 hover:shadow-md hover:shadow-amber-500/30',
        'gradient-critical':
          'border-transparent bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:scale-105 hover:shadow-md hover:shadow-red-500/30',
        // Glow Variants
        glow: 'border-transparent bg-[var(--pwa-cyan)] text-white font-bold shadow-md shadow-[var(--pwa-cyan)]/50 hover:scale-105 animate-breathing-glow',
        'glow-success':
          'border-transparent bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/50 hover:scale-105 animate-breathing-glow',
        'glow-critical':
          'border-transparent bg-red-500 text-white font-bold shadow-md shadow-red-500/50 hover:scale-105 animate-breathing-glow',
        // Glassmorphic Variants
        glass:
          'backdrop-blur-sm bg-background/80 border-border/50 text-foreground hover:bg-background/90 hover:scale-105',
        'glass-pwa':
          'backdrop-blur-sm bg-[var(--pwa-cyan)]/20 border-[var(--pwa-cyan)]/30 text-[var(--pwa-cyan)] hover:bg-[var(--pwa-cyan)]/30 hover:scale-105',
        'glass-success':
          'backdrop-blur-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 hover:scale-105',
        'glass-warning':
          'backdrop-blur-sm bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 hover:scale-105',
        'glass-critical':
          'backdrop-blur-sm bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/30 hover:scale-105',
        // Shimmer Variant
        shimmer:
          'border-transparent bg-[var(--pwa-cyan)] text-white font-bold hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-shimmer',
        'shimmer-success':
          'border-transparent bg-emerald-500 text-white font-bold hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-shimmer',
        // Pulse/Dot Variant (for active/live indicators)
        pulse:
          'border-transparent bg-[var(--pwa-cyan)] text-white font-bold pl-4 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:bg-white before:animate-pulse',
        'pulse-live':
          'border-transparent bg-red-500 text-white font-bold pl-4 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:bg-white before:animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
