CREATE TABLE ai_feedback_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE, -- Corrected reference
    share_token TEXT REFERENCES smart_share_links(share_token) ON DELETE SET NULL, -- Link context for the analysis, allow NULL if share link is deleted
    analysis_type TEXT NOT NULL, -- e.g., 'overall_sentiment', 'key_themes', 'improvement_suggestions'
    insights JSONB NOT NULL, -- The actual analysis data
    confidence_score DECIMAL(3,2), -- AI's confidence in this analysis
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensuring the constraint name is distinct if an old one with a similar auto-generated name existed
    CONSTRAINT fk_ai_feedback_insights_deck_id FOREIGN KEY (deck_id) REFERENCES pitch_decks(id) ON DELETE CASCADE, -- Corrected reference
    CONSTRAINT fk_ai_feedback_insights_share_token FOREIGN KEY (share_token) REFERENCES smart_share_links(share_token) ON DELETE SET NULL
);

COMMENT ON TABLE ai_feedback_insights IS 'Stores results of AI analysis on feedback received for decks.';
COMMENT ON COLUMN ai_feedback_insights.deck_id IS 'The deck to which this AI insight pertains.';
COMMENT ON COLUMN ai_feedback_insights.share_token IS 'The specific share link through which the feedback (that generated this insight) was received. Can be NULL if the insight is general or the link was deleted.';
COMMENT ON COLUMN ai_feedback_insights.analysis_type IS 'Type of AI analysis performed (e.g., ''overall_sentiment'', ''key_themes'', ''improvement_suggestions'').';
COMMENT ON COLUMN ai_feedback_insights.insights IS 'JSONB data containing the detailed results of the AI analysis.';
COMMENT ON COLUMN ai_feedback_insights.confidence_score IS 'The AI''s confidence level in the generated insight (e.g., 0.00 to 1.00).';
COMMENT ON COLUMN ai_feedback_insights.generated_at IS 'Timestamp of when the AI insight was generated.';
