-- Migration to add sample expert profiles

-- Sample expert users
-- Note: In a real environment, these would be actual auth.users entries
-- For this sample, we'll assume these UUIDs exist in auth.users

-- Sample Expert 1: Technical Expert
INSERT INTO expert_profiles (
  id,
  user_id,
  primary_expertise_areas,
  secondary_expertise_areas,
  industry_experience,
  functional_experience,
  company_stages_experienced,
  mentorship_capacity,
  years_of_experience,
  bio,
  success_stories,
  certifications,
  education,
  hourly_rate,
  availability_description,
  mentorship_style,
  is_accepting_clients,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '11111111-1111-1111-1111-111111111111', -- This should be a real auth.users UUID in production
  ARRAY['Software Development', 'Cloud Architecture', 'DevOps'],
  ARRAY['Microservices', 'Kubernetes', 'CI/CD'],
  '{"Enterprise": 8, "Startup": 7}',
  '{"Engineering": 15, "Architecture": 10}',
  NULL, -- We'll update this later
  5,
  15,
  'Experienced software architect with a passion for building scalable systems. I specialize in cloud-native applications and microservices architecture.',
  ARRAY['Helped a startup scale their infrastructure to handle 10x growth in 6 months.', 'Reduced AWS costs by 40% while improving performance.'],
  ARRAY['AWS Certified Solutions Architect', 'Google Cloud Professional Architect', 'Microsoft Certified: Azure Solutions Architect'],
  'M.S. Computer Science, Stanford University',
  150,
  'Available weekdays 9am-5pm EST, flexible for urgent consultations',
  'I believe in practical, hands-on mentorship. I will guide you through real-world scenarios and help you develop problem-solving skills.',
  TRUE,
  TRUE,
  4.9,
  42,
  NOW(),
  NOW()
);

-- Sample Expert 2: Business Strategy Expert
INSERT INTO expert_profiles (
  id,
  user_id,
  primary_expertise_areas,
  secondary_expertise_areas,
  industry_experience,
  functional_experience,
  company_stages_experienced,
  mentorship_capacity,
  years_of_experience,
  bio,
  success_stories,
  certifications,
  education,
  hourly_rate,
  availability_description,
  mentorship_style,
  is_accepting_clients,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '22222222-2222-2222-2222-222222222222', -- This should be a real auth.users UUID in production
  ARRAY['Business Strategy', 'Startup Growth', 'Product Management'],
  ARRAY['Go-to-Market', 'Team Building', 'Fundraising'],
  '{"SaaS": 8, "E-commerce": 4}',
  '{"Product": 12, "Strategy": 10}',
  NULL, -- We'll update this later
  3,
  12,
  'Former VP of Product at a Fortune 500 company, now helping startups and mid-size companies define their product strategy and growth plans.',
  ARRAY['Guided a SaaS startup from idea to $5M ARR in 18 months.', 'Helped restructure a product team that increased feature delivery by 200%.'],
  ARRAY['Certified Scrum Product Owner', 'PMI Project Management Professional'],
  'MBA, Harvard Business School',
  200,
  'Available for consultations Tuesday-Thursday, 10am-6pm PST',
  'I focus on strategic thinking and market analysis. My mentorship is goal-oriented with clear milestones and accountability.',
  TRUE,
  TRUE,
  4.8,
  36,
  NOW(),
  NOW()
);

