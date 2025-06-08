import { supabase } from '@/lib/supabase';
import { AvailabilitySlot, ExpertAvailability } from '../../availability.service';
import { AvailabilityStrategy, AppointmentRequest } from '../base/AvailabilityStrategy';
import { ManualStrategy } from './ManualStrategy';

/**
 * Google Calendar availability strategy implementation
 * This strategy uses the Google Calendar API to determine availability
 */
export class GoogleCalendarStrategy implements AvailabilityStrategy {
  private manualStrategy: ManualStrategy;

  constructor() {
    // We'll use the manual strategy as a fallback and for some operations
    this.manualStrategy = new ManualStrategy();
  }

  /**
   * Get available slots for an expert for a specific date range
   * @param expertId The expert's ID
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Array of available slots
   */
  async getAvailableSlots(
    expertId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    try {
      // Get the expert's Google Calendar credentials
      const credentials = await this.getExpertGoogleCredentials(expertId);
      if (!credentials) {
        console.warn('No Google Calendar credentials found for expert, falling back to manual strategy');
        return this.manualStrategy.getAvailableSlots(expertId, startDate, endDate);
      }

      // Get the expert's availability settings (working hours)
      const availabilitySettings = await this.manualStrategy.getExpertAvailability(expertId);
      
      // Get the expert's busy times from Google Calendar
      const busyTimes = await this.fetchGoogleCalendarBusyTimes(
        credentials,
        startDate,
        endDate
      );

      // Generate available slots based on working hours and busy times
      return this.calculateAvailableSlots(
        availabilitySettings,
        busyTimes,
        startDate,
        endDate
      );
    } catch (error) {
      console.error('Error in Google Calendar getAvailableSlots:', error);
      // Fallback to manual strategy if Google Calendar API fails
      console.warn('Falling back to manual strategy due to error');
      return this.manualStrategy.getAvailableSlots(expertId, startDate, endDate);
    }
  }

  /**
   * Create an appointment in the expert's calendar
   * @param appointmentDetails The appointment details
   * @returns Whether the appointment was created successfully
   */
  async createAppointment(
    appointmentDetails: AppointmentRequest
  ): Promise<boolean> {
    try {
      // First create the appointment in our database
      const dbResult = await this.manualStrategy.createAppointment(appointmentDetails);
      if (!dbResult) {
        throw new Error('Failed to create appointment in database');
      }

      // Get the expert's Google Calendar credentials
      const credentials = await this.getExpertGoogleCredentials(appointmentDetails.expertId);
      if (!credentials) {
        console.warn('No Google Calendar credentials found for expert, skipping Google Calendar event creation');
        return dbResult;
      }

      // Create the event in Google Calendar
      const eventId = await this.createGoogleCalendarEvent(
        credentials,
        appointmentDetails
      );

      // Update the appointment in our database with the Google Calendar event ID
      if (eventId) {
        await this.updateAppointmentWithEventId(appointmentDetails, eventId);
      }

      return true;
    } catch (error) {
      console.error('Error in Google Calendar createAppointment:', error);
      return false;
    }
  }

  /**
   * Update an existing appointment
   * @param appointmentId The appointment ID
   * @param updates The updates to apply
   * @returns Whether the appointment was updated successfully
   */
  async updateAppointment(
    appointmentId: string,
    updates: Partial<AppointmentRequest>
  ): Promise<boolean> {
    try {
      // First update the appointment in our database
      const dbResult = await this.manualStrategy.updateAppointment(appointmentId, updates);
      if (!dbResult) {
        throw new Error('Failed to update appointment in database');
      }

      // Get the appointment details
      const { data: appointment, error } = await supabase
        .from('expert_sessions')
        .select('expert_id, external_calendar_event_id')
        .eq('id', appointmentId)
        .single();

      if (error || !appointment) {
        console.error('Error fetching appointment:', error);
        return dbResult;
      }

      // If there's no Google Calendar event ID, we're done
      if (!appointment.external_calendar_event_id) {
        return dbResult;
      }

      // Get the expert's Google Calendar credentials
      const credentials = await this.getExpertGoogleCredentials(appointment.expert_id);
      if (!credentials) {
        console.warn('No Google Calendar credentials found for expert, skipping Google Calendar event update');
        return dbResult;
      }

      // Update the event in Google Calendar
      await this.updateGoogleCalendarEvent(
        credentials,
        appointment.external_calendar_event_id,
        updates
      );

      return true;
    } catch (error) {
      console.error('Error in Google Calendar updateAppointment:', error);
      return false;
    }
  }

