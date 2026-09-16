SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."kpi_subject_first_touch_v1" WITH (security_invoker=true) AS  SELECT b.subject_id,
    b.journey_id,
    b.first_touch_source AS first_source,
    b.first_touch_fixed_at,
    b.first_touch_rule_version,
    j.first_arrived_at,
    j.metadata ->> 'utm_campaign'::text AS campaign,
    j.metadata ->> 'utm_content'::text AS creative,
    j.metadata AS landing_params
   FROM kpi_acquisition_subject_bindings b
     JOIN kpi_acquisition_journeys j USING (journey_id)
  WHERE b.first_touch_source IS NOT NULL;
