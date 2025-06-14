# New Journey System: Admin Integration Plan

This document outlines the strategy for integrating the management of the new Journey System into the existing administrative panel. The primary goal is to provide full administrative control over the new system while maximizing code reuse and maintaining a consistent experience for administrators.

## 1. Guiding Principles

- **Seamless Integration, Not Replacement**: We will not build a separate admin panel. Instead, we will make the existing admin components "system-aware."
- **Minimal Disruption**: The default behavior of the admin panel will remain unchanged. Administrators will explicitly choose to manage the new system.
- **Code Reuse**: We will reuse the existing admin UI components (`PhaseManager`, `DomainManager`, etc.) and inject logic to support the new system, rather than duplicating them.
- **Clear Separation of Concerns**: A new, dedicated admin service (`new_journey_admin.service.ts`) will handle all database interactions for the new system, ensuring the existing `journeyContent.service.ts` is untouched.

---

## 2. Core Implementation Strategy: The "System-Aware" Toggle

The cornerstone of this plan is to add a simple UI toggle to the relevant existing admin pages.

**Affected Admin Pages:**
- `src/pages/admin/journey/PhaseManager.tsx`
- `src/pages/admin/journey/DomainManager.tsx`
- `src/pages/admin/journey/StepTemplateManager.tsx`

### Implementation Steps for Each Affected Page:

1.  **Add State for System Selection**:
    ```typescript
    // In PhaseManager.tsx, DomainManager.tsx, etc.
    const [selectedSystem, setSelectedSystem] = useState<'legacy' | 'new'>('legacy');
    ```

2.  **Add UI Toggle**:
    - A simple radio button group or segmented control will be added to the top of the page.
    ```html
    <div>
      <label>
        <input type="radio" value="legacy" checked={selectedSystem === 'legacy'} onChange={() => setSelectedSystem('legacy')} />
        Legacy System
      </label>
      <label>
        <input type="radio" value="new" checked={selectedSystem === 'new'} onChange={() => setSelectedSystem('new')} />
        New System
      </label>
    </div>
    ```

3.  **Conditional Service Calls**:
    - All data fetching and mutation calls will be wrapped in a conditional block based on the `selectedSystem` state.
    - This is the most critical step. Instead of directly calling the legacy service, we will choose the service dynamically.

    **Example in `PhaseManager.tsx`:**
    ```typescript
    // Before
    useEffect(() => {
      journeyContentService.getPhases().then(setPhases);
    }, []);

    const handleSave = (phase) => {
      journeyContentService.upsertPhase(phase);
    };

    // After
    useEffect(() => {
      const activeService = selectedSystem === 'legacy' 
        ? journeyContentService 
        : new_journey_admin_service;
      
      activeService.getPhases().then(setPhases);
    }, [selectedSystem]); // Re-fetch when the system changes

    const handleSave = (phase) => {
      const activeService = selectedSystem === 'legacy' 
        ? journeyContentService 
        : new_journey_admin_service;
      
      activeService.upsertPhase(phase);
    };
    ```

---

## 3. New Admin Service

To support the conditional logic, a new, parallel admin service is required.

**File**: `src/lib/services/admin/new_journey_admin.service.ts`

- **Responsibility**: To provide the exact same method signatures as `journeyContent.service.ts` but to interact exclusively with the `_new` database tables.
- **Methods to Implement**:
    - `getPhases()`: Fetches from `journey_phases_new`.
    - `upsertPhase(phase)`: Inserts/updates into `journey_phases_new`.
    - `getDomains()`: Fetches from `journey_domains_new`.
    - `upsertDomain(domain)`: Inserts/updates into `journey_domains_new`.
    - `getStepTemplates()`: Fetches from `journey_steps_new`.
    - `upsertStepTemplate(step)`: Inserts/updates into `journey_steps_new`.
    - `deletePhase()`, `deleteDomain()`, `deleteStepTemplate()`: All targeting the `_new` tables.

---

## 4. New Admin Pages for MRD-Specific Features

Some features in the new system have no equivalent in the legacy system and therefore require new admin pages.

**Directory**: `src/pages/admin/new_journey/`

1.  **`NewJourneyAnalytics.tsx`**
    - **Responsibility**: Displays high-level analytics for the new system (e.g., number of active journeys, steps completed, outcomes captured).
    - **Data Source**: Will query `company_journeys_new` and `company_journey_steps_new`.

2.  **`NewOutcomeAnalytics.tsx`**
    - **Responsibility**: Provides a dashboard for reviewing aggregated outcome data. This is crucial for understanding how founders are using the system.
    - **Data Source**: Will query `step_outcomes_new` and `anonymized_outcomes_new`.
    - **Features**: Will allow filtering by step, date range, and confidence level to identify trends.

---

## 5. Routing and Navigation

The main admin navigation needs to be updated to provide access to these new pages.

**File**: `src/pages/AdminPanel.tsx` (or equivalent layout/nav component for the admin section)

- **Action**:
    1.  Add a new section or sub-menu to the admin navigation titled "New Journey System".
    2.  Add links within this section:
        - `/admin/new-journey/analytics` -> `NewJourneyAnalytics.tsx`
        - `/admin/new-journey/outcomes` -> `NewOutcomeAnalytics.tsx`
    3.  The existing links for managing phases, domains, and steps will remain unchanged, as the components themselves will handle the system switching.

**File**: `src/App.tsx` (or main router)

- **Action**: Add the new routes to the routing configuration.
    ```typescript
    <Route path="/admin/new-journey/analytics" element={<NewJourneyAnalytics />} />
    <Route path="/admin/new-journey/outcomes" element={<NewOutcomeAnalytics />} />
    ```

This plan ensures that administrators have robust tools to manage the new Journey System from day one, without the overhead of building and maintaining a separate admin application.
