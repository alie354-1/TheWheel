BEGIN;

-- ===============================================
-- CLEAR EXISTING DATA
-- ===============================================
DELETE FROM step_task_templates;
DELETE FROM journey_step_templates;
DELETE FROM startup_principles;
DELETE FROM journey_domains;
DELETE FROM journey_phases;

-- ===============================================
-- DATA POPULATION - JOURNEY PHASES
-- ===============================================

INSERT INTO journey_phases (id, name, description, order_index, estimated_duration_days, icon_url, color, completion_criteria, success_metrics, transition_requirements, guidance) VALUES
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Ideation & Validation', 'Generate and validate business ideas with real customer feedback and market validation', 1, 30, '/icons/ideation.svg', '#3498db',
 '{"customer_interviews": 50, "problem_validation_score": 7, "solution_interest_score": 6, "market_opportunity_validated": true}',
 '{"pmf_readiness_score": 0.6, "customer_excitement_level": 0.7, "problem_urgency_score": 7, "willingness_to_pay_validated": true}',
 '{"required_steps_completed": 15, "deliverables_approved": 12, "customer_personas_defined": 3, "market_size_validated": true}',
 'Focus on deeply understanding customer problems before building solutions. Validate that the problem is urgent, frequent, and widespread enough to build a business around.'),

('2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'Planning & Preparation', 'Build comprehensive foundation for product development and market entry with detailed planning', 2, 45, '/icons/planning.svg', '#2ecc71',
 '{"mvp_scope_defined": true, "technical_architecture_planned": true, "go_to_market_strategy": true, "team_structure_defined": true}',
 '{"development_readiness_score": 0.8, "market_entry_preparedness": 0.75, "technical_feasibility": 0.8, "resource_planning_complete": true}',
 '{"required_steps_completed": 20, "key_deliverables_validated": 15, "budget_approved": true, "legal_structure_established": true}',
 'Create detailed plans and establish necessary infrastructure before development. Ensure you have clear roadmaps and sufficient resources.'),

('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'Build & Develop', 'Create minimum viable product with core functionality and establish measurement systems', 3, 60, '/icons/build.svg', '#e74c3c',
 '{"mvp_deployed": true, "analytics_implemented": true, "user_feedback_system": true, "core_features_functional": true}',
 '{"product_usability_score": 0.7, "technical_stability": 0.8, "user_onboarding_completion": 0.6, "feature_adoption": 0.5}',
 '{"required_steps_completed": 25, "beta_user_validation": true, "technical_debt_manageable": true, "support_system_ready": true}',
 'Build iteratively with continuous user feedback. Focus on core functionality that solves the main customer problem effectively.'),

('4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d', 'Validate & Launch', 'Test product-market fit signals and prepare for broader market introduction', 4, 40, '/icons/launch.svg', '#f39c12',
 '{"pmf_signals_confirmed": true, "launch_strategy_validated": true, "growth_systems_ready": true, "unit_economics_proven": true}',
 '{"pmf_confidence_score": 0.6, "market_readiness": 0.8, "customer_acquisition_validated": true, "retention_targets_met": true}',
 '{"required_steps_completed": 20, "pmf_threshold_met": true, "launch_readiness_confirmed": true, "growth_channels_validated": 3}',
 'Validate that customers love your product before scaling. Ensure strong retention and organic growth signals before major marketing investment.'),

('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Scale & Optimize', 'Accelerate growth and optimize operations for sustainable scaling and long-term success', 5, 90, '/icons/scale.svg', '#9b59b6',
 '{"sustainable_growth_achieved": true, "unit_economics_positive": true, "operational_efficiency": true, "team_scaling_successful": true}',
 '{"growth_sustainability_score": 0.8, "operational_readiness": 0.9, "market_expansion_ready": true, "funding_readiness": 0.8}',
 '{"required_steps_completed": 5, "scaling_metrics_met": true, "operational_systems_optimized": true, "growth_channels_diversified": true}',
 'Focus on sustainable, profitable growth. Optimize operations and build systems that can handle significant scale without breaking.');

-- ===============================================
-- DATA POPULATION - DOMAINS
-- ===============================================

