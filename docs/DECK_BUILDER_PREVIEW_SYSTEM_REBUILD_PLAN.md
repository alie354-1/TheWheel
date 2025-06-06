# Deck Builder: Comprehensive Preview System Rebuild Plan

This document outlines the plan to rebuild the presentation/preview mode for the Deck Builder, focusing on robustness, accessibility, interactivity, export capabilities, and integrations.

## **User Request:**
The user reported that the "presentation/preview mode is a complete mess - this is from the eyeball on the slide card - lets just redo the entire thing in the right way." The specific pain point is the preview initiated from the deck card on the main library page.

## **Identified Issues with Current System:**
- Multiple overlapping preview systems (DeckPreview, DeckPreviewPage, inline previews in UnifiedDeckBuilder).
- Complex scaling logic that may not work consistently across devices.
- Mixed rendering approaches between the builder and preview modes.
- Potential theme/styling inconsistencies between edit and preview modes.
- Confusing navigation between preview and edit states.

## **Core Goals for Rebuild:**
1.  **Consolidate Preview Components:** Create a single, robust preview system.
2.  **Standardize Rendering:** Ensure preview mode uses the same rendering pipeline as the builder for consistency.
3.  **Improve Fullscreen Experience:** Better scaling, navigation, and keyboard controls.
4.  **Clean Up State Management:** Simplify how preview mode is triggered and managed.
5.  **Responsive Design:** Ensure preview works well on all screen sizes.
6.  **Better Error Handling:** Graceful fallbacks for missing or corrupted deck data.

