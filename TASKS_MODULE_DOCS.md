# Tasks Module: Detailed Technical Documentation

---

## 1. Overall Purpose & Architecture

The Tasks module provides functionality for creating, managing, displaying, and tracking tasks within The Wheel platform. It appears to support both manually created tasks and tasks potentially generated or augmented by AI. The architecture centers around a `TaskManager` component that likely orchestrates the display and interaction with task lists and individual task items.

---

## 2. Key Directories and Their Roles

*   **`src/components/tasks/`**: This is the primary directory for all UI components related to task management.
    *   `TaskManager.tsx`: The central component for managing and displaying tasks, likely acting as a dashboard or main view for tasks.
    *   `TaskList.tsx`: A component responsible for rendering a list of tasks.
    *   `TaskItem.tsx`: A component that displays a single task item within a list, showing its details and potentially actions (edit, delete, complete).
    *   `TaskForm.tsx`: A form component used for creating new tasks or editing existing ones.
    *   `CreateTaskDialog.tsx` (Assumed, based on common patterns, or could be part of `TaskForm.tsx` logic): A modal dialog for task creation.
    *   `AITaskGenerator.tsx` (Assumed, based on previous analysis): Component or service integration for AI-assisted task generation.
    *   `ManualTaskCreation.tsx` (Assumed): Component specifically for manual task input, possibly distinct from `TaskForm` if `TaskForm` handles both manual and AI-augmented creation.
    *   `TaskFilterSortControls.tsx` (Assumed): Components to allow users to filter and sort the task list.
    *   `TaskAssignment.tsx` (Assumed): Components related to assigning tasks to users.
    *   `TaskComments.tsx` (Assumed): Components for adding and displaying comments on tasks.
    *   `TaskAttachments.tsx` (Assumed): Components for managing attachments related to tasks.

*   **`src/pages/` (Potentially Relevant):**
    *   A dedicated "Tasks Page" might exist, or task management could be integrated into other dashboards (e.g., `Dashboard.tsx`, `CompanyDashboard.tsx`, `BusinessOperationsHubPage.tsx`).
    *   `src/business-ops-hub/pages/UnifiedTaskListPage.tsx`: This page strongly suggests a centralized view for tasks, potentially aggregating tasks from various sources or domains within the Business Operations Hub.

*   **`src/lib/services/` (Potentially Relevant):**
    *   `task.service.ts` (Assumed): A dedicated service for CRUD operations (Create, Read, Update, Delete) related to tasks, interacting with the Supabase backend.
    *   AI services (e.g., from `src/lib/services/recommendation/` or a specific AI task service) if `AITaskGenerator.tsx` is indeed a feature.

*   **`src/lib/types/` (Potentially Relevant):**
    *   `task.types.ts` (Assumed): TypeScript definitions for task objects, including properties like ID, title, description, status, due date, assignee, priority, comments, attachments, etc.

*   **`src/lib/store/` or Contexts (Potentially Relevant):**
    *   A Zustand store slice or a React Context might be used for managing the state of tasks, especially if tasks need to be accessed or updated from multiple parts of the application (e.g., task widgets on dashboards, notifications).

---

## 3. File-by-File Breakdown (Key Components)

*   **`src/components/tasks/TaskManager.tsx`**
    *   **Purpose:** The main orchestrator for the task management UI. It likely fetches task data, handles filtering/sorting, and renders the `TaskList`.
    *   **Functionality:** May include controls for creating new tasks (possibly opening `TaskForm` or `CreateTaskDialog`), and overall management views.
    *   **Key Props/State/Context:** Manages the list of tasks (fetched or from a store), filter/sort criteria, and loading/error states. May interact with a task-specific store or context.
    *   **Relationships:** Renders `TaskList.tsx` and potentially `TaskFilterSortControls.tsx`. Interacts with `task.service.ts` for data operations.

*   **`src/components/tasks/TaskList.tsx`**
    *   **Purpose:** Renders a list of `TaskItem` components.
    *   **Functionality:** Takes an array of task objects and maps over them to display each task. May handle empty states or loading indicators.
    *   **Key Props/State/Context:** Receives `tasks` array as a prop. May also receive callbacks for actions on tasks (e.g., `onTaskSelect`, `onTaskComplete`).
    *   **Relationships:** Parent is likely `TaskManager.tsx`. Renders multiple `TaskItem.tsx` children.

*   **`src/components/tasks/TaskItem.tsx`**
    *   **Purpose:** Displays a single task with its relevant information and actions.
    *   **Functionality:** Shows task title, description (or a summary), due date, priority, status, assignee. Provides UI elements for actions like marking complete, editing, deleting, viewing details.
    *   **Key Props/State/Context:** Receives a single `task` object as a prop. May have local UI state (e.g., for an expanded view). Receives callbacks for actions performed on this task.
    *   **Relationships:** Child of `TaskList.tsx`.

