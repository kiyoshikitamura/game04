SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."kpi_acquisition_valid_journeys_v1" WITH (security_invoker=true) AS  SELECT journey_id,
    journey_token_hash,
    started_at,
    source,
    schema_version,
    created_at,
    first_arrived_at,
    metadata
   FROM kpi_acquisition_journeys j
  WHERE source <> 'qa_v1'::text AND metadata <> '{}'::jsonb AND kpi_v250_landing_metadata_valid(metadata) AND isfinite(first_arrived_at) AND first_arrived_at <= statement_timestamp() AND (EXISTS ( SELECT 1
           FROM kpi_acquisition_journey_facts f
          WHERE f.journey_id = j.journey_id AND f.event_type = 'TITLE_ARRIVED'::text AND f.source <> 'qa_v1'::text));
