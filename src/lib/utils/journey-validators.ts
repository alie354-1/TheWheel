import { ValidationError } from '../errors/journey-errors';
import {
  JourneyStep,
  Tool,
  difficulty_level,
  step_status
} from '../types/journey-unified.types';

/**
 * Validate a step object for creation or update
 */
export function validateStep(step: Partial<JourneyStep>): void {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!step.name) {
    errors.name = 'Step name is required';
  } else if (step.name.length > 100) {
    errors.name = 'Step name must be 100 characters or less';
  }
  
  if (!step.phase_id) {
    errors.phase_id = 'Phase ID is required';
  }
  
  // Difficulty level validation
  if (step.difficulty_level !== undefined) {
    if (![1, 2, 3, 4, 5].includes(step.difficulty_level as difficulty_level)) {
      errors.difficulty_level = 'Difficulty level must be between 1 and 5';
    }
  } else {
    errors.difficulty_level = 'Difficulty level is required';
  }
  
  // Estimated time validation
  if (step.estimated_time_min !== undefined) {
    if (step.estimated_time_min < 0) {
      errors.estimated_time_min = 'Minimum estimated time cannot be negative';
    }
  } else {
    errors.estimated_time_min = 'Minimum estimated time is required';
  }
  
  if (step.estimated_time_max !== undefined) {
    if (step.estimated_time_max < 0) {
      errors.estimated_time_max = 'Maximum estimated time cannot be negative';
    }
    
    if (step.estimated_time_min !== undefined && step.estimated_time_max < step.estimated_time_min) {
      errors.estimated_time_max = 'Maximum estimated time cannot be less than minimum';
    }
  } else {
    errors.estimated_time_max = 'Maximum estimated time is required';
  }
  
  // Throw validation error if any errors exist
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Step validation failed', errors);
  }
}

/**
 * Validate status update
 */
export function validateStepStatus(status: step_status): void {
  const validStatuses: step_status[] = ['not_started', 'in_progress', 'completed', 'skipped'];
  
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid step status', {
      status: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }
}

/**
 * Validate a tool object for creation or update
 */
export function validateTool(tool: Partial<Tool>): void {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!tool.name) {
    errors.name = 'Tool name is required';
  } else if (tool.name.length > 100) {
    errors.name = 'Tool name must be 100 characters or less';
  }
  
  if (!tool.type) {
    errors.type = 'Tool type is required';
  }
  
  // URL validation if provided
  if (tool.url) {
    try {
      new URL(tool.url);
    } catch (err) {
      errors.url = 'Tool URL must be a valid URL';
    }
  }
  
  // Throw validation error if any errors exist
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Tool validation failed', errors);
  }
}

/**
 * Validate a rating value
 */
export function validateRating(rating: number): void {
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new ValidationError('Invalid rating', {
      rating: 'Rating must be an integer between 1 and 5'
    });
  }
}

/**
 * Validate completion percentage
 */
export function validateCompletionPercentage(percentage: number): void {
  if (percentage < 0 || percentage > 100) {
    throw new ValidationError('Invalid completion percentage', {
      completion_percentage: 'Completion percentage must be between 0 and 100'
    });
  }
}
