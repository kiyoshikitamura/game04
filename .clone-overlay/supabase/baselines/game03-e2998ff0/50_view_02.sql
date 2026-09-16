SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."kpi_effective_active_guild_daily_v1" WITH (security_invoker=true) AS  WITH game_activity AS (
         SELECT m.guild_id,
            a.activity_date,
            count(DISTINCT a.subject_id) AS game_active_members
           FROM kpi_daily_user_activity a
             JOIN kpi_guild_membership_periods m ON m.subject_id = a.subject_id AND m.joined_at < kpi_jst_day_start(a.activity_date + 1) AND (m.left_at IS NULL OR m.left_at >= kpi_jst_day_start(a.activity_date + 1))
          WHERE NOT kpi_is_subject_excluded(a.subject_id, a.last_active_at)
          GROUP BY m.guild_id, a.activity_date
        ), chat_activity AS (
         SELECT kpi_guild_daily_chat_activity_v1.guild_id,
            kpi_guild_daily_chat_activity_v1.activity_date_jst AS activity_date,
            kpi_guild_daily_chat_activity_v1.chat_active_uu
           FROM kpi_guild_daily_chat_activity_v1
        )
 SELECT g.guild_id,
    g.activity_date,
    g.game_active_members,
    COALESCE(c.chat_active_uu, 0::bigint) AS guild_chat_active_members,
    g.game_active_members >= 3 AS is_active_guild,
    g.game_active_members >= 3 AND COALESCE(c.chat_active_uu, 0::bigint) >= 2 AS is_effective_active_guild
   FROM game_activity g
     LEFT JOIN chat_activity c USING (guild_id, activity_date);