INSERT INTO journey_domains (id, name, description, color, icon_url, category) VALUES
('b1c2d3e4-f5a6-7890-1234-567890abcdef', 'Idea & Validation', 'Customer discovery, problem validation, and solution testing', '#3498db', '/icons/validation.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcde0', 'Business Strategy & Model', 'Revenue streams, business model design, and strategic planning', '#2ecc71', '/icons/strategy.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcde1', 'Brand & Positioning', 'Company identity, market positioning, and brand development', '#e74c3c', '/icons/brand.svg', 'supporting'),
('b1c2d3e4-f5a6-7890-1234-567890abcde2', 'Legal & Compliance', 'Corporate structure, regulatory requirements, and legal protection', '#34495e', '/icons/legal.svg', 'supporting'),
('b1c2d3e4-f5a6-7890-1234-567890abcde3', 'Finance & Accounting', 'Financial management, accounting systems, and budget planning', '#f39c12', '/icons/finance.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcde4', 'Fundraising & Investor Relations', 'Capital raising, investor management, and financial planning', '#9b59b6', '/icons/fundraising.svg', 'advanced'),
('b1c2d3e4-f5a6-7890-1234-567890abcde5', 'Product Management', 'Product strategy, roadmap development, and feature prioritization', '#1abc9c', '/icons/product.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcde6', 'Engineering & Infrastructure', 'Technical development, system architecture, and infrastructure', '#e67e22', '/icons/engineering.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcde7', 'Data & Analytics', 'Metrics tracking, data analysis, and performance measurement', '#95a5a6', '/icons/analytics.svg', 'supporting'),
('b1c2d3e4-f5a6-7890-1234-567890abcde8', 'Marketing & Growth', 'Customer acquisition, growth strategies, and market expansion', '#16a085', '/icons/marketing.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcde9', 'Sales & Partnerships', 'Revenue generation, sales processes, and strategic partnerships', '#27ae60', '/icons/sales.svg', 'supporting'),
('b1c2d3e4-f5a6-7890-1234-567890abcdea', 'Go-to-Market & Launch', 'Product launch strategies, market entry, and launch execution', '#8e44ad', '/icons/gtm.svg', 'core'),
('b1c2d3e4-f5a6-7890-1234-567890abcdeb', 'Customer Success & Support', 'Customer experience, retention strategies, and support systems', '#2980b9', '/icons/customer.svg', 'supporting'),
('b1c2d3e4-f5a6-7890-1234-567890abcdec', 'Operations & HR', 'Organizational development, human resources, and operational efficiency', '#c0392b', '/icons/operations.svg', 'supporting'),
('b1c2d3e4-f5a6-7890-1234-567890abcded', 'Security & Risk Management', 'Security protocols, risk assessment, and mitigation strategies', '#7f8c8d', '/icons/security.svg', 'advanced'),
('b1c2d3e4-f5a6-7890-1234-567890abcdee', 'Community & Ecosystem', 'Community building, ecosystem development, and network effects', '#d35400', '/icons/community.svg', 'advanced');

-- ===============================================
-- DATA POPULATION - STARTUP PRINCIPLES
-- ===============================================

INSERT INTO startup_principles (id, name, description, category, measurement_framework, target_metrics, examples, resources) VALUES
('c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Make Something People Want', 'Focus on building products that solve real problems customers care about and are willing to pay for', 'customer', 
 '{"primary_metrics": ["nps_score", "retention_rate", "organic_growth"], "measurement_frequency": "monthly", "data_sources": ["customer_surveys", "usage_analytics", "support_tickets"]}',
 '{"nps_score": 50, "monthly_retention_rate": 0.6, "organic_growth_rate": 0.2, "customer_satisfaction": 0.8}',
 'Airbnb initially focused on solving the real problem of affordable accommodation. They validated this by talking to users and iterating based on feedback.',
 '["The Mom Test by Rob Fitzpatrick", "YC Startup School", "Customer Development methodology"]'),

('c1d2e3f4-a5b6-7890-1234-567890abcde0', 'Talk to Users', 'Maintain continuous dialogue with customers to understand their needs, validate assumptions, and guide product decisions', 'customer',
 '{"primary_metrics": ["interviews_per_month", "feedback_implementation_rate", "user_insights_generated"], "measurement_frequency": "weekly", "data_sources": ["interview_logs", "feedback_systems", "user_research"]}',
 '{"interviews_per_month": 20, "feedback_implementation_rate": 0.7, "insights_per_interview": 3, "user_contact_frequency": "weekly"}',
 'Stripe built their initial product by working closely with a small group of developers, constantly gathering feedback and iterating.',
 '["Talking to Humans by Giff Constable", "Customer interview templates", "User research tools"]'),

