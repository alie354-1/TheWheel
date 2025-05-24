# Business Operations Hub: Event Streaming Design

## Overview

This document defines the event types, structure, and streaming approach for the Business Operations Hub. All key user and system actions are logged as events in the `decision_events` table. This enables real-time analytics, recommendations, and integrations.

## Event Table: `decision_events`

- **id**: UUID (primary key)
- **company_id**: UUID (company context)
- **user_id**: UUID (user who triggered the event)
- **event_type**: TEXT (see below)
- **context**: JSONB (contextual info, e.g., domain, step, tool)
- **data**: JSONB (event-specific payload)
- **created_at**: TIMESTAMP

## Core Event Types

| Event Type                | Description                                 | Example Context/Data Fields                |
|--------------------------|---------------------------------------------|--------------------------------------------|
| `task_completed`         | User completes a task/step                  | step_id, domain_id, time_spent             |
| `task_created`           | User creates a custom task                  | step_id, domain_id, title, source          |
| `task_updated`           | Task/step is updated                        | step_id, changes, previous_values          |
| `task_deleted`           | Task/step is deleted                        | step_id, domain_id                         |
| `task_status_changed`    | Task status changes (e.g., in_progress)     | step_id, old_status, new_status            |
| `recommendation_shown`   | Recommendation is presented to user         | rec_id, step_id, domain_id, rec_type       |
| `recommendation_clicked` | User clicks/interacts with a recommendation | rec_id, step_id, domain_id, action         |
| `feedback_submitted`     | User submits feedback on a step/tool        | step_id, tool_id, rating, comment          |
| `consideration_activated`| User activates a cross-domain consideration | step_id, domain_id, source_step_id         |
| `consideration_dismissed`| User dismisses a consideration              | step_id, domain_id, source_step_id         |
| `tool_added`             | Tool is added to a step/domain              | tool_id, step_id, domain_id, source        |
| `tool_used`              | User launches/uses a tool                   | tool_id, step_id, domain_id, usage_context |
| `workspace_saved`        | Workspace configuration is saved            | workspace_id, domain_id, config            |
| `workspace_loaded`       | Workspace is loaded by user                 | workspace_id, domain_id                    |
| `decision_made`          | General business decision is logged         | decision_type, context, outcome            |

## Event Structure Example

```json
{
  "event_type": "task_completed",
  "company_id": "uuid-company",
  "user_id": "uuid-user",
  "context": {
    "domain_id": "uuid-domain",
    "step_id": "uuid-step"
  },
  "data": {
    "time_spent": 42,
    "completion_method": "manual"
  },
  "created_at": "2025-05-17T17:00:00Z"
}
```

## Event Streaming Approach

- **Primary Logging**: All events are inserted into `decision_events` via API or direct Supabase client.
- **Realtime Streaming (optional)**: 
  - Use Supabase Realtime to subscribe to `decision_events` for live updates in dashboards, analytics, or integrations.
  - Webhooks or edge functions can be triggered on new event inserts for further processing.
- **Event Consumers**:
  - Analytics dashboards
  - Recommendation engine
  - Notification system
  - External integrations (via webhook)

## Next Steps

1. Ensure all key user/system actions in the app log events to `decision_events` using the above structure.
2. Implement Supabase Realtime subscriptions or webhooks for live event processing as needed.
3. Document event consumer requirements for analytics, recommendations, and notifications.
4. Add integration tests to verify event logging and streaming.
