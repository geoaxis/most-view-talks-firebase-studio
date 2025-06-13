"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  starClassName?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  className,
  starClassName,
}) => {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground fill-muted",
            starClassName
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{`${rating} out of ${maxRating} stars`}</span>
    </div>
  );
};

export default StarRating;
