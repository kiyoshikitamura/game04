SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
SELECT setval('"public"."pvp_rewards_master_id_seq"', GREATEST(COALESCE((SELECT MAX("id") FROM "public"."pvp_rewards_master"),0),1), EXISTS(SELECT 1 FROM "public"."pvp_rewards_master"));
SELECT setval('"public"."raid_rewards_master_id_seq"', GREATEST(COALESCE((SELECT MAX("id") FROM "public"."raid_rewards_master"),0),1), EXISTS(SELECT 1 FROM "public"."raid_rewards_master"));
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."bbs_posts";
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."bbs_threads";
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."board_posts";
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."direct_messages";
