# Onboarding Module: Detailed Technical Documentation

---

## 1. Overall Purpose & Architecture

The Onboarding module is responsible for guiding new users through the initial setup and configuration processes of The Wheel platform. This includes user profile creation, company joining or creation, role selection, and setting initial preferences. The architecture appears to involve a main controller (`OnboardingController.tsx`) orchestrating various "wizard" components, each composed of several distinct steps. There are indications of multiple onboarding flows (initial, enhanced, company-specific), suggesting evolution and potential areas for consolidation.

---

## 2. Key Directories and Their Roles

*   **`src/components/onboarding/`**: This is the central directory for all UI components related to onboarding.
    *   **`wizards/`** (Assumed, based on file names like `InitialOnboardingWizard.tsx` - if not a subdir, these are root components): Contains the main wizard components that manage the overall flow of different onboarding experiences.
        *   `InitialOnboardingWizard.tsx`: Likely handles the very first onboarding experience for a new user.
        *   `OnboardingWizard.tsx`: Could be a more general or later-stage onboarding flow.
        *   `EnhancedOnboardingWizard.tsx`: Suggests a more feature-rich or alternative onboarding pathway.
    *   **`steps/`** (Assumed, based on typical wizard patterns - if not a subdir, these are root components): Contains individual screen components that represent distinct steps within an onboarding wizard. Examples:
        *   `WelcomeStep.tsx`
        *   `ProfileSetupStep.tsx`
        *   `RoleSelectionStep.tsx`
        *   `CompanyJoinOrCreateStep.tsx`
        *   `CompanyDetailsStep.tsx`
        *   `NotificationPreferencesStep.tsx`
        *   `EnhancedCompanyStageStep.tsx` (Indicates steps specific to "enhanced" or company onboarding)
    *   **Root-level components in `src/components/onboarding/`**:
        *   `OnboardingController.tsx`: Likely the top-level component that decides which wizard/flow to present and manages the overall onboarding state or navigation between different onboarding phases.
        *   `OnboardingProgressCard.tsx`: A UI component to display the user's progress through an onboarding flow.
        *   `SimpleProgressBar.tsx`: A basic progress bar component, possibly used by `OnboardingProgressCard.tsx` or directly in wizards/steps.

*   **`src/pages/` (Relevant to Onboarding):**
    *   `InitialOnboardingPage.tsx`: The page that likely hosts the `InitialOnboardingWizard.tsx`.
    *   `OnboardingPage.tsx`: A more general onboarding page, possibly hosting `OnboardingWizard.tsx` or `OnboardingController.tsx`.
    *   `OnboardingWizardPage.tsx`: Could be an alternative entry point or a wrapper for a specific wizard flow.
    *   `ProfileSetup.tsx`: A page specifically for user profile setup, which might be part of an onboarding flow or a standalone feature accessible later.

*   **`src/lib/services/` (Potentially Relevant):**
    *   `profile.service.ts`: Used for creating/updating user profiles during onboarding.
    *   `company.service.ts`: Used for company creation, joining, and fetching company details.
    *   `auth.service.ts`: Handles user authentication, which is a prerequisite for onboarding.

*   **`src/lib/types/` (Potentially Relevant):**
    *   `profile.types.ts`: Contains type definitions for user profile data.
    *   `company.types.ts` (Assumed): Would contain types for company data.
    *   `onboarding.types.ts` (Assumed, if exists): Would contain types specific to onboarding state or step data.

---

## 3. File-by-File Breakdown (Key Components)

*   **`src/components/onboarding/OnboardingController.tsx`**
    *   **Purpose:** Acts as the central orchestrator for the onboarding experience. It likely determines which onboarding flow (e.g., initial, company, enhanced) is appropriate for the current user and their state.
    *   **Functionality:** May manage routing between different onboarding wizards or pages, load necessary user/company data, and track overall onboarding completion status.
    *   **Key Props/State/Context:** Might take user authentication state as a prop or from a context. Manages state related to the current onboarding flow and step.
    *   **Relationships:** Renders different wizard components (`InitialOnboardingWizard.tsx`, `OnboardingWizard.tsx`, etc.) based on logic. Interacts with `auth.service.ts`, `profile.service.ts`, and `company.service.ts`.

*   **`src/components/onboarding/InitialOnboardingWizard.tsx` (and other wizards like `OnboardingWizard.tsx`, `EnhancedOnboardingWizard.tsx`)**
    *   **Purpose:** Manages a sequence of onboarding steps for a specific onboarding scenario (e.g., first-time user, adding company details).
    *   **Functionality:** Handles navigation between steps (next/previous), collects data from each step, validates input, and potentially makes API calls via services to save onboarding progress or data.
    *   **Key Props/State/Context:** Manages the current step, accumulated data from previous steps. May receive user data as props or from a context. Passes callbacks and data to individual step components.
    *   **Relationships:** Renders various step components (e.g., `WelcomeStep.tsx`, `ProfileSetupStep.tsx`). Uses `OnboardingProgressCard.tsx` or `SimpleProgressBar.tsx` to show progress.
    *   **Note on Multiple Wizards:** The existence of `InitialOnboardingWizard`, `OnboardingWizard`, and `EnhancedOnboardingWizard` suggests different onboarding paths or versions. **This is a key area for review to consolidate into a single, more configurable wizard if possible, or to clearly document the distinct purpose of each.**

