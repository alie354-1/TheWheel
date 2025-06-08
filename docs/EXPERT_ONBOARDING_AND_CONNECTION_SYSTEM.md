# Expert Onboarding and Connection System

This document provides a comprehensive overview of the expert onboarding, connection, and payment system implemented in The Wheel platform.

## System Overview

The expert system consists of several interconnected components:

1. **Expert Profiles**: Allows users to create expert profiles, showcasing their expertise, experience, and services.
2. **Expert Discovery**: Enables users to browse and search for experts based on expertise areas.
3. **Connection System**: Facilitates connections between users and experts.
4. **Contracts**: Manages service agreements between experts and users.
5. **Session Management**: Handles scheduling and tracking of expert sessions.
6. **Availability Management**: Enables experts to set their weekly availability for sessions.
7. **Payment Processing**: Enables secure payments for expert services.

## Expert Profiles

### Profile Creation

Users can sign up as experts through a multi-step wizard process:

1. **Expertise Areas**: Experts select their areas of expertise from predefined categories.
2. **Experience**: Experts provide details about their professional experience and qualifications.
3. **Success Stories**: Experts share case studies or success stories to demonstrate their impact.
4. **Mentorship Approach**: Experts describe their mentorship style and approach.
5. **Motivation**: Experts explain why they want to be part of the expert community.
6. **Profile Review**: Experts review their complete profile before submission.

### Profile Management

Experts can:
- Edit their profiles at any time
- Manage their weekly availability for sessions
- Set their hourly rates
- Create contract templates
- View analytics on their profile views and connection requests

## Expert Discovery

Users can discover experts through:

1. **Browse**: View all experts or filter by expertise area
2. **Search**: Search for experts by name, expertise, or keywords
3. **Recommendations**: Receive personalized expert recommendations based on their interests and needs

Each expert listing shows:
- Name and profile picture
- Expertise areas
- Brief bio
- Rating and reviews
- Hourly rate
- Availability status

## Connection System

### Connection Requests

Users can send connection requests to experts, which include:
- A message explaining why they want to connect
- Specific expertise area they need help with
- Preferred communication method

### Connection Management

Both users and experts can:
- View pending connection requests
- Accept or decline requests
- Message connected users/experts
- End connections if needed

## Contracts

### Contract Templates

Experts can create reusable contract templates that include:
- Service description
- Terms and conditions
- Hourly rate
- Payment terms
- Confidentiality clauses

### Contract Creation and Signing

The contract process includes:
1. Expert creates and sends a contract to a user
2. User reviews the contract
3. Both parties digitally sign the contract
4. Contract becomes active and sessions can be scheduled

## Session Management

### Session Scheduling

Once connected and with an active contract, users can:
- Schedule sessions with experts based on their availability
- Set session duration
- Define session goals and topics

### Session Tracking

The system tracks:
- Upcoming sessions
- Completed sessions
- Cancelled sessions
- Session notes and outcomes

## Payment System

### Payment Processing

Users can pay for expert sessions using:
- Credit/debit cards
- PayPal
- Bank transfers

### Payment Management

The system handles:
- Session payments
- Payment history
- Receipts and invoices
- Refunds if necessary

## User Interface Components

### Expert Profile Components

- `ExpertProfileWizard`: Multi-step wizard for creating expert profiles
- `ExpertProfilePreview`: Displays a preview of an expert's profile
- `EditExpertProfileButton`: Allows experts to edit their profiles
- `ViewExpertProfileButton`: Allows users to view an expert's full profile

### Connection Components

- `ConnectWithExpertButton`: Initiates the connection request process
- `ConnectRequestModal`: Modal for sending connection requests
- `JoinAsExpertCTA`: Call-to-action for users to become experts

### Availability Management Components

- `ExpertAvailabilityManager`: Component for experts to manage their weekly availability

### Contract and Payment Components

- `ContractModal`: Modal for creating, viewing, and signing contracts
- `PaymentModal`: Modal for processing payments

### Page Components

- `CommunityExpertsPage`: Displays expert listings and individual expert profiles
- `ConnectionDashboard`: Dashboard for experts to manage their connections
- `UserConnectionsPage`: Dashboard for users to manage their expert connections

## Database Schema

The system uses the following database tables:

### Expert Profiles

