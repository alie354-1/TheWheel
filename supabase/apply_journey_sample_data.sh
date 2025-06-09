#!/bin/bash

# Apply Journey Sample Data
# This script populates the journey integration system with sample data

echo "Applying Journey Sample Data..."

# Connect to the database
psql -U postgres -d postgres << EOF

-- Insert sample expert recommendations
INSERT INTO step_expert_recommendations (step_id, expert_id, relevance_score)
SELECT 
  s.id as step_id,
  e.id as expert_id,
  0.8 + random() * 0.2 as relevance_score
FROM 
  journey_steps s
CROSS JOIN 
  expert_profiles e
LIMIT 50;

-- Insert sample template recommendations
INSERT INTO step_template_recommendations (step_id, template_id, template_type, relevance_score)
SELECT 
  s.id as step_id,
  gen_random_uuid() as template_id,
  CASE floor(random() * 3)
    WHEN 0 THEN 'deck'
    WHEN 1 THEN 'document'
    ELSE 'tool'
  END as template_type,
  0.7 + random() * 0.3 as relevance_score
FROM 
  journey_steps s
LIMIT 50;

-- Insert sample peer insights
INSERT INTO peer_insights (step_id, avg_time_to_complete, common_blockers, success_strategies, outcome_metrics)
SELECT 
  s.id as step_id,
  floor(random() * 30) + 1 as avg_time_to_complete,
  ARRAY[
    'Feature creep - adding too many features',
    'Technical debt from rushing implementation',
    'Lack of clear success metrics',
    'Difficulty finding the right customers',
    'Limited resources and budget constraints'
  ][1:floor(random() * 3) + 2] as common_blockers,
  ARRAY[
    'Focus on solving one core problem extremely well',
    'Get a working prototype in front of users within 2 weeks',
    'Use off-the-shelf components where possible',
    'Define clear success metrics before starting',
    'Gather feedback early and often'
  ][1:floor(random() * 3) + 2] as success_strategies,
  jsonb_build_object(
    'User Acquisition Cost', concat('$', floor(random() * 100)::text),
    'Conversion Rate', concat(round((random() * 10)::numeric, 1)::text, '%'),
    'Time to First Paying Customer', concat(floor(random() * 90) + 30, ' days')
  ) as outcome_metrics
FROM 
  journey_steps s;

-- Insert sample step resources
INSERT INTO step_resources (step_id, resource_type, title, url, description, order_number)
SELECT 
  s.id as step_id,
  'article' as resource_type,
  'How to Build a Successful MVP' as title,
  '/resources/articles/how-to-build-successful-mvp' as url,
  'A comprehensive guide to building a successful MVP that resonates with your target audience.' as description,
  1 as order_number
FROM 
  journey_steps s
WHERE 
  random() < 0.5
LIMIT 20;

INSERT INTO step_resources (step_id, resource_type, title, url, description, order_number)
SELECT 
  s.id as step_id,
  'video' as resource_type,
  'MVP in 2 Weeks' as title,
  '/resources/videos/mvp-in-2-weeks' as url,
  'Learn how to build your MVP in just 2 weeks with this step-by-step video guide.' as description,
  2 as order_number
FROM 
  journey_steps s
WHERE 
  random() < 0.5
LIMIT 20;

INSERT INTO step_resources (step_id, resource_type, title, url, description, order_number)
SELECT 
  s.id as step_id,
  'tool' as resource_type,
  'Feature Prioritization Template' as title,
  '/resources/tools/feature-prioritization' as url,
  'A template to help you prioritize features for your MVP based on impact and effort.' as description,
  3 as order_number
FROM 
  journey_steps s
WHERE 
  random() < 0.5
LIMIT 20;

-- Insert sample step progress
INSERT INTO step_progress (step_id, company_id, status, started_at, completed_at, time_spent, notes)
SELECT 
  s.id as step_id,
  c.id as company_id,
  CASE floor(random() * 3)
    WHEN 0 THEN 'not_started'
    WHEN 1 THEN 'in_progress'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN random() < 0.7 THEN now() - (random() * interval '30 days')
    ELSE NULL
  END as started_at,
  CASE 
    WHEN random() < 0.3 THEN now() - (random() * interval '15 days')
    ELSE NULL
  END as completed_at,
  CASE 
    WHEN random() < 0.3 THEN floor(random() * 5000)
    ELSE NULL
  END as time_spent,
  CASE 
    WHEN random() < 0.5 THEN 'Working on this step'
    ELSE NULL
  END as notes
FROM 
  journey_steps s
CROSS JOIN 
  companies c
WHERE 
  random() < 0.3
LIMIT 50;

-- Insert sample step completion analytics
INSERT INTO step_completion_analytics (step_id, company_id, time_spent, outcome)
SELECT 
  p.step_id,
  p.company_id,
  p.time_spent,
  jsonb_build_object(
    'notes', p.notes,
    'satisfaction', floor(random() * 5) + 1
  ) as outcome
FROM 
  step_progress p
WHERE 
  p.status = 'completed'
  AND p.time_spent IS NOT NULL;

EOF

echo "Journey Sample Data applied successfully!"
