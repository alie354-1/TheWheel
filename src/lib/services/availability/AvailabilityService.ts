import { supabase } from '@/lib/supabase';
import { AvailabilitySlot, ExpertAvailability } from '../availability.service';
import { AvailabilityStrategy, AppointmentRequest } from './base/AvailabilityStrategy';
import { ManualStrategy } from './strategies/ManualStrategy';
import { GoogleCalendarStrategy } from './strategies/GoogleCalendarStrategy';
import { Office365CalendarStrategy } from './strategies/Office365CalendarStrategy';
import { CalendlyStrategy } from './strategies/CalendlyStrategy';

/**
 * Main availability service that uses the strategy pattern
 * to select the appropriate availability strategy based on the expert's integration type
 */
export class AvailabilityService {
  private manualStrategy: ManualStrategy;
  private googleCalendarStrategy: GoogleCalendarStrategy;
  private office365CalendarStrategy: Office365CalendarStrategy;
  private calendlyStrategy: CalendlyStrategy;

  constructor() {
    this.manualStrategy = new ManualStrategy();
    this.googleCalendarStrategy = new GoogleCalendarStrategy();
    this.office365CalendarStrategy = new Office365CalendarStrategy();
    this.calendlyStrategy = new CalendlyStrategy();
  }

  /**
   * Get the appropriate strategy for an expert
   * @param expertId The expert's ID
   * @returns The appropriate availability strategy
   */
  private async getStrategyForExpert(expertId: string): Promise<AvailabilityStrategy> {
    try {
      // Get the expert's integration type
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('integration_type')
        .eq('user_id', expertId)
        .single();

      if (error) {
        console.error('Error fetching expert integration type:', error);
        return this.manualStrategy; // Default to manual strategy
      }

      // Select the appropriate strategy based on the integration type
      switch (data?.integration_type) {
        case 'google_calendar':
          return this.googleCalendarStrategy;
        case 'office365_calendar':
          return this.office365CalendarStrategy;
        case 'calendly':
          return this.calendlyStrategy;
        case 'manual':
        default:
          return this.manualStrategy;
      }
    } catch (error) {
      console.error('Error in getStrategyForExpert:', error);
      return this.manualStrategy; // Default to manual strategy
    }
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
    const strategy = await this.getStrategyForExpert(expertId);
    return strategy.getAvailableSlots(expertId, startDate, endDate);
  }

  /**
   * Create an appointment in the expert's calendar
   * @param appointmentDetails The appointment details
   * @returns Whether the appointment was created successfully
   */
  async createAppointment(
    appointmentDetails: AppointmentRequest
  ): Promise<boolean> {
    const strategy = await this.getStrategyForExpert(appointmentDetails.expertId);
    return strategy.createAppointment(appointmentDetails);
  }

  /**
   * Update an existing appointment
   * @param appointmentId The appointment ID
   * @param updates The updates to apply
   * @returns Whether the appointment was updated successfully
   */
  async updateAppointment(
    appointmentId: string,
    expertId: string,
    updates: Partial<AppointmentRequest>
  ): Promise<boolean> {
    const strategy = await this.getStrategyForExpert(expertId);
    return strategy.updateAppointment(appointmentId, updates);
  }

  /**
   * Cancel an appointment
   * @param appointmentId The appointment ID
   * @param expertId The expert's ID
   * @returns Whether the appointment was cancelled successfully
   */
  async cancelAppointment(
    appointmentId: string,
    expertId: string
  ): Promise<boolean> {
    const strategy = await this.getStrategyForExpert(expertId);
    return strategy.cancelAppointment(appointmentId);
  }

  /**
   * Get expert availability for all days of the week
   * @param expertId The expert's ID
   * @returns Array of availability records
   */
  async getExpertAvailability(expertId: string): Promise<ExpertAvailability[]> {
    // This method is used by both strategies, so we'll use the manual strategy
    return this.manualStrategy.getExpertAvailability(expertId);
  }
}
