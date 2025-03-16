-- Wheel99 Consolidated Schema
-- This file contains all tables, functions, and policies needed for the Wheel99 application

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Tables

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idea Playground Tables

-- Create idea_playground_canvases table
CREATE TABLE IF NOT EXISTS public.idea_playground_canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create idea_playground_ideas table
CREATE TABLE IF NOT EXISTS public.idea_playground_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID NOT NULL REFERENCES public.idea_playground_canvases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  solution_concept TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  unique_value TEXT NOT NULL,
  business_model TEXT NOT NULL,
  marketing_strategy TEXT NOT NULL,
  revenue_model TEXT NOT NULL,
  go_to_market TEXT NOT NULL,
  market_size TEXT NOT NULL,
  used_company_context BOOLEAN NOT NULL DEFAULT false,
  company_relevance JSONB,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create idea_playground_components table
CREATE TABLE IF NOT EXISTS public.idea_playground_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create idea_playground_tags table
CREATE TABLE IF NOT EXISTS public.idea_playground_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create idea_playground_feedback table
CREATE TABLE IF NOT EXISTS public.idea_playground_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI-Related Tables

-- Create llm_query_logs table
CREATE TABLE IF NOT EXISTS public.llm_query_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  response_length INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  models_used JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Database Functions

-- Create function to create a new canvas
CREATE OR REPLACE FUNCTION public.create_idea_playground_canvas(
  p_user_id UUID,
  p_company_id UUID DEFAULT NULL,
  p_name TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_canvas_id UUID;
BEGIN
  INSERT INTO public.idea_playground_canvases (
    user_id,
    company_id,
    name,
    description
  ) VALUES (
    p_user_id,
    p_company_id,
    p_name,
    p_description
  ) RETURNING id INTO v_canvas_id;
  
  RETURN v_canvas_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to archive a canvas
CREATE OR REPLACE FUNCTION public.archive_idea_playground_canvas(
  p_canvas_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.idea_playground_canvases
  SET is_archived = true,
      updated_at = NOW()
  WHERE id = p_canvas_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to duplicate an idea with all components
CREATE OR REPLACE FUNCTION public.duplicate_idea_playground_idea(
  p_idea_id UUID,
  p_new_title TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_original_idea public.idea_playground_ideas%ROWTYPE;
  v_new_idea_id UUID;
  v_component public.idea_playground_components%ROWTYPE;
  v_tag public.idea_playground_tags%ROWTYPE;
BEGIN
  -- Get the original idea
  SELECT * INTO v_original_idea
  FROM public.idea_playground_ideas
  WHERE id = p_idea_id;
  
  -- Create a duplicate idea
  INSERT INTO public.idea_playground_ideas (
    canvas_id,
    title,
    description,
    problem_statement,
    solution_concept,
    target_audience,
    unique_value,
    business_model,
    marketing_strategy,
    revenue_model,
    go_to_market,
    market_size,
    used_company_context,
    company_relevance,
    version
  ) VALUES (
    v_original_idea.canvas_id,
    COALESCE(p_new_title, v_original_idea.title || ' (Copy)'),
    v_original_idea.description,
    v_original_idea.problem_statement,
    v_original_idea.solution_concept,
    v_original_idea.target_audience,
    v_original_idea.unique_value,
    v_original_idea.business_model,
    v_original_idea.marketing_strategy,
    v_original_idea.revenue_model,
    v_original_idea.go_to_market,
    v_original_idea.market_size,
    v_original_idea.used_company_context,
    v_original_idea.company_relevance,
    v_original_idea.version
  ) RETURNING id INTO v_new_idea_id;
  
  -- Duplicate components
  FOR v_component IN
    SELECT * FROM public.idea_playground_components
    WHERE idea_id = p_idea_id
  LOOP
    INSERT INTO public.idea_playground_components (
      idea_id,
      component_type,
      content,
      is_selected
    ) VALUES (
      v_new_idea_id,
      v_component.component_type,
      v_component.content,
      v_component.is_selected
    );
  END LOOP;
  
  -- Duplicate tags
  FOR v_tag IN
    SELECT * FROM public.idea_playground_tags
    WHERE idea_id = p_idea_id
  LOOP
    INSERT INTO public.idea_playground_tags (
      idea_id,
      name
    ) VALUES (
      v_new_idea_id,
      v_tag.name
    );
  END LOOP;
  
  RETURN v_new_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to move an idea to a different canvas
CREATE OR REPLACE FUNCTION public.move_idea_to_canvas(
  p_idea_id UUID,
  p_target_canvas_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.idea_playground_ideas
  SET canvas_id = p_target_canvas_id,
      updated_at = NOW()
  WHERE id = p_idea_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to archive an idea
CREATE OR REPLACE FUNCTION public.archive_idea_playground_idea(
  p_idea_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.idea_playground_ideas
  SET is_archived = true,
      updated_at = NOW()
  WHERE id = p_idea_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row-Level Security Policies

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_playground_canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_playground_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_playground_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_playground_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_playground_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_query_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Companies Policies
CREATE POLICY "Users can view companies"
  ON public.companies
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update companies they created"
  ON public.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE company_id = id AND profiles.id = auth.uid()
    )
  );

-- App Settings Policies
CREATE POLICY "Admin users can view app settings"
  ON public.app_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin users can update app settings"
  ON public.app_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Canvas Policies
CREATE POLICY "Users can view their own canvases"
  ON public.idea_playground_canvases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own canvases"
  ON public.idea_playground_canvases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvases"
  ON public.idea_playground_canvases
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvases"
  ON public.idea_playground_canvases
  FOR DELETE
  USING (auth.uid() = user_id);

-- Idea Policies
CREATE POLICY "Users can view ideas in their canvases"
  ON public.idea_playground_ideas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_canvases
      WHERE id = canvas_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ideas in their canvases"
  ON public.idea_playground_ideas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.idea_playground_canvases
      WHERE id = canvas_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ideas in their canvases"
  ON public.idea_playground_ideas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_canvases
      WHERE id = canvas_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ideas in their canvases"
  ON public.idea_playground_ideas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_canvases
      WHERE id = canvas_id AND user_id = auth.uid()
    )
  );

-- Component Policies
CREATE POLICY "Users can view components of ideas in their canvases"
  ON public.idea_playground_components
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create components for ideas in their canvases"
  ON public.idea_playground_components
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update components of ideas in their canvases"
  ON public.idea_playground_components
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete components of ideas in their canvases"
  ON public.idea_playground_components
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

-- Tag Policies
CREATE POLICY "Users can view tags of ideas in their canvases"
  ON public.idea_playground_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for ideas in their canvases"
  ON public.idea_playground_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags of ideas in their canvases"
  ON public.idea_playground_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

-- Feedback Policies
CREATE POLICY "Users can view feedback on ideas in their canvases"
  ON public.idea_playground_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback for ideas in their canvases"
  ON public.idea_playground_feedback
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.idea_playground_ideas
      JOIN public.idea_playground_canvases ON idea_playground_ideas.canvas_id = idea_playground_canvases.id
      WHERE idea_playground_ideas.id = idea_id AND idea_playground_canvases.user_id = auth.uid()
    )
  );

