# Sample Experts Data

## Overview

This document describes the sample expert profiles that have been added to the database for testing and demonstration purposes. These sample experts represent different areas of expertise and provide a realistic view of how the expert onboarding and connection system works.

## Sample Users

We've created sample user accounts in both the `auth.users` and `public.users` tables that can be used for testing and demonstration purposes. These users have the following credentials:

| Role | Email | Password | Name |
|------|-------|----------|------|
| Technical Expert | tech.expert@example.com | password123 | Alex Chen |
| Business Expert | business.expert@example.com | password123 | Sarah Johnson |
| Marketing Expert | marketing.expert@example.com | password123 | Miguel Rodriguez |
| Financial Expert | financial.expert@example.com | password123 | Priya Patel |
| Design Expert | design.expert@example.com | password123 | Jordan Taylor |

You can log in as any of these users to test the expert onboarding and connection system from different perspectives.

## Sample Expert Profiles

The following sample expert profiles have been added to the database and linked to the sample users:

### 1. Technical Expert

**Primary Expertise Areas:** Software Development, Cloud Architecture, DevOps
**Secondary Expertise Areas:** Microservices, Kubernetes, CI/CD
**Industry Experience:** Enterprise (8 years), Startup (7 years)
**Functional Experience:** Engineering (15 years), Architecture (10 years)
**Company Stages:** seed, growth, exit
**Mentorship Capacity:** 5 mentees
**Years of Experience:** 15
**Hourly Rate:** $150
**Availability:** Weekdays 9am-5pm EST
**Bio:** Experienced software architect with a passion for building scalable systems. Specializes in cloud-native applications and microservices architecture.
**Success Stories:** 
- Helped a startup scale their infrastructure to handle 10x growth in 6 months.
- Reduced AWS costs by 40% while improving performance.
**Education:** M.S. Computer Science, Stanford University
**Certifications:** AWS Certified Solutions Architect, Google Cloud Professional Architect, Microsoft Certified: Azure Solutions Architect

### 2. Business Strategy Expert

**Primary Expertise Areas:** Business Strategy, Startup Growth, Product Management
**Secondary Expertise Areas:** Go-to-Market, Team Building, Fundraising
**Industry Experience:** SaaS (8 years), E-commerce (4 years)
**Functional Experience:** Product (12 years), Strategy (10 years)
**Company Stages:** seed, series_a, series_b
**Mentorship Capacity:** 3 mentees
**Years of Experience:** 12
**Hourly Rate:** $200
**Availability:** Tuesday-Thursday, 10am-6pm PST
**Bio:** Former VP of Product at a Fortune 500 company, now helping startups and mid-size companies define their product strategy and growth plans.
**Success Stories:** 
- Guided a SaaS startup from idea to $5M ARR in 18 months.
- Helped restructure a product team that increased feature delivery by 200%.
**Education:** MBA, Harvard Business School
**Certifications:** Certified Scrum Product Owner, PMI Project Management Professional

### 3. Marketing Expert

**Primary Expertise Areas:** Digital Marketing, Content Strategy, SEO/SEM
**Secondary Expertise Areas:** Social Media, Email Marketing, Analytics
**Industry Experience:** B2B (6 years), B2C (4 years)
**Functional Experience:** Marketing (10 years), Growth (8 years)
**Company Stages:** seed, growth
**Mentorship Capacity:** 4 mentees
**Years of Experience:** 10
**Hourly Rate:** $125
**Availability:** Monday-Friday, flexible hours
**Bio:** Digital marketing strategist with expertise in growth marketing, content creation, and conversion optimization. Helps businesses build effective marketing engines.
**Success Stories:** 
- Increased organic traffic by 300% for an e-commerce client.
- Developed a content strategy that generated 15000 new leads in 3 months.
**Education:** B.A. Marketing, NYU Stern School of Business
**Certifications:** Google Analytics Certified, HubSpot Marketing Certification, Facebook Blueprint Certification

### 4. Financial Expert

**Primary Expertise Areas:** Financial Planning, Investment Strategy, Startup Funding
**Secondary Expertise Areas:** Venture Capital, Angel Investing, Financial Modeling
**Industry Experience:** FinTech (10 years), Venture Capital (8 years)
**Functional Experience:** Finance (18 years), Investment (15 years)
**Company Stages:** seed, series_a, series_b, series_c_plus
**Mentorship Capacity:** 2 mentees
**Years of Experience:** 18
**Hourly Rate:** $175
**Availability:** Wednesday-Friday, 9am-3pm EST
**Bio:** Financial advisor with experience in venture capital, startup funding, and personal finance. Helps entrepreneurs make sound financial decisions.
**Success Stories:** 
- Helped a tech startup secure $2M in seed funding.
- Developed financial models that attracted Series A investors for multiple clients.
**Education:** MBA, Finance, Wharton School of Business
**Certifications:** Certified Financial Planner (CFP), Chartered Financial Analyst (CFA)

