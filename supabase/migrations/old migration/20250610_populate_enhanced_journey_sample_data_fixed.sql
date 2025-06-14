-- ===============================================
-- JOURNEY ENHANCED SAMPLE DATA (FIXED)
-- ===============================================
-- This script populates the enhanced journey system with sample data
-- Date: June 11, 2025
-- Ensures all IDs are UUID type and properly references tables in the schema
-- Includes error handling to prevent issues with missing tables/columns

-- ===============================================
-- SAMPLE COMPANIES UPDATE (for testing)
-- ===============================================
DO $$ 
DECLARE
    v_techstart_id UUID := 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
    v_healthflow_id UUID := '550e8400-e29b-41d4-a716-446655440000'::uuid;
    v_ecosolutions_id UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid;
    table_exists boolean;
BEGIN
    -- First verify companies table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if the table has required columns
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
            RAISE NOTICE 'Companies table does not have proper UUID id column, skipping company data';
        END IF;
    ELSE
        RAISE NOTICE 'Companies table does not exist, skipping company data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting company data: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE JOURNEY PHASES
-- ===============================================
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check if journey_phases table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'journey_phases' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if id column is UUID type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_phases' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            INSERT INTO journey_phases (id, name, description, order_index, estimated_duration_days, icon_url, color, guidance, created_at, updated_at)
            VALUES 
                ('e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'Validate', 'Validate your business idea and market opportunity', 1, 30, '/icons/validate.svg', '#3B82F6', 'Focus on understanding your market and validating demand before building', NOW(), NOW()),
                ('a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'Build', 'Develop your minimum viable product and core features', 2, 60, '/icons/build.svg', '#F59E0B', 'Build the simplest version that solves your core problem', NOW(), NOW()),
                ('c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'Launch', 'Bring your product to market and acquire first customers', 3, 45, '/icons/launch.svg', '#10B981', 'Focus on getting real users and gathering feedback', NOW(), NOW()),
                ('d4a716e2-9b41-4465-5440-f47ac10b58cc'::uuid, 'Scale', 'Optimize and scale your business operations', 4, 90, '/icons/scale.svg', '#8B5CF6', 'Systematize processes and prepare for growth', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Journey phases inserted successfully';
        ELSE
            RAISE NOTICE 'journey_phases table does not have UUID id column, skipping phase data';
        END IF;
    ELSE
        RAISE NOTICE 'journey_phases table does not exist, skipping phase data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting journey phases: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE JOURNEY DOMAINS
-- ===============================================
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check if journey_domains table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'journey_domains' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if id column is UUID type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_domains' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            INSERT INTO journey_domains (id, name, description, phase_id, order_index, color, icon_url, created_at, updated_at)
            VALUES 
                ('b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 'Market Research', 'Understanding your market and competition', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 1, '#EF4444', '/icons/market-research.svg', NOW(), NOW()),
                ('c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 'Product Development', 'Building and iterating on your product', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 1, '#3B82F6', '/icons/product.svg', NOW(), NOW()),
                ('d4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 'Customer Development', 'Finding and engaging with customers', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 2, '#10B981', '/icons/customer.svg', NOW(), NOW()),
                ('e29b41d4-f47a-4465-5440-c10b58cc4372'::uuid, 'Business Operations', 'Setting up business processes and legal structure', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 2, '#F59E0B', '/icons/business.svg', NOW(), NOW()),
                ('f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Marketing & Sales', 'Promoting your product and acquiring customers', 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 1, '#8B5CF6', '/icons/marketing.svg', NOW(), NOW()),
                ('b8a64eef-d372-4465-9dad-11d180b400c0'::uuid, 'Finance & Funding', 'Managing finances and raising capital', 'd4a716e2-9b41-4465-5440-f47ac10b58cc'::uuid, 1, '#06B6D4', '/icons/finance.svg', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Journey domains inserted successfully';
        ELSE
            RAISE NOTICE 'journey_domains table does not have UUID id column, skipping domain data';
        END IF;
    ELSE
        RAISE NOTICE 'journey_domains table does not exist, skipping domain data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting journey domains: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE JOURNEY STEP TEMPLATES
-- ===============================================
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check if journey_step_templates table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_templates' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if id column is UUID type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_step_templates' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, order_index, difficulty, estimated_time_days, content_markdown, objectives, success_criteria, deliverables, guidance, resources, created_at, updated_at)
            VALUES 
                ('7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 1, 'intermediate', 7, '# Customer Interview Guide\n\nThis guide will help you conduct effective customer interviews to validate your problem hypothesis.\n\n## Preparation\n- Schedule 30-45 minute interviews with potential customers\n- Prepare open-ended questions about their current challenges\n- Listen more than you talk\n\n## Key Questions\n1. What are your biggest challenges with [problem area]?\n2. How are you currently solving this problem?\n3. What would an ideal solution look like?', 'Validate problem-solution fit through direct customer feedback', '{"criteria": ["10+ interviews completed", "Clear problem patterns identified", "Solution interest validated"]}', '["Interview notes", "Customer persona document", "Problem validation report"]', 'Focus on listening more than talking. Ask open-ended questions about their current challenges.', '[{"type": "template", "name": "Interview Script Template", "url": "/templates/interview-script.pdf"}]', NOW(), NOW()),
                
                ('18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 2, 'beginner', 5, '# Competitive Analysis Framework\n\nThis framework will help you analyze your competitors and position your product effectively.\n\n## Direct Competitors\n- Identify at least 5 direct competitors\n- Analyze their pricing, features, and market positioning\n- Identify strengths and weaknesses\n\n## Indirect Competitors\n- Identify alternative solutions customers are currently using\n- Understand why customers choose these alternatives\n\n## Positioning\n- Create a positioning map\n- Identify gaps in the market\n- Define your unique value proposition', 'Understand competitive landscape and positioning opportunities', '{"criteria": ["5+ direct competitors analyzed", "Competitive positioning map created", "Differentiation strategy defined"]}', '["Competitor analysis spreadsheet", "Positioning map", "Differentiation strategy"]', 'Look beyond direct competitors - include indirect solutions customers currently use.', '[{"type": "tool", "name": "Ahrefs", "url": "https://ahrefs.com"}, {"type": "template", "name": "Competitor Analysis Template", "url": "/templates/competitor-analysis.xlsx"}]', NOW(), NOW()),
                
                ('3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'Define MVP Features', 'Define the minimum viable product scope and core features', 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 1, 'advanced', 3, '# MVP Feature Definition\n\nThis guide will help you define the minimum viable product scope and core features.\n\n## Core Problem\n- Clearly define the core problem you are solving\n- Identify the minimum feature set needed to solve this problem\n\n## Feature Prioritization\n- Use the MoSCoW method (Must have, Should have, Could have, Won't have)\n- Focus on "Must have" features for your MVP\n\n## Validation\n- Define how you will validate each feature\n- Create user stories for each feature', 'Create a focused MVP that solves the core problem with minimal features', '{"criteria": ["MVP scope clearly defined", "User stories created", "Technical feasibility confirmed"]}', '["MVP specification document", "User story backlog", "Technical architecture plan"]', 'Be ruthless about feature prioritization. Your MVP should solve one problem really well.', '[{"type": "template", "name": "MVP Planning Template", "url": "/templates/mvp-planning.pdf"}]', NOW(), NOW()),
                
                ('61a91ad9-3c5e-4f4e-b5da-0de4348cd0ae'::uuid, 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 3, 'beginner', 2, '# Landing Page Creation Guide\n\nThis guide will help you create an effective landing page to validate demand.\n\n## Key Elements\n- Clear value proposition\n- Benefits (not features)\n- Social proof\n- Strong call-to-action\n\n## Analytics\n- Set up Google Analytics or similar tool\n- Track conversion rates\n- A/B test headline and CTA if possible', 'Create online presence and start collecting leads', '{"criteria": ["Landing page published", "Analytics tracking setup", "Lead capture form implemented"]}', '["Live landing page", "Analytics dashboard", "Lead collection system"]', 'Keep it simple and focused on one clear value proposition. Include a strong call-to-action.', '[{"type": "tool", "name": "Webflow", "url": "https://webflow.com"}, {"type": "tool", "name": "Carrd", "url": "https://carrd.co"}]', NOW(), NOW()),
                
                ('bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'Make First Sale', 'Acquire your first paying customer', 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 1, 'expert', 14, '# First Sale Playbook\n\nThis playbook will guide you through acquiring your first paying customer.\n\n## Target Identification\n- Identify ideal early customers\n- Reach out through warm introductions when possible\n\n## Sales Process\n- Create a simple sales deck\n- Practice your pitch\n- Focus on the problem you solve, not features\n\n## Objection Handling\n- Prepare for common objections\n- Offer a money-back guarantee if possible', 'Validate willingness to pay and refine sales process', '{"criteria": ["First paying customer acquired", "Sales process documented", "Customer feedback collected"]}', '["Sales process documentation", "Customer testimonial", "Revenue tracking system"]', 'Focus on manual sales processes initially. Perfect your pitch before automating.', '[{"type": "template", "name": "Sales Process Template", "url": "/templates/sales-process.pdf"}]', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Journey step templates inserted successfully';
        ELSE
            RAISE NOTICE 'journey_step_templates table does not have UUID id column, skipping template data';
        END IF;
    ELSE
        RAISE NOTICE 'journey_step_templates table does not exist, skipping template data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting journey step templates: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE JOURNEY STEPS (Canonical)
-- ===============================================
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check if journey_steps table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'journey_steps' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if id column is UUID type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_steps' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            INSERT INTO journey_steps (id, template_id, phase_id, domain_id, name, description, estimated_time_days, difficulty, order_index, is_required, created_at, updated_at)
            VALUES 
                ('cfb9db7d-fb78-41e8-a25f-9e07dedd0123'::uuid, '7d78a08c-ed8d-4ea0-8037-82b85f13d3c3'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'd4794465-b2c3-5440-f47a-c10b58cc4372'::uuid, 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 7, 'intermediate', 1, true, NOW(), NOW()),
                ('abe2f7c0-2731-4521-98ad-c095761ec3d4'::uuid, '18b1d84a-3e30-48dc-9496-ed459c166f8f'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'b2c3d479-4465-5440-f47a-c10b58cc4372'::uuid, 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 5, 'beginner', 2, true, NOW(), NOW()),
                ('9be16c76-a8f9-4b7b-9b15-64ebfa711073'::uuid, '3f74d06c-79e9-4a5c-8fa9-f4c8e3967b77'::uuid, 'a716e29b-4465-5440-f47a-c10b58cc4372'::uuid, 'c10b58cc-f47a-4465-5440-b2c3d4794372'::uuid, 'Define MVP Features', 'Define the minimum viable product scope and core features', 3, 'advanced', 1, true, NOW(), NOW()),
                ('b6a3f3e4-85d2-4f7d-8895-37a7351dfc2a'::uuid, '61a91ad9-3c5e-4f4e-b5da-0de4348cd0ae'::uuid, 'e29b41d4-a716-4465-5440-f47ac10b58cc'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 2, 'beginner', 3, false, NOW(), NOW()),
                ('f6c5da45-0e6a-47df-b0ea-0175bc67c7a7'::uuid, 'bf17ce3a-d6bf-47f1-8fd9-67d1e15743e0'::uuid, 'c10b58cc-4372-a567-0e02-b2c3d4794465'::uuid, 'f47ac10b-b2c3-4465-5440-e29b41d44372'::uuid, 'Make First Sale', 'Acquire your first paying customer', 14, 'expert', 1, true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Journey steps inserted successfully';
        ELSE
            RAISE NOTICE 'journey_steps table does not have UUID id column, skipping step data';
        END IF;
    ELSE
        RAISE NOTICE 'journey_steps table does not exist, skipping step data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting journey steps: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE COMPANY JOURNEY STEPS
-- ===============================================
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check if company_journey_steps table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if id column is UUID type and company_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'id' AND data_type = 'uuid'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'company_id'
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
            RAISE NOTICE 'company_journey_steps table does not have required columns, skipping company step data';
        END IF;
    ELSE
        RAISE NOTICE 'company_journey_steps table does not exist, skipping company step data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting company journey steps: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE COMPANY JOURNEY PATHS
-- ===============================================
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check if company_journey_paths table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_paths' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if id and company_id columns exist
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_paths' AND column_name = 'id' AND data_type = 'uuid'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_paths' AND column_name = 'company_id'
        ) THEN
            INSERT INTO company_journey_paths (id, company_id, name, description, is_default, is_active, created_at, updated_at)
            VALUES 
                ('c2eb7a1f-3891-4e83-bf6d-f8184b1c9682'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Tech Startup Path', 'Standard path for technology startups', true, true, NOW(), NOW()),
                ('7e1a9c82-5d79-4e3b-a53c-15d3a4ed93e8'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Healthcare Startup Path', 'Specialized path for healthcare companies', true, true, NOW(), NOW()),
                ('1d8a46c5-f731-48db-b1e3-83f1d3d9639b'::uuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'Service Business Path', 'Path optimized for service-based businesses', true, true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Company journey paths inserted successfully';
        ELSE
            RAISE NOTICE 'company_journey_paths table does not have required columns, skipping path data';
        END IF;
    ELSE
        RAISE NOTICE 'company_journey_paths table does not exist, skipping path data';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting company journey paths: %', SQLERRM;
END $$;

-- ===============================================
-- SAMPLE COMPANY STEP ARRANGEMENTS
-- ===============================================
DO
