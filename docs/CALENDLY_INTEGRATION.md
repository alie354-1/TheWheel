# Calendly Integration for Expert Availability Management

This document outlines the implementation of Calendly integration for the Expert Availability Management system. This integration allows experts to connect their Calendly accounts to manage their availability and appointments.

## Overview

The Calendly integration is part of the pluggable availability engine that powers the Expert Availability Management system. It allows experts to use their existing Calendly schedules to manage their availability, providing a seamless experience for both experts and clients.

## Architecture

The Calendly integration follows the Strategy Pattern, which allows the system to select the appropriate availability management strategy based on the expert's preference. The main components are:

1. **CalendlyPanel**: A React component that allows experts to connect their Calendly account by providing their Calendly event link.
2. **CalendlyStrategy**: A class that implements the AvailabilityStrategy interface, providing methods for getting available slots, creating appointments, updating appointments, and canceling appointments.
3. **AvailabilityService**: The main service that selects the appropriate strategy based on the expert's integration type.

## Database Schema

The Calendly integration uses the following database tables:

- **expert_profiles**: Stores the expert's integration type and Calendly configuration.
  - `integration_type`: Set to 'calendly' when the expert chooses to use Calendly.
  - `calendly_config`: A JSON field that stores the Calendly event link and other configuration details.

- **appointments**: Stores appointments created through the system.
  - `external_calendar_event_id`: Stores the Calendly event ID for appointments created through Calendly.
  - `calendar_type`: Set to 'calendly' for appointments created through Calendly.

## User Flow

1. The expert navigates to the Availability Management page.
2. The expert selects "Connect my Calendly Account" from the integration options.
3. The expert enters their Calendly event link.
4. The system stores the Calendly configuration in the expert's profile.
5. When a client views the expert's availability, the system uses the CalendlyStrategy to fetch available slots from Calendly.
6. When a client books an appointment, the system creates an appointment in Calendly and stores the appointment details in the database.

## Implementation Details

### CalendlyPanel Component

The CalendlyPanel component provides a user interface for experts to connect their Calendly account. It allows experts to:

- Enter their Calendly event link
- Connect their Calendly account
- Disconnect their Calendly account

The component communicates with the backend through Supabase to update the expert's profile with the Calendly configuration.

### CalendlyStrategy Class

The CalendlyStrategy class implements the AvailabilityStrategy interface, providing methods for:

- **getAvailableSlots**: Fetches available slots from Calendly for a specific date range.
- **createAppointment**: Creates an appointment in Calendly and stores the appointment details in the database.
- **updateAppointment**: Updates an existing appointment in Calendly and the database.
- **cancelAppointment**: Cancels an appointment in Calendly and updates the appointment status in the database.

In a production environment, these methods would use the Calendly API to interact with Calendly. For the current implementation, they use mock data to simulate the Calendly API.

### Integration with AvailabilityService

The AvailabilityService uses the Strategy Pattern to select the appropriate availability management strategy based on the expert's integration type. When an expert chooses to use Calendly, the service uses the CalendlyStrategy for all availability-related operations.

## Future Enhancements

1. **Calendly API Integration**: Implement full integration with the Calendly API to fetch real availability data and create/update/cancel appointments.
2. **Webhooks**: Set up webhooks to receive real-time updates from Calendly when appointments are created, updated, or canceled.
3. **OAuth Authentication**: Implement OAuth authentication for a more secure and seamless Calendly integration.
4. **Multiple Event Types**: Allow experts to select from multiple Calendly event types.
5. **Calendar Sync**: Sync appointments between Calendly and the expert's other calendars (Google Calendar, Office 365, etc.).

## Conclusion

The Calendly integration provides a flexible and user-friendly way for experts to manage their availability using their existing Calendly schedules. By following the Strategy Pattern, the system can easily switch between different availability management strategies based on the expert's preference, providing a consistent experience for clients regardless of the expert's chosen integration.