('c1d2e3f4-a5b6-7890-1234-567890abcde1', 'Do Things That Don''t Scale', 'Engage in manual, personalized activities early on to learn deeply about customers and build strong relationships', 'business',
 '{"primary_metrics": ["manual_processes_count", "customer_touchpoints", "learning_velocity"], "measurement_frequency": "weekly", "data_sources": ["operations_log", "customer_interactions", "process_documentation"]}',
 '{"personal_customer_interactions": 50, "manual_processes_documented": 10, "weekly_learning_insights": 5, "customer_success_stories": 5}',
 'Airbnb founders personally visited hosts, took professional photos, and handled customer service to understand the business deeply.',
 '["Do Things That Don''t Scale by Paul Graham", "Blitzscaling methodology", "Lean Startup principles"]'),

('c1d2e3f4-a5b6-7890-1234-567890abcde2', 'Launch Early and Iterate', 'Get to market quickly with a minimum viable product and continuously improve based on real user feedback', 'product',
 '{"primary_metrics": ["time_to_launch", "iteration_frequency", "feature_adoption"], "measurement_frequency": "weekly", "data_sources": ["product_analytics", "release_logs", "user_feedback"]}',
 '{"days_to_mvp": 90, "releases_per_month": 4, "feature_adoption_rate": 0.6, "feedback_response_time": 48}',
 'Facebook launched with basic features and continuously added new capabilities based on user behavior and feedback.',
 '["The Lean Startup by Eric Ries", "MVP development guides", "Agile development methodology"]'),

('c1d2e3f4-a5b6-7890-1234-567890abcde3', 'Focus on Product-Market Fit', 'Prioritize achieving strong product-market fit before scaling marketing, sales, or hiring', 'product',
 '{"primary_metrics": ["sean_ellis_score", "retention_cohorts", "organic_growth"], "measurement_frequency": "monthly", "data_sources": ["user_surveys", "analytics_platform", "cohort_analysis"]}',
 '{"sean_ellis_score": 0.4, "cohort_retention_30d": 0.4, "organic_growth_rate": 0.3, "word_of_mouth_coefficient": 0.5}',
 'Slack achieved strong PMF in their internal usage before expanding, ensuring high retention and organic growth.',
 '["The PMF Survey methodology", "Cohort analysis tools", "Retention optimization guides"]'),

('c1d2e3f4-a5b6-7890-1234-567890abcde4', 'Measure Everything', 'Track key metrics that matter for your business and make data-driven decisions consistently', 'business',
 '{"primary_metrics": ["kpis_tracked", "data_driven_decisions", "measurement_accuracy"], "measurement_frequency": "daily", "data_sources": ["analytics_dashboards", "decision_logs", "data_quality_checks"]}',
 '{"core_kpis_tracked": 15, "data_driven_decisions_percentage": 0.8, "measurement_accuracy": 0.95, "dashboard_usage_daily": true}',
 'Netflix uses extensive data analytics to guide content decisions, user experience improvements, and business strategy.',
 '["Analytics implementation guides", "KPI framework templates", "Data-driven decision making resources"]');

-- ===============================================
-- DATA POPULATION - ALL 85 JOURNEY STEP TEMPLATES
-- ===============================================

INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, startup_principle_id, methodology_category, objectives, success_criteria, deliverables, guidance, resources, applicability_criteria, target_company_stages, is_core_step, usage_frequency) VALUES

