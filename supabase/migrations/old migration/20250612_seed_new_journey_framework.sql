-- Seed data for the new journey system
-- Populates initial domains, phases, and sample steps

-- Insert Phases
INSERT INTO new_journey_phases (name, description, order_index, icon, color) VALUES
('Ideation', 'Define your vision and initial concepts', 1, 'Lightbulb', '#6366F1'),
('Validation', 'Test your assumptions and validate market fit', 2, 'CheckCircle', '#8B5CF6'),
('Foundation', 'Build the core infrastructure of your business', 3, 'Building', '#EC4899'),
('Build', 'Create your product and prepare for launch', 4, 'Hammer', '#F59E0B'),
('Growth', 'Scale your business and operations', 5, 'TrendingUp', '#10B981');

-- Insert Domains
INSERT INTO new_journey_domains (name, description, icon, color) VALUES
('Strategy', 'Vision, mission, and high-level business planning', 'Target', '#6366F1'),
('Product', 'Product development, design, and technical architecture', 'Box', '#8B5CF6'),
('Marketing', 'Brand, marketing strategies, and customer acquisition', 'Megaphone', '#EC4899'),
('Sales', 'Sales process, pipeline management, and customer conversations', 'DollarSign', '#F59E0B'),
('Finance', 'Financial planning, budgeting, and fundraising', 'PiggyBank', '#10B981'),
('Legal', 'Entity formation, compliance, and intellectual property', 'Shield', '#0EA5E9'),
('Operations', 'Day-to-day operations, tools, and processes', 'Settings', '#64748B'),
('Team', 'Hiring, team building, and culture development', 'Users', '#D946EF');

-- Get IDs for phases and domains for reference in steps
DO $$
DECLARE
    ideation_id UUID;
    validation_id UUID;
    foundation_id UUID;
    build_id UUID;
    growth_id UUID;
    
    strategy_id UUID;
    product_id UUID;
    marketing_id UUID;
    sales_id UUID;
    finance_id UUID;
    legal_id UUID;
    operations_id UUID;
    team_id UUID;
