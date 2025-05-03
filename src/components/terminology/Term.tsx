import React from 'react';
import { useTerminology } from './TerminologyProvider';
import { deepGet } from '../../lib/utils/terminology-utils';

interface TermProps {
  /** The terminology key path (dot notation) to display */
  keyPath: string;
  
  /** Default value if terminology key is not found */
  fallback?: string;
  
  /** Optional transform function to apply to the term */
  transform?: (value: string) => string;
  
  /** CSS class names to apply to the wrapper */
  className?: string;
  
  /** Whether to wrap in a span (true) or render just the text (false) */
  asText?: boolean;
}

/**
 * Term component that displays terminology from the context-aware terminology system
 * 
 * @example
 * // Simple usage
 * <Term keyPath="journeyTerms.mainUnit.singular" />
 * 
 * // With fallback
 * <Term keyPath="toolTerms.evaluationTerms.verb" fallback="evaluate" />
 * 
 * // With transform function (capitalize)
 * <Term 
 *   keyPath="journeyTerms.stepUnit.plural" 
 *   transform={(s) => s.charAt(0).toUpperCase() + s.slice(1)} 
 * />
 * 
 * // As inline text without wrapper
 * <p>Complete the <Term keyPath="journeyTerms.stepUnit.singular" /> to proceed.</p>
 */
export const Term: React.FC<TermProps> = ({
  keyPath,
  fallback = '',
  transform,
  className,
  asText = true,
}) => {
  const { terminology, isLoading } = useTerminology();
  
  if (isLoading) {
    return asText ? <span className={className}>{fallback}</span> : <>{fallback}</>;
  }

  // Get the term from the terminology context
  const term = deepGet(terminology, keyPath, fallback);
  
  // Apply transform if provided
  const displayTerm = transform && typeof term === 'string' 
    ? transform(term) 
    : String(term);
  
  // Return either as a span or pure text based on asText prop
  return asText 
    ? <span className={className}>{displayTerm}</span> 
    : <>{displayTerm}</>;
};

/**
 * Capitalized term component
 */
export const CapitalizedTerm: React.FC<Omit<TermProps, 'transform'>> = (props) => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return <Term {...props} transform={capitalize} />;
};
