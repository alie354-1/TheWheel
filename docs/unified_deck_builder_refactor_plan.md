# Unified Deck Builder Refactor Plan

This document outlines the plan to refactor the Deck Builder to a unified component-based architecture, where all slide content, including main text, is treated as a visual component.

## 1. Core Idea: Unified Component Model
- **Current:** Slides (`DeckSection`) have a main `content` field (string/object/HTML) and a separate list of `visualComponents`.
- **Proposed:** Each slide (`DeckSection`) will primarily contain an ordered array: `components: VisualComponent[]`.
    - The traditional "main content" of a slide will become one or more `VisualComponent` instances (e.g., a `type: 'text'` component).
    - This eliminates the distinction between "main content" and "added visual components."

## 2. Data Model Changes
- **`DeckSection` Interface (`src/deck-builder/types/index.ts`):**
    - Remove the existing `content: any` and `contentIsHtml?: boolean` fields.
    - Add a new primary field: `components: VisualComponent[] = [];`
    - Fields like `id`, `type` (SectionType, e.g., 'hero', 'market'), `title`, `order` remain.
- **`VisualComponent` Interface (`src/deck-builder/types/index.ts` or `blocks.ts`):**
    - `id: string` (unique within the slide)
    - `type: BlockType` (e.g., 'text', 'image', 'chart', 'customHtml', etc.)
    - `data: any` (holds component-specific content and settings, e.g., for text: `{ textContent: "...", variant: "paragraph", isHtml: true }`)
    - `layout: { x: number, y: number, width: number, height: number, zIndex?: number }` (for positioning and sizing on the canvas).
    - `order?: number` (optional, for maintaining a logical order if not using absolute positioning for all components).

