/**
 * Utility functions for working with terminology data
 */

import { 
  TerminologyValue,
  TerminologyMap, 
  ResolvedTerminologyMap,
  TerminologyOverrideBehavior
} from '../types/terminology.types';

/**
 * Deep merges two terminology objects
 */
export function deepMergeTerminology(
  base: TerminologyMap,
  override: TerminologyMap,
  behavior: TerminologyOverrideBehavior = 'replace'
): TerminologyMap {
  if (behavior === 'replace') {
    return { ...base, ...override };
  }

  const result = { ...base };

  for (const key in override) {
    if (Object.prototype.hasOwnProperty.call(override, key)) {
      const overrideValue = override[key];
      const baseValue = base[key];

      if (
        baseValue !== undefined &&
        typeof baseValue === 'object' &&
        !Array.isArray(baseValue) &&
        typeof overrideValue === 'object' &&
        !Array.isArray(overrideValue) &&
        overrideValue !== null
      ) {
        // Recursively merge nested objects
        result[key] = deepMergeTerminology(
          baseValue as TerminologyMap,
          overrideValue as TerminologyMap,
          behavior
        );
      } else {
        // Replace primitive values or arrays
        result[key] = overrideValue;
      }
    }
  }

  return result;
}

/**
 * Flattens a nested terminology object into a flat key-value map
 * @param obj The nested terminology object
 * @param prefix Key prefix for nested properties
 * @param result Accumulator for recursive calls
 * @returns Flattened key-value map
 */
export function flattenTerminology(
  obj: Record<string, any>,
  prefix: string = '',
  result: Record<string, TerminologyValue> = {}
): Record<string, TerminologyValue> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flattenTerminology(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

/**
 * Converts a flat terminology map back to a nested structure
 * @param map Flat terminology map with dot-notation keys
 * @returns Nested terminology structure
 */
export function unflattenTerminology(map: Record<string, TerminologyValue>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const value = map[key];
      const parts = key.split('.');
      
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        current[part] = current[part] || {};
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
    }
  }

  return result;
}

/**
 * Formats a terminology term with the given context
 * @param template The template string with placeholders
 * @param context The context to replace placeholders
 * @returns Formatted string
 */
export function formatTerminology(
  template: string,
  context: Record<string, any> = {}
): string {
  // Replace {{key}} placeholders with context values
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const path = key.trim().split('.');
    let value = context;
    
    for (const segment of path) {
      if (value === undefined || value === null) {
        return match; // Return the original placeholder if path is invalid
      }
      value = value[segment];
    }
    
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Validates if the provided terminology is complete for the required paths
 * @param terminology The terminology object to validate
 * @param requiredPaths Array of dot-notation paths that must exist
 * @returns True if all required paths exist, false otherwise
 */
export function validateTerminologyCompleteness(
  terminology: Record<string, any>,
  requiredPaths: string[]
): boolean {
  const flat = flattenTerminology(terminology);
  
  return requiredPaths.every((path) => {
    return flat[path] !== undefined;
  });
}

/**
 * Get a nested value from an object using dot notation
 * @param obj The object to get the value from
 * @param path The path to the value using dot notation
 * @param defaultValue The default value to return if the path doesn't exist
 */
export function deepGet(
  obj: Record<string, any>, 
  path: string, 
  defaultValue: any = undefined
): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined ? current : defaultValue;
}

/**
 * Apply terminology override with the given behavior
 * @param base Base terminology value
 * @param override Override terminology value
 * @param behavior The override behavior to apply
 */
export function applyTerminologyOverride(
  base: any,
  override: any,
  behavior: TerminologyOverrideBehavior
): any {
  if (behavior === 'replace') {
    return override;
  }
  
  if (behavior === 'merge' && 
      typeof base === 'object' && !Array.isArray(base) && 
      typeof override === 'object' && !Array.isArray(override)) {
    return deepMergeTerminology(base, override, behavior);
  }
  
  return override;
}

/**
 * Creates a default terminology configuration
 */
export function createDefaultTerminology(): ResolvedTerminologyMap {
  return {
    journeyTerms: {
      mainUnit: {
        singular: 'journey',
        plural: 'journeys',
        verb: 'complete',
        possessive: "journey's",
        articleIndefinite: 'a',
        articleDefinite: 'the'
      },
      phaseUnit: {
        singular: 'phase',
        plural: 'phases',
        possessive: "phase's",
        articleIndefinite: 'a',
        articleDefinite: 'the'
      },
      stepUnit: {
        singular: 'step',
        plural: 'steps',
        verb: 'complete',
        possessive: "step's",
        articleIndefinite: 'a',
        articleDefinite: 'the'
      },
      progressTerms: {
        notStarted: 'not started',
        inProgress: 'in progress',
        completed: 'completed',
        skipped: 'skipped',
        notNeeded: 'not needed'
      }
    },
    toolTerms: {
      mainUnit: {
        singular: 'tool',
        plural: 'tools',
        verb: 'use',
        possessive: "tool's",
        articleIndefinite: 'a',
        articleDefinite: 'the'
      },
      evaluationTerms: {
        singular: 'evaluation',
        plural: 'evaluations',
        verb: 'evaluate',
        possessive: "evaluation's",
        articleIndefinite: 'an',
        articleDefinite: 'the'
      }
    },
    systemTerms: {
      application: {
        name: 'The Wheel',
        shortName: 'Wheel',
        tagline: 'Guiding your startup journey'
      },
      actions: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        add: 'Add',
        submit: 'Submit',
        back: 'Back',
        next: 'Next',
        finish: 'Finish'
      }
    }
  };
}

/**
 * Predefined terminology sets for different contexts
 */
export const predefinedTerminologySets: {
  [key: string]: Partial<ResolvedTerminologyMap>;
  businessFormal: Partial<ResolvedTerminologyMap>;
  startupFocused: Partial<ResolvedTerminologyMap>;
  projectManagement: Partial<ResolvedTerminologyMap>;
} = {
  businessFormal: {
    journeyTerms: {
      mainUnit: {
        singular: 'objective',
        plural: 'objectives',
        verb: 'achieve',
        possessive: "objective's"
      },
      stepUnit: {
        singular: 'action item',
        plural: 'action items',
        verb: 'complete',
        possessive: "action item's"
      },
      progressTerms: {
        notStarted: 'not commenced',
        inProgress: 'in progress',
        completed: 'achieved', 
        skipped: 'bypassed',
        notNeeded: 'not applicable'
      }
    },
    toolTerms: {
      mainUnit: {
        singular: 'instrument',
        plural: 'instruments',
        verb: 'utilize'
      }
    }
  },
  startupFocused: {
    journeyTerms: {
      mainUnit: {
        singular: 'challenge',
        plural: 'challenges',
        verb: 'tackle'
      },
      phaseUnit: {
        singular: 'sprint',
        plural: 'sprints'
      },
      progressTerms: {
        notStarted: 'todo',
        inProgress: 'working on it',
        completed: 'done'
      }
    }
  },
  projectManagement: {
    journeyTerms: {
      mainUnit: {
        singular: 'deliverable',
        plural: 'deliverables',
        verb: 'deliver'
      },
      stepUnit: {
        singular: 'task',
        plural: 'tasks'
      },
      progressTerms: {
        notStarted: 'backlog',
        inProgress: 'in progress',
        completed: 'done',
        skipped: 'bypassed',
        notNeeded: 'descoped'
      }
    },
    toolTerms: {
      mainUnit: {
        singular: 'resource',
        plural: 'resources',
        verb: 'allocate'
      }
    }
  }
};