### 5. UX/UI Design Expert

**Primary Expertise Areas:** UX Design, UI Design, Product Design
**Secondary Expertise Areas:** Design Systems, User Research, Prototyping
**Industry Experience:** SaaS (5 years), Mobile Apps (3 years)
**Functional Experience:** Design (8 years), Product (5 years)
**Company Stages:** pre_seed, growth
**Mentorship Capacity:** 6 mentees
**Years of Experience:** 8
**Hourly Rate:** $140
**Availability:** Monday, Wednesday, Friday, 11am-7pm CST
**Bio:** Product designer specializing in user experience and interface design. Helps companies create intuitive, beautiful products that users love.
**Success Stories:** 
- Redesigned a SaaS platform that increased user engagement by 45%.
- Created a design system that improved development efficiency by 30%.
**Education:** B.F.A. Graphic Design, Rhode Island School of Design
**Certifications:** Adobe Certified Expert, Google UX Design Certificate

## Sample Expert Availability

Each expert has specific availability days and times set in the `expert_availability` table. This allows users to see when experts are available for consultations and sessions.

## Sample Contract Templates

Two sample contract templates have been added:

1. **Standard Consulting Agreement** - For the Technical Expert
2. **Business Strategy Consulting Agreement** - For the Business Strategy Expert

These templates demonstrate how experts can create and use contract templates for their client engagements.

## Schema Details

The expert profiles include the following key fields:

- `primary_expertise_areas`: Array of primary areas of expertise
- `secondary_expertise_areas`: Array of secondary areas of expertise
- `industry_experience`: JSON object with industry names and years of experience
- `functional_experience`: JSON object with functional areas and years of experience
- `company_stages_experienced`: Array of company stages the expert has worked with
- `mentorship_capacity`: Number of mentees the expert can take on
- `years_of_experience`: Total years of professional experience
- `bio`: Detailed description of the expert's background
- `success_stories`: Notable achievements and case studies
- `certifications`: Professional certifications
- `education`: Educational background
- `hourly_rate`: Consulting rate in USD
- `availability_description`: Text description of availability
- `mentorship_style`: Description of mentorship approach
- `is_accepting_clients`: Whether the expert is currently accepting new clients
- `is_featured`: Whether the expert is featured on the platform
- `rating`: Average rating (0-5 scale)
- `review_count`: Number of reviews received

## Implementation Details

The sample data is implemented in:

- `supabase/migrations/20250607_add_sample_experts.sql` - SQL migration file with sample data
- `supabase/apply_sample_experts.sh` - Script to apply the migration

## Usage Notes

1. The sample users have been created in both the `auth.users` and `public.users` tables with predefined UUIDs that match the expert profiles.

2. To apply the sample data to your database, use the combined script:
   ```bash
   cd supabase
   chmod +x apply_sample_data.sh
   ./apply_sample_data.sh
   ```
   
   Alternatively, you can run the individual scripts in this order:
   ```bash
   chmod +x apply_startup_stage_enum.sh
   ./apply_startup_stage_enum.sh
   chmod +x apply_expert_profiles_additional_fields.sh
   ./apply_expert_profiles_additional_fields.sh
   chmod +x apply_sample_users.sh
   ./apply_sample_users.sh
   chmod +x apply_sample_experts.sh
   ./apply_sample_experts.sh
   ```

3. After applying the sample data, you should be able to see the expert profiles in the Community Experts page.

## Important Considerations

- These sample users and experts are for demonstration purposes only and do not represent real individuals.
- The sample data assumes that the expert_profiles, expert_availability, and expert_contract_templates tables have already been created through previous migrations.
- The password hashing in the sample users migration is simplified for demonstration purposes. In a production environment, you would use Supabase Auth API to create users with proper password hashing.
- You can use these sample accounts to test the entire expert onboarding and connection flow, including:
  - Logging in as an expert
  - Viewing and editing expert profiles
  - Creating contract templates
  - Logging in as a regular user
  - Connecting with experts
  - Scheduling sessions
  - Creating and signing contracts
