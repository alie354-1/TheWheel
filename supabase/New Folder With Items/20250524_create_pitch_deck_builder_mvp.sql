-- Modern Pitch Deck Builder - Phase 1 MVP Schema
-- Simplified schema focusing on core functionality

-- Deck Templates table (must be created first due to foreign key reference)
CREATE TABLE deck_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'vc_pitch', 'product_demo', 'market_opportunity', 'technical_platform'
  sections JSONB NOT NULL, -- Template section definitions
  performance_score DECIMAL DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitch Decks table
CREATE TABLE pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  template_id UUID REFERENCES deck_templates(id),
  owner_id UUID REFERENCES auth.users(id),
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deck Sections table
CREATE TABLE deck_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hero', 'problem', 'solution', 'market', 'product', 'business_model', 'competition', 'team', 'financials', 'ask'
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deck Feedback table (simplified for MVP)
CREATE TABLE deck_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
  section_id UUID REFERENCES deck_sections(id),
  reviewer_email TEXT,
  reviewer_name TEXT,
  comment TEXT NOT NULL,
  suggestion JSONB, -- Structured suggestions for auto-incorporation
  position JSONB, -- Where comment is positioned on the section
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for pitch_decks
CREATE POLICY "Users can view their own decks" ON pitch_decks FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert their own decks" ON pitch_decks FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update their own decks" ON pitch_decks FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete their own decks" ON pitch_decks FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "Public decks are viewable by all" ON pitch_decks FOR SELECT USING (is_public = true);

-- Policies for deck_templates (read-only for users)
CREATE POLICY "Templates are viewable by all authenticated users" ON deck_templates FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for deck_sections
CREATE POLICY "Users can view sections of their own decks" ON deck_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_sections.deck_id AND pitch_decks.owner_id = auth.uid())
);
CREATE POLICY "Users can insert sections to their own decks" ON deck_sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_sections.deck_id AND pitch_decks.owner_id = auth.uid())
);
CREATE POLICY "Users can update sections of their own decks" ON deck_sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_sections.deck_id AND pitch_decks.owner_id = auth.uid())
);
CREATE POLICY "Users can delete sections of their own decks" ON deck_sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_sections.deck_id AND pitch_decks.owner_id = auth.uid())
);
CREATE POLICY "Public deck sections are viewable by all" ON deck_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_sections.deck_id AND pitch_decks.is_public = true)
);

-- Policies for deck_feedback
CREATE POLICY "Users can view feedback on their own decks" ON deck_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_feedback.deck_id AND pitch_decks.owner_id = auth.uid())
);
CREATE POLICY "Anyone can insert feedback on public decks" ON deck_feedback FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_feedback.deck_id AND pitch_decks.is_public = true)
);
CREATE POLICY "Deck owners can update feedback status" ON deck_feedback FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pitch_decks WHERE pitch_decks.id = deck_feedback.deck_id AND pitch_decks.owner_id = auth.uid())
);

-- Add indexes for performance
CREATE INDEX idx_pitch_decks_owner_id ON pitch_decks(owner_id);
CREATE INDEX idx_pitch_decks_share_token ON pitch_decks(share_token);
CREATE INDEX idx_deck_sections_deck_id ON deck_sections(deck_id);
CREATE INDEX idx_deck_sections_order ON deck_sections(deck_id, order_index);
CREATE INDEX idx_deck_feedback_deck_id ON deck_feedback(deck_id);
CREATE INDEX idx_deck_templates_category ON deck_templates(category);

-- Add updated_at trigger for pitch_decks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pitch_decks_updated_at BEFORE UPDATE ON pitch_decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deck_sections_updated_at BEFORE UPDATE ON deck_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO deck_templates (name, description, category, sections) VALUES
('Classic VC Pitch', 'Traditional venture capital pitch deck with proven structure', 'vc_pitch', 
'[
  {"type": "hero", "title": "Company Introduction", "description": "Your company name, tagline, and vision"},
  {"type": "problem", "title": "Problem", "description": "The pain point you are solving"},
  {"type": "solution", "title": "Solution", "description": "Your unique solution to the problem"},
  {"type": "market", "title": "Market Size", "description": "Total addressable market and opportunity"},
  {"type": "product", "title": "Product Demo", "description": "Show your product in action"},
  {"type": "business_model", "title": "Business Model", "description": "How you make money"},
  {"type": "competition", "title": "Competition", "description": "Competitive landscape and differentiation"},
  {"type": "team", "title": "Team", "description": "Key team members and advisors"},
  {"type": "financials", "title": "Financials", "description": "Revenue projections and key metrics"},
  {"type": "ask", "title": "The Ask", "description": "Funding amount and use of funds"}
]'::jsonb),

('Product Demo Focus', 'Product-centric pitch emphasizing features and user experience', 'product_demo',
'[
  {"type": "hero", "title": "Product Introduction", "description": "Your product name and core value proposition"},
  {"type": "problem", "title": "User Pain Points", "description": "Problems your users face daily"},
  {"type": "product", "title": "Product Walkthrough", "description": "Detailed product demonstration"},
  {"type": "solution", "title": "How We Solve It", "description": "Your approach to solving the problems"},
  {"type": "market", "title": "Market Opportunity", "description": "Who needs this and how many"},
  {"type": "business_model", "title": "Revenue Strategy", "description": "Monetization and growth strategy"},
  {"type": "team", "title": "Team", "description": "Who built this amazing product"},
  {"type": "ask", "title": "Next Steps", "description": "What you need to scale"}
]'::jsonb),

('Market Opportunity', 'Market-first approach highlighting massive opportunity and timing', 'market_opportunity',
'[
  {"type": "hero", "title": "The Opportunity", "description": "The massive market opportunity"},
  {"type": "market", "title": "Market Analysis", "description": "Deep dive into market size and trends"},
  {"type": "problem", "title": "Market Gap", "description": "What the market is missing"},
  {"type": "solution", "title": "Our Approach", "description": "How we capture this opportunity"},
  {"type": "product", "title": "Product Strategy", "description": "Product built for this market"},
  {"type": "business_model", "title": "Business Model", "description": "How we monetize this opportunity"},
  {"type": "competition", "title": "Competitive Advantage", "description": "Why we will win this market"},
  {"type": "team", "title": "Team", "description": "The team to execute on this vision"},
  {"type": "financials", "title": "Financial Projections", "description": "Revenue potential and growth"},
  {"type": "ask", "title": "Investment", "description": "Capital needed to dominate this market"}
]'::jsonb),

('Technical Platform', 'Technology-focused pitch for technical audiences and B2B platforms', 'technical_platform',
'[
  {"type": "hero", "title": "Platform Overview", "description": "Your technical platform and mission"},
  {"type": "problem", "title": "Technical Challenge", "description": "The technical problem you solve"},
  {"type": "solution", "title": "Technical Solution", "description": "Your technical approach and architecture"},
  {"type": "product", "title": "Platform Demo", "description": "Technical capabilities and features"},
  {"type": "market", "title": "Technical Market", "description": "Developer/enterprise market opportunity"},
  {"type": "business_model", "title": "Platform Economics", "description": "API pricing, usage-based revenue"},
  {"type": "team", "title": "Technical Team", "description": "Engineering expertise and background"},
  {"type": "ask", "title": "Technical Roadmap", "description": "Investment in R&D and scaling"}
]'::jsonb);
