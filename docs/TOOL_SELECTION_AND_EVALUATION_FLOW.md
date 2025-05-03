# Tool Selection & Evaluation Flow (The Wheel)

## Overview

This document describes the user flow, component structure, and data model for the tool selection and evaluation process within a journey step. This process is designed to be flexible: users can add up to 5 tools to their comparison list, and any or all of them can be custom tools. Users are not required to use any recommendations.

---

## User Flow

1. **Entry Point: "Investigate Tools"**
   - User clicks "Investigate Tools" in the action section of the step detail page.
   - Opens a modal, drawer, or navigates to a dedicated tool selection view.

2. **Personalized Recommendations**
   - Show the top 3 recommended tools for the user/company/step (from personalized logic or ranking).
   - Each tool card includes: name, description, logo, key features, and a "Add to Compare" checkbox.

3. **Build Comparison List**
   - User can:
     - Add any/all of the top 3 to their comparison list.
     - Browse the full list of available tools for the step and add any to compare.
     - Add custom tools (via a form, saved to `company_custom_tools`).
   - The comparison list is limited to 5 tools (any mix of recommended, listed, or custom).

4. **Comparison View**
   - Once the user has selected tools, show a side-by-side comparison table:
     - Columns: Tool name, description, features, price, type, etc.
     - Each tool has a "Rate" button and a "Select as My Tool" button.

5. **Tool Evaluation**
   - For each tool in the comparison:
     - User can rate (1-5 stars) and leave a comment (saved to `company_tool_evaluations`).
     - User can add private notes for their team.

6. **Final Selection**
   - User clicks "Select as My Tool" on one tool.
   - This marks the tool as chosen for this step (updates company progress or a new field).
   - The UI highlights the chosen tool and allows changing the selection if needed.

7. **Post-Selection**
   - The chosen tool is now shown as the "Selected Tool" on the step detail page.
   - The user can revisit the comparison/evaluation flow to change their choice or update ratings.

---

## Data Model & API

- **Fetch:**  
  - Top 3 recommendations (personalized service)
  - All tools for the step (`journey_step_tools`)
  - Custom tools (`company_custom_tools`)
  - Existing evaluations (`company_tool_evaluations`)
- **Mutate:**  
  - Add custom tool
  - Rate tool
  - Select tool for step

---

## UI Components

- **ToolSelectorModal/Drawer/Page**
  - Recommendations section
  - Full tool list section
  - Custom tool add form
  - Comparison table
  - Evaluation form (per tool)
  - Final selection highlight

---

## State & Logic

- `showToolSelector` (boolean)
- `comparisonList` (array of up to 5 tool IDs, any can be custom)
- `toolRatings` (map of tool ID to rating/comment)
- `selectedToolId` (tool ID)

---

## User Flow Diagram (Mermaid)

```mermaid
flowchart TD
    A[Step Detail Page] -->|Investigate Tools| B[Tool Selector]
    B --> C[Show Top 3 Recommendations]
    C --> D[Add to Comparison List]
    D --> E[Browse All Tools]
    E --> F[Add More Tools]
    D --> G[Add Custom Tool(s)]
    F --> H[Comparison Table]
    G --> H
    H --> I[Rate & Comment on Tools]
    I --> J[Select as My Tool]
    J --> K[Show Selected Tool on Step Page]
    K -->|Change Selection| H
```

---

## Notes

- Users can add up to 5 tools to compare, and any/all can be custom.
- Users are not required to use any recommendations.
- The process is designed to be flexible and user-driven.
