# New Journey System: MRD Features Implementation Plan

This document provides a detailed technical plan for implementing the advanced, high-value features defined in the Market Requirements Document (MRD), including AI-powered suggestions, the Standup Bot, Outcome Capture, and Community Intelligence.

## 1. Guiding Principles

- **MRD-Centric**: Every feature implementation is directly tied to a specific requirement or wireframe in the MRD.
- **Service-Driven Logic**: All business logic for these features is handled within the backend services (`new_journey_features.service.ts`, `new_journey_ai.service.ts`) to keep the frontend clean.
- **Data-Driven UI**: The frontend components are responsible for rendering the data provided by the services, not for making complex logical decisions.
- **Abstracted AI**: The AI service is designed as an abstraction layer, allowing for easy integration of different models (e.g., swapping OpenAI for Anthropic) without changing the components that consume the AI-generated content.

---

## 2. Feature: Outcome Capture & Adaptive Suggestions (Wireframe 3.4)

This feature is the core of the system's learning loop.

### End-to-End Flow:

1.  **User Action**: The user clicks the "Mark Complete" button on the `StepDetailPage.tsx`.
2.  **Modal Trigger**: This action opens the `OutcomeCaptureModal.tsx` component.
3.  **Form State**: The `useOutcomeCapture.ts` hook manages the state of the form fields (task results, time taken, confidence level, notes).
4.  **Submission**: The user clicks the "Submit & Continue" button. This calls the `captureOutcome` function from the `useOutcomeCapture` hook.
5.  **Backend Service Call**: The hook calls `new_journey_features.service.ts.captureOutcome(outcomeData)`.
6.  **Database Insertion**: The service saves the submitted data to the `step_outcomes_new` table.
7.  **AI Service Trigger**: The `captureOutcome` method then immediately calls `new_journey_ai.service.ts.generateAdaptiveSuggestions(outcomeData)`.
8.  **AI Prompt Engineering**: The AI service constructs a detailed prompt, for example:
    ```
    You are an expert startup advisor. A founder has just completed the step '{step.name}'.
    Here are their results:
    - Time taken: {outcome.time_taken_days} days.
    - Confidence: {outcome.confidence_level}/5.
    - Key Learnings: {outcome.key_learnings.join(', ')}.
    - Completed Tasks: {JSON.stringify(outcome.task_results)}

    Based on these results, generate 3-5 concise, actionable suggestions for what this founder should focus on next. Frame them as clear next steps.
    ```
9.  **AI Response & Storage**: The AI service receives the suggestions, parses them, and saves them to the `adaptive_suggestions_new` table, linked to the `outcome_id`.
10. **UI Update**: Back in the `OutcomeCaptureModal.tsx`, the `AdaptiveSuggestions.tsx` component (which polls or listens for new suggestions) automatically displays the newly generated suggestions to the user in real-time.

---

## 3. Feature: Standup Bot Integration (Wireframe 3.3)

This feature provides a seamless way for users to report progress via a chat interface.

### Implementation Plan:

1.  **Component**: `StandupBotWidget.tsx` will be placed on the `StepDetailPage.tsx`.
2.  **Connection**: On mount, the widget establishes a WebSocket connection to the backend endpoint (`/ws/new_journey/standup`). The `company_id` and `company_step_id` are passed during the initial handshake for context.
3.  **User Input**: The user types a message (e.g., "Completed the stakeholder calls") and sends it.
4.  **Backend Processing**:
    *   The WebSocket handler receives the message and calls `new_journey_features.service.ts.processStandupMessage()`.
    *   This service logs the message in `standup_sessions_new`.
    *   It then calls `new_journey_ai.service.ts.analyzeStandupMessage(message)`.
5.  **AI Analysis**: The AI service uses a prompt with function-calling capabilities:
    ```
    Analyze the following user message to see if it indicates the completion of any of the following tasks. If a task is mentioned as complete, call the 'markTaskComplete' function with the corresponding task ID.

    User Message: "{message}"

    Available Tasks:
    - { id: 'task_id_1', name: 'Draft vision' }
    - { id: 'task_id_2', name: 'Gather stakeholder input' }
    ```
6.  **Action Confirmation**:
    *   If the AI returns a function call with high confidence (e.g., `markTaskComplete('task_id_2')`), the backend sends a confirmation message back through the WebSocket: "Great! I've marked 'Gather stakeholder input' as complete."
    *   The backend service then calls `new_company_journey.service.ts.updateTaskStatus()` to update the database.
    *   The `InteractiveTaskList` on the `StepDetailPage.tsx` will re-render to show the updated checkbox.

---

## 4. Feature: Community Intelligence (Wireframe 3.3)

This feature provides users with anonymized benchmarks from their peers.

### Implementation Plan:

1.  **Data Anonymization**: When a user submits an outcome via `OutcomeCaptureModal.tsx` and checks "Share results anonymously," the `new_journey_features.service.ts` will create a record in the `anonymized_outcomes_new` table. This record will only contain non-identifiable data (industry, stage, time taken, etc.), completely severing any link to the specific company.
2.  **Data Aggregation**: The `new_journey_features.service.ts.getCommunityInsights(frameworkStepId)` method will be responsible for this.
    *   It will query the `anonymized_outcomes_new` table, filtered by the `framework_step_id`.
    *   It will perform aggregate calculations (e.g., `AVG(time_taken_days)`, `AVG(confidence_level)`).
    *   It will return a simple object: `{ averageTime: 3.5, successRate: 0.88, ... }`.
3.  **Frontend Display**:
    *   The `useStepDetails` hook will call this service method.
    *   The data will be passed as props to a `CommunityIntelligencePanel` component within `StepDetailPanels.tsx`.
    *   The panel will render the simple statistics, e.g., "Avg. completion: 3.5 days."

---

## 5. Feature: VC Portfolio Features (MRD Section 2.3.7)

While a full implementation is slated for a later phase, the backend schema is designed to support it.

### Foundational Plan:

1.  **Database**: The `vc_portfolios_new` and `vc_portfolio_insights_new` tables will be created (as defined in the MRD schema, but with the `_new` suffix).
2.  **Initial Service**: A placeholder service, `src/lib/services/new_journey/new_vc_portfolio.service.ts`, will be created with methods like `getPortfolioProgress(vcFirmId)`.
3.  **Future Implementation**: When this feature is prioritized, a new frontend module (`src/components/vc/new_journey/`) will be created to consume this service and build the dashboards specified in the MRD. The backend foundation will already be in place.