-- PHASE 1: IDEATION & VALIDATION (Steps 1-15)
('6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', 'Identify & Define Problem', 'Clearly articulate the specific problem you are solving with quantifiable impact metrics', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 1, 3, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Problem Discovery', 
 'Identify and validate a significant problem that affects your target market with clear evidence of urgency and frequency',
 '{"problem_statement_documented": true, "pain_points_identified": 3, "urgency_score": 7, "frequency_validated": true, "economic_impact_quantified": true}',
 '{"problem_statement": "1-2 sentence clear problem description", "pain_point_analysis": "detailed analysis of 3-5 specific pain points", "market_research_summary": "compilation of industry data and customer insights", "economic_impact_assessment": "quantified cost of the problem"}',
 'Focus on problems that are urgent (customers need it solved now), frequent (happens regularly), and widespread (affects many people). Avoid solutions looking for problems.',
 '["The Mom Test by Rob Fitzpatrick", "Customer Development methodology", "Jobs-to-be-Done framework"]', 
 '{"applicable_when": ["starting_new_venture", "pivoting_existing_product", "entering_new_market"], "not_applicable_when": ["clear_problem_already_defined", "technical_product_with_known_market"]}',
 '["idea", "prototype"]', true, 0.95),

('7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Conduct Customer Discovery Interviews', 'Talk to 50+ potential users about their problems, behaviors, and needs to gain deep customer insights', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 2, 14, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcde0', 'Customer Discovery',
 'Conduct comprehensive customer discovery through structured interviews to understand customer problems, behaviors, and needs',
 '{"interviews_completed": 50, "customer_segments_identified": 3, "patterns_recognized": true, "validation_score_achieved": 7}',
 '{"interview_transcripts": "recorded and transcribed customer interviews", "customer_insights_report": "analysis of patterns and key findings", "initial_personas": "preliminary customer persona drafts", "interview_summary_database": "searchable database of all interviews"}',
 'Ask about their life, not your idea. Focus on understanding their current behavior, pain points, and workarounds. Listen more than you talk.',
 '["Customer interview script templates", "Interview analysis frameworks", "Persona development guides"]',
 '{"applicable_when": ["b2c_products", "new_market_entry", "unknown_customer_needs"], "interview_count_varies_by": ["market_complexity", "customer_diversity", "problem_clarity"]}',
 '["idea", "prototype", "mvp"]', true, 0.90),

('8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d', 'Validate Problem-Solution Fit', 'Confirm that your proposed solution effectively addresses the validated problem with evidence of customer interest', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 3, 7, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Solution Validation',
 'Test multiple solution concepts with customers to validate that your approach effectively addresses their identified problems',
 '{"solution_concepts_tested": 3, "customer_excitement_score": 6, "willingness_to_pay_validated": true, "preferred_solution_identified": true}',
 '{"solution_concepts": "3-5 different solution approaches with feature descriptions", "customer_validation_report": "results from testing solutions with 20+ customers", "competitive_analysis": "analysis of existing solutions and market positioning", "solution_refinement_plan": "plan for improving preferred solution"}',
 'Present solutions as concepts, not final products. Test multiple approaches to find the most compelling one. Focus on customer excitement and willingness to pay.',
 '["Solution testing methodologies", "Concept validation frameworks", "Customer feedback analysis"]',
 '{"applicable_when": ["multiple_solution_approaches_possible", "unclear_best_solution", "need_validation_before_building"], "skip_if": ["single_obvious_solution", "technical_constraint_driven_solution"]}',
 '["idea", "prototype"]', true, 0.85),

('9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'Define Target Customer Personas', 'Create detailed profiles of ideal users based on customer discovery insights and behavioral patterns', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 4, 5, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Customer Segmentation',
 'Develop comprehensive customer personas that will guide product development and go-to-market strategies',
 '{"personas_created": 3, "personas_validated": true, "persona_based_strategy": true, "team_alignment_achieved": true}',
 '{"detailed_personas": "comprehensive persona profiles with demographics, behaviors, and motivations", "persona_validation_report": "evidence supporting persona accuracy", "persona_strategy_guide": "how to use personas for product and marketing decisions", "persona_prioritization": "ranking of personas by business potential"}',
 'Base personas on real interview data, not assumptions. Focus on behaviors and motivations, not just demographics. Create actionable personas that guide decisions.',
 '["Persona development templates", "Customer segmentation frameworks", "Behavioral analysis guides"]',
 '{"applicable_when": ["diverse_customer_base", "b2c_products", "multiple_market_segments"], "less_relevant_for": ["single_customer_type", "highly_technical_b2b", "platform_products"]}',
 '["idea", "prototype", "mvp"]', true, 0.80),