*   **`src/components/onboarding/steps/*Step.tsx` (e.g., `ProfileSetupStep.tsx`, `RoleSelectionStep.tsx`)**
    *   **Purpose:** Represents a single screen or logical unit of data collection/presentation within an onboarding wizard.
    *   **Functionality:** Renders form inputs, displays information, and collects user input for a specific aspect of onboarding. Validates local input.
    *   **Key Props/State/Context:** Receives current data (if any) for the step, and callbacks for submitting data and navigating (onNext, onPrev). May use local state for form management.
    *   **Relationships:** Rendered by a parent Wizard component.

*   **`src/pages/InitialOnboardingPage.tsx` (and other onboarding pages)**
    *   **Purpose:** Top-level React components that are mapped to routes, serving as entry points for onboarding flows.
    *   **Functionality:** Typically renders the main onboarding controller or a specific wizard component. May handle route parameters or initial data fetching if necessary.
    *   **Relationships:** Hosts components like `OnboardingController.tsx` or specific wizard components.

---

## 4. State Management

*   **Local State:** Individual step components likely manage their own form input state.
*   **Wizard-Level State:** Each wizard component (`InitialOnboardingWizard.tsx`, etc.) manages the current active step, and aggregates data collected across its steps. This state might be managed using React's `useState` and `useReducer`, or a small state management library if the logic is complex.
*   **Global/Controller-Level State:** `OnboardingController.tsx` might manage higher-level state, such as which onboarding flow is active or the overall completion status, potentially using React Context or a global store if onboarding state needs to be accessed from disparate parts of the application (though this is less common for self-contained flows).
*   **Context Usage:** While no specific "OnboardingContext" was explicitly listed in the initial file scan of `src/lib/contexts/`, it's possible that user context or company context is used to pre-fill data or determine onboarding paths.
*   **Recommendation:** Ensure a clear hierarchy of state. Data collected in steps should be lifted up to the parent wizard. The `OnboardingController` should manage transitions between different wizards or major onboarding phases. Avoid unnecessary global state for onboarding if possible; keep it localized to the onboarding flow.

---

## 5. User Flows

1.  **Initial User Onboarding:**
    *   Triggered for a brand new user after signup/login.
    *   Likely starts with `InitialOnboardingPage.tsx` -> `InitialOnboardingWizard.tsx`.
    *   Steps might include: Welcome, Profile Setup (name, avatar), Role Selection (e.g., individual, company admin), initial preferences.
2.  **Company Onboarding (Join or Create):**
    *   May be part of the initial flow or a separate flow triggered later.
    *   Steps: `CompanyJoinOrCreateStep.tsx`, `CompanyDetailsStep.tsx` (if creating).
3.  **Enhanced Onboarding:**
    *   Purpose and trigger for `EnhancedOnboardingWizard.tsx` and `EnhancedCompanyStageStep.tsx` are unclear from file names alone but suggest a more detailed or alternative flow, possibly for specific user types or paid tiers.
4.  **Profile Setup (Standalone):**
    *   `ProfileSetup.tsx` page suggests users can set up or complete their profile outside of the initial strict wizard flow.

---

## 6. Known Issues & Recommendations (Onboarding Module)

1.  **Multiple Wizards:** The presence of `InitialOnboardingWizard.tsx`, `OnboardingWizard.tsx`, and `EnhancedOnboardingWizard.tsx` suggests potential redundancy or an unclear evolution of onboarding flows.
    *   **Recommendation (High Priority):**
        *   Analyze the exact differences and purposes of these wizards.
        *   Consolidate into a single, highly configurable `MasterOnboardingWizard.tsx` if feasible. This wizard could take a configuration object or props to define the sequence of steps and their behavior for different onboarding scenarios (e.g., `type="initial"`, `type="company"`, `type="enhanced"`).
        *   If distinct flows are truly necessary, clearly document the entry points, triggers, and purpose of each wizard.

2.  **Step Duplication/Variation:** Steps like `EnhancedCompanyStageStep.tsx` hint that some steps might be slightly varied versions for different wizards.
    *   **Recommendation:** Abstract common step logic into base components or hooks. Step variations can then be achieved through props or composition, rather than entirely separate step files.

3.  **State Management Clarity:** While not explicitly problematic from file names, ensure that state is managed cleanly within each wizard and that data is passed efficiently between steps and to services.
    *   **Recommendation:** Review data flow within each wizard. Consider a pattern like a shared state object within the wizard that each step reads from and contributes to.

4.  **`OnboardingController.tsx` Role:**
    *   **Recommendation:** Clearly document the responsibilities of `OnboardingController.tsx`. Is it a top-level router for different onboarding *types*, or does it manage state across an entire multi-wizard onboarding journey? Its role will inform how wizards are structured.

5.  **Entry Points (`src/pages/`):** The various onboarding-related pages (`InitialOnboardingPage.tsx`, `OnboardingPage.tsx`, `OnboardingWizardPage.tsx`) should have clearly defined roles in the routing and user flow.
    *   **Recommendation:** Map out all routes leading to onboarding flows and ensure there's no ambiguity or redundancy.

6.  **Testing:** Onboarding flows are critical and can be complex.
    *   **Recommendation:** Ensure robust integration tests for each distinct onboarding path, covering step transitions, data submission, and error handling.

---

This detailed documentation for the Onboarding module should be reviewed and expanded with specifics from the code (props, exact state variables, service calls) as part of a deeper code audit.
