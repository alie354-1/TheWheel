import React, { ReactNode } from 'react';
import { useTerminology } from './TerminologyProvider';
import { deepGet } from '../../lib/utils/terminology-utils';

interface DynamicTextProps {
  /**
   * Main terminology key path (dot notation)
   */
  keyPath: string;
  
  /**
   * Default value if terminology key is not found
   */
  fallback?: string;
  
  /**
   * Optional template literal using {{placeholders}} that will be replaced with values
   * If not provided, the term value itself will be used as the template
   */
  template?: string;
  
  /**
   * Values to insert into template placeholders
   */
  values?: Record<string, string | number | ReactNode>;
  
  /**
   * CSS class names to apply to the wrapper
   */
  className?: string;
  
  /**
   * HTML element to render (defaults to span)
   */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  
  /**
   * Optional transform function to apply to the result after template processing
   */
  transform?: (value: string) => string;
  
  /**
   * Additional props to pass to the rendered element
   */
  [key: string]: any;
}

/**
 * DynamicText component that displays terminology with template support
 * 
 * @example
 * // Simple usage
 * <DynamicText keyPath="journeyTerms.mainUnit.singular" />
 * 
 * // With template
 * <DynamicText 
 *   template="You have {{count}} {{term}} remaining"
 *   values={{ count: 5, term: <Term keyPath="journeyTerms.stepUnit.plural" /> }}
 * />
 * 
 * // With HTML element type
 * <DynamicText 
 *   keyPath="systemTerms.application.tagline" 
 *   as="h2"
 *   className="text-lg font-bold"
 * />
 */
export const DynamicText: React.FC<DynamicTextProps> = ({
  keyPath,
  fallback = '',
  template,
  values = {},
  className,
  as = 'span',
  transform,
  ...rest
}) => {
  const { terminology, isLoading } = useTerminology();
  
  if (isLoading) {
    const Element = as;
    return <Element className={className} {...rest}>{fallback}</Element>;
  }

  // Get the term from the terminology context
  const term = deepGet(terminology, keyPath, fallback);
  
  // Use either the provided template or the term itself as the template
  const templateToUse = template || String(term);
  
  // Process the template by replacing placeholders
  let result = templateToUse;
  
  if (values && Object.keys(values).length > 0) {
    // Create a regex that matches {{placeholder}}
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    
    // Use React.Fragment to wrap the result with placeholders
    const fragments: ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    // Process each placeholder match
    while ((match = placeholderRegex.exec(templateToUse)) !== null) {
      const [fullMatch, placeholder] = match;
      const placeholderValue = values[placeholder.trim()];
      
      // Add text before the placeholder
      if (match.index > lastIndex) {
        fragments.push(templateToUse.substring(lastIndex, match.index));
      }
      
      // Add the placeholder value with a key for stability
      if (placeholderValue !== undefined) {
        fragments.push(
          <React.Fragment key={`placeholder-${placeholder}-${match.index}`}>
            {placeholderValue}
          </React.Fragment>
        );
      } else {
        // If no value is provided, keep the placeholder as is
        fragments.push(fullMatch);
      }
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add any remaining text after the last placeholder
    if (lastIndex < templateToUse.length) {
      fragments.push(templateToUse.substring(lastIndex));
    }
    
    // If we have React nodes in the result, return as JSX
    if (fragments.length > 1 || typeof fragments[0] !== 'string') {
      const Element = as;
      return <Element className={className} {...rest}>{fragments}</Element>;
    }
    
    // If no placeholders were matched, use the template as is
    result = fragments[0] as string;
  }
  
  // Apply transform if provided and result is a string
  if (transform && typeof result === 'string') {
    result = transform(result);
  }
  
  // Render the result with the specified element type
  const Element = as;
  return <Element className={className} {...rest}>{result}</Element>;
};

type DynamicTextVariantProps = Omit<DynamicTextProps, 'transform'>;

/**
 * Capitalized dynamic text component
 */
export const CapitalizedDynamicText: React.FC<DynamicTextVariantProps> = ({
  keyPath,
  fallback,
  ...rest
}) => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  
  // We must explicitly include keyPath to avoid TypeScript errors
  return (
    <DynamicText
      keyPath={keyPath} 
      fallback={fallback}
      transform={capitalize}
      {...rest}
    />
  );
};

/**
 * Title case dynamic text component
 */
export const TitleDynamicText: React.FC<DynamicTextVariantProps> = ({
  keyPath,
  fallback,
  ...rest
}) => {
  const titleCase = (s: string) => 
    s.split(' ')
     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
     .join(' ');
  
  // We must explicitly include keyPath to avoid TypeScript errors
  return (
    <DynamicText
      keyPath={keyPath} 
      fallback={fallback}
      transform={titleCase}
      {...rest}
    />
  );
};