## 3. Component Library (`BLOCK_REGISTRY` in `src/deck-builder/types/blocks.ts`)
- Ensure `BLOCK_REGISTRY` is comprehensive and includes entries for all desired component types.
- Each entry in `BLOCK_REGISTRY` (`BlockMeta`) should define:
    - `label: string`
    - `icon: string`
    - `category: string` (e.g., "Text", "Media", "Data Visualization", "Layout", "Business Specific") for grouping in the UI.
    - `description?: string`
    - `defaultData: any` (the initial `data` for a new component of this type).
    - `editableProps: EditableProp[]` (defines how the component's `data` can be edited in a modal).
- **New Component Type**: A dedicated `richText` or enhanced `text` component type might be needed to handle WYSIWYG/HTML content, distinct from simple plain text if that's also required. Its `data` might include `{ htmlContent: string }`.

## 4. Slide Templates
- **Definition**: Templates will define a default list of `VisualComponent` instances (type, default data, initial layout) for each `SectionType`.
- **Storage**: A `TEMPLATES` constant mapping `SectionType` to an array of `Partial<VisualComponent>` objects.
- **Usage**: When a new slide of a certain `SectionType` is created, its `components` array is initialized from the corresponding template.

## 5. Editing Experience (`UnifiedDeckBuilder.tsx`)
- **Editor Pane (Center Pane when `viewMode === 'vertical'`, or Left part of Center Pane in `split` mode):**
    - The `SafeSectionEditor` will be replaced or heavily refactored.
    - Instead of a single textarea for "main content", it will display a list of all components for the current `selectedSectionId`.
    - Each component in the list will be represented by a "card" or "row" showing:
        - Component type/icon.
        - A small preview or key data (e.g., first few words of text, image thumbnail).
        - "Edit" button: Opens `VisualComponentEditorModal` pre-filled with that component's `data`.
        - "Delete" button.
        - Drag handles for reordering components within the slide (updates their `order` property or position in the `components` array).
    - An "Add Component" button at the end of the list (or a floating button) that opens/activates the `ComponentLibraryPanel`.
- **Component Library Panel (Right Pane):**
    - Displays all available `BlockType`s from `BLOCK_REGISTRY`, grouped by `category`.
    - Clicking/dragging a component from the library adds a new instance of it to the current slide's `components` array with its `defaultData` and a default layout.
- **Preview Pane (`EnhancedSlidePreview`):**
    - Renders all `VisualComponent` instances from the current slide's `components` array.
    - Each component is rendered by `VisualComponentRenderer` based on its `type`, `data`, and `layout`.
    - **Interaction**:
        - Clicking a component in the preview could select it, highlighting it and potentially opening its editor modal or an inspector panel.
        - **Drag-and-Drop (Future)**: Allow dragging components on the canvas to update their `layout.x` and `layout.y`.

## 6. Component Editing Modal (`VisualComponentEditorModal.tsx`)
- Remains largely the same but will be invoked for *all* components, including what was previously "main content" (now a text component).
- For text components, the modal should offer a richer editing experience:
    - A WYSIWYG editor (e.g., using a lightweight library if possible, or a more advanced textarea).
    - A toggle to switch to raw HTML editing mode for that text component. The component's `data` would store `{ htmlContent: "...", format: "html" }` or `{ textContent: "...", format: "text" }`.

## 7. Data Migration
- A one-time migration logic will be needed for existing decks:
    - For each `DeckSection`:
        1. Create a new `components` array.
        2. If `section.content` exists:
            - If `section.content` is a string (and `contentIsHtml` was true), create a new text component: `{ type: 'text', data: { htmlContent: section.content, format: 'html' }, layout: { ...defaultTextLayout } }`.
            - If `section.content` is a string (and `contentIsHtml` was false or undefined), create: `{ type: 'text', data: { textContent: section.content, format: 'text' }, layout: { ...defaultTextLayout } }`.
            - If `section.content` is an object (e.g., market data): This is tricky.
                - Option A: Convert it into a specific component type if one matches (e.g., a 'marketDataBlock').
                - Option B: Convert it into a generic 'dataBlock' or 'jsonBlock' that just displays the JSON.
                - Option C (Simpler for MVP): Stringify it and put it in a text block, `{ type: 'text', data: { textContent: JSON.stringify(section.content, null, 2), format: 'text' }, layout: { ...defaultTextLayout } }`.
        3. Append existing `visualComponents` from the old model to the new `components` array, ensuring their `id`, `type`, `data`, and `position` are mapped to the new `VisualComponent` structure (especially `position` to `layout`).
        4. Remove old `content`, `contentIsHtml`, and the old `visualComponents` array from the section.
- This migration should happen when a deck is loaded by `useDeck`.

## 8. Implementation Phases (High-Level)

1.  **Phase 1: Data Model & Core Types**
    *   Update `DeckSection` and `VisualComponent` types in `src/deck-builder/types/index.ts`.
    *   Update `BLOCK_REGISTRY` in `src/deck-builder/types/blocks.ts` with `defaultData` and ensure all components have `category` and `editableProps`.
    *   Define `TEMPLATES` structure.

2.  **Phase 2: `useDeck` Hook Refactor**
    *   Modify `useDeck` to work with the new `DeckSection.components` model.
    *   Implement data migration logic within `useDeck` when loading an existing deck.
    *   Update `addSection` to use templates for populating initial components.
    *   Update `updateSection` to handle changes to the `components` array (add, remove, update, reorder components within a section).

3.  **Phase 3: Editor Pane UI Refactor (`UnifiedDeckBuilder.tsx`)**
    *   Replace `SafeSectionEditor` with a new "Component List Editor".
    *   Display each component in the `DeckSection.components` array as an editable item/card.
    *   Implement "Edit" (opens `VisualComponentEditorModal`), "Delete", and "Add Component" (opens `ComponentLibraryPanel`) functionality for this list.
    *   Implement drag-and-drop reordering for components in this list.

4.  **Phase 4: Preview Pane (`EnhancedSlidePreview`)**
    *   Update `EnhancedSlidePreview` to iterate over `currentSection.components` and render each using `VisualComponentRenderer`.
    *   Ensure `VisualComponentRenderer` correctly uses `component.layout` for positioning.
    *   (Future) Implement on-canvas selection and drag-to-move for components.

5.  **Phase 5: Text Component Enhancement**
    *   Improve the `text` component's editing experience in `VisualComponentEditorModal` with a WYSIWYG/HTML toggle.
    *   Ensure `VisualComponentRenderer` can render HTML content safely (requires a sanitizer or careful handling).

---

This refactor will result in a much more powerful and intuitive deck building experience.
