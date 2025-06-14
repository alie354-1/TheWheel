-- Migration for Journey Dashboard AI Recommendation Persistence System
-- Date: 2025-06-17

-- Create tables for AI-generated content persistence

-- 1. Recommendations table
CREATE TABLE IF NOT EXISTS ai_generated_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  step_id UUID REFERENCES journey_new_steps(id) ON DELETE SET NULL,
  content JSONB NOT NULL, -- Full recommendation data including all fields
  context_hash TEXT NOT NULL, -- Hash of company state when generated
  status TEXT NOT NULL CHECK (status IN ('fresh', 'active', 'completed', 'stale')),
  generation_model TEXT NOT NULL, -- e.g., 'gpt-4-0613'
  generation_prompt_id TEXT, -- Reference to prompt used
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_presented_at TIMESTAMPTZ,
  times_presented INTEGER NOT NULL DEFAULT 0,
  user_feedback JSONB, -- Optional feedback on quality/relevance
  UNIQUE(company_id, step_id, context_hash)
);

CREATE INDEX ON ai_generated_recommendations(company_id, status);
CREATE INDEX ON ai_generated_recommendations(context_hash);

-- 2. Peer insights table
CREATE TABLE IF NOT EXISTS ai_generated_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES journey_new_domains(id) ON DELETE SET NULL,
  step_id UUID REFERENCES journey_new_steps(id) ON DELETE SET NULL,
  content TEXT NOT NULL, -- The actual insight text
  author_profile JSONB NOT NULL, -- Author metadata (name, company, etc.)
  context_hash TEXT NOT NULL, -- Hash of company state when generated
  relevance_score FLOAT, -- How relevant this insight is (0.5-1.0)
  generation_model TEXT NOT NULL,
  generation_prompt_id TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_presented_at TIMESTAMPTZ,
  times_presented INTEGER NOT NULL DEFAULT 0,
  UNIQUE(company_id, id) -- Each insight is unique
);

CREATE INDEX ON ai_generated_insights(company_id, domain_id);
CREATE INDEX ON ai_generated_insights(company_id, step_id);
CREATE INDEX ON ai_generated_insights(relevance_score);

-- 3. Business health summaries table
CREATE TABLE IF NOT EXISTS ai_business_health_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content JSONB NOT NULL, -- Full health summary data
  context_hash TEXT NOT NULL,
  generation_model TEXT NOT NULL,
  generation_prompt_id TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_presented_at TIMESTAMPTZ,
  times_presented INTEGER NOT NULL DEFAULT 0,
  UNIQUE(company_id, context_hash)
);

CREATE INDEX ON ai_business_health_summaries(company_id);
CREATE INDEX ON ai_business_health_summaries(generated_at);

-- 4. Context snapshots table
CREATE TABLE IF NOT EXISTS ai_context_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  context_hash TEXT NOT NULL,
  context_data JSONB NOT NULL, -- The actual context data used for generation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, context_hash)
);

CREATE INDEX ON ai_context_snapshots(company_id, context_hash);

-- 5. Generation prompts table
CREATE TABLE IF NOT EXISTS ai_generation_prompts (
  id TEXT PRIMARY KEY, -- e.g., 'recommendation_v1', 'peer_insight_v2'
  prompt_type TEXT NOT NULL, -- 'recommendation', 'peer_insight', 'health_summary'
  prompt_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL,
  UNIQUE(prompt_type, version)
);

-- 6. Generation logs table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL, -- 'recommendation', 'peer_insight', 'health_summary'
  prompt_id TEXT REFERENCES ai_generation_prompts(id),
  model_used TEXT NOT NULL,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON ai_generation_logs(company_id, created_at);
CREATE INDEX ON ai_generation_logs(generation_type, success);

-- 7. Recommendation effectiveness tracking
CREATE TABLE IF NOT EXISTS ai_recommendation_effectiveness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID REFERENCES ai_generated_recommendations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  was_started BOOLEAN,
  was_completed BOOLEAN,
  time_to_start INTERVAL,
  time_to_complete INTERVAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON ai_recommendation_effectiveness(recommendation_id);
CREATE INDEX ON ai_recommendation_effectiveness(company_id);

-- Functions for recommendation lifecycle management

