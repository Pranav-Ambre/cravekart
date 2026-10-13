import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden p-3 shadow-card">
      <Skeleton className="w-full h-44 rounded-xl mb-3" />
      <div className="space-y-2 p-1">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3.5" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    </div>
  );
};

export const FoodCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 flex gap-4 shadow-card">
      <div className="flex-1 space-y-2">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-full h-10" />
      </div>
      <Skeleton className="w-28 h-28 rounded-xl flex-shrink-0" />
    </div>
  );
};
