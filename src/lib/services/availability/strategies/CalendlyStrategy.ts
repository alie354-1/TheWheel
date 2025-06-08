import { supabase } from '@/lib/supabase';
import { AvailabilityStrategy, AppointmentRequest } from '../base/AvailabilityStrategy';
import { AvailabilitySlot, ExpertAvailability } from '../../availability.service';

/**
 * Strategy for managing availability through Calendly
 */
export class CalendlyStrategy implements AvailabilityStrategy {
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
      // Get the expert's Calendly configuration
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('calendly_config')
        .eq('user_id', expertId)
        .single();

      if (error || !data?.calendly_config) {
        console.error('Error fetching Calendly config:', error);
        return [];
      }

      // Parse the Calendly configuration
      let calendlyConfig;
      try {
        calendlyConfig = JSON.parse(data.calendly_config);
      } catch (e) {
        console.error('Error parsing Calendly config:', e);
        return [];
      }

      // In a real implementation, we would:
      // 1. Use the Calendly API to fetch available slots
      // 2. Transform the response into AvailabilitySlot objects
      
      // For now, we'll return a mock implementation with some sample slots
      // This simulates what we would get from the Calendly API
      const mockSlots: AvailabilitySlot[] = [];
      
      // Generate slots for each day in the date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Loop through each day in the range
      for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        // Skip weekends in this mock implementation
        const dayOfWeek = day.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Add morning slots (9 AM - 12 PM)
        for (let hour = 9; hour < 12; hour++) {
          const slotStart = new Date(day);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(slotStart.getHours() + 1);
          
          mockSlots.push({
            date: slotStart.toISOString().split('T')[0],
            start_time: slotStart.toTimeString().substring(0, 5),
            end_time: slotEnd.toTimeString().substring(0, 5),
            is_available: true
          });
        }
        
        // Add afternoon slots (1 PM - 5 PM)
        for (let hour = 13; hour < 17; hour++) {
          const slotStart = new Date(day);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(slotStart.getHours() + 1);
          
          mockSlots.push({
            date: slotStart.toISOString().split('T')[0],
            start_time: slotStart.toTimeString().substring(0, 5),
            end_time: slotEnd.toTimeString().substring(0, 5),
            is_available: true
          });
        }
      }
      
      return mockSlots;
    } catch (error) {
      console.error('Error in CalendlyStrategy.getAvailableSlots:', error);
      return [];
    }
  }

  /**
   * Create an appointment in Calendly
   * @param appointmentDetails The appointment details
   * @returns Whether the appointment was created successfully
   */
  async createAppointment(appointmentDetails: AppointmentRequest): Promise<boolean> {
    try {
      // Get the expert's Calendly configuration
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('calendly_config')
        .eq('user_id', appointmentDetails.expertId)
        .single();

      if (error || !data?.calendly_config) {
        console.error('Error fetching Calendly config:', error);
        return false;
      }

      // Parse the Calendly configuration
      let calendlyConfig;
      try {
        calendlyConfig = JSON.parse(data.calendly_config);
      } catch (e) {
        console.error('Error parsing Calendly config:', e);
        return false;
      }

      // In a real implementation, we would:
      // 1. Use the Calendly API to create an appointment
      // 2. Store the Calendly event ID in our database
      
      // For now, we'll create a record in our appointments table
      // with a mock Calendly event ID
      const mockCalendlyEventId = `calendly-event-${Date.now()}`;
      
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          expert_id: appointmentDetails.expertId,
          client_id: appointmentDetails.clientId,
          start_time: appointmentDetails.startTime,
          end_time: appointmentDetails.endTime,
          title: appointmentDetails.notes || 'Appointment',
          description: appointmentDetails.notes,
          status: 'confirmed',
          external_calendar_event_id: mockCalendlyEventId,
          calendar_type: 'calendly'
        });

      if (insertError) {
        console.error('Error creating appointment:', insertError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in CalendlyStrategy.createAppointment:', error);
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
      // Get the appointment details
      const { data, error } = await supabase
        .from('appointments')
        .select('expert_id, external_calendar_event_id')
        .eq('id', appointmentId)
        .single();

      if (error || !data) {
        console.error('Error fetching appointment:', error);
        return false;
      }

      // Get the expert's Calendly configuration
      const { data: expertData, error: expertError } = await supabase
        .from('expert_profiles')
        .select('calendly_config')
        .eq('user_id', data.expert_id)
        .single();

      if (expertError || !expertData?.calendly_config) {
        console.error('Error fetching Calendly config:', expertError);
        return false;
      }

      // In a real implementation, we would:
      // 1. Use the Calendly API to update the appointment
      // 2. Update our database record
      
      // For now, we'll just update our database record
      const updateData: any = {};
      
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.endTime) updateData.end_time = updates.endTime;
      if (updates.notes) {
        updateData.title = updates.notes;
        updateData.description = updates.notes;
      }
      
      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (updateError) {
        console.error('Error updating appointment:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in CalendlyStrategy.updateAppointment:', error);
      return false;
    }
  }

  /**
   * Cancel an appointment
   * @param appointmentId The appointment ID
   * @returns Whether the appointment was cancelled successfully
   */
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      // Get the appointment details
      const { data, error } = await supabase
        .from('appointments')
        .select('expert_id, external_calendar_event_id')
        .eq('id', appointmentId)
        .single();

      if (error || !data) {
        console.error('Error fetching appointment:', error);
        return false;
      }

      // Get the expert's Calendly configuration
      const { data: expertData, error: expertError } = await supabase
        .from('expert_profiles')
        .select('calendly_config')
        .eq('user_id', data.expert_id)
        .single();

      if (expertError || !expertData?.calendly_config) {
        console.error('Error fetching Calendly config:', expertError);
        return false;
      }

      // In a real implementation, we would:
      // 1. Use the Calendly API to cancel the appointment
      // 2. Update our database record
      
      // For now, we'll just update our database record
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (updateError) {
        console.error('Error cancelling appointment:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in CalendlyStrategy.cancelAppointment:', error);
      return false;
    }
  }

  /**
   * Get expert availability for all days of the week
   * This is a fallback method that returns the same as the ManualStrategy
   * since Calendly doesn't have a concept of weekly availability
   * @param expertId The expert's ID
   * @returns Array of availability records
   */
  async getExpertAvailability(expertId: string): Promise<ExpertAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('expert_availability')
        .select('*')
        .eq('expert_id', expertId);

      if (error) {
        console.error('Error fetching expert availability:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in CalendlyStrategy.getExpertAvailability:', error);
      return [];
    }
  }
}