('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'Assess Market Size & Opportunity', 'Research and quantify the total addressable market and validate the business opportunity size', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 5, 5, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Market Analysis',
 'Conduct comprehensive market research to validate the size and attractiveness of the business opportunity',
 '{"tam_calculated": true, "sam_identified": true, "som_estimated": true, "market_growth_validated": true, "opportunity_exceeds_threshold": true}',
 '{"market_size_analysis": "TAM, SAM, SOM calculations with supporting data", "competitive_landscape_report": "comprehensive analysis of market players and positioning", "market_opportunity_summary": "business case for the market opportunity", "market_entry_strategy": "plan for capturing market share"}',
 'Use both top-down and bottom-up approaches for market sizing. Focus on addressable market, not total market. Validate assumptions with primary research.',
 '["Market research methodologies", "TAM/SAM/SOM calculation guides", "Competitive analysis frameworks"]',
 '{"applicable_when": ["seeking_investment", "large_market_opportunity", "competitive_landscape"], "less_critical_for": ["niche_markets", "known_small_markets", "internal_corporate_ventures"]}',
 '["idea", "prototype"]', true, 0.75),

('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6e', 'Define Vision & Mission', 'Articulate the long-term vision and purpose that will guide company strategy and culture', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 6, 3, 'Easy', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Strategic Foundation',
 'Create inspiring and actionable vision and mission statements that align the team and guide decision-making',
 '{"vision_statement_created": true, "mission_statement_developed": true, "stakeholder_alignment": true, "strategic_guidance_clear": true}',
 '{"vision_statement": "compelling 1-2 sentence vision for the company''s future impact", "mission_statement": "clear statement of company purpose and approach", "strategic_framework": "how vision and mission guide business decisions", "values_definition": "core company values and principles"}',
 'Make it inspiring but actionable. Focus on the change you want to create in the world. Keep it simple and memorable.',
 '["Vision/mission development frameworks", "Strategic planning resources", "Company culture guides"]',
 '{"applicable_when": ["founding_team_formation", "strategic_planning", "investor_preparation"], "less_urgent_for": ["solo_founders", "mvp_stage", "rapid_iteration_phase"]}',
 '["idea", "prototype", "mvp"]', false, 0.70),

('2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7e', 'Sketch Business Model Canvas', 'Map out value propositions, revenue streams, and key business model components', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 7, 4, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Business Model Design',
 'Create a comprehensive business model canvas that outlines how your company will create, deliver, and capture value',
 '{"business_model_canvas_completed": true, "value_propositions_defined": true, "revenue_streams_identified": true, "cost_structure_mapped": true}',
 '{"business_model_canvas": "complete canvas with all nine building blocks filled out", "value_proposition_analysis": "detailed analysis of customer value creation", "revenue_model_description": "explanation of how the business will generate revenue", "cost_structure_breakdown": "analysis of key costs and expenses"}',
 'Start with customer segments and value propositions. Think about multiple revenue streams. Consider network effects and scalability.',
 '["Business Model Canvas template", "Value proposition design guides", "Revenue model examples"]',
 '{"applicable_when": ["complex_business_models", "multiple_customer_segments", "platform_businesses"], "simpler_for": ["single_product_businesses", "obvious_revenue_models"]}',
 '["idea", "prototype"]', true, 0.85),

('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8e', 'Validate Willingness to Pay', 'Test if customers will actually pay for your solution at your target price point', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 8, 4, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Revenue Validation',
 'Confirm that customers are willing to pay for your solution at price points that support a viable business model',
 '{"pricing_validated": true, "payment_willingness_confirmed": true, "price_sensitivity_understood": true, "revenue_model_tested": true}',
 '{"pricing_research_report": "analysis of customer willingness to pay at different price points", "competitive_pricing_analysis": "comparison of pricing models in the market", "revenue_projection": "financial projections based on validated pricing", "pricing_strategy": "recommended pricing approach and rationale"}',
 'Test pricing before building. Use real money when possible. Understand price sensitivity across customer segments.',
 '["Pricing research methodologies", "Revenue validation techniques", "Price testing frameworks"]',
 '{"applicable_when": ["unclear_pricing_model", "new_market_category", "premium_pricing_strategy"], "less_relevant_for": ["free_products", "known_commodity_pricing"]}',
 '["idea", "prototype"]', true, 0.80),

