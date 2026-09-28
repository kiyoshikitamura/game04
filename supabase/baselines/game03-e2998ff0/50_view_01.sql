SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."kpi_guild_daily_chat_activity_v1" WITH (security_invoker=true) AS  SELECT guild_id,
    (occurred_at AT TIME ZONE 'Asia/Tokyo'::text)::date AS activity_date_jst,
    count(DISTINCT subject_id) AS chat_active_uu,
    count(*) AS message_count
   FROM kpi_guild_chat_message_facts f
  WHERE NOT kpi_is_subject_excluded(subject_id, occurred_at)
  GROUP BY guild_id, ((occurred_at AT TIME ZONE 'Asia/Tokyo'::text)::date);
