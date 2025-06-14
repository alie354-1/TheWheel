/**
 * Journey Status Configuration
 * 
 * This file defines all possible step statuses and their display properties.
 * Components should reference this configuration instead of hard-coding status values.
 */

import { CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export type StepStatusType = 'not_started' | 'active' | 'complete' | 'skipped';

export interface StepStatusConfig {
  id: StepStatusType;
  label: string;
  description: string;
  icon: any; // Lucide icon component
  colorClass: string; // Tailwind CSS color classes
  showInSidePanel: boolean;
  showInMostRecent: boolean;
  showInActive: boolean;
}

/**
 * Master configuration for all step statuses
 */
export const STEP_STATUSES: Record<StepStatusType, StepStatusConfig> = {
  'not_started': {
    id: 'not_started',
    label: 'Not Started',
    description: 'Step has been added but work has not begun',
    icon: AlertCircle,
    colorClass: 'bg-gray-100 text-gray-800',
    showInSidePanel: true,
    showInMostRecent: false,
    showInActive: true
  },
  'active': {
    id: 'active',
    label: 'In Progress',
    description: 'Work is currently being done on this step',
    icon: Clock,
    colorClass: 'bg-blue-100 text-blue-800',
    showInSidePanel: true,
    showInMostRecent: true,
    showInActive: true
  },
  'complete': {
    id: 'complete',
    label: 'Completed',
    description: 'All work for this step has been finished',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-800',
    showInSidePanel: false,
    showInMostRecent: false,
    showInActive: false
  },
  'skipped': {
    id: 'skipped',
    label: 'Skipped',
    description: 'Step was intentionally skipped',
    icon: AlertTriangle,
    colorClass: 'bg-yellow-100 text-yellow-800',
    showInSidePanel: false,
    showInMostRecent: false,
    showInActive: false
  }
};

/**
 * Helper functions for working with step statuses
 */

/**
 * Get status config by ID
 */
export const getStatusConfig = (statusId: StepStatusType): StepStatusConfig => {
  return STEP_STATUSES[statusId] || STEP_STATUSES.not_started;
};

/**
 * Get all statuses that should appear in the side panel
 */
export const getSidePanelStatuses = (): StepStatusType[] => {
  return Object.values(STEP_STATUSES)
    .filter(status => status.showInSidePanel)
    .map(status => status.id);
};

/**
 * Get all statuses that should appear in the most recent section
 */
export const getMostRecentStatuses = (): StepStatusType[] => {
  return Object.values(STEP_STATUSES)
    .filter(status => status.showInMostRecent)
    .map(status => status.id);
};

/**
 * Get all statuses that should appear in the active steps list
 */
export const getActiveStatuses = (): StepStatusType[] => {
  return Object.values(STEP_STATUSES)
    .filter(status => status.showInActive)
    .map(status => status.id);
};