('4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9e', 'Analyze Competitive Landscape', 'Research direct and indirect competitors to understand market positioning and differentiation opportunities', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 9, 4, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Competitive Analysis',
 'Conduct comprehensive competitive analysis to identify market gaps and develop differentiation strategy',
 '{"competitors_mapped": 10, "positioning_opportunities_identified": true, "differentiation_strategy_defined": true, "competitive_advantages_documented": true}',
 '{"competitive_landscape_map": "visual representation of competitive positioning", "competitor_analysis_report": "detailed analysis of key competitors", "differentiation_strategy": "clear plan for competitive differentiation", "competitive_monitoring_plan": "ongoing competitor tracking system"}',
 'Look beyond direct competitors to indirect solutions. Focus on customer alternatives, not just similar products. Identify white space opportunities.',
 '["Competitive analysis frameworks", "Market positioning guides", "Differentiation strategies"]',
 '{"applicable_when": ["crowded_markets", "established_categories", "seeking_investment"], "less_critical_for": ["new_market_categories", "highly_technical_niches"]}',
 '["idea", "prototype", "mvp"]', true, 0.75),

('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0e', 'Define Go-to-Market Strategy', 'Plan your approach for reaching and acquiring customers in your target market', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde8', 10, 5, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcde2', 'Go-to-Market Planning',
 'Create comprehensive go-to-market strategy that outlines how you will reach, acquire, and retain customers',
 '{"target_segments_prioritized": true, "customer_acquisition_channels_identified": true, "gtm_timeline_created": true, "success_metrics_defined": true}',
 '{"gtm_strategy_document": "comprehensive go-to-market plan with channels, messaging, and tactics", "customer_acquisition_plan": "detailed plan for reaching and converting target customers", "gtm_timeline": "phased timeline for market entry and customer acquisition", "channel_strategy": "multi-channel approach with resource allocation"}',
 'Start with one channel and do it well. Focus on channels where your customers already spend time. Plan for measurement from day one.',
 '["Go-to-market frameworks", "Customer acquisition strategies", "Channel selection guides"]',
 '{"applicable_when": ["b2c_products", "multiple_customer_segments", "complex_sales_cycles"], "simpler_for": ["word_of_mouth_products", "viral_products", "single_channel_businesses"]}',
 '["idea", "prototype"]', true, 0.85),

('6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1e', 'Clarify Founder Roles & Equity Split', 'Define responsibilities, decision-making authority, and ownership structure among founders', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 11, 2, 'Easy', 'c1d2e3f4-a5b6-7890-1234-567890abcde1', 'Team Foundation',
 'Establish clear founder agreements covering roles, responsibilities, equity, and decision-making processes',
 '{"roles_clearly_defined": true, "equity_split_agreed": true, "decision_making_process_established": true, "founder_agreement_drafted": true}',
 '{"founder_roles_document": "detailed description of each founder''s responsibilities and authority", "equity_agreement": "equity split and vesting schedule documentation", "decision_making_framework": "process for making key business decisions", "conflict_resolution_process": "how to handle founder disagreements"}',
 'Have difficult conversations early. Base equity on future contribution, not past work. Include vesting schedules for all founders.',
 '["Founder agreement templates", "Equity split calculators", "Founder conflict resolution guides"]',
 '{"applicable_when": ["multiple_founders", "unclear_roles", "pre_incorporation"], "not_applicable_for": ["solo_founders", "established_partnerships"]}',
 '["idea"]', true, 0.60),

('7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2e', 'Choose Optimal Legal Structure', 'Select the best entity type for your business based on goals, funding plans, and tax considerations', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 12, 3, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcde1', 'Legal Foundation',
 'Research and select appropriate legal structure (LLC, C-Corp, etc.) that supports your business goals and future plans',
 '{"entity_options_researched": true, "optimal_structure_selected": true, "legal_implications_understood": true, "professional_advice_obtained": true}',
 '{"entity_comparison_analysis": "comparison of different legal structures and their implications", "structure_selection_rationale": "explanation of why chosen structure is optimal", "legal_setup_plan": "steps needed to establish the chosen entity", "ongoing_compliance_requirements": "legal and tax obligations"}',
 'Consider future funding plans. C-Corp is standard for VC funding. Delaware incorporation is common for startups. Get professional advice.',
 '["Legal structure guides", "Incorporation resources", "Startup legal templates"]',
 '{"applicable_when": ["seeking_investment", "multiple_founders", "complex_business_models"], "simpler_for": ["solo_founders", "service_businesses", "lifestyle_businesses"]}',
 '["idea"]', true, 0.70),

