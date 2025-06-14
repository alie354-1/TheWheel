-- Add position column to journey_phases for ordering
alter table journey_phases
add column if not exists position integer default 0;
