import React, { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bordered?: boolean;
  onClick?: () => void;
};

const getShadowClass = (shadow: CardProps['shadow']) => {
  switch (shadow) {
    case 'none': return '';
    case 'sm': return 'shadow-sm';
    case 'lg': return 'shadow-lg';
    case 'xl': return 'shadow-xl';
    case 'md':
    default:
      return 'shadow-md';
  }
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  shadow = 'md',
  bordered = false,
  onClick,
}) => {
  const shadowClass = getShadowClass(shadow);
  const borderClass = bordered ? 'border border-base-300' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-base-100 rounded-lg ${shadowClass} ${borderClass} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-base-200 ${className}`}>
      {children}
    </div>
  );
};

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

type CardFooterProps = {
  children: ReactNode;
  className?: string;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-base-200 ${className}`}>
      {children}
    </div>
  );
};

type CardTitleProps = {
  children: ReactNode;
  className?: string;
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-base-content ${className}`}>
      {children}
    </h3>
  );
};

type CardDescriptionProps = {
  children: ReactNode;
  className?: string;
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-base-content/70 ${className}`}>
      {children}
    </p>
  );
};
