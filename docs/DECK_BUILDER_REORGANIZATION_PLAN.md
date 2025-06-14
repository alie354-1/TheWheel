# Deck Builder Reorganization Plan

## Overview

This document outlines a comprehensive plan to reorganize the deck builder's slide templates, slide components, and component libraries to support a more scalable, modular, and extensible architecture. The goal is to enable better reuse, categorization, and dynamic generation of pitch decks using a rich component ecosystem.

---

## Goals

- Ensure all existing templates are complete and content-rich.
- Expand the template library with industry-standard slides (e.g., YC, Startup Genome).
- Introduce a categorized slide/component registry.
- Enable dynamic template assembly from categorized slides.
- Support better UX in the deck builder UI for browsing and inserting slides.

---

## Phase 1: Infrastructure Setup

### 1.1 Create Slide Library Structure

```
src/deck-builder/slide-library/
├── registry/
│   └── index.ts
├── categories/
│   ├── hero/
│   ├── problem/
│   ├── solution/
│   ├── market/
│   ├── traction/
│   ├── team/
│   ├── financials/
│   ├── ask/
│   ├── product/
│   ├── technology/
│   ├── partnerships/
│   ├── social-proof/
│   ├── roadmap/
│   └── custom/
```

Each category folder will contain reusable slide definitions (e.g., `hero1.ts`, `hero2.ts`) exporting a `SlideDefinition` object.

### 1.2 Define SlideDefinition Type

```ts
export interface SlideDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  blocks: VisualComponent[];
}
```

---

## Phase 2: Migration

### 2.1 Extract Existing Slides

- Parse all current templates in `src/deck-builder/templates/`
- Extract each section into a standalone `SlideDefinition` file
- Categorize based on semantic meaning (e.g., `problem`, `solution`, `team`)

### 2.2 Populate Registry

- `registry/index.ts` will export a flat list of all `SlideDefinition`s
- Also export a `Map<string, SlideDefinition[]>` grouped by category

---

## Phase 3: Integration

### 3.1 Update Template System

- Refactor `DEFAULT_TEMPLATES` to reference slide IDs from the registry
- Allow templates to be dynamically assembled from slide definitions

### 3.2 Enhance UI

- Update `ComponentLibraryPanel` and `TemplateSelector` to:
  - Browse slides by category
  - Preview and insert individual slides
  - Assemble new templates from selected slides

---

## Phase 4: Deprecation

- Remove hardcoded templates once dynamic system is stable
- Migrate all legacy templates to new format
- Clean up unused block definitions

---

## Benefits

- Easier to maintain and expand slide/component library
- Enables AI-assisted deck generation from categorized slides
- Improves UX for users building custom decks
- Aligns with best practices from YC, Sequoia, and Startup Genome

---

## Next Steps

1. Implement directory structure and registry scaffolding
2. Migrate existing templates into categorized slides
3. Refactor template system to use registry
4. Update UI to support new slide library
5. Test and validate dynamic deck generation
