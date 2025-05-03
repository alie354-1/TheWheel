-- Seed Tool Recommendations SQL Script
-- This script can be run directly in the Supabase SQL Editor

-- First, make sure tool_recommendations table exists
DROP TABLE IF EXISTS tool_recommendations CASCADE;
CREATE TABLE tool_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  relevance_score NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(step_id, tool_id)
);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_step_id ON tool_recommendations(step_id);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_tool_id ON tool_recommendations(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_relevance ON tool_recommendations(relevance_score DESC);

-- Enable RLS
ALTER TABLE tool_recommendations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - users can see recommendations if they are a member of the company
CREATE POLICY IF NOT EXISTS tool_recommendations_select_policy ON tool_recommendations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM journey_steps js
    JOIN company_members cm ON js.company_id = cm.company_id
    WHERE js.id = tool_recommendations.step_id
    AND cm.user_id = auth.uid()
  )
);

-- RLS policy - admin users can manage recommendations
CREATE POLICY IF NOT EXISTS tool_recommendations_all_policy ON tool_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to seed sample tool recommendations
CREATE OR REPLACE FUNCTION seed_tool_recommendations() 
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    step_record RECORD;
    tool_record RECORD;
    num_tools INTEGER;
    category_tools UUID[];
    selected_tool UUID;
    relevance NUMERIC(5,2);
    step_counter INTEGER := 0;
    tool_counter INTEGER := 0;
BEGIN
    -- First clear existing recommendations if needed
    -- UNCOMMENT THE FOLLOWING LINE TO CLEAR EXISTING DATA
    -- DELETE FROM tool_recommendations;
    
    -- Loop through each step
    FOR step_record IN 
        SELECT id, name, phase_id 
        FROM journey_steps 
        LIMIT 50 -- Limit to first 50 steps
    LOOP
        step_counter := step_counter + 1;
        RAISE NOTICE 'Processing step % of 50: %', step_counter, step_record.name;
        
        -- Randomly determine how many tools to recommend for this step (2-5)
        num_tools := 2 + floor(random() * 4)::INTEGER;
        
        -- For each step, try to find tools by category
        FOR tool_record IN
            SELECT category FROM tools WHERE category IS NOT NULL
            GROUP BY category
            ORDER BY random()
            LIMIT 2 -- Get 2 random categories
        LOOP
            -- Find tools in this category
            category_tools := ARRAY(
                SELECT id FROM tools 
                WHERE category = tool_record.category
                ORDER BY random()
                LIMIT ceil(num_tools/2)::INTEGER
            );
            
            -- Add recommendations for tools in this category
            FOREACH selected_tool IN ARRAY category_tools
            LOOP
                -- Generate relevance score (primary category gets 7-9, secondary gets 5-7)
                IF tool_counter % 2 = 0 THEN
                    relevance := 7.0 + random() * 2.0;
                ELSE
                    relevance := 5.0 + random() * 2.0;
                END IF;
                
                relevance := round(relevance * 100) / 100; -- Round to 2 decimal places
                
                -- Insert recommendation
                INSERT INTO tool_recommendations (step_id, tool_id, relevance_score)
                VALUES (step_record.id, selected_tool, relevance)
                ON CONFLICT (step_id, tool_id) DO UPDATE
                SET relevance_score = EXCLUDED.relevance_score,
                    updated_at = NOW();
                    
                tool_counter := tool_counter + 1;
            END LOOP;
        END LOOP;
        
        -- If we didn't get enough tools by category, add some random ones
        IF (SELECT COUNT(*) FROM tool_recommendations WHERE step_id = step_record.id) < num_tools THEN
            -- Add random tools to meet the target count
            INSERT INTO tool_recommendations (step_id, tool_id, relevance_score)
            SELECT 
                step_record.id, 
                t.id, 
                round((4.0 + random() * 3.0)::numeric, 2) as relevance
            FROM tools t
            WHERE t.id NOT IN (SELECT tool_id FROM tool_recommendations WHERE step_id = step_record.id)
            ORDER BY random()
            LIMIT num_tools - (SELECT COUNT(*) FROM tool_recommendations WHERE step_id = step_record.id);
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Seeding complete. Added recommendations for % steps and % tools', step_counter, tool_counter;
END;
$$;

-- Run the function to seed the data
SELECT seed_tool_recommendations();

-- Verify seeded data
SELECT COUNT(*) AS total_recommendations FROM tool_recommendations;

-- Sample query to see recommendations
SELECT 
    js.name AS step_name,
    t.name AS tool_name,
    t.category,
    tr.relevance_score
FROM tool_recommendations tr
JOIN journey_steps js ON tr.step_id = js.id
JOIN tools t ON tr.tool_id = t.id
ORDER BY js.name, tr.relevance_score DESC
LIMIT 20;