  /**
   * Cancel an appointment
   * @param appointmentId The appointment ID
   * @returns Whether the appointment was cancelled successfully
   */
  async cancelAppointment(
    appointmentId: string
  ): Promise<boolean> {
    try {
      // First cancel the appointment in our database
      const dbResult = await this.manualStrategy.cancelAppointment(appointmentId);
      if (!dbResult) {
        throw new Error('Failed to cancel appointment in database');
      }

      // Get the appointment details
      const { data: appointment, error } = await supabase
        .from('expert_sessions')
        .select('expert_id, external_calendar_event_id')
        .eq('id', appointmentId)
        .single();

      if (error || !appointment) {
        console.error('Error fetching appointment:', error);
        return dbResult;
      }

      // If there's no Google Calendar event ID, we're done
      if (!appointment.external_calendar_event_id) {
        return dbResult;
      }

      // Get the expert's Google Calendar credentials
      const credentials = await this.getExpertGoogleCredentials(appointment.expert_id);
      if (!credentials) {
        console.warn('No Google Calendar credentials found for expert, skipping Google Calendar event cancellation');
        return dbResult;
      }

      // Cancel the event in Google Calendar
      await this.cancelGoogleCalendarEvent(
        credentials,
        appointment.external_calendar_event_id
      );

      return true;
    } catch (error) {
      console.error('Error in Google Calendar cancelAppointment:', error);
      return false;
    }
  }