-- Sample Expert 3: Marketing Expert
INSERT INTO expert_profiles (
  id,
  user_id,
  primary_expertise_areas,
  secondary_expertise_areas,
  industry_experience,
  functional_experience,
  company_stages_experienced,
  mentorship_capacity,
  years_of_experience,
  bio,
  success_stories,
  certifications,
  education,
  hourly_rate,
  availability_description,
  mentorship_style,
  is_accepting_clients,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '33333333-3333-3333-3333-333333333333', -- This should be a real auth.users UUID in production
  ARRAY['Digital Marketing', 'Content Strategy', 'SEO/SEM'],
  ARRAY['Social Media', 'Email Marketing', 'Analytics'],
  '{"B2B": 6, "B2C": 4}',
  '{"Marketing": 10, "Growth": 8}',
  NULL, -- We'll update this later
  4,
  10,
  'Digital marketing strategist with expertise in growth marketing, content creation, and conversion optimization. I help businesses build effective marketing engines.',
  ARRAY['Increased organic traffic by 300% for an e-commerce client.', 'Developed a content strategy that generated 15000 new leads in 3 months.'],
  ARRAY['Google Analytics Certified', 'HubSpot Marketing Certification', 'Facebook Blueprint Certification'],
  'B.A. Marketing, NYU Stern School of Business',
  125,
  'Available Monday-Friday, flexible hours',
  'I believe in data-driven marketing strategies. My mentorship combines analytics with creative thinking to achieve measurable results.',
  TRUE,
  FALSE,
  4.7,
  28,
  NOW(),
  NOW()
);

-- Sample Expert 4: Financial Expert
INSERT INTO expert_profiles (
  id,
  user_id,
  primary_expertise_areas,
  secondary_expertise_areas,
  industry_experience,
  functional_experience,
  company_stages_experienced,
  mentorship_capacity,
  years_of_experience,
  bio,
  success_stories,
  certifications,
  education,
  hourly_rate,
  availability_description,
  mentorship_style,
  is_accepting_clients,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '44444444-4444-4444-4444-444444444444', -- This should be a real auth.users UUID in production
  ARRAY['Financial Planning', 'Investment Strategy', 'Startup Funding'],
  ARRAY['Venture Capital', 'Angel Investing', 'Financial Modeling'],
  '{"FinTech": 10, "Venture Capital": 8}',
  '{"Finance": 18, "Investment": 15}',
  NULL, -- We'll update this later
  2,
  18,
  'Financial advisor with experience in venture capital, startup funding, and personal finance. I help entrepreneurs make sound financial decisions.',
  ARRAY['Helped a tech startup secure $2M in seed funding.', 'Developed financial models that attracted Series A investors for multiple clients.'],
  ARRAY['Certified Financial Planner (CFP)', 'Chartered Financial Analyst (CFA)'],
  'MBA, Finance, Wharton School of Business',
  175,
  'Available for consultations Wednesday-Friday, 9am-3pm EST',
  'My mentorship focuses on practical financial literacy and strategic planning. I provide actionable advice tailored to your specific situation.',
  TRUE,
  TRUE,
  4.9,
  31,
  NOW(),
  NOW()
);

-- Sample Expert 5: UX/UI Design Expert
INSERT INTO expert_profiles (
  id,
  user_id,
  primary_expertise_areas,
  secondary_expertise_areas,
  industry_experience,
  functional_experience,
  company_stages_experienced,
  mentorship_capacity,
  years_of_experience,
  bio,
  success_stories,
  certifications,
  education,
  hourly_rate,
  availability_description,
  mentorship_style,
  is_accepting_clients,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '55555555-5555-5555-5555-555555555555', -- This should be a real auth.users UUID in production
  ARRAY['UX Design', 'UI Design', 'Product Design'],
  ARRAY['Design Systems', 'User Research', 'Prototyping'],
  '{"SaaS": 5, "Mobile Apps": 3}',
  '{"Design": 8, "Product": 5}',
  NULL, -- We'll update this later
  6,
  8,
  'Product designer specializing in user experience and interface design. I help companies create intuitive, beautiful products that users love.',
  ARRAY['Redesigned a SaaS platform that increased user engagement by 45%.', 'Created a design system that improved development efficiency by 30%.'],
  ARRAY['Adobe Certified Expert', 'Google UX Design Certificate'],
  'B.F.A. Graphic Design, Rhode Island School of Design',
  140,
  'Available Monday, Wednesday, Friday, 11am-7pm CST',
  'I believe in user-centered design principles. My mentorship combines theory with practical exercises to develop your design thinking.',
  TRUE,
  FALSE,
  4.6,
  22,
  NOW(),
  NOW()
);

