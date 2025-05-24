/**
 * Loading Spinner Component
 * 
 * A reusable loading spinner with different sizes and variants.
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'light';
  className?: string;
  text?: string;
}

const variantClasses = {
  primary: 'border-b-primary',
  secondary: 'border-b-secondary',
  light: 'border-b-white',
};

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-b-transparent',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}