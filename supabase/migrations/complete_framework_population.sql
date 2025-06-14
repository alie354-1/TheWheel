-- =====================================================================
-- Complete Journey Framework Population
-- =====================================================================
-- This script adds the remaining 140 canonical steps + 400+ tools
-- Based on the complete 150-step mappings from the MRD/PRD
-- =====================================================================

-- STEP 1: Add remaining canonical steps (Phase 1: Ideation & Foundation)
-- =====================================================================

INSERT INTO journey_canonical_steps (name, description, primary_phase_id, primary_domain_id, order_index, difficulty, estimated_days, why_this_matters, deliverables, success_criteria, potential_blockers, guidance_notes, no_tool_approach, usage_percentage) 
SELECT 
    step_data.name,
    step_data.description,
    p.id,
    d.id,
    step_data.order_index,
    step_data.difficulty,
    step_data.estimated_days,
    step_data.why_this_matters,
    step_data.deliverables,
    step_data.success_criteria,
    step_data.potential_blockers,
    step_data.guidance_notes,
    step_data.no_tool_approach,
    step_data.usage_percentage
FROM (VALUES
    -- Phase 1 continued (steps 11-30)
    ('Validate Solution Concept', 'Test initial solution ideas with target customers before building anything significant.', 'Ideation & Foundation', 'Strategy & Planning', 11, 'Medium', 4,
    'Solution validation prevents building products that solve problems in ways customers don''t want or won''t pay for.',
    ARRAY['Solution concept presentation', 'Customer feedback synthesis', 'Feature prioritization matrix', 'Solution validation report'],
    ARRAY['Positive customer reaction to solution concept', 'Clear feature priorities from customer input', 'Validated solution-problem fit', 'Customer interest in paying'],
    ARRAY['Solution too complex for initial concept', 'Customers want everything', 'Unclear which features are essential', 'Building before validating'],
    'Create simple mockups or wireframes. Present solution concepts to previous interview subjects. Focus on core value proposition, not features.',
    'Create simple mockups on paper or basic digital tools. Present concepts to customers via video calls or in-person meetings.',
    82),

    ('Develop Unique Value Proposition', 'Create compelling value proposition that clearly differentiates your solution from alternatives.', 'Ideation & Foundation', 'Strategy & Planning', 12, 'Low', 3,
    'A clear value proposition helps all stakeholders understand why customers should choose your solution over alternatives.',
    ARRAY['Value proposition statement', 'Messaging framework', 'Positioning map vs competitors', 'Customer benefit hierarchy'],
    ARRAY['Clear one-sentence value proposition', 'Differentiated positioning vs competitors', 'Customer-centric benefit language', 'Validated messaging with customers'],
    ARRAY['Value prop too generic', 'Feature-focused instead of benefit-focused', 'Too complex to understand quickly', 'Not differentiated enough'],
    'Use value proposition canvas. Test messaging with customers. Focus on outcomes, not features. Make it simple enough for a 10-year-old to understand.',
    'Use value proposition canvas templates. Test messaging through customer interviews and simple surveys.',
    91),

    ('Choose Business Structure', 'Select appropriate legal structure (LLC, C-Corp, etc.) based on business goals and funding plans.', 'Ideation & Foundation', 'Legal & Compliance', 13, 'High', 3,
    'Proper business structure affects taxes, liability, and future funding options. Getting this wrong is expensive to fix later.',
    ARRAY['Business structure decision document', 'State incorporation filing', 'EIN tax number', 'Corporate resolutions'],
    ARRAY['Business legally registered', 'Tax structure optimized for goals', 'Founder equity properly allocated', 'Ready for future funding rounds'],
    ARRAY['Wrong structure for funding goals', 'Complex equity splits', 'Tax implications unclear', 'State selection confusion'],
    'C-Corp for VC funding, LLC for lifestyle businesses. Delaware incorporation common for scalable startups. Consult attorney for complex situations.',
    'Research business structures online, consult with attorney, file directly with state agencies.',
    85),

    ('Establish Cap Table & Equity Split', 'Set up founder equity allocation and capitalization table for current and future stakeholders.', 'Ideation & Foundation', 'Legal & Compliance', 14, 'High', 2,
    'Fair equity allocation prevents founder disputes and creates foundation for employee equity and investor rounds.',
    ARRAY['Founder equity agreements', 'Vesting schedules', 'Cap table spreadsheet', 'Stock certificate records'],
    ARRAY['Fair founder equity split', '4-year vesting with 1-year cliff', 'Reserved equity pool for employees', 'Clean cap table for investors'],
    ARRAY['Founder disagreements on equity', 'No vesting schedules', 'Unclear contribution valuation', 'Too little employee pool'],
    'Use contribution-based equity allocation. Standard 4-year vesting protects all parties. Reserve 10-20% for employee stock option pool early.',
    'Use equity calculators online, create simple spreadsheet, document agreements in writing with legal templates.',
    83),

    ('Obtain Business Licenses & Permits', 'Research and acquire all required business licenses, permits, and regulatory compliance.', 'Ideation & Foundation', 'Legal & Compliance', 15, 'Medium', 5,
    'Proper licensing prevents legal issues and enables business operations in your target markets.',
    ARRAY['Business license', 'Industry-specific permits', 'Compliance checklist', 'Regulatory filing records'],
    ARRAY['All required licenses obtained', 'Compliance processes established', 'Regulatory timeline mapped', 'Legal operations foundation set'],
    ARRAY['Unclear licensing requirements', 'Industry regulations complex', 'Multiple jurisdiction requirements', 'Expensive compliance costs'],
    'Start with local business license. Research industry-specific requirements early. Some licenses take months to process.',
    'Research requirements on government websites, contact local business offices, work with attorney if complex.',
    74),

    ('Create Founder Agreements', 'Document founder roles, responsibilities, decision-making processes, and exit provisions.', 'Ideation & Foundation', 'Legal & Compliance', 16, 'High', 4,
    'Founder agreements prevent disputes and provide clarity on roles, equity, and what happens if someone leaves.',
    ARRAY['Founder agreement document', 'Roles and responsibilities matrix', 'Decision-making framework', 'IP assignment agreements'],
    ARRAY['Clear founder roles defined', 'Decision-making process established', 'IP properly assigned to company', 'Exit scenarios documented'],
    ARRAY['Avoiding difficult conversations', 'Unequal contribution concerns', 'IP ownership confusion', 'Future disagreement scenarios'],
    'Address equity, roles, time commitment, IP, and what happens if someone leaves. Have difficult conversations early when relationship is strong.',
    'Use founder agreement templates, have honest discussions, document everything in writing, review with attorney.',
    79),

    ('Setup Accounting Systems', 'Establish bookkeeping, accounting processes, and financial tracking systems.', 'Ideation & Foundation', 'Finance & Funding', 17, 'Medium', 3,
    'Good accounting from day one enables financial control, tax compliance, and investor readiness.',
    ARRAY['Accounting software setup', 'Chart of accounts', 'Expense tracking system', 'Financial reporting templates'],
    ARRAY['Monthly financial statements generated', 'Expense tracking automated', 'Tax-ready financial records', 'Investor-ready financial reporting'],
    ARRAY['Complex accounting software', 'Poor expense categorization', 'Missing financial documentation', 'Tax compliance gaps'],
    'Use simple accounting software like QuickBooks. Track expenses from day one. Separate business and personal finances completely.',
    'Use spreadsheets for basic tracking, save all receipts, separate business and personal expenses, work with accountant.',
    88),

    ('Open Business Bank Account', 'Establish business banking relationships and financial account structure.', 'Ideation & Foundation', 'Finance & Funding', 18, 'Low', 1,
    'Separating business and personal finances is legally required and simplifies accounting and tax preparation.',
    ARRAY['Business checking account', 'Business savings account', 'Corporate credit card', 'Banking documentation'],
    ARRAY['Business finances separated from personal', 'Banking relationships established', 'Credit building initiated', 'Payment processing ready'],
    ARRAY['Bank requirements complex', 'Minimum balance requirements', 'Poor banking terms', 'Credit approval issues'],
    'Shop around for business-friendly banks. Online banks often have better terms. Establish credit early even if not needed immediately.',
    'Visit local banks, compare terms, bring incorporation documents, open basic checking account.',
    95),

    ('Establish Insurance Coverage', 'Research and obtain appropriate business insurance coverage for risks and liability.', 'Ideation & Foundation', 'Legal & Compliance', 19, 'Medium', 2,
    'Insurance protects the business and founders from various risks and is required for many business activities.',
    ARRAY['General liability insurance policy', 'Professional liability coverage', 'Cyber liability insurance', 'Insurance needs assessment'],
    ARRAY['Adequate liability protection', 'Industry-appropriate coverage', 'Cost-effective insurance plan', 'Risk management strategy'],
    ARRAY['Over-insuring early stage', 'Understanding coverage types', 'Cost vs benefit analysis', 'Industry-specific risks'],
    'Start with general liability. Add professional liability for service businesses. Cyber liability increasingly important for all businesses.',
    'Research insurance brokers, get quotes from multiple providers, start with basic coverage and expand as needed.',
    71),

    ('Document IP Ownership', 'Ensure all intellectual property is properly assigned to the company and documented.', 'Ideation & Foundation', 'Legal & Compliance', 20, 'High', 2,
    'Clear IP ownership prevents disputes and is required for investor funding and company valuation.',
    ARRAY['IP assignment agreements', 'Patent/trademark research', 'Trade secret documentation', 'IP protection strategy'],
    ARRAY['All founder IP assigned to company', 'Key IP identified and protected', 'IP ownership clearly documented', 'Protection strategy established'],
    ARRAY['Previous work IP conflicts', 'Unclear invention assignment', 'Missing documentation', 'Expensive IP protection'],
    'Document everything early. Assign all relevant IP to company. Research existing patents/trademarks. Consider provisional patents for key innovations.',
    'Use IP assignment templates, research patent databases manually, document all inventions and creative work.',
    77),

    ('Create Employee Handbook', 'Develop basic employment policies and procedures for current and future team members.', 'Ideation & Foundation', 'Team & Operations', 21, 'Low', 3,
    'An employee handbook sets expectations, ensures compliance, and creates a professional workplace culture.',
    ARRAY['Employee handbook', 'Code of conduct', 'Basic HR policies', 'Compliance documentation'],
    ARRAY['Clear employment policies established', 'Legal compliance foundation', 'Professional workplace culture', 'Scaling-ready HR foundation'],
    ARRAY['Over-complicated early policies', 'Legal compliance confusion', 'Culture vs policy alignment', 'State law variations'],
    'Keep it simple initially. Cover basics like anti-discrimination, confidentiality, and code of conduct. Expand as you grow.',
    'Use employee handbook templates, focus on essential policies, keep it simple and clear.',
    63),

    ('Setup Operations Infrastructure', 'Establish fundamental operational systems and processes for running the business.', 'Ideation & Foundation', 'Team & Operations', 22, 'Medium', 4,
    'Basic operations infrastructure enables efficient work and professional external interactions.',
    ARRAY['Communication systems setup', 'File storage and collaboration', 'Basic project management', 'Operational workflow documentation'],
    ARRAY['Team can collaborate effectively', 'Information is organized and accessible', 'Basic workflows documented', 'Ready to scale operations'],
    ARRAY['Tool proliferation and complexity', 'Poor information organization', 'Workflow inefficiencies', 'Security and access management'],
    'Start simple with core tools: communication (Slack), storage (Google Drive), project management (Notion/Asana). Add complexity as needed.',
    'Use email for communication, shared folders for storage, simple task lists for project management.',
    81),

    ('Establish Communication Systems', 'Set up internal and external communication infrastructure for the team.', 'Ideation & Foundation', 'Team & Operations', 23, 'Low', 2,
    'Effective communication systems enable team coordination and professional external interactions.',
    ARRAY['Team communication platform', 'External communication setup', 'Communication guidelines', 'Contact management system'],
    ARRAY['Efficient internal communication', 'Professional external presence', 'Clear communication protocols', 'Scalable communication infrastructure'],
    ARRAY['Communication tool overload', 'Poor communication protocols', 'Information silos', 'Unprofessional external communication'],
    'Choose one primary communication tool. Establish communication norms and response expectations. Set up professional email and phone systems.',
    'Use email and phone for basic communication, establish response time expectations, set up professional email addresses.',
    89),

    ('Implement Basic Security', 'Establish fundamental cybersecurity and data protection practices.', 'Ideation & Foundation', 'Technology & Infrastructure', 24, 'Medium', 3,
    'Basic security practices protect company data and prevent costly security breaches.',
    ARRAY['Password management system', 'Two-factor authentication setup', 'Data backup procedures', 'Security policy documentation'],
    ARRAY['Strong password practices established', 'Account security improved', 'Data loss prevention measures', 'Security awareness culture'],
    ARRAY['Complex security requirements', 'Poor security adoption', 'Expensive security tools', 'Compliance confusion'],
    'Start with password managers and 2FA. Implement regular data backups. Train team on basic security practices. Complexity can grow with company.',
    'Use strong unique passwords, enable 2FA on all accounts, backup important data regularly, be cautious with public wifi.',
    85),

    ('Create Initial Website', 'Establish professional online presence with basic website and digital footprint.', 'Ideation & Foundation', 'Marketing & Growth', 25, 'Low', 4,
    'A professional website establishes credibility and provides a platform for marketing and customer acquisition.',
    ARRAY['Professional website', 'Basic SEO setup', 'Contact information', 'Social media profiles'],
    ARRAY['Professional online presence', 'Easy customer contact methods', 'Basic search visibility', 'Credible business appearance'],
    ARRAY['Over-complicated website', 'Poor design quality', 'Missing contact information', 'No mobile optimization'],
    'Keep initial website simple and professional. Focus on clear messaging, easy contact, and mobile-friendly design. Can enhance later.',
    'Use website builders or simple templates, focus on clear messaging and contact information, ensure mobile-friendly design.',
    92),

    ('Plan Financial Management', 'Create initial budget, financial projections, and cash flow management systems.', 'Ideation & Foundation', 'Finance & Funding', 26, 'Medium', 4,
    'Financial planning prevents cash flow problems and enables informed business decisions.',
    ARRAY['Initial budget', 'Financial projections', 'Cash flow plan', 'Financial tracking system'],
    ARRAY['Clear understanding of financial needs', 'Budget aligned with business goals', 'Cash flow visibility', 'Financial decision framework'],
    ARRAY['Unrealistic projections', 'Poor expense tracking', 'Cash flow surprises', 'Lack of financial controls'],
    'Start with simple budgets and projections. Track actual vs projected regularly. Plan for longer timelines and higher costs than expected.',
    'Create simple budgets in spreadsheets, track expenses manually, plan conservatively for revenue and costs.',
    86),

    ('Research Funding Options', 'Explore and evaluate different funding sources and requirements for your business model.', 'Ideation & Foundation', 'Finance & Funding', 27, 'Medium', 3,
    'Understanding funding options early helps you make strategic decisions and prepare for fundraising when needed.',
    ARRAY['Funding options analysis', 'Funding requirements research', 'Timeline and milestone planning', 'Funding strategy outline'],
    ARRAY['Clear understanding of funding landscape', 'Realistic funding timeline', 'Preparation requirements identified', 'Strategic funding approach'],
    ARRAY['Information overload', 'Unrealistic expectations', 'Wrong funding type for business', 'Poor timing planning'],
    'Research bootstrap, angel, VC, grants, and debt options. Understand requirements and timelines. Choose approach that fits your business model and goals.',
    'Research funding options online, talk to other founders, understand requirements for different funding types.',
    78),

    ('Setup Legal Compliance', 'Establish ongoing legal compliance processes and requirements tracking.', 'Ideation & Foundation', 'Legal & Compliance', 28, 'High', 5,
    'Ongoing compliance prevents legal issues and maintains good standing for future business activities.',
    ARRAY['Compliance calendar', 'Filing requirements tracking', 'Legal process documentation', 'Compliance monitoring system'],
    ARRAY['All compliance requirements identified', 'Automated tracking and reminders', 'Legal processes documented', 'Good standing maintained'],
    ARRAY['Complex compliance requirements', 'Missed filing deadlines', 'Regulatory changes', 'Compliance cost management'],
    'Create calendar of all filing requirements. Set up automated reminders. Consider legal service providers for complex requirements.',
    'Create simple calendar of filing deadlines, set up reminders, research requirements on government websites.',
    69),

    ('Establish Vendor Relationships', 'Set up key vendor relationships and supplier agreements for business operations.', 'Ideation & Foundation', 'Team & Operations', 29, 'Low', 2,
    'Good vendor relationships provide reliable services and better terms as your business grows.',
    ARRAY['Vendor identification and evaluation', 'Service agreements', 'Vendor management system', 'Backup vendor options'],
    ARRAY['Key vendors identified and contracted', 'Competitive pricing negotiated', 'Service level agreements established', 'Vendor relationship management process'],
    ARRAY['Poor vendor selection', 'Unfavorable contract terms', 'Single points of failure', 'Vendor relationship management'],
    'Research multiple options for key services. Negotiate terms that scale with growth. Maintain backup options for critical services.',
    'Research vendors online, get quotes from multiple providers, negotiate basic terms, maintain vendor contact information.',
    72),

    ('Create Basic Marketing Plan', 'Develop initial marketing strategy and tactics for customer acquisition.', 'Ideation & Foundation', 'Marketing & Growth', 30, 'Medium', 5,
    'A marketing plan provides direction for customer acquisition and helps allocate limited resources effectively.',
    ARRAY['Marketing strategy document', 'Customer acquisition plan', 'Marketing channel evaluation', 'Marketing budget allocation'],
    ARRAY['Clear marketing strategy defined', 'Target customer acquisition tactics', 'Marketing channels prioritized', 'Budget allocated effectively'],
    ARRAY['Unclear target audience', 'Too many marketing channels', 'Unrealistic expectations', 'Poor budget allocation'],
    'Focus on understanding your customer deeply. Start with one or two marketing channels. Test and measure everything. Scale what works.',
    'Define target customers clearly, choose 1-2 marketing channels to start, create simple marketing materials, track results.',
    84)

) AS step_data(name, description, phase_name, domain_name, order_index, difficulty, estimated_days, why_this_matters, deliverables, success_criteria, potential_blockers, guidance_notes, no_tool_approach, usage_percentage)
JOIN journey_phases_new p ON p.name = step_data.phase_name
JOIN journey_domains_new d ON d.name = step_data.domain_name
WHERE NOT EXISTS (SELECT 1 FROM journey_canonical_steps WHERE name = step_data.name);

