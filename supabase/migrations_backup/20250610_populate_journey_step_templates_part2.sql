-- ===============================================
-- DATA POPULATION - JOURNEY STEP TEMPLATES (PART 2)
-- ===============================================

-- Continue populating journey step templates

INSERT INTO journey_step_templates (id, name, description, phase_id, domain_id, suggested_order_index, estimated_time_days, difficulty, startup_principle_id, methodology_category, objectives, success_criteria, deliverables, guidance, resources, applicability_criteria, target_company_stages, is_core_step, usage_frequency) VALUES

-- Continue PHASE 1: IDEATION & VALIDATION
(gen_random_uuid(), 'Assess Market Size & Opportunity', 'Research and quantify the total addressable market and validate the business opportunity size', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 5, 5, 'Medium', NULL, 'Market Analysis',
 'Conduct comprehensive market research to validate the size and attractiveness of the business opportunity',
 '{"tam_calculated": true, "sam_identified": true, "som_estimated": true, "market_growth_validated": true, "opportunity_exceeds_threshold": true}',
 '{"market_size_analysis": "TAM, SAM, SOM calculations with supporting data", "competitive_landscape_report": "comprehensive analysis of market players and positioning", "market_opportunity_summary": "business case for the market opportunity", "market_entry_strategy": "plan for capturing market share"}',
 'Use both top-down and bottom-up approaches for market sizing. Focus on addressable market, not total market. Validate assumptions with primary research.',
 '["Market research methodologies", "TAM/SAM/SOM calculation guides", "Competitive analysis frameworks"]',
 '{"applicable_when": ["seeking_investment", "large_market_opportunity", "competitive_landscape"], "less_critical_for": ["niche_markets", "known_small_markets", "internal_corporate_ventures"]}',
 '["idea", "prototype"]', true, 0.75),

(gen_random_uuid(), 'Define Vision & Mission', 'Articulate the long-term vision and purpose that will guide company strategy and culture', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 6, 3, 'Easy', NULL, 'Strategic Foundation',
 'Create inspiring and actionable vision and mission statements that align the team and guide decision-making',
 '{"vision_statement_created": true, "mission_statement_developed": true, "stakeholder_alignment": true, "strategic_guidance_clear": true}',
 '{"vision_statement": "compelling 1-2 sentence vision for the company''s future impact", "mission_statement": "clear statement of company purpose and approach", "strategic_framework": "how vision and mission guide business decisions", "values_definition": "core company values and principles"}',
 'Make it inspiring but actionable. Focus on the change you want to create in the world. Keep it simple and memorable.',
 '["Vision/mission development frameworks", "Strategic planning resources", "Company culture guides"]',
 '{"applicable_when": ["founding_team_formation", "strategic_planning", "investor_preparation"], "less_urgent_for": ["solo_founders", "mvp_stage", "rapid_iteration_phase"]}',
 '["idea", "prototype", "mvp"]', false, 0.70),

(gen_random_uuid(), 'Sketch Business Model Canvas', 'Map out value propositions, revenue streams, and key business model components', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 7, 4, 'Medium', NULL, 'Business Model Design',
 'Create a comprehensive business model canvas that outlines how your company will create, deliver, and capture value',
 '{"business_model_canvas_completed": true, "value_propositions_defined": true, "revenue_streams_identified": true, "cost_structure_mapped": true}',
 '{"business_model_canvas": "complete canvas with all nine building blocks filled out", "value_proposition_analysis": "detailed analysis of customer value creation", "revenue_model_description": "explanation of how the business will generate revenue", "cost_structure_breakdown": "analysis of key costs and expenses"}',
 'Start with customer segments and value propositions. Think about multiple revenue streams. Consider network effects and scalability.',
 '["Business Model Canvas template", "Value proposition design guides", "Revenue model examples"]',
 '{"applicable_when": ["complex_business_models", "multiple_customer_segments", "platform_businesses"], "simpler_for": ["single_product_businesses", "obvious_revenue_models"]}',
 '["idea", "prototype"]', true, 0.85),

(gen_random_uuid(), 'Validate Willingness to Pay', 'Test if customers will actually pay for your solution at your target price point', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 8, 4, 'Medium', NULL, 'Revenue Validation',
 'Confirm that customers are willing to pay for your solution at price points that support a viable business model',
 '{"pricing_validated": true, "payment_willingness_confirmed": true, "price_sensitivity_understood": true, "revenue_model_tested": true}',
 '{"pricing_research_report": "analysis of customer willingness to pay at different price points", "competitive_pricing_analysis": "comparison of pricing models in the market", "revenue_projection": "financial projections based on validated pricing", "pricing_strategy": "recommended pricing approach and rationale"}',
 'Test pricing before building. Use real money when possible. Understand price sensitivity across customer segments.',
 '["Pricing research methodologies", "Revenue validation techniques", "Price testing frameworks"]',
 '{"applicable_when": ["unclear_pricing_model", "new_market_category", "premium_pricing_strategy"], "less_relevant_for": ["free_products", "known_commodity_pricing"]}',
 '["idea", "prototype"]', true, 0.80),

(gen_random_uuid(), 'Analyze Competitive Landscape', 'Research direct and indirect competitors to understand market positioning and differentiation opportunities', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1c2d3e4-f5a6-7890-1234-567890abcde0', 9, 4, 'Medium', NULL, 'Competitive Analysis',
 'Conduct comprehensive competitive analysis to identify market gaps and develop differentiation strategy',
 '{"competitors_mapped": 10, "positioning_opportunities_identified": true, "differentiation_strategy_defined": true, "competitive_advantages_documented": true}',
 '{"competitive_landscape_map": "visual representation of competitive positioning", "competitor_analysis_report": "detailed analysis of key competitors", "differentiation_strategy": "clear plan for competitive differentiation", "competitive_monitoring_plan": "ongoing competitor tracking system"}',
 'Look beyond direct competitors to indirect solutions. Focus on customer alternatives, not just similar products. Identify white space opportunities.',
 '["Competitive analysis frameworks", "Market positioning guides", "Differentiation strategies"]',
 '{"applicable_when": ["crowded_markets", "established_categories", "seeking_investment"], "less_critical_for": ["new_market_categories", "highly_technical_niches"]}',
 '["idea", "prototype", "mvp"]', true, 0.75)
