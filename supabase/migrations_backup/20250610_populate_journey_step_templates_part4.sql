-- ===============================================
-- DATA POPULATION - JOURNEY STEP TEMPLATES (PART 4)
-- ===============================================

-- Continue populating journey step templates

INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, startup_principle_id, methodology_category, objectives, success_criteria, deliverables, guidance, resources, applicability_criteria, target_company_stages, is_core_step, usage_frequency) VALUES

-- Complete PHASE 1: IDEATION & VALIDATION
(gen_random_uuid(), 'Open Business Bank Account', 'Separate business and personal finances with dedicated business banking relationship', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde3', 15, 1, 'Easy', NULL, 'Financial Foundation',
 'Establish business banking to separate business and personal finances and enable proper financial tracking',
 '{"business_account_opened": true, "banking_relationship_established": true, "initial_deposit_made": true, "account_access_configured": true}',
 '{"business_bank_account": "active business checking account with proper documentation", "banking_setup_documentation": "account agreements and banking relationship papers", "account_access_credentials": "online banking and account management access", "banking_fee_structure": "understanding of all banking costs and fees"}',
 'Separate business and personal finances from day one. Choose a bank with good online tools. Consider credit card and line of credit options.',
 '["Business banking guides", "Banking comparison tools", "Financial management resources"]',
 '{"applicable_when": ["incorporated_business", "revenue_generation", "expense_tracking_needed"], "can_delay_for": ["pre_incorporation", "no_business_transactions"]}',
 '["idea", "prototype", "mvp", "launched"]', true, 0.90),

-- Begin PHASE 2: PLANNING & PREPARATION (Steps 16-35)
(gen_random_uuid(), 'Define Product Vision & Goals', 'Set clear product objectives and success metrics aligned with customer needs', '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'b1c2d3e4-f5a6-7890-1234-567890abcde5', 16, 3, 'Medium', NULL, 'Product Strategy',
 'Create compelling product vision and specific, measurable goals that guide development priorities and resource allocation',
 '{"product_vision_created": true, "smart_goals_defined": true, "success_metrics_established": true, "stakeholder_alignment": true}',
 '{"product_vision_statement": "inspiring 1-2 sentence product vision", "product_goals_document": "specific, measurable goals for next 12 months", "success_metrics_framework": "KPIs and measurement plan", "product_roadmap_outline": "high-level development priorities and timeline"}',
 'Connect product vision to customer problems identified in validation. Set ambitious but achievable goals. Focus on outcomes, not features.',
 '["Product vision frameworks", "Goal setting methodologies", "Product strategy guides"]',
 '{"applicable_when": ["complex_products", "multiple_features", "team_coordination_needed"], "simpler_for": ["single_feature_products", "obvious_product_direction"]}',
 '["prototype", "mvp"]', true, 0.85),

(gen_random_uuid(), 'Create User Journey Maps', 'Map customer experience and identify optimization opportunities throughout their interaction with your product', '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'b1c2d3e4-f5a6-7890-1234-567890abcde5', 17, 4, 'Medium', NULL, 'User Experience',
 'Design comprehensive user journey maps that identify pain points, opportunities, and optimal user experience flows',
 '{"current_journey_mapped": true, "ideal_journey_designed": true, "pain_points_identified": true, "optimization_opportunities_prioritized": true}',
 '{"current_state_journey": "map of how users currently solve the problem", "future_state_journey": "optimized journey with your solution", "journey_optimization_plan": "prioritized improvements and implementation timeline", "user_experience_requirements": "product requirements based on journey analysis"}',
 'Map the entire customer lifecycle, not just product usage. Include emotional journey alongside functional steps. Validate with real users.',
 '["User journey mapping tools", "Customer experience frameworks", "UX design resources"]',
 '{"applicable_when": ["complex_user_workflows", "multi_step_processes", "b2c_products"], "less_relevant_for": ["simple_tools", "single_use_products"]}',
 '["prototype", "mvp"]', true, 0.75),

(gen_random_uuid(), 'Develop User Stories & Product Requirements', 'Create detailed specifications for product features based on user needs and business goals', '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'b1c2d3e4-f5a6-7890-1234-567890abcde5', 18, 5, 'Medium', NULL, 'Product Development',
 'Document comprehensive product requirements and user stories that define what needs to be built and why',
 '{"user_stories_created": 20, "acceptance_criteria_defined": true, "edge_cases_identified": true, "prioritization_completed": true}',
 '{"user_story_document": "detailed user stories with acceptance criteria", "feature_requirements": "technical and functional requirements for each feature", "product_backlog": "prioritized list of features and requirements", "technical_limitations": "constraints and considerations for development"}',
 'Focus on user needs, not just feature lists. Include acceptance criteria for each story. Prioritize based on business impact and user value.',
 '["User story templates", "Product requirement documents", "Agile requirement frameworks"]',
 '{"applicable_when": ["complex_products", "development_team_coordination", "multiple_features"], "simpler_for": ["single_feature_products", "solo_developer_projects"]}',
 '["prototype", "mvp"]', true, 0.85),

(gen_random_uuid(), 'Design User Interface Mockups', 'Create visual representations of your product interface focusing on user experience and functionality', '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'b1c2d3e4-f5a6-7890-1234-567890abcde5', 19, 7, 'Medium', NULL, 'UI/UX Design',
 'Design intuitive, user-friendly interfaces that effectively solve user problems and provide a compelling experience',
 '{"wireframes_created": true, "mockups_designed": true, "user_feedback_collected": true, "design_system_established": true}',
 '{"wireframes": "low-fidelity sketches of key user flows", "high_fidelity_mockups": "detailed visual designs for all screens", "design_system": "reusable components, color palette, and typography", "clickable_prototype": "interactive demonstration of key user flows"}',
 'Start with wireframes before moving to high-fidelity designs. Test designs with users early and often. Focus on solving user problems, not just aesthetics.',
 '["UI design tools", "Design system guides", "UX best practices"]',
 '{"applicable_when": ["consumer_facing_products", "complex_interfaces", "visual_product"], "simpler_for": ["api_products", "backend_systems", "technical_tools"]}',
 '["prototype", "mvp"]', true, 0.80)
