SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."kpi_marketing_latest_revisions_v1" WITH (security_invoker=true) AS  WITH latest AS (
         SELECT DISTINCT ON (r.scope_id, r.external_key) r.id,
            r.scope_id,
            r.platform,
            r.report_date_jst,
            r.source_timezone,
            r.account_key,
            r.campaign_key,
            r.campaign_name,
            r.line_item_key,
            r.line_item_name,
            r.creative_key,
            r.creative_name,
            r.reporting_grain,
            r.spend,
            r.currency,
            r.impressions,
            r.clicks,
            r.external_key,
            r.revision,
            r.batch_id,
            r.imported_at,
            r.idempotency_key,
            r.payload_hash,
            r.metadata
           FROM kpi_marketing_daily_fact_revisions r
          ORDER BY r.scope_id, r.external_key, r.revision DESC
        )
 SELECT l.id,
    l.scope_id,
    l.platform,
    l.report_date_jst,
    l.source_timezone,
    l.account_key,
    l.campaign_key,
    l.campaign_name,
    l.line_item_key,
    l.line_item_name,
    l.creative_key,
    l.creative_name,
    l.reporting_grain,
    l.spend,
    l.currency,
    l.impressions,
    l.clicks,
    l.external_key,
    l.revision,
    l.batch_id,
    l.imported_at,
    l.idempotency_key,
    l.payload_hash,
    l.metadata,
    l.clicks::numeric / NULLIF(l.impressions, 0)::numeric AS ctr,
    l.spend / NULLIF(l.clicks, 0)::numeric AS cpc,
    l.spend * 1000::numeric / NULLIF(l.impressions, 0)::numeric AS cpm,
        CASE
            WHEN l.impressions = 0 THEN 'zero_denominator'::text
            ELSE NULL::text
        END AS ctr_null_reason,
        CASE
            WHEN l.clicks = 0 THEN 'zero_denominator'::text
            ELSE NULL::text
        END AS cpc_null_reason,
        CASE
            WHEN l.impressions = 0 THEN 'zero_denominator'::text
            ELSE NULL::text
        END AS cpm_null_reason,
    l.currency = 'JPY'::text AS jpy_gate_eligible
   FROM latest l
     JOIN kpi_marketing_import_batches b ON b.id = l.batch_id
  WHERE NOT COALESCE((b.metadata ->> 'qa'::text)::boolean, false);
