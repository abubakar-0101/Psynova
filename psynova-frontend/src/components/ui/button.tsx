import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md',
        // Premium gradient button — indigo → pink. Use on dark backgrounds for primary CTA.
        brand:
          'bg-brand-gradient text-white shadow-[0_8px_30px_-6px_rgba(99,102,241,0.45)] hover:shadow-[0_8px_30px_-4px_rgba(236,72,153,0.5)] hover:brightness-110',
        // Subtle glass button — use on hero/dark surfaces.
        glass:
          'glass text-[var(--fg)] hover:bg-[var(--surface-elevated)]',
        sage: 'bg-sage text-white hover:bg-sage-dark shadow-sm hover:shadow-md',
        outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10',
        ghost: 'text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]',
        destructive: 'bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90',
        secondary: 'bg-[var(--subtle)] text-[var(--fg)] hover:bg-[var(--border-subtle)]',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
