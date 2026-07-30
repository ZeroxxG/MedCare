import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, count, showNumber = true }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 dark:fill-slate-700 text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1">
          {rating ? rating.toFixed(1) : 'New'}
          {count !== undefined && <span className="text-slate-400"> ({count})</span>}
        </span>
      )}
    </div>
  );
};