## **Prioritized Enhancement Areas (User Selected):**
The user has prioritized the following areas for the rebuild:
1.  **Accessibility Excellence (#3 from full list)**
2.  **Interactive Elements (#6 from full list)**
3.  **Multiple Export Formats (#9 from full list)**
4.  **External Integrations (#11 from full list)**

## **Detailed Implementation Plan (Phased Approach):**

### **Phase 1: Core Preview System & Accessibility Excellence**

**Objective:** Establish a new, unified preview component and integrate foundational accessibility features.

**Key Features:**
*   **Unified Preview Component:** A new `DeckPreviewer.tsx` component that will handle all preview rendering.
*   **Consistent Rendering:** Utilize `VisualComponentRenderer` and theme settings consistently with the editor.
*   **Basic Fullscreen Mode:** Simple, clean fullscreen display.
*   **WCAG 2.1 AA Compliance (Foundational):**
    *   Screen reader announcements for slide changes.
    *   Logical focus order.
*   **Keyboard Navigation:**
    *   Arrow keys for next/previous slide.
    *   Space/Enter to advance.
    *   Escape to exit fullscreen.
*   **High Contrast Mode (Basic):** Toggle for a high-contrast theme variant.
*   **Scalable Fonts (Basic):** Ensure text scales with browser zoom.

**New/Modified Files & Structure:**
```
src/deck-builder/
├── preview/
│   ├── components/
│   │   ├── DeckPreviewer.tsx             // The main new preview component
│   │   ├── PreviewSlide.tsx              // Renders a single slide in preview
│   │   ├── PreviewControls.tsx           // UI for next/prev, fullscreen, etc.
│   │   ├── AccessibilityToolbar.tsx    // Controls for high-contrast, etc.
│   │   └── ScreenReaderAnnouncer.tsx     // Handles ARIA live region updates
│   ├── hooks/
│   │   ├── usePreviewState.ts            // Manages preview-specific state
│   │   └── useKeyboardNavigation.ts      // Handles keyboard input for preview
│   ├── styles/
│   │   └── preview.css                   // Specific styles for preview mode
│   └── types/
│       └── preview.types.ts              // Types specific to the preview system
├── pages/
│   └── DeckPreviewHostPage.tsx         // New page to host the DeckPreviewer
```

**State Management (`usePreviewState`):**
```typescript
interface PreviewState {
  deck: Deck | null;
  currentSlideIndex: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  themeSettings: ThemeSettings; // Derived or passed in
  accessibilitySettings: {
    highContrast: boolean;
    // ... other a11y settings
  };
}
```

**Steps:**
1.  Create the new directory structure `src/deck-builder/preview/`.
2.  Develop `DeckPreviewer.tsx` as the central preview component.
3.  Integrate `DeckPreviewer.tsx` into a new `DeckPreviewHostPage.tsx`.
4.  Modify `DeckLibrary.tsx` (and `DeckLibraryPage.tsx`) to launch `DeckPreviewHostPage.tsx` when the "eye" icon is clicked on a deck card, passing the `deckId`.
5.  Implement basic keyboard navigation and screen reader announcements.
6.  Add a simple accessibility toolbar.

---

### **Phase 2: Interactive Elements**

**Objective:** Enhance the preview with interactive capabilities.

**Key Features:**
*   **Clickable Hotspots:** Define areas on slides that can trigger actions or display info.
*   **Embedded Video Controls:** Consistent playback controls for embedded videos.
*   **Interactive Charts/Graphs (Basic):** Allow basic interaction like hover-to-see-data.

**New/Modified Files & Structure (within `src/deck-builder/preview/`):**
```
src/deck-builder/preview/
├── interactive/
│   ├── HotspotRenderer.tsx
│   ├── EmbeddedVideoPlayer.tsx
│   └── InteractiveChartWrapper.tsx
├── components/
│   └── PreviewSlide.tsx // Updated to include interactive elements
```

**Steps:**
1.  Develop components for rendering hotspots, videos, and interactive charts within `PreviewSlide.tsx`.
2.  Update `VisualComponentRenderer` (or create a preview-specific version) to handle these interactive types.
3.  Ensure interactivity is intuitive and accessible.

---

### **Phase 3: Multiple Export Formats**

**Objective:** Implement robust export functionality.

**Key Features:**
*   **PDF Export:** High-fidelity PDF generation, preserving layouts and vector graphics.
*   **PowerPoint (.pptx) Export (Basic):** Convert deck structure and content to PPTX.
*   **HTML Bundle Export:** Create a self-contained HTML package for offline viewing.

**New/Modified Files & Structure (within `src/deck-builder/`):**
```
src/deck-builder/
├── export/
│   ├── services/
│   │   ├── PdfExportService.ts
│   │   ├── PptxExportService.ts
│   │   └── HtmlExportService.ts
│   ├── workers/ // For offloading heavy export tasks
│   │   ├── pdf.worker.ts
│   │   └── pptx.worker.ts
│   └── utils/
│       └── exportUtils.ts
├── preview/
│   ├── components/
│   │   └── ExportModal.tsx // UI for selecting export options
```

**Steps:**
1.  Integrate libraries like `jspdf` and `pptxgenjs`.
2.  Develop services for each export format.
3.  Implement an `ExportModal` accessible from the preview controls.
4.  Consider using web workers for complex export tasks to avoid UI blocking.

---

### **Phase 4: External Integrations**

**Objective:** Allow connection with common external platforms.

**Key Features:**
*   **Zoom/Teams Integration (Basic):** Facilitate screen sharing of the presentation.
*   **Google Drive/Dropbox Sync (Basic):** Option to save/backup decks to cloud storage.

**New/Modified Files & Structure (within `src/deck-builder/`):**
```
src/deck-builder/
├── integrations/
│   ├── services/
│   │   ├── ZoomIntegrationService.ts
│   │   ├── GoogleDriveService.ts
│   ├── components/
│   │   └── IntegrationSettingsModal.tsx // UI for managing integrations
```

**Steps:**
1.  Research and implement SDKs or APIs for Zoom, Google Drive, etc.
2.  Add UI elements for connecting accounts and triggering integration actions.
3.  Ensure secure handling of authentication tokens and user data.

---

## **General Technical Considerations:**

*   **State Management:** Utilize Zustand or a similar lightweight state management library for the preview state (`usePreviewState`).
*   **Styling:** Continue using Tailwind CSS, ensuring styles are well-encapsulated for the preview mode.
*   **Error Handling:** Implement comprehensive error boundaries and user-friendly error messages.
*   **Performance:** Profile and optimize rendering performance, especially for large decks.
*   **Testing:** Implement unit and integration tests for all new components and services.

This plan provides a structured approach to rebuilding the preview system with a focus on the prioritized features.
