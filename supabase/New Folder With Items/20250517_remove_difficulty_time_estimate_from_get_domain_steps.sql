-- Migration: Remove difficulty and time_estimate from get_domain_steps function

DROP FUNCTION IF EXISTS public.get_domain_steps(uuid, uuid, boolean);

CREATE OR REPLACE FUNCTION public.get_domain_steps(
  p_domain_id uuid,
  p_company_id uuid,
  p_include_recommended boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  step_id uuid,
  name text,
  description text,
  domain_specific_description text,
  status text,
  completion_percentage integer,
  phase_name text,
  phase_order integer,
  step_order integer,
  relevance_score float,
  is_required boolean,
  is_recommended boolean
) AS $$
BEGIN
  -- Return explicitly associated steps
  RETURN QUERY
  SELECT
    ds.id,
    ds.step_id,
    js.name,
    js.description,
    ds.domain_specific_description,
    COALESCE(cjs.status, 'not_started'::TEXT) AS status,
    COALESCE(cjs.completion_percentage, 0) AS completion_percentage,
    jp.name AS phase_name,
    jp.order AS phase_order,
    js.order AS step_order,
    ds.relevance_score,
    ds.is_required,
    false AS is_recommended
  FROM
    domain_steps ds
  JOIN
    journey_steps js ON ds.step_id = js.id
  JOIN
    journey_phases jp ON js.phase_id = jp.id
  LEFT JOIN
    company_journey_steps cjs ON ds.step_id = cjs.global_step_id AND ds.company_id = cjs.company_id
  WHERE
    ds.domain_id = p_domain_id AND
    ds.company_id = p_company_id

  UNION ALL

  -- Include recommended steps if requested
  SELECT
    gen_random_uuid() AS id,
    js.id AS step_id,
    js.name,
    js.description,
    NULL AS domain_specific_description,
    'not_started'::TEXT AS status,
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
    dsr.domain_id = p_domain_id AND
    p_include_recommended = true AND
    NOT EXISTS (
      SELECT 1 FROM domain_steps ds 
      WHERE ds.domain_id = p_domain_id AND ds.step_id = js.id AND ds.company_id = p_company_id
    )

  ORDER BY
    phase_order, step_order, relevance_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_domain_steps IS 'Returns all domain steps for a specific company and domain, with rich metadata and optional recommendations. (difficulty and time_estimate removed)';
