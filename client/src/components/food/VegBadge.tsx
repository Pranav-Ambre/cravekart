import React from 'react';

export const VegBadge: React.FC<{ isVeg: boolean; className?: string }> = ({
  isVeg,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded-[4px] p-0.5 ${
        isVeg ? 'border-green-600' : 'border-red-600'
      } ${className}`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      aria-label={isVeg ? 'Vegetarian dish' : 'Non-Vegetarian dish'}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isVeg ? 'bg-green-600' : 'bg-red-600'
        }`}
      />
    </span>
  );
};
