-- ===============================================
-- JOURNEY ENHANCED SAMPLE DATA
-- ===============================================
-- This script populates the enhanced journey system with sample data
-- Date: June 10, 2025

-- ===============================================
-- SAMPLE COMPANIES (for testing if they don't exist)
-- ===============================================
INSERT INTO companies (id, name, industry, stage, created_at, updated_at) 
VALUES 
    ('test-company-1', 'TechStart Inc', 'Technology', 'mvp', NOW(), NOW()),
    ('test-company-2', 'HealthFlow', 'Healthcare', 'prototype', NOW(), NOW()),
    ('test-company-3', 'EcoSolutions', 'Sustainability', 'launched', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY PHASES (Enhanced)
-- ===============================================
INSERT INTO journey_phases (id, name, description, order_index, estimated_duration_days, icon_url, color, guidance, created_at, updated_at)
VALUES 
    ('validate', 'Validate', 'Validate your business idea and market opportunity', 1, 30, '/icons/validate.svg', '#3B82F6', 'Focus on understanding your market and validating demand before building', NOW(), NOW()),
    ('build', 'Build', 'Develop your minimum viable product and core features', 2, 60, '/icons/build.svg', '#F59E0B', 'Build the simplest version that solves your core problem', NOW(), NOW()),
    ('launch', 'Launch', 'Bring your product to market and acquire first customers', 3, 45, '/icons/launch.svg', '#10B981', 'Focus on getting real users and gathering feedback', NOW(), NOW()),
    ('scale', 'Scale', 'Optimize and scale your business operations', 4, 90, '/icons/scale.svg', '#8B5CF6', 'Systematize processes and prepare for growth', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY DOMAINS
-- ===============================================
INSERT INTO journey_domains (id, name, description, color, icon_url, created_at, updated_at)
VALUES 
    ('market-research', 'Market Research', 'Understanding your market and competition', '#EF4444', '/icons/market-research.svg', NOW(), NOW()),
    ('product-development', 'Product Development', 'Building and iterating on your product', '#3B82F6', '/icons/product.svg', NOW(), NOW()),
    ('customer-development', 'Customer Development', 'Finding and engaging with customers', '#10B981', '/icons/customer.svg', NOW(), NOW()),
    ('business-operations', 'Business Operations', 'Setting up business processes and legal structure', '#F59E0B', '/icons/business.svg', NOW(), NOW()),
    ('marketing-sales', 'Marketing & Sales', 'Promoting your product and acquiring customers', '#8B5CF6', '/icons/marketing.svg', NOW(), NOW()),
    ('finance-funding', 'Finance & Funding', 'Managing finances and raising capital', '#06B6D4', '/icons/finance.svg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY STEP TEMPLATES
-- ===============================================
INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, objectives, success_criteria, deliverables, guidance, resources, created_at, updated_at)
VALUES 
    ('customer-interviews', 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 'validate', 'customer-development', 1, 7, 'Medium', 'Validate problem-solution fit through direct customer feedback', '{"criteria": ["10+ interviews completed", "Clear problem patterns identified", "Solution interest validated"]}', '["Interview notes", "Customer persona document", "Problem validation report"]', 'Focus on listening more than talking. Ask open-ended questions about their current challenges.', '[{"type": "template", "name": "Interview Script Template", "url": "/templates/interview-script.pdf"}]', NOW(), NOW()),
    
    ('competitor-analysis', 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 'validate', 'market-research', 2, 5, 'Easy', 'Understand competitive landscape and positioning opportunities', '{"criteria": ["5+ direct competitors analyzed", "Competitive positioning map created", "Differentiation strategy defined"]}', '["Competitor analysis spreadsheet", "Positioning map", "Differentiation strategy"]', 'Look beyond direct competitors - include indirect solutions customers currently use.', '[{"type": "tool", "name": "Ahrefs", "url": "https://ahrefs.com"}, {"type": "template", "name": "Competitor Analysis Template", "url": "/templates/competitor-analysis.xlsx"}]', NOW(), NOW()),
    
    ('mvp-definition', 'Define MVP Features', 'Define the minimum viable product scope and core features', 'build', 'product-development', 1, 3, 'Hard', 'Create a focused MVP that solves the core problem with minimal features', '{"criteria": ["MVP scope clearly defined", "User stories created", "Technical feasibility confirmed"]}', '["MVP specification document", "User story backlog", "Technical architecture plan"]', 'Be ruthless about feature prioritization. Your MVP should solve one problem really well.', '[{"type": "template", "name": "MVP Planning Template", "url": "/templates/mvp-planning.pdf"}]', NOW(), NOW()),
    
    ('landing-page', 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 'validate', 'marketing-sales', 3, 2, 'Easy', 'Create online presence and start collecting leads', '{"criteria": ["Landing page published", "Analytics tracking setup", "Lead capture form implemented"]}', '["Live landing page", "Analytics dashboard", "Lead collection system"]', 'Keep it simple and focused on one clear value proposition. Include a strong call-to-action.', '[{"type": "tool", "name": "Webflow", "url": "https://webflow.com"}, {"type": "tool", "name": "Carrd", "url": "https://carrd.co"}]', NOW(), NOW()),
    
    ('first-sale', 'Make First Sale', 'Acquire your first paying customer', 'launch', 'marketing-sales', 1, 14, 'Very Hard', 'Validate willingness to pay and refine sales process', '{"criteria": ["First paying customer acquired", "Sales process documented", "Customer feedback collected"]}', '["Sales process documentation", "Customer testimonial", "Revenue tracking system"]', 'Focus on manual sales processes initially. Perfect your pitch before automating.', '[{"type": "template", "name": "Sales Process Template", "url": "/templates/sales-process.pdf"}]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY STEPS (Canonical)
-- ===============================================
INSERT INTO journey_steps (id, template_id, phase_id, domain_id, name, description, estimated_time_days, difficulty, order_index, is_required, created_at, updated_at)
VALUES 
    ('step-customer-interviews', 'customer-interviews', 'validate', 'customer-development', 'Conduct Customer Interviews', 'Interview potential customers to validate your problem hypothesis', 7, 'Medium', 1, true, NOW(), NOW()),
    ('step-competitor-analysis', 'competitor-analysis', 'validate', 'market-research', 'Competitive Analysis', 'Analyze direct and indirect competitors in your market', 5, 'Easy', 2, true, NOW(), NOW()),
    ('step-mvp-definition', 'mvp-definition', 'build', 'product-development', 'Define MVP Features', 'Define the minimum viable product scope and core features', 3, 'Hard', 1, true, NOW(), NOW()),
    ('step-landing-page', 'landing-page', 'validate', 'marketing-sales', 'Create Landing Page', 'Build a landing page to collect interest and validate demand', 2, 'Easy', 3, false, NOW(), NOW()),
    ('step-first-sale', 'first-sale', 'launch', 'marketing-sales', 'Make First Sale', 'Acquire your first paying customer', 14, 'Very Hard', 1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY JOURNEY STEPS
-- ===============================================
INSERT INTO company_journey_steps (id, company_id, canonical_step_id, name, description, phase_id, domain_id, order_index, status, completion_percentage, is_custom, created_at, updated_at)
VALUES 
    ('comp-step-1', 'test-company-1', 'step-customer-interviews', 'Conduct Customer Interviews', 'Interview potential customers to validate our AI-powered analytics platform', 'validate', 'customer-development', 1, 'completed', 100, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),
    ('comp-step-2', 'test-company-1', 'step-competitor-analysis', 'Competitive Analysis', 'Analyze competitors in the business intelligence space', 'validate', 'market-research', 2, 'completed', 100, false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
    ('comp-step-3', 'test-company-1', 'step-mvp-definition', 'Define MVP Features', 'Define core features for our analytics dashboard MVP', 'build', 'product-development', 1, 'in_progress', 65, false, NOW() - INTERVAL '5 days', NOW()),
    ('comp-step-4', 'test-company-1', 'step-landing-page', 'Create Landing Page', 'Build landing page for TechStart analytics platform', 'validate', 'marketing-sales', 3, 'completed', 100, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days'),
    
    ('comp-step-5', 'test-company-2', 'step-customer-interviews', 'Conduct Patient Interviews', 'Interview healthcare providers about patient engagement challenges', 'validate', 'customer-development', 1, 'in_progress', 40, false, NOW() - INTERVAL '3 days', NOW()),
    ('comp-step-6', 'test-company-2', 'step-competitor-analysis', 'Healthcare Competitor Analysis', 'Analyze existing patient engagement solutions', 'validate', 'market-research', 2, 'not_started', 0, false, NOW(), NOW()),
    
    ('comp-step-7', 'test-company-3', 'step-first-sale', 'First Sustainability Consulting Sale', 'Land our first corporate sustainability consulting client', 'launch', 'marketing-sales', 1, 'completed', 100, false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY JOURNEY PATHS
-- ===============================================
INSERT INTO company_journey_paths (id, company_id, name, description, is_default, is_active, created_at, updated_at)
VALUES 
    ('path-1', 'test-company-1', 'Tech Startup Path', 'Standard path for technology startups', true, true, NOW(), NOW()),
    ('path-2', 'test-company-2', 'Healthcare Startup Path', 'Specialized path for healthcare companies', true, true, NOW(), NOW()),
    ('path-3', 'test-company-3', 'Service Business Path', 'Path optimized for service-based businesses', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE COMPANY STEP PROGRESS
-- ===============================================
INSERT INTO company_step_progress (id, company_id, step_id, status, notes, completion_percentage, completed_at, created_at, updated_at)
VALUES 
    ('progress-1', 'test-company-1', 'comp-step-1', 'completed', 'Completed 12 customer interviews. Key insight: customers want real-time dashboards over batch reports.', 100, NOW() - INTERVAL '8 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),
    ('progress-2', 'test-company-1', 'comp-step-2', 'completed', 'Identified 5 direct competitors. Our AI-powered insights are a key differentiator.', 100, NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
    ('progress-3', 'test-company-1', 'comp-step-3', 'in_progress', 'Defined core dashboard features. Still working on user permission system design.', 65, NULL, NOW() - INTERVAL '5 days', NOW()),
    ('progress-4', 'test-company-2', 'comp-step-5', 'in_progress', 'Interviewed 4 doctors so far. Common theme: current tools are too complex.', 40, NULL, NOW() - INTERVAL '3 days', NOW()),
    ('progress-5', 'test-company-3', 'comp-step-7', 'completed', 'Signed $15K contract with local manufacturing company for sustainability audit.', 100, NOW() - INTERVAL '15 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE TEMPLATE UPDATE NOTIFICATIONS
-- ===============================================
INSERT INTO template_update_notifications (id, template_id, company_id, notification_type, title, message, changes_summary, action_required, priority, is_read, created_at, updated_at)
VALUES 
    ('notif-1', 'customer-interviews', 'test-company-1', 'template_update', 'Customer Interview Template Updated', 'The customer interview template has been updated with new question frameworks based on recent best practices.', '{"new_questions": 3, "updated_frameworks": 2, "new_resources": 1}', false, 6, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('notif-2', 'competitor-analysis', 'test-company-2', 'enhancement', 'New Competitor Analysis Tools Available', 'We''ve added integration with new market research tools to make competitor analysis more efficient.', '{"new_integrations": 2, "automated_features": 1}', false, 4, false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('notif-3', 'mvp-definition', NULL, 'version_release', 'MVP Planning Framework 2.0 Released', 'Major update to the MVP planning framework with new prioritization methods and validation techniques.', '{"new_methods": 4, "updated_templates": 3, "case_studies": 2}', true, 3, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE PEER PROGRESS SHARING
-- ===============================================
INSERT INTO peer_progress_sharing (id, company_id, step_id, sharing_level, progress_data, industry, company_stage, insights_shared, is_milestone, visibility, created_at, updated_at)
VALUES 
    ('peer-1', 'test-company-1', 'comp-step-1', 'anonymous', '{"completion_time_days": 7, "interviews_conducted": 12, "key_insights": ["real-time preference", "mobile-first requirement"]}', 'Technology', 'mvp', 'Focus on mobile experience - 8/12 customers primarily used mobile for analytics', true, 'community', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    ('peer-2', 'test-company-3', 'comp-step-7', 'company_name', '{"completion_time_days": 5, "contract_value": 15000, "success_factors": ["industry connections", "case study presentation"]}', 'Sustainability', 'launched', 'Having a strong case study made all the difference in closing the first sale', true, 'community', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE EXPERT RECOMMENDATIONS
-- ===============================================
INSERT INTO step_expert_recommendations (id, step_template_id, expert_id, recommendation_text, expertise_areas, success_rate, estimated_time_hours, pricing_range_min, pricing_range_max, priority, is_active, created_at, updated_at)
VALUES 
    ('expert-rec-1', 'customer-interviews', 'expert-sarah-chen', 'Focus on behavioral questions rather than feature requests. Ask about their current workflow and pain points.', '{"customer_development", "product_management"}', 92.5, 2, 150, 300, 8, true, NOW(), NOW()),
    ('expert-rec-2', 'mvp-definition', 'expert-mike-rodriguez', 'Start with the riskiest assumptions first. Your MVP should test these assumptions as quickly as possible.', '{"product_strategy", "lean_startup"}', 88.3, 3, 200, 450, 9, true, NOW(), NOW()),
    ('expert-rec-3', 'first-sale', 'expert-lisa-wang', 'Perfect your demo before scaling sales efforts. Record yourself and identify areas for improvement.', '{"sales", "go_to_market"}', 95.1, 4, 300, 600, 10, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE JOURNEY MILESTONES
-- ===============================================
INSERT INTO journey_milestones (id, company_id, milestone_type, milestone_name, description, achieved_at, celebration_level, metadata, created_at)
VALUES 
    ('milestone-1', 'test-company-1', 'phase_completion', 'Validation Phase Complete', 'Successfully completed the validation phase with strong market validation', NOW() - INTERVAL '7 days', 'major', '{"phase_id": "validate", "steps_completed": 3, "time_taken_days": 15}', NOW() - INTERVAL '7 days'),
    ('milestone-2', 'test-company-3', 'custom', 'First Revenue', 'Achieved first revenue milestone with $15K contract', NOW() - INTERVAL '15 days', 'major', '{"revenue_amount": 15000, "milestone_type": "first_sale"}', NOW() - INTERVAL '15 days'),
    ('milestone-3', 'test-company-1', 'step_streak', '3-Day Streak', 'Completed activities for 3 consecutive days', NOW() - INTERVAL '2 days', 'minor', '{"streak_days": 3, "activities_completed": 8}', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE SMART RECOMMENDATIONS
-- ===============================================
INSERT INTO journey_smart_recommendations (id, company_id, recommendation_type, title, description, priority, confidence_score, estimated_impact, action_items, related_step_ids, expires_at, is_applied, created_at, updated_at)
VALUES 
    ('smart-rec-1', 'test-company-1', 'next_step', 'Focus on Technical Architecture', 'Based on your MVP definition progress, it''s time to start planning your technical architecture to avoid technical debt later.', 'high', 0.85, 'Prevent 2-3 weeks of refactoring later', '{"Define database schema", "Choose technology stack", "Plan API structure"}', '{"comp-step-3"}', NOW() + INTERVAL '7 days', false, NOW(), NOW()),
    
    ('smart-rec-2', 'test-company-2', 'optimization', 'Accelerate Customer Interviews', 'You''re progressing slowly on customer interviews. Consider these strategies to speed up the process.', 'medium', 0.72, 'Complete validation phase 1 week earlier', '{"Use video calls instead of in-person", "Leverage existing network", "Offer small incentives"}', '{"comp-step-5"}', NOW() + INTERVAL '5 days', false, NOW(), NOW()),
    
    ('smart-rec-3', 'test-company-3', 'resource', 'Scale Your Sales Process', 'Congratulations on your first sale! Now is the time to systematize your sales process for scalability.', 'urgent', 0.91, 'Enable consistent 2-3 sales per month', '{"Document sales playbook", "Create proposal templates", "Set up CRM system"}', '{"comp-step-7"}', NOW() + INTERVAL '3 days', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- SAMPLE STEP COMPLETION ANALYTICS
-- ===============================================
INSERT INTO step_completion_analytics (id, step_template_id, company_id, completion_time_days, difficulty_rating, success_factors, blockers_encountered, tools_used, industry, company_stage, team_size, created_at)
VALUES 
    ('analytics-1', 'customer-interviews', 'test-company-1', 7, 3, '{"existing_network", "clear_interview_script", "follow_up_system"}', '{"scheduling_conflicts", "no_show_rate"}', '{"calendly", "zoom", "notion"}', 'Technology', 'mvp', 3, NOW() - INTERVAL '8 days'),
    ('analytics-2', 'first-sale', 'test-company-3', 5, 4, '{"industry_connections", "strong_case_study", "clear_value_prop"}', '{"price_objections", "decision_timeline"}', '{"hubspot", "docusign", "loom"}', 'Sustainability', 'launched', 2, NOW() - INTERVAL '15 days'),
    ('analytics-3', 'competitor-analysis', 'test-company-1', 5, 2, '{"comprehensive_research", "positioning_insights"}', '{"information_availability"}', '{"ahrefs", "similarweb", "google_sheets"}', 'Technology', 'mvp', 3, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;
