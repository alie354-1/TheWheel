/**
 * Form Field Component
 * 
 * A component for creating consistent form fields with labels, validation, and error messages.
 */

import React from 'react';

export interface FormFieldProps {
  /** The field's label */
  label: string;
  /** The field's HTML ID (required for accessibility) */
  id: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** The input component */
  children: React.ReactNode;
  /** Additional CSS classes for the field wrapper */
  className?: string;
  /** Additional CSS classes for the label */
  labelClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  required = false,
  error,
  helperText,
  children,
  className = '',
  labelClassName = '',
}) => {
  const fieldClasses = [
    'mb-4',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'block text-sm font-medium text-gray-700 mb-1',
    labelClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses}>
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-description`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};