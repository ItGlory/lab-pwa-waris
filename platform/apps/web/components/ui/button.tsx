import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02] hover:shadow-md hover:shadow-destructive/25',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:border-accent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02]',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]',
        link: 'text-primary underline-offset-4 hover:underline',
        // PWA Brand Buttons
        pwa: 'bg-[var(--pwa-cyan)] text-white hover:bg-[var(--pwa-blue-deep)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/30',
        'pwa-secondary':
          'bg-[var(--pwa-blue)] text-white hover:bg-[var(--pwa-navy)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-blue)]/30',
        // Gradient Variants
        gradient:
          'bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/40 hover:brightness-110',
        'gradient-secondary':
          'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-navy)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-blue-deep)]/40 hover:brightness-110',
        'gradient-destructive':
          'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/40 hover:brightness-110',
        'gradient-success':
          'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/40 hover:brightness-110',
        // Glow Effect Variants
        glow: 'bg-[var(--pwa-cyan)] text-white hover:scale-[1.02] shadow-md shadow-[var(--pwa-cyan)]/50 hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/60 animate-breathing-glow',
        'glow-secondary':
          'bg-[var(--pwa-blue-deep)] text-white hover:scale-[1.02] shadow-md shadow-[var(--pwa-blue-deep)]/50 hover:shadow-lg hover:shadow-[var(--pwa-blue-deep)]/60 animate-breathing-glow',
        // Glassmorphic Variants
        glass:
          'backdrop-blur-sm bg-background/80 border border-border/50 text-foreground hover:bg-background/90 hover:scale-[1.02] hover:shadow-lg hover:border-[var(--pwa-cyan)]/30',
        'glass-pwa':
          'backdrop-blur-sm bg-[var(--pwa-cyan)]/20 border border-[var(--pwa-cyan)]/30 text-[var(--pwa-cyan)] hover:bg-[var(--pwa-cyan)]/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/20',
        'glass-dark':
          'backdrop-blur-sm bg-[var(--pwa-navy)]/40 border border-[var(--pwa-blue)]/30 text-white hover:bg-[var(--pwa-navy)]/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-blue)]/20',
        // Shine Effect Variant (with shimmer animation)
        shine:
          'bg-[var(--pwa-cyan)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/30 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