BEGIN
    -- Get phase IDs
    SELECT id INTO ideation_id FROM new_journey_phases WHERE name = 'Ideation';
    SELECT id INTO validation_id FROM new_journey_phases WHERE name = 'Validation';
    SELECT id INTO foundation_id FROM new_journey_phases WHERE name = 'Foundation';
    SELECT id INTO build_id FROM new_journey_phases WHERE name = 'Build';
    SELECT id INTO growth_id FROM new_journey_phases WHERE name = 'Growth';
    
    -- Get domain IDs
    SELECT id INTO strategy_id FROM new_journey_domains WHERE name = 'Strategy';
    SELECT id INTO product_id FROM new_journey_domains WHERE name = 'Product';
    SELECT id INTO marketing_id FROM new_journey_domains WHERE name = 'Marketing';
    SELECT id INTO sales_id FROM new_journey_domains WHERE name = 'Sales';
    SELECT id INTO finance_id FROM new_journey_domains WHERE name = 'Finance';
    SELECT id INTO legal_id FROM new_journey_domains WHERE name = 'Legal';
    SELECT id INTO operations_id FROM new_journey_domains WHERE name = 'Operations';
    SELECT id INTO team_id FROM new_journey_domains WHERE name = 'Team';
    
    -- Insert sample journey steps (just a few examples to start with)
    -- These will be expanded in a future migration with the full 150 steps
    
    -- Ideation Phase / Strategy Domain
    INSERT INTO new_journey_steps (
        name, 
        description, 
        primary_phase_id, 
        primary_domain_id, 
        order_index, 
        difficulty, 
        estimated_days,
        why_this_matters,
        deliverables,
        success_criteria,
        potential_blockers
    ) VALUES (
        'Define Vision & Mission', 
        'Create a clear and compelling vision and mission statement that will guide your company strategy and align team members.',
        ideation_id,
        strategy_id,
        1,
        'Medium',
        3,
        'A clear vision and mission serves as a north star for all company decisions, from product development to hiring. It helps align stakeholders around core purpose and provides a foundation for strategic planning.',
        ARRAY['Vision statement draft (1-2 sentences)', 'Mission statement draft (1-2 paragraphs)', 'Presentation for stakeholder review', 'Documentation for company handbook'],
        ARRAY['Stakeholder approval ≥80%', 'Team members can articulate vision/mission when asked', 'Vision/mission influences product roadmap decisions', 'Mission connects to tangible business goals'],
        ARRAY['Difficulty scheduling stakeholder meetings', 'Competing visions among leadership', 'Insufficient market/customer research']
    );
    
    -- Validation Phase / Product Domain
    INSERT INTO new_journey_steps (
        name, 
        description, 
        primary_phase_id, 
        primary_domain_id, 
        order_index, 
        difficulty, 
        estimated_days,
        why_this_matters,
        deliverables,
        success_criteria,
        potential_blockers
    ) VALUES (
        'Conduct Market Research', 
        'Research your target market to validate product-market fit and identify opportunities and threats.',
        validation_id,
        product_id,
        10,
        'Medium',
        5,
        'Market research helps you understand customer needs, competitive landscape, and market trends, reducing the risk of building something nobody wants. It provides data-driven insights to shape your product strategy.',
        ARRAY['Market analysis report', 'Competitor analysis', 'Customer persona documents', 'Market size calculation'],
        ARRAY['Identified clear target market segments', 'Validated market need through data', 'Documented 3-5 key competitors', 'Quantified market opportunity size'],
        ARRAY['Limited access to quality data', 'Difficulty reaching target customers for research', 'Confirmation bias in interpreting results']
    );
    
    -- Foundation Phase / Legal Domain
    INSERT INTO new_journey_steps (
        name, 
        description, 
        primary_phase_id, 
        primary_domain_id, 
        order_index, 
        difficulty, 
        estimated_days,
        why_this_matters,
        deliverables,
        success_criteria,
        potential_blockers
    ) VALUES (
        'Legal Entity Setup', 
        'Establish your legal business entity and complete necessary registrations.',
        foundation_id,
        legal_id,
        20,
        'High',
        7,
        'The right legal structure affects everything from taxes to liability protection to fundraising options. Getting this right early saves significant time and money later and provides the foundation for all business operations.',
        ARRAY['Registered business entity', 'EIN/tax ID', 'Business licenses', 'Initial corporate documents', 'Bank account setup'],
        ARRAY['Entity type matches business goals', 'All required government registrations completed', 'Corporate governance documents in place', 'Ownership structure clearly documented'],
        ARRAY['Confusion about optimal entity type', 'Delays in government processing', 'Cost concerns', 'Incomplete understanding of requirements']
    );
    
    -- Build Phase / Product Domain
    INSERT INTO new_journey_steps (
        name, 
        description, 
        primary_phase_id, 
        primary_domain_id, 
        order_index, 
        difficulty, 
        estimated_days,
        why_this_matters,
        deliverables,
        success_criteria,
        potential_blockers
    ) VALUES (
        'Build MVP', 
        'Develop your minimum viable product to begin testing with users.',
        build_id,
        product_id,
        30,
        'High',
        14,
        'An MVP lets you test your core value proposition with real users while minimizing development time and cost. It focuses on learning rather than perfection, allowing you to validate assumptions before full-scale development.',
        ARRAY['Functional prototype', 'List of core features implemented', 'Known limitations document', 'Testing plan'],
        ARRAY['MVP includes only essential features', 'Core functionality works reliably', 'MVP ready for user testing', 'Development completed within timeline'],
        ARRAY['Feature creep expanding scope', 'Technical challenges and bugs', 'Resource constraints', 'Difficulty prioritizing features']
    );
    
    -- Growth Phase / Marketing Domain
    INSERT INTO new_journey_steps (
        name, 
        description, 
        primary_phase_id, 
        primary_domain_id, 
        order_index, 
        difficulty, 
        estimated_days,
        why_this_matters,
        deliverables,
        success_criteria,
        potential_blockers
    ) VALUES (
        'Develop Content Strategy', 
        'Create a content plan to establish your brand voice and reach customers.',
        growth_id,
        marketing_id,
        40,
        'Medium',
        4,
        'Content marketing builds brand awareness, establishes thought leadership, supports SEO, and nurtures leads through the funnel. A strategic approach ensures content aligns with business goals and resonates with your audience.',
        ARRAY['Content strategy document', 'Editorial calendar', 'Content creation guidelines', 'Distribution channel plan'],
        ARRAY['Strategy aligns with buyer journey', 'Clear publishing cadence established', 'Content types mapped to business goals', 'Measurement framework defined'],
        ARRAY['Limited content creation resources', 'Difficulty establishing metrics', 'Maintaining consistent publication schedule', 'Creating truly differentiated content']
    );
    
    -- Foundation Phase / Finance Domain
    INSERT INTO new_journey_steps (
        name, 
        description, 
        primary_phase_id, 
        primary_domain_id, 
        order_index, 
        difficulty, 
        estimated_days,
        why_this_matters,
        deliverables,
        success_criteria,
        potential_blockers
    ) VALUES (
        'Set Up Financial Tracking', 
        'Implement financial tracking systems for accounting and reporting.',
        foundation_id,
        finance_id,
        25,
        'Medium',
        2,
        'Proper financial tracking is essential for tax compliance, understanding your cash position, making informed business decisions, and preparing for fundraising. Starting with good habits early prevents painful cleanup later.',
        ARRAY['Accounting software setup', 'Chart of accounts', 'Expense tracking process', 'Initial financial reports', 'Bookkeeping process'],
        ARRAY['System captures all financial transactions', 'Reports can be generated easily', 'Compliant with tax requirements', 'Team follows established processes'],
        ARRAY['Lack of financial expertise', 'Choosing the right tools', 'Building sustainable processes', 'Cost of professional services']
    );
    
END $$;
