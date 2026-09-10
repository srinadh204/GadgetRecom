import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ rating, size = 'md', showNumber = false, reviewCount, className = '' }: StarRatingProps) {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes[size]} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-slate-700">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-slate-400"> ({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}
