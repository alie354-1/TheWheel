import { AvailabilitySlot } from '../../availability.service';

/**
 * Interface for appointment request
 */
export interface AppointmentRequest {
  expertId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  duration: number; // in minutes
  notes?: string;
}

/**
 * Base interface for all availability strategies
 */
export interface AvailabilityStrategy {
  /**
   * Get available slots for an expert for a specific date range
   * @param expertId The expert's ID
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Array of available slots
   */
  getAvailableSlots(
    expertId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]>;

  /**
   * Create an appointment in the expert's calendar
   * @param appointmentDetails The appointment details
   * @returns Whether the appointment was created successfully
   */
  createAppointment(
    appointmentDetails: AppointmentRequest
  ): Promise<boolean>;

  /**
   * Update an existing appointment
   * @param appointmentId The appointment ID
   * @param updates The updates to apply
   * @returns Whether the appointment was updated successfully
   */
  updateAppointment(
    appointmentId: string,
    updates: Partial<AppointmentRequest>
  ): Promise<boolean>;

  /**
   * Cancel an appointment
   * @param appointmentId The appointment ID
   * @returns Whether the appointment was cancelled successfully
   */
  cancelAppointment(
    appointmentId: string
  ): Promise<boolean>;
}
