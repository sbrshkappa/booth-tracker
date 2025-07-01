"use client";
import React from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg", 
    lg: "text-xl"
  };

  const handleStarClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = () => {
    if (!readonly) {
      // Optional: Add hover effects here
    }
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover()}
          disabled={readonly}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${
            star <= rating 
              ? 'text-yellow-400' 
              : 'text-gray-300'
          }`}
        >
          {star <= rating ? '★' : '☆'}
        </button>
      ))}
      {!readonly && (
        <span className="text-xs text-gray-500 ml-2">
          {rating > 0 ? `${rating}/5` : 'Rate this booth'}
        </span>
      )}
    </div>
  );
};

export default StarRating; 