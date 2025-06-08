# Office 365 Calendar Integration

This document outlines the implementation of Office 365 Calendar integration for the expert availability management system. This integration allows experts to connect their Office 365 Calendar to automatically sync their availability and manage appointments.

## Overview

The Office 365 Calendar integration is part of our flexible, multi-source appointment scheduler. It allows experts to choose how they want to manage their availability:

1. Manual scheduling (setting specific hours)
2. Google Calendar integration
3. Office 365 Calendar integration

When an expert connects their Office 365 Calendar, the system will:
- Check their calendar for existing events when determining available slots
- Create new events in their calendar when appointments are booked
- Update or cancel events when appointments are modified or cancelled

## Implementation Details

### Database Schema

The integration uses the existing `expert_profiles` table with the following fields:

- `integration_type`: Enum field that can be set to 'manual', 'google_calendar', or 'office365_calendar'
- `office365_calendar_credentials`: JSONB field that stores the OAuth 2.0 credentials for Office 365 Calendar

### Components

1. **Office365CalendarStrategy**: Implements the `AvailabilityStrategy` interface to handle Office 365 Calendar-specific logic for:
   - Getting available slots
   - Creating appointments
   - Updating appointments
   - Cancelling appointments

2. **Office365CalendarPanel**: React component that provides the UI for:
   - Connecting to Office 365 Calendar
   - Disconnecting from Office 365 Calendar
   - Configuring sync settings

3. **SQL Functions**:
   - `connect_office365_calendar`: Updates the expert profile with Office 365 Calendar credentials
   - `disconnect_office365_calendar`: Removes Office 365 Calendar credentials and reverts to manual scheduling

### Authentication Flow

The Office 365 Calendar integration uses OAuth 2.0 for authentication:

1. The expert clicks "Connect Office 365 Calendar" in the UI
2. The system redirects to the Microsoft OAuth consent screen
3. The expert grants permission to access their calendar
4. Microsoft redirects back to our application with an authorization code
5. The system exchanges the code for access and refresh tokens
6. The tokens are securely stored in the database

### Microsoft Graph API Integration

The integration uses the Microsoft Graph API to:

1. **Get Busy Times**: Query the expert's calendar for existing events
   - Endpoint: `https://graph.microsoft.com/v1.0/me/calendar/calendarView`
   - Parameters: `startDateTime`, `endDateTime`

2. **Create Events**: Add new appointments to the expert's calendar
   - Endpoint: `https://graph.microsoft.com/v1.0/me/calendar/events`
   - Method: POST

3. **Update Events**: Modify existing appointments
   - Endpoint: `https://graph.microsoft.com/v1.0/me/calendar/events/{event-id}`
   - Method: PATCH

4. **Cancel Events**: Remove cancelled appointments
   - Endpoint: `https://graph.microsoft.com/v1.0/me/calendar/events/{event-id}`
   - Method: DELETE

## Security Considerations

1. **Token Storage**: OAuth tokens are stored encrypted in the database
2. **Token Refresh**: The system automatically refreshes tokens before they expire
3. **Scope Limitation**: Only the minimum required scopes are requested:
   - `Calendars.Read`: To check availability
   - `Calendars.ReadWrite`: To create/update/delete events

## User Experience

### For Experts

1. Navigate to the Availability Management page
2. Select the "Office 365 Calendar" tab
3. Click "Connect Office 365 Calendar"
4. Grant permissions on the Microsoft consent screen
5. Configure sync settings (buffer time, calendar selection)

### For Clients

The client experience remains the same regardless of the expert's integration choice:
1. View the expert's available slots
2. Select a time slot
3. Book the appointment

## Testing

For testing purposes, the current implementation uses mock data instead of making actual API calls. In a production environment, these mock implementations would be replaced with real API calls to the Microsoft Graph API.

## Future Enhancements

1. **Multiple Calendar Support**: Allow experts to select which calendars to sync
2. **Availability Rules**: Add support for custom availability rules on top of calendar events
3. **Two-way Sync**: Update our system when events are modified in Office 365 Calendar
4. **Calendar Colors**: Use the expert's calendar color coding for different appointment types

## Troubleshooting

Common issues and their solutions:

1. **Connection Failures**: Usually due to invalid client credentials or incorrect redirect URI
2. **Token Expiration**: If tokens aren't refreshed properly, reconnecting the calendar will resolve this
3. **Missing Events**: Check if the correct calendars are selected for sync
4. **Timezone Issues**: Ensure all dates are properly converted to/from UTC

## References

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0)
- [Microsoft OAuth 2.0 Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
