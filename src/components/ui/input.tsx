/**
 * Input Component
 * 
 * A versatile input component for collecting user input.
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input has an error */
  hasError?: boolean;
  /** Message to display when input has an error */
  errorMessage?: string;
  /** The size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to display at the start of the input */
  leftIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  rightIcon?: React.ReactNode;
  /** Label for the input */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Whether the input takes up the full width of its container */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    hasError = false,
    errorMessage,
    size = 'md',
    leftIcon,
    rightIcon,
    label,
    helperText,
    fullWidth = false,
    className = '',
    id,
    ...props
  },
  ref
) => {
  // Generate a unique ID for accessibility if none provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2.5 py-1.5 text-sm';
      case 'md': return 'px-3 py-2 text-base';
      case 'lg': return 'px-4 py-2.5 text-lg';
      default: return 'px-3 py-2 text-base';
    }
  };
  
  // Base classes for the input
  const baseClasses = [
    'block rounded-md border-gray-300 shadow-sm',
    'focus:border-indigo-500 focus:ring-indigo-500',
    hasError ? 'border-red-500 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : '',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    getSizeClasses(),
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={baseClasses}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={errorMessage ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {errorMessage && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
      
      {!errorMessage && helperText && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';