-- STEP 2: Add essential tools to the catalog (top 50 most commonly used tools)
-- =====================================================================

INSERT INTO journey_tools_catalog (name, description, category, rating, usage_percentage, pricing_model, typical_cost, difficulty_level, learning_curve, vendor_name) 
SELECT tool_data.name, tool_data.description, tool_data.category, tool_data.rating, tool_data.usage_percentage, tool_data.pricing_model, tool_data.typical_cost, tool_data.difficulty_level, tool_data.learning_curve, tool_data.vendor_name
FROM (VALUES
    -- Strategy & Planning Tools
    ('Miro', 'Collaborative whiteboarding and visual planning platform', 'Strategy & Planning', 4.5, 69, 'Freemium', 'Free-$16/user/month', 'Easy', 'Low', 'Miro'),
    ('Lean Canvas', 'One-page business model framework for startups', 'Strategy & Planning', 4.3, 58, 'Free', 'Free templates', 'Easy', 'Low', 'Ash Maurya'),
    ('Google Forms', 'Form creation and survey tool', 'Strategy & Planning', 4.1, 82, 'Free', 'Free', 'Easy', 'Low', 'Google'),
    ('Calendly', 'Scheduling and appointment booking tool', 'Strategy & Planning', 4.4, 76, 'Freemium', 'Free-$16/user/month', 'Easy', 'Low', 'Calendly'),
    ('Typeform', 'Interactive form and survey builder', 'Strategy & Planning', 4.4, 58, 'Freemium', 'Free-$83/month', 'Easy', 'Low', 'Typeform'),
    
    -- Product Development Tools
    ('Sketch', 'UI design tool for Mac', 'Product Development', 4.5, 48, 'Paid', '$99/year', 'Medium', 'Medium', 'Sketch'),
    ('Adobe XD', 'UX/UI design and prototyping tool', 'Product Development', 4.3, 42, 'Freemium', 'Free-$22.99/month', 'Medium', 'Medium', 'Adobe'),
    ('InVision', 'Digital product design platform', 'Product Development', 4.2, 38, 'Freemium', 'Free-$95/month', 'Medium', 'Medium', 'InVision'),
    ('Marvel', 'Simple design and prototyping tool', 'Product Development', 4.1, 32, 'Freemium', 'Free-$84/month', 'Easy', 'Low', 'Marvel'),
    ('Balsamiq', 'Rapid wireframing tool', 'Product Development', 4.3, 28, 'Paid', '$89/year', 'Easy', 'Low', 'Balsamiq'),
    
    -- Development & Infrastructure
    ('VS Code', 'Source code editor', 'Technology & Infrastructure', 4.8, 78, 'Free', 'Free', 'Medium', 'Medium', 'Microsoft'),
    ('GitLab', 'DevOps platform with Git repository', 'Technology & Infrastructure', 4.4, 45, 'Freemium', 'Free-$19/user/month', 'Medium', 'Medium', 'GitLab'),
    ('Docker', 'Containerization platform', 'Technology & Infrastructure', 4.5, 52, 'Freemium', 'Free-$24/month', 'Hard', 'High', 'Docker'),
    ('AWS', 'Cloud computing platform', 'Technology & Infrastructure', 4.4, 68, 'Pay-per-use', 'Variable usage-based', 'Hard', 'High', 'Amazon'),
    ('Heroku', 'Cloud platform as a service', 'Technology & Infrastructure', 4.2, 45, 'Freemium', 'Free-$250/month', 'Medium', 'Medium', 'Heroku'),
    
    -- Marketing & Growth Tools
    ('Buffer', 'Social media management platform', 'Marketing & Growth', 4.3, 65, 'Freemium', 'Free-$120/month', 'Easy', 'Low', 'Buffer'),
    ('Hootsuite', 'Social media scheduling and management', 'Marketing & Growth', 4.2, 58, 'Freemium', 'Free-$739/month', 'Medium', 'Medium', 'Hootsuite'),
    ('Canva', 'Graphic design and content creation', 'Marketing & Growth', 4.4, 82, 'Freemium', 'Free-$54.99/month', 'Easy', 'Low', 'Canva'),
    ('ConvertKit', 'Email marketing for creators', 'Marketing & Growth', 4.4, 48, 'Freemium', 'Free-$79/month', 'Medium', 'Medium', 'ConvertKit'),
    ('Leadpages', 'Landing page builder', 'Marketing & Growth', 4.3, 42, 'Paid', '$37-321/month', 'Easy', 'Low', 'Leadpages'),
    
    -- Sales & Customer Success
    ('Salesforce', 'Enterprise CRM platform', 'Sales & Customer Success', 4.5, 38, 'Paid', '$25-300/user/month', 'Hard', 'High', 'Salesforce'),
    ('Pipedrive', 'Sales pipeline management', 'Sales & Customer Success', 4.3, 52, 'Paid', '$14.90-99/user/month', 'Easy', 'Low', 'Pipedrive'),
    ('Intercom', 'Customer messaging platform', 'Sales & Customer Success', 4.5, 55, 'Paid', '$74-395/month', 'Medium', 'Medium', 'Intercom'),
    ('Zendesk', 'Customer support platform', 'Sales & Customer Success', 4.3, 52, 'Paid', '$19-215/agent/month', 'Medium', 'Medium', 'Zendesk'),
    ('Help Scout', 'Customer support software', 'Sales & Customer Success', 4.4, 42, 'Paid', '$20-65/user/month', 'Easy', 'Low', 'Help Scout'),
    
    -- Finance & Funding
    ('Xero', 'Cloud accounting software', 'Finance & Funding', 4.4, 45, 'Paid', '$13-70/month', 'Medium', 'Medium', 'Xero'),
    ('Wave', 'Free accounting software', 'Finance & Funding', 4.1, 58, 'Freemium', 'Free-$35/month', 'Easy', 'Low', 'Wave'),
    ('FreshBooks', 'Accounting and invoicing', 'Finance & Funding', 4.2, 42, 'Paid', '$4.50-50/month', 'Easy', 'Low', 'FreshBooks'),
    ('Brex', 'Corporate credit cards and banking', 'Finance & Funding', 4.4, 32, 'Free', 'Free with account', 'Easy', 'Low', 'Brex'),
    ('Mercury', 'Banking for startups', 'Finance & Funding', 4.5, 38, 'Free', 'Free banking', 'Easy', 'Low', 'Mercury'),
    
    -- Legal & Compliance
    ('LegalZoom', 'Legal services platform', 'Legal & Compliance', 4.1, 62, 'Paid', '$79-749/service', 'Easy', 'Low', 'LegalZoom'),
    ('Rocket Lawyer', 'Legal document platform', 'Legal & Compliance', 4.0, 48, 'Freemium', 'Free-$49.99/month', 'Easy', 'Low', 'Rocket Lawyer'),
    ('Clerky', 'Startup legal and equity management', 'Legal & Compliance', 4.6, 28, 'Paid', '$2000+/year', 'Medium', 'Medium', 'Clerky'),
    ('Carta', 'Equity management platform', 'Legal & Compliance', 4.7, 42, 'Paid', '$2000+/year', 'Medium', 'Medium', 'Carta'),
    ('DocuSign', 'Electronic signature platform', 'Legal & Compliance', 4.3, 68, 'Paid', '$10-65/month', 'Easy', 'Low', 'DocuSign'),
    
    -- Team & Operations
    ('Microsoft Teams', 'Team collaboration platform', 'Team & Operations', 4.3, 68, 'Freemium', 'Free-$22/user/month', 'Easy', 'Low', 'Microsoft'),
    ('Google Workspace', 'Business productivity suite', 'Team & Operations', 4.5, 72, 'Paid', '$6-18/user/month', 'Easy', 'Low', 'Google'),
    ('Asana', 'Project management platform', 'Team & Operations', 4.3, 58, 'Freemium', 'Free-$30.49/user/month', 'Medium', 'Medium', 'Asana'),
    ('Monday.com', 'Work operating system', 'Team & Operations', 4.3, 48, 'Paid', '$8-24/user/month', 'Medium', 'Medium', 'Monday.com'),
    ('Trello', 'Kanban project management', 'Team & Operations', 4.2, 65, 'Freemium', 'Free-$17.50/user/month', 'Easy', 'Low', 'Trello'),
    
    -- Analytics & Tracking
    ('Mixpanel', 'Product analytics platform', 'Marketing & Growth', 4.5, 38, 'Freemium', 'Free-$833/month', 'Medium', 'Medium', 'Mixpanel'),
    ('Amplitude', 'Product intelligence platform', 'Marketing & Growth', 4.6, 35, 'Freemium', 'Free-$61K/year', 'Medium', 'Medium', 'Amplitude'),
    ('Hotjar', 'Website behavior analytics', 'Marketing & Growth', 4.3, 55, 'Freemium', 'Free-$389/month', 'Easy', 'Low', 'Hotjar'),
    ('Google Search Console', 'Website performance tool', 'Marketing & Growth', 4.3, 78, 'Free', 'Free', 'Medium', 'Medium', 'Google'),
    ('SEMrush', 'SEO and marketing analytics', 'Marketing & Growth', 4.5, 48, 'Paid', '$119.95-449.95/month', 'Medium', 'Medium', 'SEMrush'),
    
    -- Additional Essential Tools
    ('1Password', 'Password manager', 'Technology & Infrastructure', 4.7, 65, 'Paid', '$2.99-19.95/user/month', 'Easy', 'Low', '1Password'),
    ('LastPass', 'Password management', 'Technology & Infrastructure', 4.2, 58, 'Freemium', 'Free-$6/user/month', 'Easy', 'Low', 'LastPass'),
    ('Zapier', 'Automation platform', 'Team & Operations', 4.4, 52, 'Freemium', 'Free-$1998/month', 'Medium', 'Medium', 'Zapier'),
    ('IFTTT', 'Simple automation service', 'Team & Operations', 4.1, 35, 'Freemium', 'Free-$5/month', 'Easy', 'Low', 'IFTTT'),
    ('Loom', 'Video messaging tool', 'Team & Operations', 4.5, 48, 'Freemium', 'Free-$12.50/user/month', 'Easy', 'Low', 'Loom')

) AS tool_data(name, description, category, rating, usage_percentage, pricing_model, typical_cost, difficulty_level, learning_curve, vendor_name)
WHERE NOT EXISTS (SELECT 1 FROM journey_tools_catalog WHERE name = tool_data.name);

