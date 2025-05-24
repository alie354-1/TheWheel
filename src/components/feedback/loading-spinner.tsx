/**
 * Loading Spinner Component
 * 
 * A versatile loading spinner with different sizes and colors.
 */

import React from 'react';

export interface LoadingSpinnerProps {
  /** The size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** The color of the spinner */
  color?: 'primary' | 'gray' | 'white' | 'success' | 'warning' | 'danger';
  /** Additional CSS classes */
  className?: string;
  /** Text to display alongside the spinner */
  text?: string;
  /** Center the spinner in its container */
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  centered = false,
}) => {
  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'h-3 w-3';
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-6 w-6';
      case 'lg': return 'h-8 w-8';
      case 'xl': return 'h-12 w-12';
      default: return 'h-6 w-6';
    }
  };

  // Color classes
  const getColorClasses = () => {
    switch (color) {
      case 'primary': return 'text-indigo-600';
      case 'gray': return 'text-gray-600';
      case 'white': return 'text-white';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-indigo-600';
    }
  };

  // Text size based on spinner size
  const getTextSizeClass = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const spinnerClasses = [
    'inline-block animate-spin rounded-full border-current border-solid border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
    getSizeClasses(),
    getColorClasses(),
    'border-2',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'inline-flex items-center',
    centered ? 'justify-center' : '',
    text ? 'gap-2' : '',
  ].filter(Boolean).join(' ');

  const textClasses = [
    getTextSizeClass(),
    getColorClasses()
  ].join(' ');

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      <svg 
        className={spinnerClasses} 
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <span className={textClasses}>{text}</span>}
    </div>
  );
};