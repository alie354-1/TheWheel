/**
 * Events Service - Handles core event tracking functionality
 * 
 * This service is responsible for tracking analytics events and storing them in the database.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';

/**
 * Track an analytics event in the system
 * 
 * @param event_name The name of the event to track
 * @param user_id The user ID associated with the event (null for anonymous events)
 * @param company_id The company ID associated with the event (null for user-only events)
 * @param payload Additional data to store with the event
 */
export async function trackEvent(
  event_name: string,
  user_id: string | null,
  company_id: string | null,
  payload: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from("analytics_events")
      .insert([{ event_name, user_id, company_id, payload }]);
    
    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), { 
          context: 'trackEvent', 
          event_name, 
          user_id, 
          company_id,
          source: 'analytics/events.service.ts'
        });
      }
      console.error('Error tracking analytics event:', error);
    }
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), { 
        context: 'trackEvent', 
        event_name, 
        user_id, 
        company_id,
        source: 'analytics/events.service.ts'
      });
    }
    console.error('Failed to track analytics event:', error);
  }
}

/**
 * Fetch analytics events for a company or user
 * 
 * @param companyId The company ID to fetch events for
 * @param userId Optional user ID to filter events
 * @param limit Optional limit on number of events to return
 * @returns Array of analytics events
 */
export async function fetchAnalyticsEvents(companyId?: string, userId?: string, limit = 100): Promise<any[]> {
  try {
    let query = supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), { 
          context: 'fetchAnalyticsEvents', 
          companyId, 
          userId,
          source: 'analytics/events.service.ts'
        });
      }
      console.error('Error fetching analytics events:', error);
      return [];
    }

    return data;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), { 
        context: 'fetchAnalyticsEvents', 
        companyId, 
        userId,
        source: 'analytics/events.service.ts'
      });
    }
    console.error('Failed to fetch analytics events:', error);
    return [];
  }
}