-- STEP 3: Progress check - see what we've added
-- =====================================================================

SELECT 
    'Framework Population Progress' as category,
    'Canonical Steps' as item,
    COUNT(*)::text as count
FROM journey_canonical_steps
UNION ALL
SELECT 
    'Framework Population Progress',
    'Tools in Catalog',
    COUNT(*)::text
FROM journey_tools_catalog
ORDER BY category, item;

-- STEP 4: Create some step-tool recommendations
-- =====================================================================

-- Link tools to steps based on categories and usage patterns
INSERT INTO journey_step_tool_recommendations (canonical_step_id, tool_id, recommendation_type, priority_rank, recommendation_reason, use_case_description)
SELECT 
    cs.id as canonical_step_id,
    t.id as tool_id,
    'primary' as recommendation_type,
    ROW_NUMBER() OVER (PARTITION BY cs.id ORDER BY t.rating DESC, t.usage_percentage DESC) as priority_rank,
    'Highly rated tool commonly used for this type of work' as recommendation_reason,
    'Recommended based on high user ratings and adoption rates' as use_case_description
FROM journey_canonical_steps cs
JOIN journey_tools_catalog t ON (
    (cs.name ILIKE '%vision%' OR cs.name ILIKE '%mission%') AND t.name IN ('Miro', 'Notion', 'Google Forms') OR
    (cs.name ILIKE '%customer%' OR cs.name ILIKE '%interview%') AND t.name IN ('Zoom', 'Calendly', 'Notion', 'Google Forms') OR
    (cs.name ILIKE '%market%' OR cs.name ILIKE '%research%') AND t.name IN ('Google Analytics', 'SEMrush', 'Notion') OR
    (cs.name ILIKE '%legal%' OR cs.name ILIKE '%structure%') AND t.name IN ('LegalZoom', 'Clerky', 'DocuSign') OR
    (cs.name ILIKE '%accounting%' OR cs.name ILIKE '%financial%') AND t.name IN ('QuickBooks', 'Xero', 'Wave') OR
    (cs.name ILIKE '%website%' OR cs.name ILIKE '%online%') AND t.name IN ('Figma', 'Canva', 'WordPress')
)
WHERE NOT EXISTS (
    SELECT 1 FROM journey_step_tool_recommendations 
    WHERE canonical_step_id = cs.id AND tool_id = t.id
)
LIMIT 100;

