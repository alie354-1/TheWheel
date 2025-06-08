import { supabase } from '@/lib/supabase';
import { AvailabilitySlot, ExpertAvailability } from '../../availability.service';
import { AvailabilityStrategy, AppointmentRequest } from '../base/AvailabilityStrategy';
import { ManualStrategy } from './ManualStrategy';

/**
 * Office 365 Calendar availability strategy implementation
 * This strategy uses the Microsoft Graph API to determine availability
 */
export class Office365CalendarStrategy implements AvailabilityStrategy {
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
      // Get the expert's Office 365 Calendar credentials
      const credentials = await this.getExpertOffice365Credentials(expertId);
      if (!credentials) {
        console.warn('No Office 365 Calendar credentials found for expert, falling back to manual strategy');
        return this.manualStrategy.getAvailableSlots(expertId, startDate, endDate);
      }

      // Get the expert's availability settings (working hours)
      const availabilitySettings = await this.manualStrategy.getExpertAvailability(expertId);
      
      // Get the expert's busy times from Office 365 Calendar
      const busyTimes = await this.fetchOffice365CalendarBusyTimes(
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
      console.error('Error in Office 365 Calendar getAvailableSlots:', error);
      // Fallback to manual strategy if Office 365 Calendar API fails
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

      // Get the expert's Office 365 Calendar credentials
      const credentials = await this.getExpertOffice365Credentials(appointmentDetails.expertId);
      if (!credentials) {
        console.warn('No Office 365 Calendar credentials found for expert, skipping Office 365 Calendar event creation');
        return dbResult;
      }

      // Create the event in Office 365 Calendar
      const eventId = await this.createOffice365CalendarEvent(
        credentials,
        appointmentDetails
      );

      // Update the appointment in our database with the Office 365 Calendar event ID
      if (eventId) {
        await this.updateAppointmentWithEventId(appointmentDetails, eventId);
      }

      return true;
    } catch (error) {
      console.error('Error in Office 365 Calendar createAppointment:', error);
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

      // If there's no Office 365 Calendar event ID, we're done
      if (!appointment.external_calendar_event_id) {
        return dbResult;
      }

      // Get the expert's Office 365 Calendar credentials
      const credentials = await this.getExpertOffice365Credentials(appointment.expert_id);
      if (!credentials) {
        console.warn('No Office 365 Calendar credentials found for expert, skipping Office 365 Calendar event update');
        return dbResult;
      }

      // Update the event in Office 365 Calendar
      await this.updateOffice365CalendarEvent(
        credentials,
        appointment.external_calendar_event_id,
        updates
      );

      return true;
    } catch (error) {
      console.error('Error in Office 365 Calendar updateAppointment:', error);
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

      // If there's no Office 365 Calendar event ID, we're done
      if (!appointment.external_calendar_event_id) {
        return dbResult;
      }

      // Get the expert's Office 365 Calendar credentials
      const credentials = await this.getExpertOffice365Credentials(appointment.expert_id);
      if (!credentials) {
        console.warn('No Office 365 Calendar credentials found for expert, skipping Office 365 Calendar event cancellation');
        return dbResult;
      }

      // Cancel the event in Office 365 Calendar
      await this.cancelOffice365CalendarEvent(
        credentials,
        appointment.external_calendar_event_id
      );

      return true;
    } catch (error) {
      console.error('Error in Office 365 Calendar cancelAppointment:', error);
      return false;
    }
  }

  /**
   * Get the expert's Office 365 Calendar credentials
   * @param expertId The expert's ID
   * @returns The Office 365 Calendar credentials or null if not found
   */
  private async getExpertOffice365Credentials(expertId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('office365_calendar_credentials')
        .eq('user_id', expertId)
        .single();

      if (error || !data || !data.office365_calendar_credentials) {
        console.error('Error fetching Office 365 Calendar credentials:', error);
        return null;
      }

      return data.office365_calendar_credentials;
    } catch (error) {
      console.error('Error in getExpertOffice365Credentials:', error);
      return null;
    }
  }

  /**
   * Fetch busy times from Office 365 Calendar
   * @param credentials The Office 365 Calendar credentials
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Array of busy time slots
   */
  private async fetchOffice365CalendarBusyTimes(
    credentials: any,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      // In a real implementation, we would use the Microsoft Graph API
      // to fetch the busy times for the expert's calendar
      // For now, we'll return an empty array
      
      // TODO: Implement Microsoft Graph API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Microsoft Graph API's calendar/getSchedule endpoint
      // 3. Processing the response to extract busy times

      console.log('Fetching busy times from Office 365 Calendar (mock implementation)');
      return [];
    } catch (error) {
      console.error('Error fetching Office 365 Calendar busy times:', error);
      return [];
    }
  }

  /**
   * Calculate available slots based on working hours and busy times
   * @param availabilitySettings The expert's availability settings
   * @param busyTimes The expert's busy times from Office 365 Calendar
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
    // 2. Remove slots that overlap with busy times from Office 365 Calendar
    
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
   * Create an event in Office 365 Calendar
   * @param credentials The Office 365 Calendar credentials
   * @param appointmentDetails The appointment details
   * @returns The Office 365 Calendar event ID or null if creation failed
   */
  private async createOffice365CalendarEvent(
    credentials: any,
    appointmentDetails: AppointmentRequest
  ): Promise<string | null> {
    try {
      // In a real implementation, we would use the Microsoft Graph API
      // to create an event in the expert's calendar
      // For now, we'll return a mock event ID
      
      // TODO: Implement Microsoft Graph API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Microsoft Graph API's events endpoint
      // 3. Returning the event ID from the response

      console.log('Creating event in Office 365 Calendar (mock implementation)');
      return `office365_event_${Date.now()}`;
    } catch (error) {
      console.error('Error creating Office 365 Calendar event:', error);
      return null;
    }
  }

  /**
   * Update an event in Office 365 Calendar
   * @param credentials The Office 365 Calendar credentials
   * @param eventId The Office 365 Calendar event ID
   * @param updates The updates to apply
   * @returns Whether the event was updated successfully
   */
  private async updateOffice365CalendarEvent(
    credentials: any,
    eventId: string,
    updates: Partial<AppointmentRequest>
  ): Promise<boolean> {
    try {
      // In a real implementation, we would use the Microsoft Graph API
      // to update an event in the expert's calendar
      // For now, we'll return true
      
      // TODO: Implement Microsoft Graph API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Microsoft Graph API's events endpoint
      // 3. Returning whether the update was successful

      console.log('Updating event in Office 365 Calendar (mock implementation)');
      return true;
    } catch (error) {
      console.error('Error updating Office 365 Calendar event:', error);
      return false;
    }
  }

  /**
   * Cancel an event in Office 365 Calendar
   * @param credentials The Office 365 Calendar credentials
   * @param eventId The Office 365 Calendar event ID
   * @returns Whether the event was cancelled successfully
   */
  private async cancelOffice365CalendarEvent(
    credentials: any,
    eventId: string
  ): Promise<boolean> {
    try {
      // In a real implementation, we would use the Microsoft Graph API
      // to cancel an event in the expert's calendar
      // For now, we'll return true
      
      // TODO: Implement Microsoft Graph API integration
      // This would involve:
      // 1. Refreshing the access token if needed
      // 2. Making a request to the Microsoft Graph API's events endpoint
      // 3. Returning whether the cancellation was successful

      console.log('Cancelling event in Office 365 Calendar (mock implementation)');
      return true;
    } catch (error) {
      console.error('Error cancelling Office 365 Calendar event:', error);
      return false;
    }
  }

  /**
   * Update an appointment with the Office 365 Calendar event ID
   * @param appointmentDetails The appointment details
   * @param eventId The Office 365 Calendar event ID
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

      // Update the appointment with the Office 365 Calendar event ID
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