*   **`src/components/tasks/TaskForm.tsx`**
    *   **Purpose:** Provides a form for creating a new task or editing an existing one.
    *   **Functionality:** Includes input fields for all editable task properties (title, description, due date, priority, assignee, etc.). Handles form submission, validation, and calls the appropriate service method to save the task.
    *   **Key Props/State/Context:** May receive an existing `task` object (for editing) or be in "create" mode. Manages form field states and validation. Receives callbacks for `onSubmit` and `onCancel`.
    *   **Relationships:** Can be rendered as a standalone component or within a modal (`CreateTaskDialog.tsx`). Interacts with `task.service.ts`.

*   **`src/business-ops-hub/pages/UnifiedTaskListPage.tsx`**
    *   **Purpose:** Provides a centralized page for viewing tasks, potentially across different domains or projects within the Business Operations Hub.
    *   **Functionality:** Likely integrates the `TaskManager.tsx` component or a similar task display system, but with a broader scope or specific filters relevant to the Business Ops Hub.
    *   **Relationships:** A page-level component that uses task management components.

---

## 4. State Management

*   **Local Component State:** `TaskForm.tsx` and `TaskItem.tsx` (for UI interactions like expansion) will use local React state.
*   **`TaskManager.tsx` State:** This component will likely manage the primary list of tasks being displayed, along with current filters, sorting, and pagination state if applicable. This could be done with `useState`/`useReducer` or by subscribing to a global task store.
*   **Global Task Store/Context (Recommended):** For an application of this scale, tasks are often cross-cutting concerns (e.g., appearing in dashboards, notifications, different modules). A global state solution (like a Zustand store slice for tasks or a dedicated `TaskContext`) is recommended for:
    *   Fetching and caching tasks.
    *   Providing a single source of truth for task data.
    *   Allowing various components to subscribe to task updates.
    *   Handling optimistic updates for CRUD operations.
*   **Data Fetching:** Task data is likely fetched via a `task.service.ts` that communicates with the Supabase backend. React Query or SWR could be used within the store or `TaskManager` for managing server state (caching, refetching, etc.).

---

## 5. User Flows

1.  **Viewing Tasks:**
    *   User navigates to a task list view (e.g., `TaskManager` on a dashboard, `UnifiedTaskListPage`).
    *   Tasks are fetched and displayed by `TaskList` and `TaskItem`.
    *   User can filter/sort tasks.
2.  **Creating a Task:**
    *   User clicks a "Create Task" button.
    *   `TaskForm` (possibly in a `CreateTaskDialog`) is presented.
    *   User fills in task details and submits.
    *   `task.service.ts` saves the task to the backend.
    *   Task list updates to show the new task.
3.  **Editing a Task:**
    *   User clicks an "Edit" action on a `TaskItem`.
    *   `TaskForm` is presented, pre-filled with existing task data.
    *   User modifies details and submits.
    *   `task.service.ts` updates the task.
    *   Task list updates.
4.  **Completing/Updating Task Status:**
    *   User interacts with a `TaskItem` (e.g., checkbox, status dropdown).
    *   `task.service.ts` updates the task's status.
    *   `TaskItem` UI reflects the change.
5.  **Deleting a Task:**
    *   User clicks a "Delete" action on a `TaskItem`.
    *   Confirmation prompt may appear.
    *   `task.service.ts` deletes the task.
    *   Task is removed from the list.

---

## 6. Known Issues & Recommendations (Tasks Module)

1.  **Clarity of Task Creation Flows:** If `AITaskGenerator.tsx` and `ManualTaskCreation.tsx` exist as separate components from a more general `TaskForm.tsx`, their integration and distinct use cases need to be clear.
    *   **Recommendation:** Consolidate task creation into `TaskForm.tsx` if possible, with props or internal logic to handle variations (e.g., pre-filling from AI suggestions). If separate components are maintained, ensure their roles are well-defined.

2.  **State Management Strategy:**
    *   **Recommendation:** If not already in place, implement a robust global state management solution for tasks (e.g., Zustand slice) to handle fetching, caching, and optimistic updates. This will improve consistency and performance across different parts of the app that display or interact with tasks.

3.  **Component Reusability:**
    *   **Recommendation:** Ensure `TaskItem.tsx` and `TaskForm.tsx` are highly reusable and configurable through props to support different display contexts or task types if they emerge.

4.  **Integration with Other Modules:** Tasks are likely related to other entities (Journey Steps, Business Ops Domains, Ideas).
    *   **Recommendation:** Document how tasks are linked to these other entities in the data model and how this is handled in the UI (e.g., displaying related tasks, creating tasks from a Journey Step). The `UnifiedTaskListPage.tsx` in `business-ops-hub` suggests such integrations exist.

5.  **Advanced Features (Assumed):** If features like comments, attachments, and subtasks are planned or partially implemented:
    *   **Recommendation:** Document their data models, UI components, and service interactions clearly. Ensure these are integrated smoothly into `TaskItem` and `TaskForm`.

6.  **Testing:**
    *   **Recommendation:** Implement comprehensive tests for task CRUD operations, filtering/sorting, and any AI-assisted generation logic.

---

This detailed documentation for the Tasks module should be reviewed and expanded with specifics from the code (props, exact state variables, service calls) as part of a deeper code audit.
