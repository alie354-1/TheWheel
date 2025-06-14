-- ===============================================
-- JOURNEY ENHANCED SAMPLE DATA
-- ===============================================
-- This script populates the enhanced journey system with sample data
-- Date: June 10, 2025
-- All records use native UUID data type for consistency

-- ===============================================
-- SAMPLE COMPANIES UPDATE (for testing)
-- ===============================================
-- Update industry and stage for existing companies or insert new ones if they don't exist
DO $$ 
DECLARE
    v_techstart_id UUID := 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
    v_healthflow_id UUID := '550e8400-e29b-41d4-a716-446655440000'::uuid;
    v_ecosolutions_id UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid;
BEGIN
    -- Check if companies exist, update industry and stage
    UPDATE companies 
    SET industry = 'Technology', stage = 'mvp' 
    WHERE id = v_techstart_id;
    
    UPDATE companies 
    SET industry = 'Healthcare', stage = 'prototype' 
    WHERE id = v_healthflow_id;
    
    UPDATE companies 
    SET industry = 'Sustainability', stage = 'launched' 
    WHERE id = v_ecosolutions_id;
    
    -- Insert companies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_techstart_id) THEN
        INSERT INTO companies (id, name, industry, stage) 
        VALUES (v_techstart_id, 'TechStart Inc', 'Technology', 'mvp');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_healthflow_id) THEN
        INSERT INTO companies (id, name, industry, stage) 
        VALUES (v_healthflow_id, 'HealthFlow', 'Healthcare', 'prototype');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_ecosolutions_id) THEN
        INSERT INTO companies (id, name, industry, stage) 
        VALUES (v_ecosolutions_id, 'EcoSolutions', 'Sustainability', 'launched');
    END IF;
END $$;

