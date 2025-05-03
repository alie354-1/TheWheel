/**
 * Terminology components index file
 * Centralizes export of all terminology-related components
 */

import { TerminologyProvider, useTerminology } from './TerminologyProvider';
import { Term, CapitalizedTerm } from './Term';
import { TerminologyEditor } from './TerminologyEditor';
import { SimpleTerminologyEditor } from './SimpleTerminologyEditor';
import { DynamicText, CapitalizedDynamicText, TitleDynamicText } from './DynamicText';
import { TerminologyShowcase } from './TerminologyShowcase';

export {
  // Context provider and hook
  TerminologyProvider,
  useTerminology,
  
  // Basic UI components
  Term,
  CapitalizedTerm,
  TerminologyEditor,
  SimpleTerminologyEditor,
  
  // Enhanced text components
  DynamicText,
  CapitalizedDynamicText,
  TitleDynamicText,
  
  // Demo/showcase components
  TerminologyShowcase
};
