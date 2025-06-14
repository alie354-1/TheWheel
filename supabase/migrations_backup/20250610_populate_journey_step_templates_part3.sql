-- ===============================================
-- DATA POPULATION - JOURNEY STEP TEMPLATES (PART 3)
-- ===============================================

-- Continue populating journey step templates

INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, startup_principle_id, methodology_category, objectives, success_criteria, deliverables, guidance, resources, applicability_criteria, target_company_stages, is_core_step, usage_frequency) VALUES

-- Continue PHASE 1: IDEATION & VALIDATION
(gen_random_uuid(), 'Define Go-to-Market Strategy', 'Plan your approach for reaching and acquiring customers in your target market', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdea', 10, 5, 'Medium', NULL, 'Go-to-Market Planning',
 'Create comprehensive go-to-market strategy that outlines how you will reach, acquire, and retain customers',
 '{"target_segments_prioritized": true, "customer_acquisition_channels_identified": true, "gtm_timeline_created": true, "success_metrics_defined": true}',
 '{"gtm_strategy_document": "comprehensive go-to-market plan with channels, messaging, and tactics", "customer_acquisition_plan": "detailed plan for reaching and converting target customers", "gtm_timeline": "phased timeline for market entry and customer acquisition", "channel_strategy": "multi-channel approach with resource allocation"}',
 'Start with one channel and do it well. Focus on channels where your customers already spend time. Plan for measurement from day one.',
 '["Go-to-market frameworks", "Customer acquisition strategies", "Channel selection guides"]',
 '{"applicable_when": ["b2c_products", "multiple_customer_segments", "complex_sales_cycles"], "simpler_for": ["word_of_mouth_products", "viral_products", "single_channel_businesses"]}',
 '["idea", "prototype"]', true, 0.85),

(gen_random_uuid(), 'Clarify Founder Roles & Equity Split', 'Define responsibilities, decision-making authority, and ownership structure among founders', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 11, 2, 'Easy', NULL, 'Team Foundation',
 'Establish clear founder agreements covering roles, responsibilities, equity, and decision-making processes',
 '{"roles_clearly_defined": true, "equity_split_agreed": true, "decision_making_process_established": true, "founder_agreement_drafted": true}',
 '{"founder_roles_document": "detailed description of each founder''s responsibilities and authority", "equity_agreement": "equity split and vesting schedule documentation", "decision_making_framework": "process for making key business decisions", "conflict_resolution_process": "how to handle founder disagreements"}',
 'Have difficult conversations early. Base equity on future contribution, not past work. Include vesting schedules for all founders.',
 '["Founder agreement templates", "Equity split calculators", "Founder conflict resolution guides"]',
 '{"applicable_when": ["multiple_founders", "unclear_roles", "pre_incorporation"], "not_applicable_for": ["solo_founders", "established_partnerships"]}',
 '["idea"]', true, 0.60),

(gen_random_uuid(), 'Choose Optimal Legal Structure', 'Select the best entity type for your business based on goals, funding plans, and tax considerations', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 12, 3, 'Medium', NULL, 'Legal Foundation',
 'Research and select appropriate legal structure (LLC, C-Corp, etc.) that supports your business goals and future plans',
 '{"entity_options_researched": true, "optimal_structure_selected": true, "legal_implications_understood": true, "professional_advice_obtained": true}',
 '{"entity_comparison_analysis": "comparison of different legal structures and their implications", "structure_selection_rationale": "explanation of why chosen structure is optimal", "legal_setup_plan": "steps needed to establish the chosen entity", "ongoing_compliance_requirements": "legal and tax obligations"}',
 'Consider future funding plans. C-Corp is standard for VC funding. Delaware incorporation is common for startups. Get professional advice.',
 '["Legal structure guides", "Incorporation resources", "Startup legal templates"]',
 '{"applicable_when": ["seeking_investment", "multiple_founders", "complex_business_models"], "simpler_for": ["solo_founders", "service_businesses", "lifestyle_businesses"]}',
 '["idea"]', true, 0.70),

(gen_random_uuid(), 'Incorporate Company & Register Domain', 'File incorporation paperwork and secure web presence for your business', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 13, 2, 'Easy', NULL, 'Legal Foundation',
 'Complete legal incorporation process and establish basic business infrastructure including domain registration',
 '{"incorporation_completed": true, "domain_registered": true, "basic_business_accounts_opened": true, "registered_agent_established": true}',
 '{"incorporation_documents": "articles of incorporation and other required legal documents", "domain_registration": "secured web domain and basic online presence", "business_registration_proof": "evidence of completed business registration", "compliance_checklist": "ongoing legal requirements and deadlines"}',
 'Choose a name that''s available as .com domain. File in Delaware for future investment flexibility. Set up registered agent service.',
 '["Incorporation services", "Domain registration platforms", "Business registration guides"]',
 '{"applicable_when": ["ready_to_formalize_business", "seeking_investment", "hiring_employees"], "can_delay_for": ["very_early_testing", "solo_exploration", "pre_validation"]}',
 '["idea", "prototype"]', true, 0.80),

(gen_random_uuid(), 'Draft Founders Agreement', 'Create legal document defining founder relationships, equity, and key business terms', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 14, 3, 'Medium', NULL, 'Legal Foundation',
 'Develop comprehensive founders'' agreement that protects all parties and establishes clear terms for the business relationship',
 '{"agreement_drafted": true, "key_terms_negotiated": true, "legal_review_completed": true, "agreement_executed": true}',
 '{"founders_agreement": "legally binding document covering equity, roles, and key terms", "term_sheet": "summary of key agreement terms and conditions", "legal_review_summary": "attorney feedback and recommendations", "amendment_process": "how to modify agreement as business evolves"}',
 'Include vesting schedules for all founders. Address IP assignment. Plan for founder departure scenarios. Get legal review.',
 '["Founder agreement templates", "Legal document reviews", "Startup legal guides"]',
 '{"applicable_when": ["multiple_founders", "pre_incorporation", "unclear_founder_terms"], "not_needed_for": ["solo_founders", "informal_partnerships"]}',
 '["idea"]', true, 0.55)
