import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'flex h-10 w-full rounded-lg border px-3 py-2',
    'text-base ring-offset-background md:text-sm',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200',
    'touch-target',
  ],
  {
    variants: {
      variant: {
        default:
          'border-input bg-background focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)]',
        // Glassmorphic Variants
        glass:
          'backdrop-blur-sm bg-background/80 border-border/50 focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)]/50 focus-visible:bg-background/90 hover:border-border/70',
        'glass-pwa':
          'backdrop-blur-sm bg-[var(--pwa-cyan)]/5 border-[var(--pwa-cyan)]/30 focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)]/60 focus-visible:bg-[var(--pwa-cyan)]/10 hover:border-[var(--pwa-cyan)]/40',
        'glass-dark':
          'backdrop-blur-sm bg-[var(--pwa-navy)]/20 border-[var(--pwa-blue)]/30 text-foreground focus-visible:ring-2 focus-visible:ring-[var(--pwa-blue)] focus-visible:border-[var(--pwa-blue)]/60 hover:border-[var(--pwa-blue)]/40',
        // Gradient Border (focus state)
        'gradient-border':
          'border-input bg-background focus-visible:ring-0 focus-visible:border-transparent focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-[var(--pwa-cyan)]',
        // Glow Effect Variants
        glow: 'border-input bg-background focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)] focus-visible:shadow-lg focus-visible:shadow-[var(--pwa-cyan)]/30',
        'glow-success':
          'border-input bg-background focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 focus-visible:shadow-lg focus-visible:shadow-emerald-500/30',
        'glow-error':
          'border-destructive bg-background focus-visible:ring-2 focus-visible:ring-destructive focus-visible:border-destructive focus-visible:shadow-lg focus-visible:shadow-destructive/30',
        // Filled Variant
        filled:
          'border-transparent bg-muted focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:bg-background focus-visible:border-[var(--pwa-cyan)]',
        // Underline Variant
        underline:
          'border-0 border-b-2 border-input rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[var(--pwa-cyan)]',
      },
      inputSize: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-2 py-1 text-sm',
        lg: 'h-12 px-4 py-3',
        xl: 'h-14 px-5 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