-- Function to update recommendation status
CREATE OR REPLACE FUNCTION update_recommendation_status(
  p_recommendation_id UUID,
  p_new_status TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_generated_recommendations
  SET 
    status = p_new_status,
    last_presented_at = CASE WHEN p_new_status = 'active' THEN NOW() ELSE last_presented_at END,
    times_presented = CASE WHEN p_new_status = 'active' THEN times_presented + 1 ELSE times_presented END
  WHERE id = p_recommendation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if content should be regenerated
CREATE OR REPLACE FUNCTION should_regenerate_content(
  p_company_id UUID,
  p_content_type TEXT,
  p_context_hash TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_hash TEXT;
  v_last_generated TIMESTAMPTZ;
  v_regenerate BOOLEAN := false;
BEGIN
  -- Get current context hash for the company
  SELECT context_hash INTO v_current_hash
  FROM ai_context_snapshots
  WHERE company_id = p_company_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if context has changed significantly
  IF v_current_hash != p_context_hash THEN
    v_regenerate := true;
  END IF;
  
  -- Check time-based expiration
  IF p_content_type = 'recommendation' THEN
    SELECT MAX(generated_at) INTO v_last_generated
    FROM ai_generated_recommendations
    WHERE company_id = p_company_id AND status NOT IN ('stale');
    
    IF v_last_generated IS NULL OR v_last_generated < NOW() - INTERVAL '14 days' THEN
      v_regenerate := true;
    END IF;
  ELSIF p_content_type = 'insight' THEN
    SELECT MAX(generated_at) INTO v_last_generated
    FROM ai_generated_insights
    WHERE company_id = p_company_id;
    
    IF v_last_generated IS NULL OR v_last_generated < NOW() - INTERVAL '30 days' THEN
      v_regenerate := true;
    END IF;
  ELSIF p_content_type = 'health' THEN
    SELECT MAX(generated_at) INTO v_last_generated
    FROM ai_business_health_summaries
    WHERE company_id = p_company_id;
    
    IF v_last_generated IS NULL OR v_last_generated < NOW() - INTERVAL '7 days' THEN
      v_regenerate := true;
    END IF;
  END IF;
  
  RETURN v_regenerate;
END;
$$ LANGUAGE plpgsql;

-- Function to generate context hash for a company
CREATE OR REPLACE FUNCTION generate_company_context_hash(
  p_company_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_completed_steps TEXT;
  v_in_progress_steps TEXT;
  v_domain_levels TEXT;
  v_last_activity TIMESTAMPTZ;
  v_context_data JSONB;
  v_hash TEXT;
BEGIN
  -- Get completed steps
  SELECT string_agg(id::text, ',') INTO v_completed_steps
  FROM company_new_journey_steps
  WHERE company_journey_id = p_company_id AND status = 'completed'
  ORDER BY id;
  
  -- Get in-progress steps
  SELECT string_agg(id::text, ',') INTO v_in_progress_steps
  FROM company_new_journey_steps
  WHERE company_journey_id = p_company_id AND status = 'in_progress'
  ORDER BY id;
  
  -- Get domain maturity levels
  SELECT string_agg(domain_id::text || ':' || maturity_level, ',') INTO v_domain_levels
  FROM company_new_journey_steps
  WHERE company_journey_id = p_company_id AND domain_id IS NOT NULL
  ORDER BY domain_id;
  
  -- Get last activity timestamp
  SELECT MAX(created_at) INTO v_last_activity
  FROM new_journey_step_outcomes
  WHERE company_journey_id = p_company_id;
  
  -- Construct context data
  v_context_data := jsonb_build_object(
    'completed_steps', v_completed_steps,
    'in_progress_steps', v_in_progress_steps,
    'domain_levels', v_domain_levels,
    'last_activity', v_last_activity
  );
  
  -- Generate hash
  v_hash := encode(sha256(v_context_data::text::bytea), 'hex');
  
  -- Store context snapshot
  INSERT INTO ai_context_snapshots (company_id, context_hash, context_data)
  VALUES (p_company_id, v_hash, v_context_data)
  ON CONFLICT (company_id, context_hash) DO NOTHING;
  
  RETURN v_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommendations with fallback
CREATE OR REPLACE FUNCTION get_recommendations_with_fallback(
  p_company_id UUID,
  p_limit INTEGER DEFAULT 3
) RETURNS SETOF ai_generated_recommendations AS $$
DECLARE
  v_context_hash TEXT;
  v_found_count INTEGER;
BEGIN
  -- Get current context hash
  v_context_hash := generate_company_context_hash(p_company_id);
  
  -- Try to get recommendations for current context
  RETURN QUERY
  SELECT * FROM ai_generated_recommendations
  WHERE company_id = p_company_id
    AND context_hash = v_context_hash
    AND status IN ('fresh', 'active')
  ORDER BY generated_at DESC
  LIMIT p_limit;
  
  GET DIAGNOSTICS v_found_count = ROW_COUNT;
  
  -- If not enough found, fall back to any non-stale recommendations
  IF v_found_count < p_limit THEN
    RETURN QUERY
    SELECT * FROM ai_generated_recommendations
    WHERE company_id = p_company_id
      AND status IN ('fresh', 'active')
      AND id NOT IN (
        SELECT id FROM ai_generated_recommendations
        WHERE company_id = p_company_id
          AND context_hash = v_context_hash
          AND status IN ('fresh', 'active')
      )
    ORDER BY generated_at DESC
    LIMIT (p_limit - v_found_count);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to mark stale recommendations in batch
CREATE OR REPLACE FUNCTION mark_stale_recommendations_batch(
  p_batch_size INTEGER DEFAULT 1000
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  WITH updated AS (
    UPDATE ai_generated_recommendations
    SET status = 'stale'
    WHERE id IN (
      SELECT r.id
      FROM ai_generated_recommendations r
      JOIN ai_context_snapshots s ON r.company_id = s.company_id
      WHERE r.status IN ('fresh', 'active')
        AND r.context_hash != s.context_hash
        AND s.created_at > r.generated_at
      ORDER BY r.generated_at ASC
      LIMIT p_batch_size
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM updated;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to track recommendation effectiveness when step is started
CREATE OR REPLACE FUNCTION track_recommendation_start(
  p_recommendation_id UUID
) RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
  v_generated_at TIMESTAMPTZ;
BEGIN
  -- Get recommendation details
  SELECT company_id, generated_at INTO v_company_id, v_generated_at
  FROM ai_generated_recommendations
  WHERE id = p_recommendation_id;
  
  -- Update or insert effectiveness record
  INSERT INTO ai_recommendation_effectiveness (
    recommendation_id, company_id, was_started, time_to_start
  )
  VALUES (
    p_recommendation_id, v_company_id, true, NOW() - v_generated_at
  )
  ON CONFLICT (recommendation_id) DO UPDATE
  SET 
    was_started = true,
    time_to_start = NOW() - v_generated_at;
    
  -- Update recommendation status
  PERFORM update_recommendation_status(p_recommendation_id, 'active');
END;
$$ LANGUAGE plpgsql;

-- Function to track recommendation completion
CREATE OR REPLACE FUNCTION track_recommendation_completion(
  p_recommendation_id UUID
) RETURNS VOID AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_generated_at TIMESTAMPTZ;
  v_company_id UUID;
BEGIN
  -- Get recommendation details
  SELECT r.company_id, r.generated_at, e.created_at
  INTO v_company_id, v_generated_at, v_start_time
  FROM ai_generated_recommendations r
  LEFT JOIN ai_recommendation_effectiveness e ON r.id = e.recommendation_id
  WHERE r.id = p_recommendation_id;
  
  -- If no effectiveness record exists, create one
  IF v_start_time IS NULL THEN
    v_start_time := NOW();
    
    INSERT INTO ai_recommendation_effectiveness (
      recommendation_id, company_id, was_started, was_completed, 
      time_to_start, time_to_complete
    )
    VALUES (
      p_recommendation_id, v_company_id, true, true,
      NOW() - v_generated_at, interval '0'
    );
  ELSE
    -- Update existing record
    UPDATE ai_recommendation_effectiveness
    SET 
      was_completed = true,
      time_to_complete = NOW() - v_start_time
    WHERE recommendation_id = p_recommendation_id;
  END IF;
  
  -- Update recommendation status
  PERFORM update_recommendation_status(p_recommendation_id, 'completed');
END;
$$ LANGUAGE plpgsql;

-- Function for daily maintenance
CREATE OR REPLACE FUNCTION ai_daily_maintenance() RETURNS VOID AS $$
DECLARE
  v_batch_count INTEGER;
  v_total_count INTEGER := 0;
BEGIN
  -- Mark stale recommendations in batches
  LOOP
    v_batch_count := mark_stale_recommendations_batch(1000);
    v_total_count := v_total_count + v_batch_count;
    EXIT WHEN v_batch_count = 0;
  END LOOP;
  
  -- Clean up old context snapshots (keep 90 days of history)
  DELETE FROM ai_context_snapshots
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old generation logs (keep 90 days of history)
  DELETE FROM ai_generation_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log the maintenance run
  INSERT INTO system_logs (component, message)
  VALUES ('ai_maintenance', format('Marked %s recommendations as stale', v_total_count));
END;
$$ LANGUAGE plpgsql;

-- Function to get AI usage statistics
CREATE OR REPLACE FUNCTION get_ai_usage_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS TABLE(
  day DATE,
  generation_type TEXT,
  generations_count INTEGER,
  tokens_used INTEGER,
  avg_generation_time_ms NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) AS day,
    generation_type,
    COUNT(*) AS generations_count,
    SUM(tokens_used) AS tokens_used,
    AVG(generation_time_ms)::NUMERIC AS avg_generation_time_ms,
    (SUM(CASE WHEN success THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100)::NUMERIC AS success_rate
  FROM ai_generation_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date
  GROUP BY DATE(created_at), generation_type
  ORDER BY DATE(created_at), generation_type;
END;
$$ LANGUAGE plpgsql;

-- Initialize with sample prompt templates
INSERT INTO ai_generation_prompts (id, prompt_type, prompt_template, version, active)
VALUES 
  ('recommendation_v1', 'recommendation', 
   'You are an expert founder advisor specializing in recommending strategic next steps for startups.
   Your recommendations are based on patterns observed across thousands of similar companies.
   
   CONTEXT:
   Company Profile:
   - Industry: {company.industry}
   - Stage: {company.stage}
   - Size: {company.size}
   - Founded: {company.foundedDate}
   
   Current Progress:
   - Completed Steps: [{list of completed steps with domains}]
   - In Progress Steps: [{list of in-progress steps with domains}]
   - Domain Maturity Levels: [{domain maturity levels}]
   
   Recent Activity:
   - Last worked on: {last step worked on}
   - Time spent on: {recent time allocation by domain}
   
   Peer Activity Patterns:
   - Companies similar to this one often do {step X} after {step Y}
   - {percentage}% of similar companies focus on {domain} at this stage
   - Common next steps after current progress: [{step statistics}]
   
   TASK:
   Generate {limit} personalized step recommendations for this company that would be most valuable to tackle next. 
   Each recommendation should include a compelling "why" explanation that references:
   1. The company''s specific progress and context
   2. Patterns observed in similar companies
   3. The strategic value of this step at their current stage
   
   FORMAT:
   Generate a JSON array of recommendation objects with these fields:
   - id: A unique identifier
   - stepId: The ID of the recommended step
   - name: The name of the step
   - description: A brief description of what the step involves
   - domain: The domain this step belongs to
   - domainId: The domain ID
   - priority: "High", "Medium", or "Low" based on urgency
   - reason: A compelling explanation of why this step is recommended now (1-2 sentences)
   - peerAdoptionPercentage: Percentage of similar companies that did this step (realistic number)
   - estimatedTime: Estimated time to complete this step (e.g., "3-5 days")
   - difficulty: "Easy", "Medium", or "Hard"
   - recommendedTools: Array of 2-3 tools commonly used for this step
   
   CONSTRAINTS:
   - Make reasons specific to this company''s context and progress
   - Ensure the peer adoption percentages are realistic (not all 90%+)
   - Vary the priority levels across recommendations
   - Ensure recommended steps build logically on their current progress', 
   1, true),
   
  ('peer_insight_v1', 'peer_insight', 
   'You are generating authentic peer insights from founders who have been through similar journeys.
   These insights should feel like real advice from experienced founders, not generic platitudes.
   
   CONTEXT:
   Company Profile:
   - Industry: {company.industry}
   - Stage: {company.stage}
   - Current Focus: {current domains of focus}
   - Current Challenges: {derived from in-progress steps}
   
   Relevant Peer Data:
   - Founders in {industry} typically emphasize {patterns}
   - Common learnings from companies at this stage: [{insights}]
   - Challenges frequently mentioned: [{challenges}]
   
   TASK:
   Generate {limit} authentic-sounding peer insights from fictional founders that would be helpful and relevant
   to this company''s current situation. Each insight should feel like it comes from a real person
   sharing a specific learning or experience related to the company''s current focus or challenges.
   
   FORMAT:
   Generate a JSON array of peer insight objects with these fields:
   - id: A unique identifier
   - authorProfile: {
     name: A realistic founder name,
     company: A fictional company name appropriate for their industry,
     industry: Their primary industry
   }
   - content: The actual insight in conversational first-person language (1-3 sentences)
   - domainId: The domain this insight is most relevant to
   - stepId: The specific step this insight relates to (if applicable)
   - relevanceScore: A number from 0.5-1.0 indicating how relevant this is to the company''s current situation
   
   CONSTRAINTS:
   - Write insights in authentic first-person founder voice (conversational, specific)
   - Include specific details that make the insight credible
   - Vary the length, style, and tone across different insights
   - Make the insights actionable and substantive, not generic
   - Ensure insights reflect realistic founder experiences', 
   1, true),
   
  ('health_summary_v1', 'health_summary', 
   'You are an expert at analyzing startup health across different domains of operation.
   You identify patterns, strengths, and areas needing attention based on progress data.
   
   CONTEXT:
   Company Profile:
   - Industry: {company.industry}
   - Stage: {company.stage}
   - Founded: {company.foundedDate}
   
   Domain Progress:
   {for each domain, provide:}
   - Domain: {name}
   - Maturity Level: {level} out of 5
   - Steps Completed: [{step names}]
   - Time Invested: {time}
   - Industry Benchmark: {average maturity for similar companies}
   
   Overall Metrics:
   - Total Steps Completed: {count} / {total}
   - Domains at/above benchmark: {count} / {total}
   - Most time invested in: {domain}
   - Least time invested in: {domain}
   
   TASK:
   Analyze the company''s progress across domains and generate a business health summary. 
   Identify strengths to maintain and specific areas needing attention, with concrete focus recommendations.
   
   FORMAT:
   Generate a JSON object with these fields:
   - overallStatus: "Healthy", "Needs Attention", or "At Risk"
   - domains: [Array of domain summary objects with:
     - domainId
     - name
     - maturityLevel
     - currentState: "active_focus", "maintaining", or "future_focus"
     - strengths: [Array of specific strengths in this domain]
     - focusAreas: [Array of specific areas needing improvement]
   ]
   - focusRecommendations: [Array of 2-4 specific, actionable focus recommendations]
   
   CONSTRAINTS:
   - Base the analysis on actual progress data, not generic advice
   - Make strengths and focus areas specific, not generic
   - Ensure recommendations are concrete and actionable
   - Balance positive reinforcement with growth opportunities
   - Consider industry-specific patterns and benchmarks in the analysis', 
   1, true)
ON CONFLICT (id) DO NOTHING;

-- Add comments to tables for better documentation
COMMENT ON TABLE ai_generated_recommendations IS 'Stores step recommendations generated by AI for each company';
COMMENT ON TABLE ai_generated_insights IS 'Stores peer insights generated by AI for companies';
COMMENT ON TABLE ai_business_health_summaries IS 'Stores AI-generated business health analysis for companies';
COMMENT ON TABLE ai_context_snapshots IS 'Stores snapshots of company context for tracking changes';
COMMENT ON TABLE ai_generation_prompts IS 'Stores versioned prompts used for generation';
COMMENT ON TABLE ai_generation_logs IS 'Tracks AI generation events for monitoring and optimization';
COMMENT ON TABLE ai_recommendation_effectiveness IS 'Tracks effectiveness of recommendations';

-- Add comments to functions for better documentation
COMMENT ON FUNCTION update_recommendation_status IS 'Updates recommendation status and tracking metrics';
COMMENT ON FUNCTION should_regenerate_content IS 'Determines if content should be regenerated based on context changes and time';
COMMENT ON FUNCTION generate_company_context_hash IS 'Generates and stores a hash of company context';
COMMENT ON FUNCTION get_recommendations_with_fallback IS 'Gets recommendations with fallback to older content if needed';
COMMENT ON FUNCTION mark_stale_recommendations_batch IS 'Marks recommendations as stale in batches for better performance';
COMMENT ON FUNCTION track_recommendation_start IS 'Tracks when a user starts working on a recommendation';
COMMENT ON FUNCTION track_recommendation_completion IS 'Tracks when a user completes a recommendation';
COMMENT ON FUNCTION ai_daily_maintenance IS 'Performs daily maintenance tasks on AI content';
COMMENT ON FUNCTION get_ai_usage_stats IS 'Gets usage statistics for AI generation';
