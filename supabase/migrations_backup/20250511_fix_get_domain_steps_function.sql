-- Migration: Fix get_domain_steps function to use domain_steps_status view

DROP FUNCTION IF EXISTS public.get_domain_steps(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_domain_steps(
  p_domain_id uuid,
  p_company_id uuid
)
RETURNS TABLE (
  id uuid,
  step_id uuid,
  name text,
  description text,
  difficulty integer,
  time_estimate integer,
  status text,
  completion_percentage integer,
  phase_name text,
  phase_order integer,
  step_order integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dss.id,
    dss.step_id,
    dss.name,
    dss.description,
    dss.difficulty,
    dss.time_estimate,
    COALESCE(dss.status, 'not_started'::TEXT) AS status,
    COALESCE(dss.completion_percentage, 0) AS completion_percentage,
    dss.phase_name,
    dss.phase_order,
    dss.step_order
  FROM
    domain_steps_status dss
  WHERE
    dss.domain_id = p_domain_id AND
    dss.company_id = p_company_id
  ORDER BY
    dss.phase_order, dss.step_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_domain_steps IS 'Returns all domain steps for a specific company and domain, with rich metadata.';
