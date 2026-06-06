import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 16, showValue = true }: { rating: number; size?: number; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          style={{ width: size, height: size }}
        />
      ))}
      {showValue && <span className="ml-1 text-sm text-gray-500">{rating.toFixed(1)}</span>}
    </div>
  );
}
