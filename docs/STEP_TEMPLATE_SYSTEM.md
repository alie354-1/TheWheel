# Step Template System

This document outlines the design and implementation plan for the Step Template system, which allows admins to define structural presets for journey steps. These templates control which UI sections are enabled for a step, simplifying the creation and customization of step instances.

---

## Purpose

Step templates define the *structure* of a step, not its content. They answer:

- Should this step have a task list?
- Should this step include resource links?
- Should this step allow user notes or reflections?
- Should this step include a tool picker or submission box?

This enables consistent step creation while allowing flexibility to toggle features on/off per instance.

---

## Template Structure

Each template defines a set of boolean flags for UI sections:

```json
{
  "name": "Full Step",
  "description": "All sections enabled",
  "instructions": true,
  "taskList": true,
  "resources": true,
  "notes": true,
  "toolPicker": true,
  "submissionBox": false
}
```

---

## Core Templates

1. **Full Step** – All sections enabled
2. **Task-Only Step** – Instructions + Task List
3. **Resource-Only Step** – Instructions + Resources
4. **Minimal Step** – Instructions only
5. **Submission Step** – Instructions + Submission Box
6. **Reflection Step** – Instructions + Notes
7. **Tool-Driven Step** – Instructions + Tool Picker

---

## Database Schema

```sql
CREATE TABLE step_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions BOOLEAN DEFAULT TRUE,
  task_list BOOLEAN DEFAULT FALSE,
  resources BOOLEAN DEFAULT FALSE,
  notes BOOLEAN DEFAULT FALSE,
  tool_picker BOOLEAN DEFAULT FALSE,
  submission_box BOOLEAN DEFAULT FALSE
);
```

Seed data:

```sql
INSERT INTO step_templates (name, description, instructions, task_list, resources, notes, tool_picker, submission_box) VALUES
('Full Step', 'All sections enabled', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE),
('Task-Only Step', 'Instructions and task list only', TRUE, TRUE, FALSE, FALSE, FALSE, FALSE),
('Resource-Only Step', 'Instructions and resources only', TRUE, FALSE, TRUE, FALSE, FALSE, FALSE),
('Minimal Step', 'Instructions only', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE),
('Submission Step', 'Instructions and submission box', TRUE, FALSE, FALSE, FALSE, FALSE, TRUE),
('Reflection Step', 'Instructions and notes', TRUE, FALSE, FALSE, TRUE, FALSE, FALSE),
('Tool-Driven Step', 'Instructions and tool picker', TRUE, FALSE, FALSE, FALSE, TRUE, FALSE);
```

---

## Admin UI

- Template Manager: Create/edit templates with toggles for each section.
- Step Creation: Select a template to pre-fill section toggles.
- Step Instance: Allow per-step override of section toggles.

---

## Step Page Rendering

```tsx
function StepPage({ step, template }) {
  return (
    <>
      {template.instructions && <InstructionsSection content={step.instructions} />}
      {template.taskList && <TaskListSection tasks={step.tasks} />}
      {template.resources && <ResourceLinksSection resources={step.resources} />}
      {template.notes && <NotesSection notes={step.notes} />}
      {template.toolPicker && <ToolPickerSection tools={step.tools} />}
      {template.submissionBox && <SubmissionBoxSection submission={step.submission} />}
    </>
  );
}
```

---

## Summary

This system provides a flexible, scalable way to manage step structure across the journey builder. It simplifies admin workflows and ensures consistency while allowing customization where needed.
