import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        sage: 'bg-sage/15 text-sage',
        secondary: 'bg-[var(--subtle)] text-[var(--muted-fg)]',
        outline: 'border border-primary text-primary',
        success: 'bg-[var(--success)]/10 text-[var(--success)]',
        warning: 'bg-[var(--warning)]/10 text-[var(--warning)]',
        destructive: 'bg-[var(--danger)]/10 text-[var(--danger)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