-- ===============================================
-- SAMPLE JOURNEY PHASES (Enhanced)
-- ===============================================
INSERT INTO journey_phases (id, name, description, order_index, estimated_duration_days, icon_url, color, guidance, created_at, updated_at)
VALUES 
    ('e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'Validate', 'Validate your business idea and market opportunity', 1, 30, '/icons/validate.svg', '#3B82F6', 'Focus on understanding your market and validating demand before building', NOW(), NOW()),
    ('a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'Build', 'Develop your minimum viable product and core features', 2, 60, '/icons/build.svg', '#F59E0B', 'Build the simplest version that solves your core problem', NOW(), NOW()),
    ('c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'Launch', 'Bring your product to market and acquire first customers', 3, 45, '/icons/launch.svg', '#10B981', 'Focus on getting real users and gathering feedback', NOW(), NOW()),
    ('d4a716e2-9b41-4465-5440-f47ac10b58cc'::uuid, 'Scale', 'Optimize and scale your business operations', 4, 90, '/icons/scale.svg', '#8B5CF6', 'Systematize processes and prepare for growth', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY DOMAINS
-- ===============================================
INSERT INTO journey_domains (id, name, description, color, icon_url, created_at, updated_at)
VALUES 
    ('b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 'Market Research', 'Understanding your market and competition', '#EF4444', '/icons/market-research.svg', NOW(), NOW()),
    ('c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 'Product Development', 'Building and iterating on your product', '#3B82F6', '/icons/product.svg', NOW(), NOW()),
    ('d4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 'Customer Development', 'Finding and engaging with customers', '#10B981', '/icons/customer.svg', NOW(), NOW()),
    ('e29b41d4-f47a-4465-5440-c10b58cc4372'::uuid, 'Business Operations', 'Setting up business processes and legal structure', '#F59E0B', '/icons/business.svg', NOW(), NOW()),
    ('f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Marketing & Sales', 'Promoting your product and acquiring customers', '#8B5CF6', '/icons/marketing.svg', NOW(), NOW()),
    ('b8a64eef-d372-4465-9dad-11d180b400c0'::uuid, 'Finance & Funding', 'Managing finances and raising capital', '#06B6D4', '/icons/finance.svg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY STEP TEMPLATES
-- ===============================================
INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, objectives, success_criteria, deliverables, guidance, resources, created_at, updated_at)
VALUES 
    ('7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 7, 'Medium', 'Validate problem-solution fit through direct customer feedback', '{"criteria": ["10+ interviews completed", "Clear problem patterns identified", "Solution interest validated"]}', '["Interview notes", "Customer persona document", "Problem validation report"]', 'Focus on listening more than talking. Ask open-ended questions about their current challenges.', '[{"type": "template", "name": "Interview Script Template", "url": "/templates/interview-script.pdf"}]', NOW(), NOW()),
    
    ('18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 5, 'Easy', 'Understand competitive landscape and positioning opportunities', '{"criteria": ["5+ direct competitors analyzed", "Competitive positioning map created", "Differentiation strategy defined"]}', '["Competitor analysis spreadsheet", "Positioning map", "Differentiation strategy"]', 'Look beyond direct competitors - include indirect solutions customers currently use.', '[{"type": "tool", "name": "Ahrefs", "url": "https://ahrefs.com"}, {"type": "template", "name": "Competitor Analysis Template", "url": "/templates/competitor-analysis.xlsx"}]', NOW(), NOW()),
    
    ('3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'Define MVP Features', 'Define the minimum viable product scope and core features', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 1, 3, 'Hard', 'Create a focused MVP that solves the core problem with minimal features', '{"criteria": ["MVP scope clearly defined", "User stories created", "Technical feasibility confirmed"]}', '["MVP specification document", "User story backlog", "Technical architecture plan"]', 'Be ruthless about feature prioritization. Your MVP should solve one problem really well.', '[{"type": "template", "name": "MVP Planning Template", "url": "/templates/mvp-planning.pdf"}]', NOW(), NOW()),
    
    ('61a91ad9-3c5e-4f4e-b5da-0de4348cd0ae'::uuid, 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 3, 2, 'Easy', 'Create online presence and start collecting leads', '{"criteria": ["Landing page published", "Analytics tracking setup", "Lead capture form implemented"]}', '["Live landing page", "Analytics dashboard", "Lead collection system"]', 'Keep it simple and focused on one clear value proposition. Include a strong call-to-action.', '[{"type": "tool", "name": "Webflow", "url": "https://webflow.com"}, {"type": "tool", "name": "Carrd", "url": "https://carrd.co"}]', NOW(), NOW()),
    
    ('bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'Make First Sale', 'Acquire your first paying customer', 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 1, 14, 'Very Hard', 'Validate willingness to pay and refine sales process', '{"criteria": ["First paying customer acquired", "Sales process documented", "Customer feedback collected"]}', '["Sales process documentation", "Customer testimonial", "Revenue tracking system"]', 'Focus on manual sales processes initially. Perfect your pitch before automating.', '[{"type": "template", "name": "Sales Process Template", "url": "/templates/sales-process.pdf"}]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY STEPS (Canonical)
-- ===============================================
INSERT INTO journey_steps (id, template_id, phase_id, domain_id, name, description, estimated_time_days, difficulty, order_index, is_required, created_at, updated_at)
VALUES 
    ('cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 7, 'Medium', 1, true, NOW(), NOW()),
    ('abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 5, 'Easy', 2, true, NOW(), NOW()),
    ('9be16c76-a8f9-4b7b-9b15-64ebfa711073'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 'Define MVP Features', 'Define the minimum viable product scope and core features', 3, 'Hard', 1, true, NOW(), NOW()),
    ('b6a3f3e4-85d2-4f7d-8895-37a7351dfc2a'::uuid, '61a91ad9-3c5e-4f4e-b5da-0de4348cd0ae'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 2, 'Easy', 3, false, NOW(), NOW()),
    ('f6c5da45-0e6a-47df-b0ea-0175bc67c7a7'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Make First Sale', 'Acquire your first paying customer', 14, 'Very Hard', 1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY JOURNEY STEPS
-- ===============================================
INSERT INTO company_journey_steps (id, company_id, canonical_step_id, name, description, phase_id, domain_id, order_index, status, completion_percentage, is_custom, created_at, updated_at)
VALUES 
    ('5a9b3b90-3d6e-47e1-b7f8-dc738b15b4f0'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate our AI-powered analytics platform', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 'completed', 100, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),
    ('2c6bfb8a-2e3a-4a57-9e9c-4d74e42ff331'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, 'Competitive Analysis', 'Analyze competitors in the business intelligence space', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 'completed', 100, false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
    ('c9f1a97d-0c7d-4c35-9f1c-9d5ea238b8d2'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '9be16c76-a8f9-4b7b-9b15-64ebfa711073'::uuid, 'Define MVP Features', 'Define core features for our analytics dashboard MVP', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 1, 'in_progress', 65, false, NOW() - INTERVAL '5 days', NOW()),
    ('e3f4a62c-5ba9-4a12-b92d-f77283a8814c'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'b6a3f3e4-85d2-4f7d-8895-37a7351dfc2a'::uuid, 'Create Landing Page', 'Build landing page for TechStart analytics platform', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 3, 'completed', 100, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days'),
    
    ('dc99e13a-6fcb-4e50-b85d-e21f42103ca2'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, 'Conduct Patient Interviews', 'Interview healthcare providers about patient engagement challenges', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 'in_progress', 40, false, NOW() - INTERVAL '3 days', NOW()),
    ('bde7d3a8-0f15-4a02-8a7f-06e1a2de3651'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, 'Healthcare Competitor Analysis', 'Analyze existing patient engagement solutions', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 'not_started', 0, false, NOW(), NOW()),
    
    ('9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'f6c5da45-0e6a-47df-b0ea-0175bc67c7a7'::uuid, 'First Sustainability Consulting Sale', 'Land our first corporate sustainability consulting client', 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 1, 'completed', 100, false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY JOURNEY PATHS
-- ===============================================
INSERT INTO company_journey_paths (id, company_id, name, description, is_default, is_active, created_at, updated_at)
VALUES 
    ('c2eb7a1f-3891-4e83-bf6d-f8184b1c9682'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Tech Startup Path', 'Standard path for technology startups', true, true, NOW(), NOW()),
    ('7e1a9c82-5d79-4e3b-a53c-15d3a4ed93e8'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Healthcare Startup Path', 'Specialized path for healthcare companies', true, true, NOW(), NOW()),
    ('1d8a46c5-f731-48db-b1e3-83f1d3d9639b'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'Service Business Path', 'Path optimized for service-based businesses', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY STEP PROGRESS
-- ===============================================
INSERT INTO company_step_progress (id, company_id, step_id, status, notes, completion_percentage, completed_at, created_at, updated_at)
VALUES 
    ('7f9e8d3b-1a2c-4e5f-9b8a-7c6d5e4f3d2a'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '5a9b3b90-3d6e-47e1-b7f8-dc738b15b4f0'::uuid, 'completed', 'Completed 12 customer interviews. Key insight: customers want real-time dashboards over batch reports.', 100, NOW() - INTERVAL '8 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),
    ('6e5d4c3b-2a1b-0f9e-8d7c-6f5e4d3c2b1a'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '2c6bfb8a-2e3a-4a57-9e9c-4d74e42ff331'::uuid, 'completed', 'Identified 5 direct competitors. Our AI-powered insights are a key differentiator.', 100, NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
    ('5d4c3b2a-1f0e-9d8c-7b6a-5e4d3c2b1a0f'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'c9f1a97d-0c7d-4c35-9f1c-9d5ea238b8d2'::uuid, 'in_progress', 'Defined core dashboard features. Still working on user permission system design.', 65, NULL, NOW() - INTERVAL '5 days', NOW()),
    ('4c3b2a1f-0e9d-8c7b-6a5e-4d3c2b1a0f9e'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'dc99e13a-6fcb-4e50-b85d-e21f42103ca2'::uuid, 'in_progress', 'Interviewed 4 doctors so far. Common theme: current tools are too complex.', 40, NULL, NOW() - INTERVAL '3 days', NOW()),
    ('3b2a1f0e-9d8c-7b6a-5e4d-3c2b1a0f9e8d'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, '9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c'::uuid, 'completed', 'Signed $15K contract with local manufacturing company for sustainability audit.', 100, NOW() - INTERVAL '15 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE TEMPLATE UPDATE NOTIFICATIONS
-- ===============================================
INSERT INTO template_update_notifications (id, template_id, company_id, notification_type, title, message, changes_summary, action_required, priority, is_read, created_at, updated_at)
VALUES 
    ('2a1f0e9d-8c7b-6a5e-4d3c-2b1a0f9e8d7c'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'template_update', 'Customer Interview Template Updated', 'The customer interview template has been updated with new question frameworks based on recent best practices.', '{"new_questions": 3, "updated_frameworks": 2, "new_resources": 1}', false, 6, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('1f0e9d8c-7b6a-5e4d-3c2b-1a0f9e8d7c6b'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'enhancement', 'New Competitor Analysis Tools Available', 'We''ve added integration with new market research tools to make competitor analysis more efficient.', '{"new_integrations": 2, "automated_features": 1}', false, 4, false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('0e9d8c7b-6a5e-4d3c-2b1a-0f9e8d7c6b5a'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, NULL, 'version_release', 'MVP Planning Framework 2.0 Released', 'Major update to the MVP planning framework with new prioritization methods and validation techniques.', '{"new_methods": 4, "updated_templates": 3, "case_studies": 2}', true, 3, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE PEER PROGRESS SHARING
-- ===============================================
INSERT INTO peer_progress_sharing (id, company_id, step_id, sharing_level, progress_data, industry, company_stage, insights_shared, is_milestone, visibility, created_at, updated_at)
VALUES 
    ('9d8c7b6a-5e4d-3c2b-1a0f-9e8d7c6b5a4f'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '5a9b3b90-3d6e-47e1-b7f8-dc738b15b4f0'::uuid, 'anonymous', '{"completion_time_days": 7, "interviews_conducted": 12, "key_insights": ["real-time preference", "mobile-first requirement"]}', 'Technology', 'mvp', 'Focus on mobile experience - 8/12 customers primarily used mobile for analytics', true, 'community', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    ('8c7b6a5e-4d3c-2b1a-0f9e-8d7c6b5a4f3e'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, '9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c'::uuid, 'company_name', '{"completion_time_days": 5, "contract_value": 15000, "success_factors": ["industry connections", "case study presentation"]}', 'Sustainability', 'launched', 'Having a strong case study made all the difference in closing the first sale', true, 'community', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE EXPERT RECOMMENDATIONS
-- ===============================================
INSERT INTO step_expert_recommendations (id, step_template_id, expert_id, recommendation_text, expertise_areas, success_rate, estimated_time_hours, pricing_range_min, pricing_range_max, priority, is_active, created_at, updated_at)
VALUES 
    ('7b6a5e4d-3c2b-1a0f-9e8d-7c6b5a4f3e2d'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'de1c0b9a-8f7e-6d5c-4b3a-2e1d0c9b8a7f'::uuid, 'Focus on behavioral questions rather than feature requests. Ask about their current workflow and pain points.', '{"customer_development", "product_management"}', 92.5, 2, 150, 300, 8, true, NOW(), NOW()),
    ('6a5e4d3c-2b1a-0f9e-8d7c-6b5a4f3e2d1c'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'b9a8f7e6-d5c4-b3a2-e1d0-c9b8a7f6e5d4'::uuid, 'Start with the riskiest assumptions first. Your MVP should test these assumptions as quickly as possible.', '{"product_strategy", "lean_startup"}', 88.3, 3, 200, 450, 9, true, NOW(), NOW()),
    ('5e4d3c2b-1a0f-9e8d-7c6b-5a4f3e2d1c0b'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'a8f7e6d5-c4b3-a2e1-d0c9-b8a7f6e5d4c3'::uuid, 'Perfect your demo before scaling sales efforts. Record yourself and identify areas for improvement.', '{"sales", "go_to_market"}', 95.1, 4, 300, 600, 10, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY MILESTONES
-- ===============================================
INSERT INTO journey_milestones (id, company_id, milestone_type, milestone_name, description, achieved_at, celebration_level, metadata, created_at)
VALUES 
    ('4d3c2b1a-0f9e-8d7c-6b5a-4f3e2d1c0b9a'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'phase_completion', 'Validation Phase Complete', 'Successfully completed the validation phase with strong market validation', NOW() - INTERVAL '7 days', 'major', '{"phase_id": "e29b41d4-a716-4465-5440-f47ac10b58cc", "steps_completed": 3, "time_taken_days": 15}', NOW() - INTERVAL '7 days'),
    ('3c2b1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'custom', 'First Revenue', 'Achieved first revenue milestone with $15K contract', NOW() - INTERVAL '15 days', 'major', '{"revenue_amount": 15000, "milestone_type": "first_sale"}', NOW() - INTERVAL '15 days'),
    ('2b1a0f9e-8d7c-6b5a-4f3e-2d1c0b9a8f7e'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'step_streak', '3-Day Streak', 'Completed activities for 3 consecutive days', NOW() - INTERVAL '2 days', 'minor', '{"streak_days": 3, "activities_completed": 8}', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE SMART RECOMMENDATIONS
-- ===============================================
INSERT INTO journey_smart_recommendations (id, company_id, recommendation_type, title, description, priority, confidence_score, estimated_impact, action_items, related_step_ids, expires_at, is_applied, created_at, updated_at)
VALUES 
    ('1a0f9e8d-7c6b-5a4f-3e2d-1c0b9a8f7e6d'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'next_step', 'Focus on Technical Architecture', 'Based on your MVP definition progress, it''s time to start planning your technical architecture to avoid technical debt later.', 'high', 0.85, 'Prevent 2-3 weeks of refactoring later', '{"Define database schema", "Choose technology stack", "Plan API structure"}', '{"c9f1a97d-0c7d-4c35-9f1c-9d5ea238b8d2"::uuid}', NOW() + INTERVAL '7 days', false, NOW(), NOW()),
    
    ('0f9e8d7c-6b5a-4f3e-2d1c-0b9a8f7e6d5c'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'optimization', 'Accelerate Customer Interviews', 'You''re progressing slowly on customer interviews. Consider these strategies to speed up the process.', 'medium', 0.72, 'Complete validation phase 1 week earlier', '{"Use video calls instead of in-person", "Leverage existing network", "Offer small incentives"}', '{"dc99e13a-6fcb-4e50-b85d-e21f42103ca2"::uuid}', NOW() + INTERVAL '5 days', false, NOW(), NOW()),
    
    ('f9e8d7c6-b5a4-f3e2-d1c0-b9a8f7e6d5c4'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'resource', 'Scale Your Sales Process', 'Congratulations on your first sale! Now is the time to systematize your sales process for scalability.', 'urgent', 0.91, 'Enable consistent 2-3 sales per month', '{"Document sales playbook", "Create proposal templates", "Set up CRM system"}', '{"9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c"::uuid}', NOW() + INTERVAL '3 days', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE STEP COMPLETION ANALYTICS
-- ===============================================
INSERT INTO step_completion_analytics (id, step_template_id, company_id, completion_time_days, difficulty_rating, success_factors, blockers_encountered, tools_used, industry, company_stage, team_size, created_at)
VALUES 
    ('e8d7c6b5-a4f3-e2d1-c0b9-a8f7e6d5c4b3'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 7, 3, '{"existing_network", "clear_interview_script", "follow_up_system"}', '{"scheduling_conflicts", "no_show_rate"}', '{"calendly", "zoom", "notion"}', 'Technology', 'mvp', 3, NOW() - INTERVAL '8 days'),
    ('d7c6b5a4-f3e2-d1c0-b9a8-f7e6d5c4b3a2'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 5, 4, '{"industry_connections", "strong_case_study", "clear_value_prop"}', '{"price_objections", "decision_timeline"}', '{"hubspot", "docusign", "loom"}', 'Sustainability', 'launched', 2, NOW() - INTERVAL '15 days'),
    ('c6b5a4f3-e2d1-c0b9-a8f7-e6d5c4b3a2e1'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 5, 2, '{"comprehensive_research", "positioning_insights"}', '{"information_availability"}', '{"ahrefs", "similarweb", "google_sheets"}', 'Technology', 'mvp', 3, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;-- ===============================================
-- JOURNEY ENHANCED SAMPLE DATA (UPDATED)
-- ===============================================
-- This script populates the enhanced journey system with sample data
-- Date: June 11, 2025
-- Ensures all IDs are properly formatted UUIDs with appropriate types
-- Includes validation checks to prevent "column does not exist" errors

-- ===============================================
-- SAMPLE COMPANIES UPDATE (for testing)
-- ===============================================
-- Update industry and stage for existing companies or insert new ones if they don't exist
DO $$ 
DECLARE
    v_techstart_id UUID := 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
    v_healthflow_id UUID := '550e8400-e29b-41d4-a716-446655440000'::uuid;
    v_ecosolutions_id UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid;
BEGIN
    -- First verify companies table exists and has the right structure
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        -- UPSERT pattern for companies - safer than separate update/insert
        INSERT INTO companies (id, name, industry, stage, created_at, updated_at) 
        VALUES 
            (v_techstart_id, 'TechStart Inc', 'Technology', 'mvp', NOW(), NOW()),
            (v_healthflow_id, 'HealthFlow', 'Healthcare', 'prototype', NOW(), NOW()),
            (v_ecosolutions_id, 'EcoSolutions', 'Sustainability', 'launched', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET 
            industry = EXCLUDED.industry,
            stage = EXCLUDED.stage,
            updated_at = NOW();
            
        RAISE NOTICE 'Companies data upserted successfully';
    ELSE
        RAISE EXCEPTION 'Companies table does not exist or does not have proper UUID id column';
    END IF;
END $$;

-- ===============================================
-- SAMPLE JOURNEY PHASES (Enhanced)
-- ===============================================
DO $$ 
BEGIN
    -- First verify journey_phases table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_phases' AND schemaname = 'public') THEN
        -- Check if the table has all required columns
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_phases' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            -- Get column list to adjust insert based on available columns
            DECLARE column_list text[];
            BEGIN
                SELECT array_agg(column_name) INTO column_list
                FROM information_schema.columns
                WHERE table_name = 'journey_phases' AND table_schema = 'public';
                
                -- Insert data with UUID type for id and dynamic column selection
                INSERT INTO journey_phases (id, name, description, order_index, 
                    CASE WHEN 'estimated_duration_days' = ANY(column_list) THEN 'estimated_duration_days' ELSE NULL END,
                    CASE WHEN 'icon_url' = ANY(column_list) THEN 'icon_url' ELSE NULL END,
                    CASE WHEN 'color' = ANY(column_list) THEN 'color' ELSE NULL END,
                    CASE WHEN 'guidance' = ANY(column_list) THEN 'guidance' ELSE NULL END,
                    created_at, updated_at)
                VALUES 
                    ('e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'Validate', 'Validate your business idea and market opportunity', 1, 
                     CASE WHEN 'estimated_duration_days' = ANY(column_list) THEN 30 ELSE NULL END,
                     CASE WHEN 'icon_url' = ANY(column_list) THEN '/icons/validate.svg' ELSE NULL END,
                     CASE WHEN 'color' = ANY(column_list) THEN '#3B82F6' ELSE NULL END,
                     CASE WHEN 'guidance' = ANY(column_list) THEN 'Focus on understanding your market and validating demand before building' ELSE NULL END,
                     NOW(), NOW()),
                    ('a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'Build', 'Develop your minimum viable product and core features', 2, 
                     CASE WHEN 'estimated_duration_days' = ANY(column_list) THEN 60 ELSE NULL END,
                     CASE WHEN 'icon_url' = ANY(column_list) THEN '/icons/build.svg' ELSE NULL END,
                     CASE WHEN 'color' = ANY(column_list) THEN '#F59E0B' ELSE NULL END,
                     CASE WHEN 'guidance' = ANY(column_list) THEN 'Build the simplest version that solves your core problem' ELSE NULL END,
                     NOW(), NOW()),
                    ('c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'Launch', 'Bring your product to market and acquire first customers', 3, 
                     CASE WHEN 'estimated_duration_days' = ANY(column_list) THEN 45 ELSE NULL END,
                     CASE WHEN 'icon_url' = ANY(column_list) THEN '/icons/launch.svg' ELSE NULL END,
                     CASE WHEN 'color' = ANY(column_list) THEN '#10B981' ELSE NULL END,
                     CASE WHEN 'guidance' = ANY(column_list) THEN 'Focus on getting real users and gathering feedback' ELSE NULL END,
                     NOW(), NOW()),
                    ('d4a716e2-9b41-4465-5440-f47ac10b58cc'::uuid, 'Scale', 'Optimize and scale your business operations', 4, 
                     CASE WHEN 'estimated_duration_days' = ANY(column_list) THEN 90 ELSE NULL END,
                     CASE WHEN 'icon_url' = ANY(column_list) THEN '/icons/scale.svg' ELSE NULL END,
                     CASE WHEN 'color' = ANY(column_list) THEN '#8B5CF6' ELSE NULL END,
                     CASE WHEN 'guidance' = ANY(column_list) THEN 'Systematize processes and prepare for growth' ELSE NULL END,
                     NOW(), NOW())
                ON CONFLICT (id) DO NOTHING;
                
                RAISE NOTICE 'Journey phases inserted successfully';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error inserting journey phases: %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'journey_phases table does not have required columns';
        END IF;
    ELSE
        RAISE NOTICE 'journey_phases table does not exist, skipping phase data';
    END IF;
END $$;

-- ===============================================
-- SAMPLE JOURNEY DOMAINS
-- ===============================================
INSERT INTO journey_domains (id, name, description, color, icon_url, created_at, updated_at)
VALUES 
    ('b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 'Market Research', 'Understanding your market and competition', '#EF4444', '/icons/market-research.svg', NOW(), NOW()),
    ('c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 'Product Development', 'Building and iterating on your product', '#3B82F6', '/icons/product.svg', NOW(), NOW()),
    ('d4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 'Customer Development', 'Finding and engaging with customers', '#10B981', '/icons/customer.svg', NOW(), NOW()),
    ('e29b41d4-f47a-4465-5440-c10b58cc4372'::uuid, 'Business Operations', 'Setting up business processes and legal structure', '#F59E0B', '/icons/business.svg', NOW(), NOW()),
    ('f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Marketing & Sales', 'Promoting your product and acquiring customers', '#8B5CF6', '/icons/marketing.svg', NOW(), NOW()),
    ('b8a64eef-d372-4465-9dad-11d180b400c0'::uuid, 'Finance & Funding', 'Managing finances and raising capital', '#06B6D4', '/icons/finance.svg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY STEP TEMPLATES
-- ===============================================
INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, objectives, success_criteria, deliverables, guidance, resources, created_at, updated_at)
VALUES 
    ('7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 7, 'Medium', 'Validate problem-solution fit through direct customer feedback', '{"criteria": ["10+ interviews completed", "Clear problem patterns identified", "Solution interest validated"]}', '["Interview notes", "Customer persona document", "Problem validation report"]', 'Focus on listening more than talking. Ask open-ended questions about their current challenges.', '[{"type": "template", "name": "Interview Script Template", "url": "/templates/interview-script.pdf"}]', NOW(), NOW()),
    
    ('18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 5, 'Easy', 'Understand competitive landscape and positioning opportunities', '{"criteria": ["5+ direct competitors analyzed", "Competitive positioning map created", "Differentiation strategy defined"]}', '["Competitor analysis spreadsheet", "Positioning map", "Differentiation strategy"]', 'Look beyond direct competitors - include indirect solutions customers currently use.', '[{"type": "tool", "name": "Ahrefs", "url": "https://ahrefs.com"}, {"type": "template", "name": "Competitor Analysis Template", "url": "/templates/competitor-analysis.xlsx"}]', NOW(), NOW()),
    
    ('3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'Define MVP Features', 'Define the minimum viable product scope and core features', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 1, 3, 'Hard', 'Create a focused MVP that solves the core problem with minimal features', '{"criteria": ["MVP scope clearly defined", "User stories created", "Technical feasibility confirmed"]}', '["MVP specification document", "User story backlog", "Technical architecture plan"]', 'Be ruthless about feature prioritization. Your MVP should solve one problem really well.', '[{"type": "template", "name": "MVP Planning Template", "url": "/templates/mvp-planning.pdf"}]', NOW(), NOW()),
    
    ('61a91ad9-3c5e-4f4e-b5da-0de4348cd0ae'::uuid, 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 3, 2, 'Easy', 'Create online presence and start collecting leads', '{"criteria": ["Landing page published", "Analytics tracking setup", "Lead capture form implemented"]}', '["Live landing page", "Analytics dashboard", "Lead collection system"]', 'Keep it simple and focused on one clear value proposition. Include a strong call-to-action.', '[{"type": "tool", "name": "Webflow", "url": "https://webflow.com"}, {"type": "tool", "name": "Carrd", "url": "https://carrd.co"}]', NOW(), NOW()),
    
    ('bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'Make First Sale', 'Acquire your first paying customer', 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 1, 14, 'Very Hard', 'Validate willingness to pay and refine sales process', '{"criteria": ["First paying customer acquired", "Sales process documented", "Customer feedback collected"]}', '["Sales process documentation", "Customer testimonial", "Revenue tracking system"]', 'Focus on manual sales processes initially. Perfect your pitch before automating.', '[{"type": "template", "name": "Sales Process Template", "url": "/templates/sales-process.pdf"}]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY STEPS (Canonical)
-- ===============================================
INSERT INTO journey_steps (id, template_id, phase_id, domain_id, name, description, estimated_time_days, difficulty, order_index, is_required, created_at, updated_at)
VALUES 
    ('cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 7, 'Medium', 1, true, NOW(), NOW()),
    ('abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 5, 'Easy', 2, true, NOW(), NOW()),
    ('9be16c76-a8f9-4b7b-9b15-64ebfa711073'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 'Define MVP Features', 'Define the minimum viable product scope and core features', 3, 'Hard', 1, true, NOW(), NOW()),
    ('b6a3f3e4-85d2-4f7d-8895-37a7351dfc2a'::uuid, '61a91ad9-3c5e-4f4e-b5da-0de4348cd0ae'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 2, 'Easy', 3, false, NOW(), NOW()),
    ('f6c5da45-0e6a-47df-b0ea-0175bc67c7a7'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Make First Sale', 'Acquire your first paying customer', 14, 'Very Hard', 1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY JOURNEY STEPS
-- ===============================================
DO $$ 
BEGIN
    -- First verify company_journey_steps table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps' AND schemaname = 'public') THEN
        -- Check if the table has the required company_id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'company_id' AND data_type = 'uuid'
        ) THEN
            INSERT INTO company_journey_steps (id, company_id, canonical_step_id, name, description, phase_id, domain_id, order_index, status, completion_percentage, is_custom, created_at, updated_at)
            VALUES 
                ('5a9b3b90-3d6e-47e1-b7f8-dc738b15b4f0'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate our AI-powered analytics platform', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 'completed', 100, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),
                ('2c6bfb8a-2e3a-4a57-9e9c-4d74e42ff331'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, 'Competitive Analysis', 'Analyze competitors in the business intelligence space', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 'completed', 100, false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
                ('c9f1a97d-0c7d-4c35-9f1c-9d5ea238b8d2'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '9be16c76-a8f9-4b7b-9b15-64ebfa711073'::uuid, 'Define MVP Features', 'Define core features for our analytics dashboard MVP', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 1, 'in_progress', 65, false, NOW() - INTERVAL '5 days', NOW()),
                ('e3f4a62c-5ba9-4a12-b92d-f77283a8814c'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'b6a3f3e4-85d2-4f7d-8895-37a7351dfc2a'::uuid, 'Create Landing Page', 'Build landing page for TechStart analytics platform', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 3, 'completed', 100, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days'),
                
                ('dc99e13a-6fcb-4e50-b85d-e21f42103ca2'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, 'Conduct Patient Interviews', 'Interview healthcare providers about patient engagement challenges', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 'in_progress', 40, false, NOW() - INTERVAL '3 days', NOW()),
                ('bde7d3a8-0f15-4a02-8a7f-06e1a2de3651'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, 'Healthcare Competitor Analysis', 'Analyze existing patient engagement solutions', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 'not_started', 0, false, NOW(), NOW()),
                
                ('9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'f6c5da45-0e6a-47df-b0ea-0175bc67c7a7'::uuid, 'First Sustainability Consulting Sale', 'Land our first corporate sustainability consulting client', 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 1, 'completed', 100, false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days')
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Company journey steps inserted successfully';
        ELSE 
            RAISE NOTICE 'company_journey_steps table does not have company_id column of UUID type';
        END IF;
    ELSE
        RAISE NOTICE 'company_journey_steps table does not exist, skipping data';
    END IF;
END $$;

-- ===============================================
-- SAMPLE COMPANY JOURNEY PATHS
-- ===============================================
INSERT INTO company_journey_paths (id, company_id, name, description, is_default, is_active, created_at, updated_at)
VALUES 
    ('c2eb7a1f-3891-4e83-bf6d-f8184b1c9682'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Tech Startup Path', 'Standard path for technology startups', true, true, NOW(), NOW()),
    ('7e1a9c82-5d79-4e3b-a53c-15d3a4ed93e8'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Healthcare Startup Path', 'Specialized path for healthcare companies', true, true, NOW(), NOW()),
    ('1d8a46c5-f731-48db-b1e3-83f1d3d9639b'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'Service Business Path', 'Path optimized for service-based businesses', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY STEP PROGRESS
-- ===============================================
INSERT INTO company_step_progress (id, company_id, step_id, status, notes, completion_percentage, completed_at, created_at, updated_at)
VALUES 
    ('7f9e8d3b-1a2c-4e5f-9b8a-7c6d5e4f3d2a'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '5a9b3b90-3d6e-47e1-b7f8-dc738b15b4f0'::uuid, 'completed', 'Completed 12 customer interviews. Key insight: customers want real-time dashboards over batch reports.', 100, NOW() - INTERVAL '8 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),
    ('6e5d4c3b-2a1b-0f9e-8d7c-6f5e4d3c2b1a'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '2c6bfb8a-2e3a-4a57-9e9c-4d74e42ff331'::uuid, 'completed', 'Identified 5 direct competitors. Our AI-powered insights are a key differentiator.', 100, NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
    ('5d4c3b2a-1f0e-9d8c-7b6a-5e4d3c2b1a0f'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'c9f1a97d-0c7d-4c35-9f1c-9d5ea238b8d2'::uuid, 'in_progress', 'Defined core dashboard features. Still working on user permission system design.', 65, NULL, NOW() - INTERVAL '5 days', NOW()),
    ('4c3b2a1f-0e9d-8c7b-6a5e-4d3c2b1a0f9e'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'dc99e13a-6fcb-4e50-b85d-e21f42103ca2'::uuid, 'in_progress', 'Interviewed 4 doctors so far. Common theme: current tools are too complex.', 40, NULL, NOW() - INTERVAL '3 days', NOW()),
    ('3b2a1f0e-9d8c-7b6a-5e4d-3c2b1a0f9e8d'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, '9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c'::uuid, 'completed', 'Signed $15K contract with local manufacturing company for sustainability audit.', 100, NOW() - INTERVAL '15 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE TEMPLATE UPDATE NOTIFICATIONS
-- ===============================================
INSERT INTO template_update_notifications (id, template_id, company_id, notification_type, title, message, changes_summary, action_required, priority, is_read, created_at, updated_at)
VALUES 
    ('2a1f0e9d-8c7b-6a5e-4d3c-2b1a0f9e8d7c'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'template_update', 'Customer Interview Template Updated', 'The customer interview template has been updated with new question frameworks based on recent best practices.', '{"new_questions": 3, "updated_frameworks": 2, "new_resources": 1}', false, 6, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('1f0e9d8c-7b6a-5e4d-3c2b-1a0f9e8d7c6b'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'enhancement', 'New Competitor Analysis Tools Available', 'We''ve added integration with new market research tools to make competitor analysis more efficient.', '{"new_integrations": 2, "automated_features": 1}', false, 4, false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('0e9d8c7b-6a5e-4d3c-2b1a-0f9e8d7c6b5a'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, NULL, 'version_release', 'MVP Planning Framework 2.0 Released', 'Major update to the MVP planning framework with new prioritization methods and validation techniques.', '{"new_methods": 4, "updated_templates": 3, "case_studies": 2}', true, 3, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE PEER PROGRESS SHARING
-- ===============================================
INSERT INTO peer_progress_sharing (id, company_id, step_id, sharing_level, progress_data, industry, company_stage, insights_shared, is_milestone, visibility, created_at, updated_at)
VALUES 
    ('9d8c7b6a-5e4d-3c2b-1a0f-9e8d7c6b5a4f'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '5a9b3b90-3d6e-47e1-b7f8-dc738b15b4f0'::uuid, 'anonymous', '{"completion_time_days": 7, "interviews_conducted": 12, "key_insights": ["real-time preference", "mobile-first requirement"]}', 'Technology', 'mvp', 'Focus on mobile experience - 8/12 customers primarily used mobile for analytics', true, 'community', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    ('8c7b6a5e-4d3c-2b1a-0f9e-8d7c6b5a4f3e'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, '9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c'::uuid, 'company_name', '{"completion_time_days": 5, "contract_value": 15000, "success_factors": ["industry connections", "case study presentation"]}', 'Sustainability', 'launched', 'Having a strong case study made all the difference in closing the first sale', true, 'community', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE EXPERT RECOMMENDATIONS
-- ===============================================
INSERT INTO step_expert_recommendations (id, step_template_id, expert_id, recommendation_text, expertise_areas, success_rate, estimated_time_hours, pricing_range_min, pricing_range_max, priority, is_active, created_at, updated_at)
VALUES 
    ('7b6a5e4d-3c2b-1a0f-9e8d-7c6b5a4f3e2d'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'de1c0b9a-8f7e-6d5c-4b3a-2e1d0c9b8a7f'::uuid, 'Focus on behavioral questions rather than feature requests. Ask about their current workflow and pain points.', '{"customer_development", "product_management"}', 92.5, 2, 150, 300, 8, true, NOW(), NOW()),
    ('6a5e4d3c-2b1a-0f9e-8d7c-6b5a4f3e2d1c'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'b9a8f7e6-d5c4-b3a2-e1d0-c9b8a7f6e5d4'::uuid, 'Start with the riskiest assumptions first. Your MVP should test these assumptions as quickly as possible.', '{"product_strategy", "lean_startup"}', 88.3, 3, 200, 450, 9, true, NOW(), NOW()),
    ('5e4d3c2b-1a0f-9e8d-7c6b-5a4f3e2d1c0b'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'a8f7e6d5-c4b3-a2e1-d0c9-b8a7f6e5d4c3'::uuid, 'Perfect your demo before scaling sales efforts. Record yourself and identify areas for improvement.', '{"sales", "go_to_market"}', 95.1, 4, 300, 600, 10, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY MILESTONES
-- ===============================================
INSERT INTO journey_milestones (id, company_id, milestone_type, milestone_name, description, achieved_at, celebration_level, metadata, created_at)
VALUES 
    ('4d3c2b1a-0f9e-8d7c-6b5a-4f3e2d1c0b9a'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'phase_completion', 'Validation Phase Complete', 'Successfully completed the validation phase with strong market validation', NOW() - INTERVAL '7 days', 'major', '{"phase_id": "e29b41d4-a716-4465-5440-f47ac10b58cc", "steps_completed": 3, "time_taken_days": 15}', NOW() - INTERVAL '7 days'),
    ('3c2b1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'custom', 'First Revenue', 'Achieved first revenue milestone with $15K contract', NOW() - INTERVAL '15 days', 'major', '{"revenue_amount": 15000, "milestone_type": "first_sale"}', NOW() - INTERVAL '15 days'),
    ('2b1a0f9e-8d7c-6b5a-4f3e-2d1c0b9a8f7e'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'step_streak', '3-Day Streak', 'Completed activities for 3 consecutive days', NOW() - INTERVAL '2 days', 'minor', '{"streak_days": 3, "activities_completed": 8}', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE SMART RECOMMENDATIONS
-- ===============================================
INSERT INTO journey_smart_recommendations (id, company_id, recommendation_type, title, description, priority, confidence_score, estimated_impact, action_items, related_step_ids, expires_at, is_applied, created_at, updated_at)
VALUES 
    ('1a0f9e8d-7c6b-5a4f-3e2d-1c0b9a8f7e6d'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'next_step', 'Focus on Technical Architecture', 'Based on your MVP definition progress, it''s time to start planning your technical architecture to avoid technical debt later.', 'high', 0.85, 'Prevent 2-3 weeks of refactoring later', '{"Define database schema", "Choose technology stack", "Plan API structure"}', '{"c9f1a97d-0c7d-4c35-9f1c-9d5ea238b8d2"::uuid}', NOW() + INTERVAL '7 days', false, NOW(), NOW()),
    
    ('0f9e8d7c-6b5a-4f3e-2d1c-0b9a8f7e6d5c'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'optimization', 'Accelerate Customer Interviews', 'You''re progressing slowly on customer interviews. Consider these strategies to speed up the process.', 'medium', 0.72, 'Complete validation phase 1 week earlier', '{"Use video calls instead of in-person", "Leverage existing network", "Offer small incentives"}', '{"dc99e13a-6fcb-4e50-b85d-e21f42103ca2"::uuid}', NOW() + INTERVAL '5 days', false, NOW(), NOW()),
    
    ('f9e8d7c6-b5a4-f3e2-d1c0-b9a8f7e6d5c4'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'resource', 'Scale Your Sales Process', 'Congratulations on your first sale! Now is the time to systematize your sales process for scalability.', 'urgent', 0.91, 'Enable consistent 2-3 sales per month', '{"Document sales playbook", "Create proposal templates", "Set up CRM system"}', '{"9f8b9c4a-2573-4db0-8c71-5b5e8a217d5c"::uuid}', NOW() + INTERVAL '3 days', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE STEP COMPLETION ANALYTICS
-- ===============================================
INSERT INTO step_completion_analytics (id, step_template_id, company_id, completion_time_days, difficulty_rating, success_factors, blockers_encountered, tools_used, industry, company_stage, team_size, created_at)
VALUES 
    ('e8d7c6b5-a4f3-e2d1-c0b9-a8f7e6d5c4b3'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 7, 3, '{"existing_network", "clear_interview_script", "follow_up_system"}', '{"scheduling_conflicts", "no_show_rate"}', '{"calendly", "zoom", "notion"}', 'Technology', 'mvp', 3, NOW() - INTERVAL '8 days'),
    ('d7c6b5a4-f3e2-d1c0-b9a8-f7e6d5c4b3a2'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 5, 4, '{"industry_connections", "strong_case_study", "clear_value_prop"}', '{"price_objections", "decision_timeline"}', '{"hubspot", "docusign", "loom"}', 'Sustainability', 'launched', 2, NOW() - INTERVAL '15 days'),
    ('c6b5a4f3-e2d1-c0b9-a8f7-e6d5c4b3a2e1'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 5, 2, '{"comprehensive_research", "positioning_insights"}', '{"information_availability"}', '{"ahrefs", "similarweb", "google_sheets"}', 'Technology', 'mvp', 3, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;
