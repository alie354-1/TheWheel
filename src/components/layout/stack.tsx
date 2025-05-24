import React, { ReactNode } from 'react';

type StackProps = {
  children: ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  className?: string;
};

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing = 'md',
  wrap = false,
  justify = 'start',
  align = 'start',
  className = '',
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  
  const spacingClass = (() => {
    const axis = direction === 'row' ? 'x' : 'y';
    switch (spacing) {
      case 'none': return '';
      case 'xs': return `gap-${axis}-1`;
      case 'sm': return `gap-${axis}-2`;
      case 'md': return `gap-${axis}-4`;
      case 'lg': return `gap-${axis}-6`;
      case 'xl': return `gap-${axis}-8`;
      default: return `gap-${axis}-4`;
    }
  })();
  
  const wrapClass = wrap ? 'flex-wrap' : '';
  
  const justifyClass = (() => {
    switch (justify) {
      case 'start': return 'justify-start';
      case 'end': return 'justify-end';
      case 'center': return 'justify-center';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      case 'evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  })();
  
  const alignClass = (() => {
    switch (align) {
      case 'start': return 'items-start';
      case 'end': return 'items-end';
      case 'center': return 'items-center';
      case 'baseline': return 'items-baseline';
      case 'stretch': return 'items-stretch';
      default: return 'items-start';
    }
  })();
  
  return (
    <div className={`flex ${directionClass} ${spacingClass} ${wrapClass} ${justifyClass} ${alignClass} ${className}`}>
      {children}
    </div>
  );
};

export default Stack;