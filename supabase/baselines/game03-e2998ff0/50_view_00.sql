SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."kpi_canonical_tutorial_completions_v1" WITH (security_invoker=true) AS  SELECT subject_id,
    occurred_at AS completed_at,
    tutorial_version,
    context_id,
    source
   FROM kpi_tutorial_journey_facts
  WHERE fact_type = 'FIRST_MYPAGE_ACCESS_CONFIRMED'::text;
