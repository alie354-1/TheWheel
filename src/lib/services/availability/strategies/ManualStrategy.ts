import { supabase } from '@/lib/supabase';
import { AvailabilitySlot, ExpertAvailability } from '../../availability.service';
import { AvailabilityStrategy, AppointmentRequest } from '../base/AvailabilityStrategy';

/**
 * Manual availability strategy implementation
 * This strategy uses the expert_availability table to determine availability
 */
export class ManualStrategy implements AvailabilityStrategy {
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
    // Get the expert's availability settings
    const availabilitySettings = await this.getExpertAvailability(expertId);
    
    // Get the expert's booked sessions in this date range
    const { data: bookedSessions, error } = await supabase
      .from('expert_sessions')
      .select('scheduled_at, duration_minutes')
      .eq('expert_id', expertId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    if (error) {
      console.error('Error fetching booked sessions:', error);
      throw error;
    }

    // Convert booked sessions to unavailable time slots
    const bookedSlots = (bookedSessions || []).map(session => {
      const startDateTime = new Date(session.scheduled_at);
      const endDateTime = new Date(startDateTime.getTime() + session.duration_minutes * 60000);
      
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
        // Check if this slot overlaps with any booked sessions
        const isSlotAvailable = !bookedSlots.some(bookedSlot => {
          if (bookedSlot.date !== dateString) return false;
          
          // Check for time overlap
          const slotStart = slot.start_time;
          const slotEnd = slot.end_time;
          const bookedStart = bookedSlot.start_time;
          const bookedEnd = bookedSlot.end_time;
          
          return (
            (slotStart <= bookedStart && slotEnd > bookedStart) ||
            (slotStart >= bookedStart && slotStart < bookedEnd)
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

    return availableSlots;
  }

  /**
   * Get expert availability for all days of the week
   * @param expertId The expert's ID
   * @returns Array of availability records
   */
  async getExpertAvailability(expertId: string): Promise<ExpertAvailability[]> {
    const { data, error } = await supabase
      .from('expert_availability')
      .select('*')
      .eq('expert_id', expertId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }

    return data || [];
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
      const { data, error } = await supabase
        .from('expert_sessions')
        .insert({
          expert_id: appointmentDetails.expertId,
          client_id: appointmentDetails.clientId,
          client_name: appointmentDetails.clientName,
          client_email: appointmentDetails.clientEmail,
          scheduled_at: appointmentDetails.startTime,
          duration_minutes: appointmentDetails.duration,
          notes: appointmentDetails.notes || '',
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
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
      const updateData: any = {};
      
      if (updates.startTime) updateData.scheduled_at = updates.startTime;
      if (updates.duration) updateData.duration_minutes = updates.duration;
      if (updates.notes) updateData.notes = updates.notes;
      
      const { error } = await supabase
        .from('expert_sessions')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
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
      const { error } = await supabase
        .from('expert_sessions')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelAppointment:', error);
      return false;
    }
  }
}
