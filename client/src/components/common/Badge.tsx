import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

  const variants = {
    default: 'bg-gray-100 text-dark-primary',
    primary: 'bg-primary-50 text-primary-600 border border-primary-200',
    success: 'bg-green-50 text-success border border-green-200',
    danger: 'bg-red-50 text-danger border border-red-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    outline: 'border border-border text-dark-secondary bg-transparent',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
