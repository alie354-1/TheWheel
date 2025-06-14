-- Migration: Add description column to step_templates and seed core templates

alter table step_templates
add column if not exists description text;

insert into step_templates (name, description, instructions, task_list, resources, notes, tool_picker, submission_box) values
('Full Step', 'All sections enabled', true, true, true, true, true, false),
('Task-Only Step', 'Instructions and task list only', true, true, false, false, false, false),
('Resource-Only Step', 'Instructions and resources only', true, false, true, false, false, false),
('Minimal Step', 'Instructions only', true, false, false, false, false, false),
('Submission Step', 'Instructions and submission box', true, false, false, false, false, true),
('Reflection Step', 'Instructions and notes', true, false, false, true, false, false),
('Tool-Driven Step', 'Instructions and tool picker', true, false, false, false, true, false);
