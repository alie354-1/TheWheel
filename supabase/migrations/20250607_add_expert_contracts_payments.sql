-- Migration for Expert Contracts and Payments System
-- This migration adds tables for expert contracts and payments

-- Add columns to expert_profiles table for rates and payment preferences
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS payment_methods TEXT[];
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS contract_template_id UUID;

-- Table for expert contract templates
CREATE TABLE IF NOT EXISTS expert_contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS expert_contract_templates_expert_id_idx ON expert_contract_templates(expert_id);

-- Table for expert contracts (agreements between experts and users)
CREATE TABLE IF NOT EXISTS expert_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connect_request_id UUID REFERENCES expert_connect_requests(id) ON DELETE SET NULL,
  template_id UUID REFERENCES expert_contract_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'terminated')),
  expert_signed BOOLEAN NOT NULL DEFAULT FALSE,
  user_signed BOOLEAN NOT NULL DEFAULT FALSE,
  expert_signed_at TIMESTAMPTZ,
  user_signed_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  hourly_rate DECIMAL(10,2),
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS expert_contracts_expert_id_idx ON expert_contracts(expert_id);
CREATE INDEX IF NOT EXISTS expert_contracts_user_id_idx ON expert_contracts(user_id);
CREATE INDEX IF NOT EXISTS expert_contracts_status_idx ON expert_contracts(status);

-- Add column to expert_sessions table for contract reference
ALTER TABLE expert_sessions ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES expert_contracts(id) ON DELETE SET NULL;
ALTER TABLE expert_sessions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'disputed'));

-- Table for expert payments
CREATE TABLE IF NOT EXISTS expert_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES expert_sessions(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES expert_contracts(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  notes TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS expert_payments_expert_id_idx ON expert_payments(expert_id);
CREATE INDEX IF NOT EXISTS expert_payments_user_id_idx ON expert_payments(user_id);
CREATE INDEX IF NOT EXISTS expert_payments_session_id_idx ON expert_payments(session_id);
CREATE INDEX IF NOT EXISTS expert_payments_status_idx ON expert_payments(status);

-- RLS Policies for expert_contract_templates
ALTER TABLE expert_contract_templates ENABLE ROW LEVEL SECURITY;

-- Experts can view and manage their own contract templates
CREATE POLICY "Experts can view and manage their own contract templates"
  ON expert_contract_templates
  FOR ALL
  USING (
    auth.uid() = expert_id
  );

-- RLS Policies for expert_contracts
ALTER TABLE expert_contracts ENABLE ROW LEVEL SECURITY;

-- Users can view contracts they're involved in
CREATE POLICY "Users can view contracts they're involved in"
  ON expert_contracts
  FOR SELECT
  USING (
    auth.uid() = expert_id OR
    auth.uid() = user_id
  );

-- Experts can create and update contracts
CREATE POLICY "Experts can create and update contracts"
  ON expert_contracts
  FOR INSERT
  WITH CHECK (
    auth.uid() = expert_id
  );

-- Experts can update their own contracts
CREATE POLICY "Experts can update their own contracts"
  ON expert_contracts
  FOR UPDATE
  USING (
    auth.uid() = expert_id
  );

-- Users can update contracts to sign them
CREATE POLICY "Users can update contracts to sign them"
  ON expert_contracts
  FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status = 'sent'
  )
  WITH CHECK (
    user_signed = true AND
    user_signed_at IS NOT NULL
  );

-- RLS Policies for expert_payments
ALTER TABLE expert_payments ENABLE ROW LEVEL SECURITY;

-- Users can view payments they're involved in
CREATE POLICY "Users can view payments they're involved in"
  ON expert_payments
  FOR SELECT
  USING (
    auth.uid() = expert_id OR
    auth.uid() = user_id
  );

-- Users can create payments
CREATE POLICY "Users can create payments"
  ON expert_payments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Experts can update payment status
CREATE POLICY "Experts can update payment status"
  ON expert_payments
  FOR UPDATE
  USING (
    auth.uid() = expert_id
  );

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_expert_contract_templates_updated_at
BEFORE UPDATE ON expert_contract_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_contracts_updated_at
BEFORE UPDATE ON expert_contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_payments_updated_at
BEFORE UPDATE ON expert_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
