# Calendar Integration System Implementation Guide

This document provides a comprehensive overview of the calendar integration system implemented for the Expert Availability Management feature. The system allows experts to manage their availability through multiple calendar sources, providing flexibility and convenience.

## System Architecture

The calendar integration system follows the Strategy Pattern, which allows the application to select the appropriate availability management strategy based on the expert's preference. This pattern provides a flexible and extensible architecture that can easily accommodate new integration types in the future.

### Core Components

1. **AvailabilityStrategy Interface**: Defines the contract that all availability strategies must implement.
2. **AvailabilityService**: The main service that selects the appropriate strategy based on the expert's integration type.
3. **Strategy Implementations**:
   - **ManualStrategy**: For experts who want to set their availability manually.
   - **GoogleCalendarStrategy**: For experts who want to sync with their Google Calendar.
   - **Office365CalendarStrategy**: For experts who want to sync with their Office 365 Calendar.
   - **CalendlyStrategy**: For experts who want to use their Calendly schedule.
4. **UI Components**:
   - **ExpertAvailabilityManager**: The main component that allows experts to manage their availability.
   - **GoogleCalendarPanel**: UI for connecting to Google Calendar.
   - **Office365CalendarPanel**: UI for connecting to Office 365 Calendar.
   - **CalendlyPanel**: UI for connecting to Calendly.

### Database Schema

The system uses the following database tables:

- **expert_profiles**: Stores the expert's integration type and credentials.
  - `integration_type`: The type of integration (manual, google_calendar, office365_calendar, calendly).
  - `google_calendar_credentials`: JSON field for Google Calendar credentials.
  - `office365_calendar_credentials`: JSON field for Office 365 Calendar credentials.
  - `calendly_config`: JSON field for Calendly configuration.

- **expert_availability**: Stores the expert's manual availability settings.
  - `expert_id`: The expert's ID.
  - `day_of_week`: The day of the week (0-6, where 0 is Sunday).
  - `start_time`: The start time of the availability slot.
  - `end_time`: The end time of the availability slot.
  - `is_available`: Whether the expert is available during this time.

- **appointments**: Stores appointments created through the system.
  - `expert_id`: The expert's ID.
  - `client_id`: The client's ID.
  - `start_time`: The start time of the appointment.
  - `end_time`: The end time of the appointment.
  - `status`: The status of the appointment (confirmed, cancelled, etc.).
  - `external_calendar_event_id`: The event ID in the external calendar system.
  - `calendar_type`: The type of calendar (google, office365, calendly).

## Integration Types

### 1. Manual Availability

The manual availability option allows experts to set their availability for each day of the week. This is the simplest integration type and doesn't require any external calendar system.

#### Implementation Details

- **ManualStrategy**: Implements the AvailabilityStrategy interface, providing methods for getting available slots, creating appointments, updating appointments, and canceling appointments.
- **Database**: Uses the expert_availability table to store the expert's availability settings.
- **UI**: The ExpertAvailabilityManager component provides a UI for setting manual availability.

### 2. Google Calendar Integration

The Google Calendar integration allows experts to sync their availability with their Google Calendar. When a client books an appointment, it's automatically added to the expert's Google Calendar.

#### Implementation Details

- **GoogleCalendarStrategy**: Implements the AvailabilityStrategy interface, providing methods for getting available slots, creating appointments, updating appointments, and canceling appointments.
- **OAuth 2.0**: Uses OAuth 2.0 for authentication with the Google Calendar API.
- **Database**: Stores the expert's Google Calendar credentials in the expert_profiles table.
- **UI**: The GoogleCalendarPanel component provides a UI for connecting to Google Calendar.

### 3. Office 365 Calendar Integration

The Office 365 Calendar integration allows experts to sync their availability with their Office 365 Calendar. When a client books an appointment, it's automatically added to the expert's Office 365 Calendar.

#### Implementation Details

- **Office365CalendarStrategy**: Implements the AvailabilityStrategy interface, providing methods for getting available slots, creating appointments, updating appointments, and canceling appointments.
- **OAuth 2.0**: Uses OAuth 2.0 for authentication with the Microsoft Graph API.
- **Database**: Stores the expert's Office 365 Calendar credentials in the expert_profiles table.
- **UI**: The Office365CalendarPanel component provides a UI for connecting to Office 365 Calendar.

### 4. Calendly Integration

The Calendly integration allows experts to use their existing Calendly schedule to manage their availability. When a client books an appointment, it's automatically added to the expert's Calendly schedule.

#### Implementation Details

- **CalendlyStrategy**: Implements the AvailabilityStrategy interface, providing methods for getting available slots, creating appointments, updating appointments, and canceling appointments.
- **Database**: Stores the expert's Calendly configuration in the expert_profiles table.
- **UI**: The CalendlyPanel component provides a UI for connecting to Calendly.

## User Flow

1. The expert navigates to the Availability Management page.
2. The expert selects their preferred integration type (Manual, Google Calendar, Office 365 Calendar, or Calendly).
3. If the expert selects an external calendar system, they are prompted to connect their account.
4. Once connected, the system uses the appropriate strategy to manage the expert's availability.
5. When a client views the expert's availability, the system uses the selected strategy to fetch available slots.
6. When a client books an appointment, the system creates an appointment using the selected strategy.

## Implementation Steps

### 1. Database Setup

Create the necessary database tables and functions:

- expert_profiles table with integration_type and credential fields
- expert_availability table for manual availability settings
- appointments table for storing appointments
- Database functions for connecting and disconnecting from external calendar systems

### 2. Strategy Pattern Implementation

1. Define the AvailabilityStrategy interface with methods for getting available slots, creating appointments, updating appointments, and canceling appointments.
2. Implement the ManualStrategy, GoogleCalendarStrategy, Office365CalendarStrategy, and CalendlyStrategy classes.
3. Create the AvailabilityService class that selects the appropriate strategy based on the expert's integration type.

### 3. UI Components

1. Create the ExpertAvailabilityManager component that allows experts to manage their availability.
2. Create the GoogleCalendarPanel, Office365CalendarPanel, and CalendlyPanel components for connecting to external calendar systems.
3. Integrate these components into the expert's profile or settings page.

### 4. API Integration

1. Implement OAuth 2.0 authentication for Google Calendar and Office 365 Calendar.
2. Implement the necessary API calls to fetch available slots, create appointments, update appointments, and cancel appointments.
3. Handle error cases and edge cases, such as expired tokens or API rate limits.

## Security Considerations

1. **Credential Storage**: Store all credentials securely, preferably encrypted.
2. **OAuth 2.0**: Use OAuth 2.0 for authentication with external calendar systems.
3. **Scope Limitations**: Request only the necessary scopes for each integration.
4. **Token Refresh**: Implement token refresh for OAuth 2.0 integrations.
5. **Error Handling**: Handle authentication errors gracefully.

## Future Enhancements

1. **Additional Calendar Integrations**: Add support for other calendar systems, such as Apple Calendar or Yahoo Calendar.
2. **Webhooks**: Implement webhooks for real-time updates from external calendar systems.
3. **Two-Way Sync**: Implement two-way synchronization between the system and external calendar systems.
4. **Recurring Appointments**: Add support for recurring appointments.
5. **Buffer Times**: Allow experts to set buffer times between appointments.
6. **Availability Templates**: Allow experts to create and apply availability templates.

## Conclusion

The calendar integration system provides a flexible and extensible architecture for managing expert availability. By following the Strategy Pattern, the system can easily accommodate different integration types and provide a consistent experience for both experts and clients. The system is designed to be secure, scalable, and user-friendly, making it a valuable addition to the Expert Availability Management feature.
