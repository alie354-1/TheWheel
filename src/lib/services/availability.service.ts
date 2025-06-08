import { supabase } from '@/lib/supabase';

/**
 * Interface for expert availability
 */
export interface ExpertAvailability {
  id: string;
  expert_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  start_time: string; // Format: HH:MM (24-hour)
  end_time: string; // Format: HH:MM (24-hour)
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for expert availability slot
 */
export interface AvailabilitySlot {
  date: string; // ISO date string
  start_time: string; // Format: HH:MM (24-hour)
  end_time: string; // Format: HH:MM (24-hour)
  is_available: boolean;
}

/**
 * Service for managing expert availability
 */
export const availabilityService = {
  /**
   * Set expert availability for a specific day of the week
   * @param expertId The expert's ID
   * @param dayOfWeek Day of the week (0 = Sunday, 6 = Saturday)
   * @param startTime Start time (HH:MM)
   * @param endTime End time (HH:MM)
   * @param isAvailable Whether the expert is available during this time
   * @returns The created or updated availability record
   */
  async setExpertAvailability(
    expertId: string,
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
    startTime: string,
    endTime: string,
    isAvailable: boolean = true
  ): Promise<ExpertAvailability | null> {
    // Check if an availability record already exists for this day and time
    const { data: existingAvailability } = await supabase
      .from('expert_availability')
      .select('*')
      .eq('expert_id', expertId)
      .eq('day_of_week', dayOfWeek)
      .eq('start_time', startTime)
      .eq('end_time', endTime)
      .maybeSingle();

    if (existingAvailability) {
      // Update existing availability
      const { data, error } = await supabase
        .from('expert_availability')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAvailability.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating availability:', error);
        throw error;
      }

      return data;
    } else {
      // Create new availability
      const { data, error } = await supabase
        .from('expert_availability')
        .insert({
          expert_id: expertId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating availability:', error);
        throw error;
      }

      return data;
    }
  },

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
  },

  /**
   * Delete an availability record
   * @param availabilityId The availability record ID
   * @returns Whether the deletion was successful
   */
  async deleteAvailability(availabilityId: string): Promise<boolean> {
    const { error } = await supabase
      .from('expert_availability')
      .delete()
      .eq('id', availabilityId);

    if (error) {
      console.error('Error deleting availability:', error);
      throw error;
    }

    return true;
  },

  /**
   * Get available slots for an expert for a specific date range
   * @param expertId The expert's ID
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Array of available slots
   */
  async getAvailableSlotsForDateRange(
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
};