  /**
   * Get the expert's Google Calendar credentials
   * @param expertId The expert's ID
   * @returns The Google Calendar credentials or null if not found
   */
  private async getExpertGoogleCredentials(expertId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('google_calendar_credentials')
        .eq('user_id', expertId)
        .single();

      if (error || !data || !data.google_calendar_credentials) {
        console.error('Error fetching Google Calendar credentials:', error);
        return null;
      }

      return data.google_calendar_credentials;
    } catch (error) {
      console.error('Error in getExpertGoogleCredentials:', error);
      return null;
    }
  }

  /**
   * Fetch busy times from Google Calendar
   * @param credentials The Google Calendar credentials
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Array of busy time slots
   */
  private async fetchGoogleCalendarBusyTimes(
    credentials: any,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      // In a real implementation, we would use the Google Calendar API
      // to fetch the busy times for the expert's calendar
      // For now, we'll return an empty array
      
      // TODO: Implement Google Calendar API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Google Calendar API's freebusy endpoint
      // 3. Processing the response to extract busy times

      console.log('Fetching busy times from Google Calendar (mock implementation)');
      return [];
    } catch (error) {
      console.error('Error fetching Google Calendar busy times:', error);
      return [];
    }
  }

  /**
   * Calculate available slots based on working hours and busy times
   * @param availabilitySettings The expert's availability settings
   * @param busyTimes The expert's busy times from Google Calendar
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Array of available slots
   */
  private calculateAvailableSlots(
    availabilitySettings: ExpertAvailability[],
    busyTimes: any[],
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    // For now, we'll use a simplified implementation
    // In a real implementation, we would:
    // 1. Generate slots based on the expert's working hours
    // 2. Remove slots that overlap with busy times from Google Calendar
    
    // Convert busy times to unavailable slots
    const unavailableSlots = busyTimes.map(busyTime => {
      const startDateTime = new Date(busyTime.start);
      const endDateTime = new Date(busyTime.end);
      
      return {
        date: startDateTime.toISOString().split('T')[0],
        start_time: startDateTime.toTimeString().substring(0, 5),
        end_time: endDateTime.toTimeString().substring(0, 5),
        is_available: false
      };
    });

    // Generate available slots based on availability settings
    const availableSlots: AvailabilitySlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const dateString = date.toISOString().split('T')[0];
      
      // Find availability settings for this day of the week
      const dayAvailability = availabilitySettings.filter(
        a => a.day_of_week === dayOfWeek && a.is_available
      );
      
      // Add available slots for this day
      for (const slot of dayAvailability) {
        // Check if this slot overlaps with any busy times
        const isSlotAvailable = !unavailableSlots.some(unavailableSlot => {
          if (unavailableSlot.date !== dateString) return false;
          
          // Check for time overlap
          const slotStart = slot.start_time;
          const slotEnd = slot.end_time;
          const unavailableStart = unavailableSlot.start_time;
          const unavailableEnd = unavailableSlot.end_time;
          
          return (
            (slotStart <= unavailableStart && slotEnd > unavailableStart) ||
            (slotStart >= unavailableStart && slotStart < unavailableEnd)
          );
        });
        
        if (isSlotAvailable) {
          availableSlots.push({
            date: dateString,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: true
          });
        }
      }
    }

    return Promise.resolve(availableSlots);
  }

  /**
   * Create an event in Google Calendar
   * @param credentials The Google Calendar credentials
   * @param appointmentDetails The appointment details
   * @returns The Google Calendar event ID or null if creation failed
   */
  private async createGoogleCalendarEvent(
    credentials: any,
    appointmentDetails: AppointmentRequest
  ): Promise<string | null> {
    try {
      // In a real implementation, we would use the Google Calendar API
      // to create an event in the expert's calendar
      // For now, we'll return a mock event ID
      
      // TODO: Implement Google Calendar API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Google Calendar API's events.insert endpoint
      // 3. Returning the event ID from the response

      console.log('Creating event in Google Calendar (mock implementation)');
      return `google_event_${Date.now()}`;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return null;
    }
  }

  /**
   * Update an event in Google Calendar
   * @param credentials The Google Calendar credentials
   * @param eventId The Google Calendar event ID
   * @param updates The updates to apply
   * @returns Whether the event was updated successfully
   */
  private async updateGoogleCalendarEvent(
    credentials: any,
    eventId: string,
    updates: Partial<AppointmentRequest>
  ): Promise<boolean> {
    try {
      // In a real implementation, we would use the Google Calendar API
      // to update an event in the expert's calendar
      // For now, we'll return true
      
      // TODO: Implement Google Calendar API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Google Calendar API's events.update endpoint
      // 3. Returning whether the update was successful

      console.log('Updating event in Google Calendar (mock implementation)');
      return true;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      return false;
    }
  }

  /**
   * Cancel an event in Google Calendar
   * @param credentials The Google Calendar credentials
   * @param eventId The Google Calendar event ID
   * @returns Whether the event was cancelled successfully
   */
  private async cancelGoogleCalendarEvent(
    credentials: any,
    eventId: string
  ): Promise<boolean> {
    try {
      // In a real implementation, we would use the Google Calendar API
      // to cancel an event in the expert's calendar
      // For now, we'll return true
      
      // TODO: Implement Google Calendar API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Google Calendar API's events.delete endpoint
      // 3. Returning whether the cancellation was successful

      console.log('Cancelling event in Google Calendar (mock implementation)');
      return true;
    } catch (error) {
      console.error('Error cancelling Google Calendar event:', error);
      return false;
    }
  }

  /**
   * Update an appointment with the Google Calendar event ID
   * @param appointmentDetails The appointment details
   * @param eventId The Google Calendar event ID
   * @returns Whether the update was successful
   */
  private async updateAppointmentWithEventId(
    appointmentDetails: AppointmentRequest,
    eventId: string
  ): Promise<boolean> {
    try {
      // Find the appointment in our database
      const { data: appointments, error: fetchError } = await supabase
        .from('expert_sessions')
        .select('id')
        .eq('expert_id', appointmentDetails.expertId)
        .eq('client_id', appointmentDetails.clientId)
        .eq('scheduled_at', appointmentDetails.startTime)
        .eq('status', 'scheduled');

      if (fetchError || !appointments || appointments.length === 0) {
        console.error('Error fetching appointment:', fetchError);
        return false;
      }

      // Update the appointment with the Google Calendar event ID
      const { error: updateError } = await supabase
        .from('expert_sessions')
        .update({ external_calendar_event_id: eventId })
        .eq('id', appointments[0].id);

      if (updateError) {
        console.error('Error updating appointment with event ID:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateAppointmentWithEventId:', error);
      return false;
    }
  }
}