```sql
CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_areas TEXT[] NOT NULL,
  years_of_experience INTEGER NOT NULL,
  bio TEXT NOT NULL,
  success_stories JSONB,
  mentorship_approach TEXT,
  motivation TEXT,
  hourly_rate DECIMAL(10,2),
  payment_methods TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Availability

```sql
CREATE TABLE expert_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Connect Requests

```sql
CREATE TABLE expert_connect_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  expertise_area TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Sessions

```sql
CREATE TABLE expert_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connect_request_id UUID REFERENCES expert_connect_requests(id) ON DELETE SET NULL,
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES expert_contracts(id) ON DELETE SET NULL,
  session_title TEXT,
  session_goals TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Contract Templates

```sql
CREATE TABLE expert_contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Contracts

```sql
CREATE TABLE expert_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connect_request_id UUID REFERENCES expert_connect_requests(id) ON DELETE SET NULL,
  template_id UUID REFERENCES expert_contract_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'terminated')),
  expert_signed BOOLEAN NOT NULL DEFAULT FALSE,
  user_signed BOOLEAN NOT NULL DEFAULT FALSE,
  expert_signed_at TIMESTAMPTZ,
  user_signed_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  hourly_rate DECIMAL(10,2),
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Payments

```sql
CREATE TABLE expert_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES expert_sessions(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES expert_contracts(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  notes TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Service Layer

The system is supported by several service modules:

### Expert Service

`expert.service.ts` - Handles expert profile management:
- Creating expert profiles
- Updating expert profiles
- Retrieving expert profiles
- Searching for experts

### Connect Service

`connect.service.ts` - Manages connections between users and experts:
- Creating connection requests
- Accepting/declining requests
- Retrieving connection requests
- Checking connection status

### Session Service

`session.service.ts` - Handles expert session management:
- Creating sessions
- Updating session status
- Retrieving sessions
- Rescheduling sessions

### Contract Service

`contract.service.ts` - Manages contracts between users and experts:
- Creating contract templates
- Creating contracts
- Signing contracts
- Retrieving contracts

### Availability Service

`availability.service.ts` - Manages expert availability:
- Setting availability for specific days and times
- Getting all availability slots for an expert
- Removing availability slots
- Getting available slots for a specific date range, taking into account existing bookings

## User Flow

### Becoming an Expert

1. User navigates to the Experts page
2. User clicks "Join as Expert" button
3. User completes the multi-step expert profile wizard
4. Admin reviews and approves the expert profile
5. Expert profile becomes visible to other users
6. Expert sets their weekly availability for sessions

### Connecting with an Expert

1. User browses or searches for experts
2. User views expert profiles
3. User clicks "Connect" on an expert's profile
4. User fills out connection request form
5. Expert receives notification and reviews request
6. Expert accepts the connection request
7. User receives notification of acceptance

### Creating a Contract

1. Expert creates a contract for the user
2. User receives notification of new contract
3. User reviews contract
4. User signs the contract
5. Expert receives notification of signed contract

### Scheduling and Paying for Sessions

1. User or expert initiates session scheduling
2. User selects from available time slots based on expert's availability
3. Session is created in the system
4. User pays for the session
5. Both receive confirmation and calendar invites

### Completing Sessions

1. Expert and user meet for the session
2. After completion, expert marks session as completed
3. User can leave feedback
4. Payment is finalized

## Implementation Notes

- The current implementation is a placeholder that demonstrates the UI and data flow.
- In a production environment, you would need to integrate with a secure payment processor.
- Contract templates should be reviewed by legal experts before use.
- The system should be extended to handle tax implications and financial regulations.
- Additional features like video conferencing integration, file sharing, and messaging would enhance the user experience.

## Future Enhancements

1. **Advanced Scheduling**: Calendar integration with conflict detection
2. **Video Conferencing**: Built-in video conferencing for sessions
3. **Messaging System**: Real-time messaging between users and experts
4. **File Sharing**: Secure document sharing capabilities
5. **Reviews and Ratings**: Comprehensive review system for experts
6. **Dispute Resolution**: Tools for handling disputes between users and experts
7. **Analytics Dashboard**: Performance metrics for experts
8. **Certification Verification**: System to verify expert credentials
9. **Group Sessions**: Support for one-to-many expert sessions
10. **Subscription Models**: Recurring payment options for ongoing mentorship
