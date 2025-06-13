-- Sprint 6: Dynamic Priority Adjustment for Business Operations Hub

-- 1. Add columns for locking/overriding priorities
ALTER TABLE domain_steps
ADD COLUMN IF NOT EXISTS is_priority_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_priority_order FLOAT;

COMMENT ON COLUMN domain_steps.is_priority_locked IS 'If true, this task''s priority is locked and will not be auto-adjusted';
COMMENT ON COLUMN domain_steps.locked_priority_order IS 'Manual override for priority order when is_priority_locked is true';

-- 2. Update get_priority_tasks function to use locked priority if set
CREATE OR REPLACE FUNCTION get_priority_tasks(p_domain_id UUID, p_limit INTEGER DEFAULT 3)
RETURNS SETOF domain_steps AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM domain_steps
    WHERE domain_id = p_domain_id
    ORDER BY 
        CASE WHEN status = 'in_progress' THEN 0
             WHEN status = 'blocked' THEN 1
             WHEN status = 'to_do' THEN 2
             ELSE 3
        END,
        CASE 
            WHEN is_priority_locked AND locked_priority_order IS NOT NULL THEN locked_priority_order
            ELSE priority_order
        END ASC,
        due_date ASC NULLS LAST,
        created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Optional) Add a table to track priority history
CREATE TABLE IF NOT EXISTS priority_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID NOT NULL REFERENCES domain_steps(id) ON DELETE CASCADE,
    old_priority_order FLOAT,
    new_priority_order FLOAT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id),
    reason TEXT
);

COMMENT ON TABLE priority_history IS 'Tracks changes to task priority for audit/history purposes';
