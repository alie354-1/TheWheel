/**
 * Time utility functions
 */

/**
 * Format a time range in a human-readable format
 * 
 * @param minutes - Time in minutes
 * @returns Formatted time string (e.g. "30 minutes", "1-2 hours", "2-3 days")
 */
export function formatTimeRange(minMinutes: number, maxMinutes: number): string {
  // For very short tasks (under 30 minutes)
  if (maxMinutes < 30) {
    return 'less than 30 minutes';
  }
  
  // For tasks under 1 hour
  if (maxMinutes < 60) {
    return `${Math.round(minMinutes / 5) * 5}-${Math.round(maxMinutes / 5) * 5} minutes`;
  }
  
  // For tasks under 24 hours
  if (maxMinutes < 24 * 60) {
    const minHours = Math.round(minMinutes / 60 * 2) / 2; // Round to nearest half hour
    const maxHours = Math.ceil(maxMinutes / 60 * 2) / 2; // Round up to nearest half hour
    
    if (minHours === maxHours) {
      return `about ${minHours} hour${minHours !== 1 ? 's' : ''}`;
    }
    
    return `${minHours}-${maxHours} hours`;
  }
  
  // For longer tasks (in days)
  const minDays = Math.round(minMinutes / (60 * 24) * 2) / 2; // Round to nearest half day
  const maxDays = Math.ceil(maxMinutes / (60 * 24) * 2) / 2; // Round up to nearest half day
  
  if (minDays === maxDays) {
    return `about ${minDays} day${minDays !== 1 ? 's' : ''}`;
  }
  
  return `${minDays}-${maxDays} days`;
}

/**
 * Calculate a human-readable time estimate from min/max minutes
 */
export function calculateTimeEstimate(minMinutes: number, maxMinutes: number): string {
  return formatTimeRange(minMinutes, maxMinutes);
}

/**
 * Get completion time estimate based on estimated times and current progress
 */
export function getCompletionEstimate(
  estimatedMinMinutes: number,
  estimatedMaxMinutes: number,
  progressPercentage: number
): string {
  if (progressPercentage >= 100) {
    return 'Completed';
  }
  
  if (progressPercentage <= 0) {
    return formatTimeRange(estimatedMinMinutes, estimatedMaxMinutes);
  }
  
  // Calculate remaining time based on progress
  const remainingFactor = (100 - progressPercentage) / 100;
  const minRemaining = Math.round(estimatedMinMinutes * remainingFactor);
  const maxRemaining = Math.round(estimatedMaxMinutes * remainingFactor);
  
  return formatTimeRange(minRemaining, maxRemaining);
}

/**
 * Format a date or timestamp
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get relative time from a date (e.g. "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = then.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  if (diffDays < -30) {
    return formatDate(then);
  }
  
  if (diffDays < -1) {
    return `${Math.abs(diffDays)} days ago`;
  }
  
  if (diffDays === -1) {
    return 'yesterday';
  }
  
  if (diffHours < 0) {
    return `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
  }
  
  if (diffMins < 0) {
    return `${Math.abs(diffMins)} minute${Math.abs(diffMins) !== 1 ? 's' : ''} ago`;
  }
  
  if (diffMins === 0) {
    return 'just now';
  }
  
  if (diffMins < 60) {
    return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  }
  
  if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  }
  
  if (diffDays === 1) {
    return 'tomorrow';
  }
  
  if (diffDays < 30) {
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
  
  return formatDate(then);
}
