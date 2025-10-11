/**
 * StarRating Component
 * Sistema de calificación con estrellas (1-5)
 */

'use client';

import { useState } from 'react';

export default function StarRating({ 
  rating = 0, 
  onRate, 
  readonly = false,
  size = 'md' 
}) {
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hover || rating);
        
        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRate && onRate(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            className={`${sizes[size]} transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <span 
              className={isFilled ? 'text-emerald-500' : 'text-gray-600'}
            >
              {isFilled ? '★' : '☆'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