-- LLM Query Logs Policies
CREATE POLICY "Users can view their own query logs"
  ON public.llm_query_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert query logs"
  ON public.llm_query_logs
  FOR INSERT
  WITH CHECK (true);

-- Indexes for Performance

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles (company_id);

-- Canvas indexes
CREATE INDEX IF NOT EXISTS idea_playground_canvases_user_id_idx ON public.idea_playground_canvases (user_id);
CREATE INDEX IF NOT EXISTS idea_playground_canvases_company_id_idx ON public.idea_playground_canvases (company_id);
CREATE INDEX IF NOT EXISTS idea_playground_canvases_is_archived_idx ON public.idea_playground_canvases (is_archived);

-- Ideas indexes
CREATE INDEX IF NOT EXISTS idea_playground_ideas_canvas_id_idx ON public.idea_playground_ideas (canvas_id);
CREATE INDEX IF NOT EXISTS idea_playground_ideas_is_archived_idx ON public.idea_playground_ideas (is_archived);
CREATE INDEX IF NOT EXISTS idea_playground_ideas_used_company_context_idx ON public.idea_playground_ideas (used_company_context);

-- Components indexes
CREATE INDEX IF NOT EXISTS idea_playground_components_idea_id_idx ON public.idea_playground_components (idea_id);
CREATE INDEX IF NOT EXISTS idea_playground_components_component_type_idx ON public.idea_playground_components (component_type);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idea_playground_tags_idea_id_idx ON public.idea_playground_tags (idea_id);
CREATE INDEX IF NOT EXISTS idea_playground_tags_name_idx ON public.idea_playground_tags (name);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idea_playground_feedback_idea_id_idx ON public.idea_playground_feedback (idea_id);
CREATE INDEX IF NOT EXISTS idea_playground_feedback_feedback_type_idx ON public.idea_playground_feedback (feedback_type);

-- LLM Query Logs indexes
CREATE INDEX IF NOT EXISTS llm_query_logs_user_id_idx ON public.llm_query_logs (user_id);
CREATE INDEX IF NOT EXISTS llm_query_logs_company_id_idx ON public.llm_query_logs (company_id);
CREATE INDEX IF NOT EXISTS llm_query_logs_created_at_idx ON public.llm_query_logs (created_at);
