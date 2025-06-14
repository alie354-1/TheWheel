-- Migration: Create get_domain_steps function for Business Operations Hub

CREATE OR REPLACE FUNCTION public.get_domain_steps(
  p_company_id uuid,
  p_domain_id uuid
)
RETURNS TABLE (
  id uuid,
  domain_id uuid,
  name text,
  description text,
  status text,
  assigned_to uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.domain_id,
    s.name,
    s.description,
    s.status,
    s.assigned_to,
    s.created_at,
    s.updated_at
  FROM domain_steps s
  WHERE s.company_id = p_company_id
    AND s.domain_id = p_domain_id
  ORDER BY s.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_domain_steps IS 'Returns all steps for a given company and domain.';
