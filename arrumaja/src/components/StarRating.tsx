import { Star } from 'lucide-react';
import { classNames } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, maxStars = 5, size = 'sm', interactive = false, onChange }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={classNames(
            interactive && 'cursor-pointer hover:scale-110 transition-transform',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            className={classNames(
              sizeClass,
              i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
