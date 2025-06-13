-- Migration: Create get_domain_step_recommendations function for Business Operations Hub

CREATE OR REPLACE FUNCTION public.get_domain_step_recommendations(
  p_domain_id uuid,
  p_company_id uuid
)
RETURNS TABLE (
  id uuid,
  step_id uuid,
  name text,
  description text,
  domain_specific_description text,
  difficulty integer,
  time_estimate integer,
  status text,
  completion_percentage integer,
  phase_name text,
  phase_order integer,
  step_order integer,
  relevance_score integer,
  is_required boolean,
  is_recommended boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gen_random_uuid() AS id,
    js.id AS step_id,
    js.name,
    js.description,
    NULL AS domain_specific_description,
    js.difficulty,
    js.time_estimate,
    'not_started' AS status,
    0 AS completion_percentage,
    jp.name AS phase_name,
    jp.order AS phase_order,
    js.order AS step_order,
    dsr.relevance_score,
    false AS is_required,
    true AS is_recommended
  FROM
    domain_step_recommendations dsr
  JOIN
    journey_steps js ON dsr.step_id = js.id
  JOIN
    journey_phases jp ON js.phase_id = jp.id
  WHERE
    dsr.domain_id = p_domain_id
    AND NOT EXISTS (
      SELECT 1 FROM domain_steps ds
      WHERE ds.domain_id = p_domain_id AND ds.step_id = js.id AND ds.company_id = p_company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_domain_step_recommendations IS 'Returns recommended steps for a given domain and company, excluding already linked steps.';
