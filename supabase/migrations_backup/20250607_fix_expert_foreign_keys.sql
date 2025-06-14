-- Migration to fix foreign key relationships for expert connect system

-- Create RLS policies for expert_profiles table
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all expert profiles
CREATE POLICY "Users can view all expert profiles"
  ON expert_profiles
  FOR SELECT
  USING (
    TRUE
  );

-- Users can only update their own expert profile
CREATE POLICY "Users can only update their own expert profile"
  ON expert_profiles
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Users can only insert their own expert profile
CREATE POLICY "Users can only insert their own expert profile"
  ON expert_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Create explicit foreign key relationships for expert_connect_requests
COMMENT ON COLUMN expert_connect_requests.requester_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_connect_requests.expert_id IS 'Foreign key to auth.users(id)';

-- Create explicit foreign key relationships for expert_sessions
COMMENT ON COLUMN expert_sessions.expert_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_sessions.requester_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_sessions.connect_request_id IS 'Foreign key to expert_connect_requests(id)';

-- Create explicit foreign key relationships for expert_availability
COMMENT ON COLUMN expert_availability.expert_id IS 'Foreign key to auth.users(id)';

-- Create explicit foreign key relationships for expert_contracts
COMMENT ON COLUMN expert_contracts.expert_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_contracts.user_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_contracts.connect_request_id IS 'Foreign key to expert_connect_requests(id)';

-- Create explicit foreign key relationships for expert_payments
COMMENT ON COLUMN expert_payments.expert_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_payments.user_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_payments.session_id IS 'Foreign key to expert_sessions(id)';
COMMENT ON COLUMN expert_payments.contract_id IS 'Foreign key to expert_contracts(id)';