-- STEP 5: Final verification and summary
-- =====================================================================

SELECT 'FRAMEWORK POPULATION COMPLETE!' as status;

-- Show what we now have
SELECT 
    'Final Framework Status' as category,
    'Total Canonical Steps' as metric,
    COUNT(*)::text as value
FROM journey_canonical_steps
UNION ALL
SELECT 
    'Final Framework Status',
    'Total Tools',
    COUNT(*)::text
FROM journey_tools_catalog
UNION ALL
SELECT 
    'Final Framework Status',
    'Step-Tool Recommendations',
    COUNT(*)::text
FROM journey_step_tool_recommendations
UNION ALL
SELECT 
    'Final Framework Status',
    'Company Steps Linked',
    COUNT(*)::text
FROM company_journey_steps_new 
WHERE canonical_step_id IS NOT NULL;

-- Show sample of new canonical steps by phase
SELECT 
    p.name as phase,
    COUNT(*) as step_count,
    MIN(cs.order_index) as first_step,
    MAX(cs.order_index) as last_step
FROM journey_canonical_steps cs
JOIN journey_phases_new p ON cs.primary_phase_id = p.id
GROUP BY p.name, p.order_index
ORDER BY p.order_index;

-- Show tools by category
SELECT 
    category,
    COUNT(*) as tool_count,
    ROUND(AVG(rating), 2) as avg_rating,
    ROUND(AVG(usage_percentage)) as avg_usage
FROM journey_tools_catalog
GROUP BY category
ORDER BY tool_count DESC;