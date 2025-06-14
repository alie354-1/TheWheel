# Journey System Data Verification

This document explains how to verify that the new journey system is properly using the populated data.

## Overview

The journey system has been populated with the following data:

- **5 phases** in `journey_phases_new` table
- **8 domains** in `journey_domains_new` table
- **150 canonical steps** in `journey_canonical_steps` table
- **50+ tools** in `journey_tools_catalog` table
- **100+ step-tool recommendations** in `journey_step_tool_recommendations` table

The verification scripts in this repository will help you confirm that all this data is properly populated and accessible to the journey system.

## Verification Scripts

### 1. `check_journey_data.js`

This Node.js script connects to your Supabase database and verifies that all the required data is present. It checks:

- The number of phases, domains, steps, tools, and recommendations
- The distribution of steps across phases and domains
- The completeness of step metadata (deliverables, success criteria, etc.)
- The distribution of tools across categories
- The coverage of step-tool recommendations

The script provides a detailed report and an overall implementation score.

### 2. `run_journey_verification.sh`

This shell script is a wrapper around `check_journey_data.js` that:

- Checks for required environment variables
- Prompts for Supabase credentials if not found
- Installs required dependencies
- Runs the verification script
- Provides guidance based on the results

### 3. `src/utils/test_journey_framework.js`

This Node.js script tests if the journey framework service is properly using the populated data. It focuses on testing the service layer's ability to access and use the journey data. It checks:

- If the service can fetch phases, domains, steps, and tools
- If the service can fetch step-tool recommendations
- If the service can fetch steps by phase and domain
- If the service can fetch a specific step by ID
- If the step metadata is properly accessible through the service

### 4. `run_framework_test.sh`

This shell script is a wrapper around `src/utils/test_journey_framework.js` that:

- Checks for required environment variables
- Prompts for Supabase credentials if not found
- Installs required dependencies
- Runs the framework service test script
- Provides guidance based on the results

## Running the Verification

### Database Verification

1. Make sure you have Node.js installed
2. Set up your Supabase credentials in a `.env` file or be ready to enter them when prompted
3. Run the database verification script:

```bash
./run_journey_verification.sh
```

### Framework Service Verification

1. Make sure you have Node.js installed
2. Set up your Supabase credentials in a `.env` file or be ready to enter them when prompted
3. Run the framework service test script:

```bash
./run_framework_test.sh
```

## Interpreting the Results

The verification script will output a detailed report with the following sections:

1. **Phases Verification**: Confirms all 5 phases are present
2. **Domains Verification**: Confirms all 8 domains are present
3. **Canonical Steps Verification**: Confirms all 150 steps are present and properly distributed
4. **Tools Catalog Verification**: Confirms 50+ tools are present with proper metadata
5. **Step-Tool Recommendations Verification**: Confirms 100+ recommendations are present
6. **Coverage Analysis**: Shows how well steps are covered by tool recommendations
7. **Verification Summary**: Provides an overall implementation score

## Troubleshooting

If the verification fails or shows incomplete data:

1. Check the SQL migration files to ensure they're properly populating the data
2. Run the migrations again if needed
3. Manually verify the data in the Supabase dashboard
4. Check for any errors in the console output

## Data Structure

The journey system uses the following data structure:

### Phases

The 5 phases represent the stages of a founder's journey:
- Ideation & Foundation
- Planning & Development
- Pre-Launch & Validation
- Launch & Growth
- Scale & Optimize

### Domains

The 8 domains represent different areas of focus:
- Strategy & Planning
- Product Development
- Marketing & Growth
- Sales & Customer Success
- Finance & Funding
- Legal & Compliance
- Team & Operations
- Technology & Infrastructure

### Canonical Steps

The 150 canonical steps represent the standard steps that founders typically take. Each step includes:
- Basic information (name, description)
- Phase and domain associations
- Rich metadata (deliverables, success criteria, potential blockers, etc.)
- Difficulty and time estimates

### Tools Catalog

The tools catalog contains 50+ tools that can help founders complete steps, including:
- Tool information (name, description, URL)
- Ratings and usage statistics
- Pricing information
- Difficulty level and learning curve

### Step-Tool Recommendations

The step-tool recommendations link canonical steps to appropriate tools, including:
- Priority ranking
- Recommendation type
- Recommendation reason

## Next Steps

After verifying the data, you can:

1. Test the journey system with a company account
2. Create a company journey and add steps
3. Verify that the recommendations are appearing correctly
4. Check that the dashboard is displaying the correct data
