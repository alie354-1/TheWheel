-- ===============================================
-- DATA POPULATION - JOURNEY STEP TEMPLATES
-- ===============================================

-- Clear existing data
DELETE FROM journey_step_templates;

-- Insert journey step templates with proper UUIDs
INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, startup_principle_id, methodology_category, objectives, success_criteria, deliverables, guidance, resources, applicability_criteria, target_company_stages, is_core_step, usage_frequency) VALUES

-- PHASE 1: IDEATION & VALIDATION (Steps 1-15)
(gen_random_uuid(), 'Identify & Define Problem', 'Clearly articulate the specific problem you are solving with quantifiable impact metrics', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 1, 3, 'Medium', NULL, 'Problem Discovery', 
 'Identify and validate a significant problem that affects your target market with clear evidence of urgency and frequency',
 '{"problem_statement_documented": true, "pain_points_identified": 3, "urgency_score": 7, "frequency_validated": true, "economic_impact_quantified": true}',
 '{"problem_statement": "1-2 sentence clear problem description", "pain_point_analysis": "detailed analysis of 3-5 specific pain points", "market_research_summary": "compilation of industry data and customer insights", "economic_impact_assessment": "quantified cost of the problem"}',
 'Focus on problems that are urgent (customers need it solved now), frequent (happens regularly), and widespread (affects many people). Avoid solutions looking for problems.',
 '["The Mom Test by Rob Fitzpatrick", "Customer Development methodology", "Jobs-to-be-Done framework"]', 
 '{"applicable_when": ["starting_new_venture", "pivoting_existing_product", "entering_new_market"], "not_applicable_when": ["clear_problem_already_defined", "technical_product_with_known_market"]}',
 '["idea", "prototype"]', true, 0.95),

(gen_random_uuid(), 'Conduct Customer Discovery Interviews', 'Talk to 50+ potential users about their problems, behaviors, and needs to gain deep customer insights', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 2, 14, 'Medium', NULL, 'Customer Discovery',
 'Conduct comprehensive customer discovery through structured interviews to understand customer problems, behaviors, and needs',
 '{"interviews_completed": 50, "customer_segments_identified": 3, "patterns_recognized": true, "validation_score_achieved": 7}',
 '{"interview_transcripts": "recorded and transcribed customer interviews", "customer_insights_report": "analysis of patterns and key findings", "initial_personas": "preliminary customer persona drafts", "interview_summary_database": "searchable database of all interviews"}',
 'Ask about their life, not your idea. Focus on understanding their current behavior, pain points, and workarounds. Listen more than you talk.',
 '["Customer interview script templates", "Interview analysis frameworks", "Persona development guides"]',
 '{"applicable_when": ["b2c_products", "new_market_entry", "unknown_customer_needs"], "interview_count_varies_by": ["market_complexity", "customer_diversity", "problem_clarity"]}',
 '["idea", "prototype", "mvp"]', true, 0.90),

(gen_random_uuid(), 'Validate Problem-Solution Fit', 'Confirm that your proposed solution effectively addresses the validated problem with evidence of customer interest', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 3, 7, 'Medium', NULL, 'Solution Validation',
 'Test multiple solution concepts with customers to validate that your approach effectively addresses their identified problems',
 '{"solution_concepts_tested": 3, "customer_excitement_score": 6, "willingness_to_pay_validated": true, "preferred_solution_identified": true}',
 '{"solution_concepts": "3-5 different solution approaches with feature descriptions", "customer_validation_report": "results from testing solutions with 20+ customers", "competitive_analysis": "analysis of existing solutions and market positioning", "solution_refinement_plan": "plan for improving preferred solution"}',
 'Present solutions as concepts, not final products. Test multiple approaches to find the most compelling one. Focus on customer excitement and willingness to pay.',
 '["Solution testing methodologies", "Concept validation frameworks", "Customer feedback analysis"]',
 '{"applicable_when": ["multiple_solution_approaches_possible", "unclear_best_solution", "need_validation_before_building"], "skip_if": ["single_obvious_solution", "technical_constraint_driven_solution"]}',
 '["idea", "prototype"]', true, 0.85),

(gen_random_uuid(), 'Define Target Customer Personas', 'Create detailed profiles of ideal users based on customer discovery insights and behavioral patterns', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 4, 5, 'Medium', NULL, 'Customer Segmentation',
 'Develop comprehensive customer personas that will guide product development and go-to-market strategies',
 '{"personas_created": 3, "personas_validated": true, "persona_based_strategy": true, "team_alignment_achieved": true}',
 '{"detailed_personas": "comprehensive persona profiles with demographics, behaviors, and motivations", "persona_validation_report": "evidence supporting persona accuracy", "persona_strategy_guide": "how to use personas for product and marketing decisions", "persona_prioritization": "ranking of personas by business potential"}',
 'Base personas on real interview data, not assumptions. Focus on behaviors and motivations, not just demographics. Create actionable personas that guide decisions.',
 '["Persona development templates", "Customer segmentation frameworks", "Behavioral analysis guides"]',
 '{"applicable_when": ["diverse_customer_base", "b2c_products", "multiple_market_segments"], "less_relevant_for": ["single_customer_type", "highly_technical_b2b", "platform_products"]}',
 '["idea", "prototype", "mvp"]', true, 0.80)
