import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  [
    'flex min-h-[80px] w-full rounded-lg border px-3 py-2',
    'text-base ring-offset-background md:text-sm',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200',
    'resize-none',
  ],
  {
    variants: {
      variant: {
        default:
          'border-input bg-background focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)]',
        glass:
          'backdrop-blur-sm bg-background/80 border-border/50 focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)]/50 focus-visible:bg-background/90 hover:border-border/70',
        'glass-pwa':
          'backdrop-blur-sm bg-[var(--pwa-cyan)]/5 border-[var(--pwa-cyan)]/30 focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)]/60 focus-visible:bg-[var(--pwa-cyan)]/10 hover:border-[var(--pwa-cyan)]/40',
        'glass-dark':
          'backdrop-blur-sm bg-[var(--pwa-navy)]/20 border-[var(--pwa-blue)]/30 text-foreground focus-visible:ring-2 focus-visible:ring-[var(--pwa-blue)] focus-visible:border-[var(--pwa-blue)]/60 hover:border-[var(--pwa-blue)]/40',
        glow: 'border-input bg-background focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:border-[var(--pwa-cyan)] focus-visible:shadow-lg focus-visible:shadow-[var(--pwa-cyan)]/30',
        filled:
          'border-transparent bg-muted focus-visible:ring-2 focus-visible:ring-[var(--pwa-cyan)] focus-visible:bg-background focus-visible:border-[var(--pwa-cyan)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextareaProps
  extends React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