-- Add sample expert availability
-- For Expert 1
INSERT INTO expert_availability (
  id,
  expert_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at,
  updated_at
) VALUES
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 1, '09:00', '17:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 2, '09:00', '17:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 3, '09:00', '17:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 4, '09:00', '17:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 5, '09:00', '17:00', TRUE, NOW(), NOW());

-- For Expert 2
INSERT INTO expert_availability (
  id,
  expert_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at,
  updated_at
) VALUES
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 2, '10:00', '18:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 3, '10:00', '18:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 4, '10:00', '18:00', TRUE, NOW(), NOW());

-- For Expert 3
INSERT INTO expert_availability (
  id,
  expert_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at,
  updated_at
) VALUES
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 1, '08:00', '16:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 2, '08:00', '16:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 3, '08:00', '16:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 4, '08:00', '16:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 5, '08:00', '16:00', TRUE, NOW(), NOW());

-- For Expert 4
INSERT INTO expert_availability (
  id,
  expert_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at,
  updated_at
) VALUES
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 3, '09:00', '15:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 4, '09:00', '15:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 5, '09:00', '15:00', TRUE, NOW(), NOW());

-- For Expert 5
INSERT INTO expert_availability (
  id,
  expert_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at,
  updated_at
) VALUES
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 1, '11:00', '19:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 3, '11:00', '19:00', TRUE, NOW(), NOW()),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 5, '11:00', '19:00', TRUE, NOW(), NOW());

-- Update company_stages_experienced for each expert
-- Technical Expert
UPDATE expert_profiles
SET company_stages_experienced = ARRAY['seed', 'growth', 'exit']::startup_stage[]
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Business Strategy Expert
UPDATE expert_profiles
SET company_stages_experienced = ARRAY['seed', 'series_a', 'series_b']::startup_stage[]
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- Marketing Expert
UPDATE expert_profiles
SET company_stages_experienced = ARRAY['seed', 'growth']::startup_stage[]
WHERE user_id = '33333333-3333-3333-3333-333333333333';

-- Financial Expert
UPDATE expert_profiles
SET company_stages_experienced = ARRAY['seed', 'series_a', 'series_b', 'series_c_plus']::startup_stage[]
WHERE user_id = '44444444-4444-4444-4444-444444444444';

-- UX/UI Design Expert
UPDATE expert_profiles
SET company_stages_experienced = ARRAY['pre_seed', 'growth']::startup_stage[]
WHERE user_id = '55555555-5555-5555-5555-555555555555';

-- Add sample contract templates for experts
INSERT INTO expert_contract_templates (
  id,
  expert_id,
  title,
  content,
  is_default,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '11111111-1111-1111-1111-111111111111',
  'Standard Consulting Agreement',
  'This Consulting Agreement (Agreement) is entered into between the Expert and the Client.

1. SERVICES
The Expert will provide technical consulting services in the areas of software development, cloud architecture, and DevOps.

2. COMPENSATION
Client agrees to pay Expert at the rate of $150 per hour. Payments are due within 15 days of invoice.

3. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all information shared during the engagement.

4. TERM
This Agreement shall commence on the date of signing and continue until the services are completed or the Agreement is terminated.

5. TERMINATION
Either party may terminate this Agreement with 7 days written notice.',
  TRUE,
  NOW(),
  NOW()
);

INSERT INTO expert_contract_templates (
  id,
  expert_id,
  title,
  content,
  is_default,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '22222222-2222-2222-2222-222222222222',
  'Business Strategy Consulting Agreement',
  'This Consulting Agreement (Agreement) is entered into between the Expert and the Client.

1. SERVICES
The Expert will provide business strategy consulting services including market analysis, growth planning, and product strategy.

2. COMPENSATION
Client agrees to pay Expert at the rate of $200 per hour. Payments are due within 15 days of invoice.

3. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all information shared during the engagement.

4. TERM
This Agreement shall commence on the date of signing and continue until the services are completed or the Agreement is terminated.

5. TERMINATION
Either party may terminate this Agreement with 14 days written notice.',
  TRUE,
  NOW(),
  NOW()
);
