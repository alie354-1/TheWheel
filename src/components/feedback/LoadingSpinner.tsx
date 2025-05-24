import React from 'react';

type LoadingSpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  centered?: boolean;
  className?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  centered = false,
  className = '',
}) => {
  const sizeClass = (() => {
    switch (size) {
      case 'xs': return 'loading-xs';
      case 'sm': return 'loading-sm';
      case 'lg': return 'loading-lg';
      case 'xl': return 'loading-xl';
      case 'md':
      default:
        return 'loading-md';
    }
  })();
  
  const centerClass = centered ? 'flex flex-col items-center justify-center' : '';
  
  return (
    <div className={`${centerClass} ${className}`}>
      <div className={`loading loading-spinner ${sizeClass} text-primary`}></div>
      {text && <p className="mt-2 text-sm text-base-content/70">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;