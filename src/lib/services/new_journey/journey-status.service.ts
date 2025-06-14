/**
 * Journey Status Service
 * 
 * This service handles fetching and caching step status configurations from the database.
 * It provides methods to get statuses for different UI components.
 */

import { supabase } from '../../utils/supabaseClient';
import { CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

// Type definitions
export type StepStatusType = 'not_started' | 'active' | 'complete' | 'skipped';

export interface StepStatusConfig {
  id: StepStatusType;
  label: string;
  description: string;
  icon: any; // Lucide icon component
  colorClass: string;
  showInSidePanel: boolean;
  showInMostRecent: boolean;
  showInActive: boolean;
  orderIndex: number;
}

// Icon mapping
const ICON_MAP: Record<string, any> = {
  'CheckCircle': CheckCircle,
  'Clock': Clock,
  'AlertTriangle': AlertTriangle,
  'AlertCircle': AlertCircle
};

/**
 * Journey Status Service
 */
class JourneyStatusService {
  private statusCache: Record<StepStatusType, StepStatusConfig> | null = null;
  private lastFetchTime: number = 0;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Fetch all statuses from the database
   */
  private async fetchStatuses(): Promise<Record<StepStatusType, StepStatusConfig>> {
    try {
      const { data, error } = await supabase
        .from('journey_step_statuses')
        .select('*')
        .order('order_index');

      if (error) {
        console.error('Error fetching journey step statuses:', error);
        return this.getFallbackStatuses();
      }

      // Transform the data into the expected format
      const statuses: Record<StepStatusType, StepStatusConfig> = this.getFallbackStatuses();
      
      data.forEach((status: any) => {
        statuses[status.id as StepStatusType] = {
          id: status.id as StepStatusType,
          label: status.label,
          description: status.description || '',
          icon: ICON_MAP[status.icon] || AlertCircle,
          colorClass: status.color_class,
          showInSidePanel: status.show_in_side_panel,
          showInMostRecent: status.show_in_most_recent,
          showInActive: status.show_in_active,
          orderIndex: status.order_index
        };
      });

      // Update cache
      this.statusCache = statuses;
      this.lastFetchTime = Date.now();
      
      return statuses;
    } catch (error) {
      console.error('Error in fetchStatuses:', error);
      return this.getFallbackStatuses();
    }
  }

  /**
   * Get fallback statuses in case of database error
   */
  private getFallbackStatuses(): Record<StepStatusType, StepStatusConfig> {
    return {
      'not_started': {
        id: 'not_started',
        label: 'Not Started',
        description: 'Step has been added but work has not begun',
        icon: AlertCircle,
        colorClass: 'bg-gray-100 text-gray-800',
        showInSidePanel: true,
        showInMostRecent: false,
        showInActive: true,
        orderIndex: 1
      },
      'active': {
        id: 'active',
        label: 'In Progress',
        description: 'Work is currently being done on this step',
        icon: Clock,
        colorClass: 'bg-blue-100 text-blue-800',
        showInSidePanel: true,
        showInMostRecent: true,
        showInActive: true,
        orderIndex: 2
      },
      'complete': {
        id: 'complete',
        label: 'Completed',
        description: 'All work for this step has been finished',
        icon: CheckCircle,
        colorClass: 'bg-green-100 text-green-800',
        showInSidePanel: false,
        showInMostRecent: false,
        showInActive: false,
        orderIndex: 3
      },
      'skipped': {
        id: 'skipped',
        label: 'Skipped',
        description: 'Step was intentionally skipped',
        icon: AlertTriangle,
        colorClass: 'bg-yellow-100 text-yellow-800',
        showInSidePanel: false,
        showInMostRecent: false,
        showInActive: false,
        orderIndex: 4
      }
    };
  }

  /**
   * Get all statuses
   */
  async getAllStatuses(): Promise<Record<StepStatusType, StepStatusConfig>> {
    // Check if cache is valid
    if (this.statusCache && (Date.now() - this.lastFetchTime < this.cacheTTL)) {
      return this.statusCache;
    }
    
    // Fetch fresh data
    return this.fetchStatuses();
  }

  /**
   * Get status config by ID
   */
  async getStatusConfig(statusId: StepStatusType): Promise<StepStatusConfig> {
    const statuses = await this.getAllStatuses();
    return statuses[statusId] || statuses['not_started'];
  }

  /**
   * Get all statuses that should appear in the side panel
   */
  async getSidePanelStatuses(): Promise<StepStatusType[]> {
    const statuses = await this.getAllStatuses();
    return Object.values(statuses)
      .filter(status => status.showInSidePanel)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(status => status.id);
  }

  /**
   * Get all statuses that should appear in the most recent section
   */
  async getMostRecentStatuses(): Promise<StepStatusType[]> {
    const statuses = await this.getAllStatuses();
    return Object.values(statuses)
      .filter(status => status.showInMostRecent)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(status => status.id);
  }

  /**
   * Get all statuses that should appear in the active steps list
   */
  async getActiveStatuses(): Promise<StepStatusType[]> {
    const statuses = await this.getAllStatuses();
    return Object.values(statuses)
      .filter(status => status.showInActive)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(status => status.id);
  }

  /**
   * Refresh the status cache
   */
  async refreshCache(): Promise<void> {
    await this.fetchStatuses();
  }
}

// Export a singleton instance
export const journeyStatusService = new JourneyStatusService();
