-- Seed journey_steps_new with sample data
DO $$
DECLARE
    ideation_phase_id UUID;
    validation_phase_id UUID;
    foundation_phase_id UUID;
    build_phase_id UUID;
    strategy_domain_id UUID;
    product_domain_id UUID;
    legal_domain_id UUID;
BEGIN
    -- Get phase and domain UUIDs
    SELECT id INTO ideation_phase_id FROM journey_phases_new WHERE name = 'Ideation';
    SELECT id INTO validation_phase_id FROM journey_phases_new WHERE name = 'Validation';
    SELECT id INTO foundation_phase_id FROM journey_phases_new WHERE name = 'Foundation';
    SELECT id INTO build_phase_id FROM journey_phases_new WHERE name = 'Build';
    SELECT id INTO strategy_domain_id FROM journey_domains_new WHERE name = 'Strategy';
    SELECT id INTO product_domain_id FROM journey_domains_new WHERE name = 'Product';
    SELECT id INTO legal_domain_id FROM journey_domains_new WHERE name = 'Legal';

    -- Insert steps
    INSERT INTO journey_steps_new (name, description, phase_id, domain_id, order_index, difficulty, estimated_time_days, deliverables, success_criteria, guidance_notes)
    VALUES
        ('Define Vision & Mission', 'Establish a clear and compelling vision and mission for your startup.', ideation_phase_id, strategy_domain_id, 1, 'Low', 3, '{"Vision draft", "Mission framework"}', '{"Stakeholder approval >= 80%"}', 'Aligns team and stakeholders around a core purpose.'),
        ('Conduct Market Research', 'Understand your target market, customer needs, and competitive landscape.', validation_phase_id, product_domain_id, 2, 'Medium', 14, '{"Market analysis report", "Customer personas"}', '{"Identified target market segment"}', 'This is a critical step to validate your assumptions before building.'),
        ('Legal Setup', 'Establish the legal entity for your company.', foundation_phase_id, legal_domain_id, 3, 'High', 7, '{"Company registration documents"}', '{"Company legally registered"}', 'Consult with a lawyer to ensure you are setting up the correct legal structure.'),
        ('Build MVP', 'Build a minimum viable product to test your core hypothesis.', build_phase_id, product_domain_id, 4, 'High', 30, '{"Functional MVP"}', '{"MVP ready for user testing"}', 'Focus on the core functionality that solves a key problem for your target users.');
END $$;