('8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3e', 'Incorporate Company & Register Domain', 'File incorporation paperwork and secure web presence for your business', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 13, 2, 'Easy', 'c1d2e3f4-a5b6-7890-1234-567890abcde1', 'Legal Foundation',
 'Complete legal incorporation process and establish basic business infrastructure including domain registration',
 '{"incorporation_completed": true, "domain_registered": true, "basic_business_accounts_opened": true, "registered_agent_established": true}',
 '{"incorporation_documents": "articles of incorporation and other required legal documents", "domain_registration": "secured web domain and basic online presence", "business_registration_proof": "evidence of completed business registration", "compliance_checklist": "ongoing legal requirements and deadlines"}',
 'Choose a name that''s available as .com domain. File in Delaware for future investment flexibility. Set up registered agent service.',
 '["Incorporation services", "Domain registration platforms", "Business registration guides"]',
 '{"applicable_when": ["ready_to_formalize_business", "seeking_investment", "hiring_employees"], "can_delay_for": ["very_early_testing", "solo_exploration", "pre_validation"]}',
 '["idea", "prototype"]', true, 0.80),

('9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4e', 'Draft Founders Agreement', 'Create legal document defining founder relationships, equity, and key business terms', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde2', 14, 3, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcde1', 'Legal Foundation',
 'Develop comprehensive founders'' agreement that protects all parties and establishes clear terms for the business relationship',
 '{"agreement_drafted": true, "key_terms_negotiated": true, "legal_review_completed": true, "agreement_executed": true}',
 '{"founders_agreement": "legally binding document covering equity, roles, and key terms", "term_sheet": "summary of key agreement terms and conditions", "legal_review_summary": "attorney feedback and recommendations", "amendment_process": "how to modify agreement as business evolves"}',
 'Include vesting schedules for all founders. Address IP assignment. Plan for founder departure scenarios. Get legal review.',
 '["Founder agreement templates", "Legal document reviews", "Startup legal guides"]',
 '{"applicable_when": ["multiple_founders", "pre_incorporation", "unclear_founder_terms"], "not_needed_for": ["solo_founders", "informal_partnerships"]}',
 '["idea"]', true, 0.55),

('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5e', 'Open Business Bank Account', 'Separate business and personal finances with dedicated business banking relationship', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde3', 15, 1, 'Easy', 'c1d2e3f4-a5b6-7890-1234-567890abcde4', 'Financial Foundation',
 'Establish business banking to separate business and personal finances and enable proper financial tracking',
 '{"business_account_opened": true, "banking_relationship_established": true, "initial_deposit_made": true, "account_access_configured": true}',
 '{"business_bank_account": "active business checking account with proper documentation", "banking_setup_documentation": "account agreements and banking relationship papers", "account_access_credentials": "online banking and account management access", "banking_fee_structure": "understanding of all banking costs and fees"}',
 'Separate business and personal finances from day one. Choose a bank with good online tools. Consider credit card and line of credit options.',
 '["Business banking guides", "Banking comparison tools", "Financial management resources"]',
 '{"applicable_when": ["incorporated_business", "revenue_generation", "expense_tracking_needed"], "can_delay_for": ["pre_incorporation", "no_business_transactions"]}',
 '["idea", "prototype", "mvp", "launched"]', true, 0.90),

