import { AvailabilityService } from './AvailabilityService';
import { AvailabilityStrategy, AppointmentRequest } from './base/AvailabilityStrategy';
import { ManualStrategy } from './strategies/ManualStrategy';
import { GoogleCalendarStrategy } from './strategies/GoogleCalendarStrategy';
import { Office365CalendarStrategy } from './strategies/Office365CalendarStrategy';
import { CalendlyStrategy } from './strategies/CalendlyStrategy';

// Export the main service
export const availabilityService = new AvailabilityService();

// Export types and interfaces
export type { AvailabilityStrategy, AppointmentRequest };

// Export strategies (for testing or direct use if needed)
export { ManualStrategy, GoogleCalendarStrategy, Office365CalendarStrategy, CalendlyStrategy };

// Re-export types from the original availability service
export type { AvailabilitySlot, ExpertAvailability } from '../availability.service';
