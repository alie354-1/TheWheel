# Expert Availability Management Implementation

This document outlines the implementation of the Expert Availability Management system, which allows experts to set their weekly availability for sessions with users.

## Overview

The Expert Availability Management system enables:

1. Experts to set their weekly availability by day and time
2. Experts to view and manage their current availability slots
3. The system to use this availability data for session scheduling

## Components

### ExpertAvailabilityManager

The `ExpertAvailabilityManager` component provides a user interface for experts to manage their availability. It includes:

- A form to add new availability slots by day of week, start time, and end time
- A display of current availability slots organized by day
- The ability to remove existing availability slots

The component validates input to prevent overlapping time slots and ensures that end times are after start times.

### Integration with ConnectionDashboard

The `ExpertAvailabilityManager` component is integrated into the `ConnectionDashboard` as a tab, allowing experts to manage their availability alongside other expert-related activities such as:

- Managing connection requests
- Viewing upcoming sessions
- Managing connections with users

## Database Schema

The system uses the `expert_availability` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| expert_id | UUID | Reference to the expert profile |
| day_of_week | SMALLINT | Day of the week (0-6, Sunday-Saturday) |
| start_time | TEXT | Start time (HH:MM, 24-hour format) |
| end_time | TEXT | End time (HH:MM, 24-hour format) |
| is_available | BOOLEAN | Whether the expert is available |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Services

### availability.service.ts

The `availabilityService` provides the following functionality:

- `setExpertAvailability`: Set availability for a specific day and time
- `getExpertAvailability`: Get all availability slots for an expert
- `deleteAvailability`: Remove an availability slot
- `getAvailableSlotsForDateRange`: Get available slots for a specific date range, taking into account existing bookings

## User Flow

1. **Setting Availability**:
   - Expert navigates to the Connection Dashboard
   - Expert selects the "Manage Availability" tab
   - Expert adds availability slots for specific days and times
   - System saves the availability settings

2. **Viewing Availability**:
   - Expert can view their current availability organized by day
   - Expert can remove any availability slots they no longer want

3. **Using Availability for Scheduling**:
   - When users want to schedule a session with an expert, the system uses the expert's availability settings to show available time slots
   - The system prevents double-booking by checking existing sessions

## Implementation Details

### Time Slot Management

- Time slots are stored in 24-hour format (HH:MM) for consistency
- The UI displays times in 12-hour format with AM/PM for user-friendliness
- Time slots are displayed in 15-minute increments for granular scheduling

### Validation

The system includes validation to:
- Ensure end times are after start times
- Prevent overlapping availability slots on the same day
- Validate input before saving to the database

## Future Enhancements

1. **Calendar View**: Add a calendar view for more intuitive availability management
2. **Recurring Availability**: Allow setting recurring availability patterns
3. **Availability Templates**: Enable experts to save and apply availability templates
4. **Time Zone Support**: Add support for different time zones
5. **Availability Exceptions**: Allow experts to mark specific dates as unavailable despite regular availability

## Integration with Session Scheduling

The next phase of implementation will focus on the session scheduling system, which will:

1. Use the expert's availability to show available time slots to users
2. Allow users to book sessions during available times
3. Prevent double-booking by checking existing sessions
4. Send notifications to both users and experts when sessions are scheduled

## Conclusion

The Expert Availability Management system provides a foundation for the session scheduling functionality in the expert connect system. It allows experts to set their availability, which is a critical component for enabling users to book sessions with experts.
