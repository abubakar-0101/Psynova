import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  // Prisma's Decimal serializes as a string over JSON, so coerce.
  const value = Number(rating) || 0;
  const sizeClass = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value);
          const partial = !filled && i < value;
          return (
            <Star
              key={i}
              className={cn(
                sizeClass,
                filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200',
                partial ? 'fill-amber-200 text-amber-400' : '',
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-[#1A1A2E] ml-1">
          {value.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-[#6B7280]">({reviewCount})</span>
      )}
    </div>
  );
}
