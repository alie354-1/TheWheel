-- Sprint 4: Add recommendation_feedback table for AI feedback loop (BOH-402.3)
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('accept', 'reject', 'customize')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_company_id ON recommendation_feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
