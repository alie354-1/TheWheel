import React, { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
  className?: string;
};

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = false,
  centered = false,
  className = '',
}) => {
  const maxWidthClass = (() => {
    switch (maxWidth) {
      case 'none': return '';
      case 'full': return 'max-w-full';
      case 'xs': return 'max-w-xs';
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '3xl': return 'max-w-3xl';
      case '4xl': return 'max-w-4xl';
      case '5xl': return 'max-w-5xl';
      case '6xl': return 'max-w-6xl';
      case '7xl': return 'max-w-7xl';
      default: return 'max-w-xl';
    }
  })();

  const paddingClass = padding ? 'px-4 sm:px-6 lg:px-8 py-6' : '';
  const centerClass = centered ? 'mx-auto' : '';
  
  return (
    <div className={`${maxWidthClass} ${paddingClass} ${centerClass} ${className}`}>
      {children}
    </div>
  );
};

export default Container;