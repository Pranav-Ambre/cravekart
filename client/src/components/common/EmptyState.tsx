import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-2xl border border-dashed border-gray-300 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h4 className="text-lg font-bold text-dark-primary">{title}</h4>
      <p className="text-sm text-dark-secondary mt-1 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
