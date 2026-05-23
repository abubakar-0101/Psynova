import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white px-4 py-2 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#E85D60] focus:ring-[#E85D60]',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#E85D60]">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
