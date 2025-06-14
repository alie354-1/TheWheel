-- ===============================================
-- POPULATE STEP TASK TEMPLATES
-- ===============================================

INSERT INTO step_task_templates (step_template_id, name, description, order_index, estimated_time_hours, task_type, instructions, success_criteria, deliverable_template, tools_suggested, is_core_task, applicability_criteria) VALUES

-- Tasks for Step 1: Identify & Define Problem
('template-001', 'Conduct Problem Research', 'Research your target market through industry reports, online communities, and informal conversations', 1, 6, 'research', 
 'Gather information from at least 5 different sources: industry reports, online forums, social media groups, news articles, and informal conversations. Focus on understanding the current landscape and identifying potential problems.',
 'Research completed from at least 5 different sources with documented findings', 
 'Research summary document with key findings, sources, and initial problem hypotheses',
 '["Google Scholar", "Industry report databases", "Reddit", "LinkedIn", "Twitter"]', true, '{}'),

('template-001', 'Create Problem Hypothesis', 'Develop a clear, testable hypothesis about the specific problem you believe exists', 2, 3, 'analysis',
 'Based on your research, formulate a specific hypothesis about a problem that affects your target market. Make it testable and specific.',
 'Clear hypothesis statement with specific, measurable assumptions',
 'Problem hypothesis document with testable assumptions and success criteria',
 '["Notion", "Google Docs", "Miro"]', true, '{}'),

('template-001', 'Validate Problem Severity', 'Survey 25+ potential users to quantify problem severity, frequency, and current solutions', 3, 8, 'validation',
 'Create and distribute a survey to at least 25 people in your target market. Ask about problem frequency, severity, current solutions, and willingness to pay for a solution.',
 '25+ survey responses with quantified severity scores (1-10 scale)',
 'Survey results analysis with problem severity metrics and respondent insights',
 '["Typeform", "Google Forms", "SurveyMonkey", "Airtable"]', true, '{}'),

('template-001', 'Document Economic Impact', 'Calculate the time, money, and opportunity cost of the problem for target customers', 4, 4, 'analysis',
 'Analyze survey results and research to quantify the economic impact of the problem. Calculate time lost, money spent on current solutions, and opportunity costs.',
 'Clear economic impact metrics with quantified costs',
 'Economic impact report with cost breakdowns and total impact assessment',
 '["Excel", "Google Sheets", "Calculator.net"]', true, '{}');