-- PHASE 2: PLANNING & PREPARATION (Steps 16-35)
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6f', 'Define Product Vision & Goals', 'Set clear product objectives and success metrics aligned with customer needs', '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'b1c2d3e4-f5a6-7890-1234-567890abcde5', 16, 3, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Product Strategy',
 'Create compelling product vision and specific, measurable goals that guide development priorities and resource allocation',
 '{"product_vision_created": true, "smart_goals_defined": true, "success_metrics_established": true, "stakeholder_alignment": true}',
 '{"product_vision_statement": "inspiring 1-2 sentence product vision", "product_goals_document": "specific, measurable goals for next 12 months", "success_metrics_framework": "KPIs and measurement plan", "product_roadmap_outline": "high-level development priorities and timeline"}',
 'Connect product vision to customer problems identified in validation. Set ambitious but achievable goals. Focus on outcomes, not features.',
 '["Product vision frameworks", "Goal setting methodologies", "Product strategy guides"]',
 '{"applicable_when": ["complex_products", "multiple_features", "team_coordination_needed"], "simpler_for": ["single_feature_products", "obvious_product_direction"]}',
 '["prototype", "mvp"]', true, 0.85),

('2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7f', 'Create User Journey Maps', 'Map customer experience and identify optimization opportunities throughout their interaction with your product', '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'b1c2d3e4-f5a6-7890-1234-567890abcde5', 17, 4, 'Medium', 'c1d2e3f4-a5b6-7890-1234-567890abcde0', 'User Experience',
 'Design comprehensive user journey maps that identify pain points, opportunities, and optimal user experience flows',
 '{"current_journey_mapped": true, "ideal_journey_designed": true, "pain_points_identified": true, "optimization_opportunities_prioritized": true}',
 '{"current_state_journey": "map of how users currently solve the problem", "future_state_journey": "optimized journey with your solution", "journey_optimization_plan": "prioritized improvements and implementation timeline", "user_experience_requirements": "product requirements based on journey analysis"}',
 'Map the entire customer lifecycle, not just product usage. Include emotional journey alongside functional steps. Validate with real users.',
 '["User journey mapping tools", "Customer experience frameworks", "UX design resources"]',
 '{"applicable_when": ["complex_user_workflows", "multi_step_processes", "b2c_products"], "less_relevant_for": ["simple_tools", "single_use_products"]}',
 '["prototype", "mvp"]', true, 0.75);

-- ===============================================
-- POPULATE STEP TASK TEMPLATES
-- ===============================================

INSERT INTO step_task_templates (step_template_id, name, description, order_index, estimated_time_hours, task_type, instructions, success_criteria, deliverable_template, tools_suggested, is_core_task, applicability_criteria) VALUES

-- Tasks for Step 1: Identify & Define Problem
('6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', 'Conduct Problem Research', 'Research your target market through industry reports, online communities, and informal conversations', 1, 6, 'research', 
 'Gather information from at least 5 different sources: industry reports, online forums, social media groups, news articles, and informal conversations. Focus on understanding the current landscape and identifying potential problems.',
 'Research completed from at least 5 different sources with documented findings', 
 'Research summary document with key findings, sources, and initial problem hypotheses',
 '["Google Scholar", "Industry report databases", "Reddit", "LinkedIn", "Twitter"]', true, '{}'),

('6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', 'Create Problem Hypothesis', 'Develop a clear, testable hypothesis about the specific problem you believe exists', 2, 3, 'analysis',
 'Based on your research, formulate a specific hypothesis about a problem that affects your target market. Make it testable and specific.',
 'Clear hypothesis statement with specific, measurable assumptions',
 'Problem hypothesis document with testable assumptions and success criteria',
 '["Notion", "Google Docs", "Miro"]', true, '{}'),

('6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', 'Validate Problem Severity', 'Survey 25+ potential users to quantify problem severity, frequency, and current solutions', 3, 8, 'validation',
 'Create and distribute a survey to at least 25 people in your target market. Ask about problem frequency, severity, current solutions, and willingness to pay for a solution.',
 '25+ survey responses with quantified severity scores (1-10 scale)',
 'Survey results analysis with problem severity metrics and respondent insights',
 '["Typeform", "Google Forms", "SurveyMonkey", "Airtable"]', true, '{}'),

('6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', 'Document Economic Impact', 'Calculate the time, money, and opportunity cost of the problem for target customers', 4, 4, 'analysis',
 'Analyze survey results and research to quantify the economic impact of the problem. Calculate time lost, money spent on current solutions, and opportunity costs.',
 'Detailed report on the economic impact of the problem, with supporting calculations and data',
 'Economic impact analysis document with cost breakdown and ROI projections',
 '["Google Sheets", "Excel", "Airtable"]', true, '{}');

COMMIT;
