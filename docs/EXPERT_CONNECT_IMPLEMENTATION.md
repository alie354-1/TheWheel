# Expert Connect System Implementation

This document outlines the implementation of the Expert Connect system, which allows users to connect with experts, schedule sessions, and manage availability.

## Overview

The Expert Connect system enables:

1. Users to request connections with experts
2. Experts to accept or decline connection requests
3. Scheduling and managing expert sessions
4. Experts to set and manage their availability
5. Users to view expert profiles and availability

## Database Schema

The system uses three main tables:

### expert_connect_requests

Stores connection requests between users and experts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| requester_id | UUID | User requesting the connection |
| expert_id | UUID | Expert being requested |
| message | TEXT | Optional message from the requester |
| expertise_area | TEXT | Area of expertise for the connection |
| status | TEXT | 'pending', 'accepted', or 'declined' |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### expert_sessions

Stores scheduled sessions between users and experts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| connect_request_id | UUID | Reference to the connection request |
| expert_id | UUID | Expert for the session |
| requester_id | UUID | User who requested the session |
| session_title | TEXT | Optional title for the session |
| session_goals | TEXT | Optional goals for the session |
| scheduled_at | TIMESTAMPTZ | When the session is scheduled |
| duration_minutes | INTEGER | Duration in minutes |
| status | TEXT | 'scheduled', 'completed', or 'cancelled' |
| notes | TEXT | Optional notes about the session |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### expert_availability

Stores expert availability for scheduling sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| expert_id | UUID | Expert ID |
| day_of_week | SMALLINT | Day of the week (0-6, Sunday-Saturday) |
| start_time | TEXT | Start time (HH:MM, 24-hour format) |
| end_time | TEXT | End time (HH:MM, 24-hour format) |
| is_available | BOOLEAN | Whether the expert is available |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Frontend Components

### ConnectWithExpertButton

A button component that allows users to request a connection with an expert. It shows different states based on the connection status:

- Not connected: "Connect with [Expert Name]"
- Pending: "Connection Pending"
- Accepted: "Connected"
- Declined: "Connection Declined"

### ConnectRequestModal

A modal that appears when a user clicks the ConnectWithExpertButton. It allows the user to:

- Select an area of expertise
- Write a message to the expert
- Submit the connection request

### ConnectionDashboard

A dashboard for experts to manage their connections, sessions, and availability. It includes:

- Connection Requests: View and manage incoming connection requests
- Upcoming Sessions: View and manage scheduled sessions
- My Connections: View all connected users
- Manage Availability: Set and manage availability for sessions

## Services

### connect.service.ts

Handles connection requests between users and experts:

- Creating connection requests
- Accepting/declining requests
- Fetching connection requests
- Checking connection status

### session.service.ts

Manages expert sessions:

- Creating sessions
- Updating session status
- Fetching upcoming sessions
- Managing session notes

### availability.service.ts

Manages expert availability:

- Setting availability for specific days/times
- Fetching expert availability
- Generating available slots for scheduling

## User Flow

1. **Connection Request**:
   - User views an expert profile
   - User clicks "Connect with Expert"
   - User fills out the connection request form
   - Expert receives the connection request

2. **Connection Acceptance**:
   - Expert views pending connection requests
   - Expert accepts or declines the request
   - User is notified of the expert's decision

3. **Session Scheduling**:
   - After connection is established, either party can initiate a session
   - User selects from available time slots
   - Expert confirms the session

4. **Session Management**:
   - Both parties can view upcoming sessions
   - Sessions can be rescheduled or cancelled
   - After completion, experts can add notes

## Implementation Steps

1. **Database Setup**:
   - Create the necessary tables using the migration script
   - Set up Row Level Security policies

2. **Backend Services**:
   - Implement connect.service.ts
   - Implement session.service.ts
   - Implement availability.service.ts

3. **Frontend Components**:
   - Create ConnectWithExpertButton
   - Create ConnectRequestModal
   - Create ConnectionDashboard

4. **Integration**:
   - Add the ConnectionDashboard to the routes
   - Add ConnectWithExpertButton to expert profiles
   - Test the complete flow

## Security Considerations

- Row Level Security ensures users can only access their own data
- Experts can only accept/decline requests directed to them
- Users can only create connection requests for themselves
- Session data is only visible to the involved parties

## Future Enhancements

- Notification system for connection requests and session reminders
- Integration with calendar systems
- Video conferencing integration for virtual sessions
- Rating and review system for expert sessions
- Analytics for experts to track their sessions and performance
