SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE SEQUENCE "public"."pvp_rewards_master_id_seq" AS integer START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE SEQUENCE "public"."raid_rewards_master_id_seq" AS integer START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE "private"."initial_equipment_receipts" (
"user_id" uuid NOT NULL,
"state" text NOT NULL,
"equipment_ids" uuid[] NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"completed_at" timestamp with time zone
);
ALTER TABLE "private"."initial_equipment_receipts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "private"."raid_daily_targets" (
"date_jst" date NOT NULL,
"first_variant_id" text NOT NULL,
"second_variant_id" text NOT NULL,
"first_area_id" text NOT NULL,
"second_area_id" text NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "private"."raid_daily_targets" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."anonymous_onboarding_cleanup_runs" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"started_at" timestamp with time zone NOT NULL,
"finished_at" timestamp with time zone,
"candidate_count" integer NOT NULL,
"deleted_count" integer NOT NULL,
"skipped_count" integer NOT NULL,
"skipped_user_ids" uuid[] NOT NULL
);
ALTER TABLE "public"."anonymous_onboarding_cleanup_runs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."avatar_parts" (
"part_id" text NOT NULL,
"category" text NOT NULL,
"name" text NOT NULL,
"price_cash" integer,
"price_diamond" integer,
"unlock_level" integer,
"img_url" text
);
ALTER TABLE "public"."avatar_parts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."battle_replay_events" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"battle_replay_session_id" uuid NOT NULL,
"event_index" integer NOT NULL,
"round_number" smallint NOT NULL,
"event_type" text NOT NULL,
"payload" jsonb NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."battle_replay_events" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."battle_replay_sessions" (
"id" uuid NOT NULL,
"requester_user_id" uuid NOT NULL,
"battle_mode" text NOT NULL,
"source_reference_id" uuid,
"status" text NOT NULL,
"tactic_id" text NOT NULL,
"random_seed" bigint NOT NULL,
"player_snapshot" jsonb NOT NULL,
"enemy_snapshot" jsonb NOT NULL,
"result" jsonb,
"resolved_at" timestamp with time zone,
"created_at" timestamp with time zone NOT NULL,
"resolution_authority" text NOT NULL,
"finalization_status" text NOT NULL,
"finalized_at" timestamp with time zone,
"finalization_result" jsonb,
"official_context" jsonb NOT NULL,
"enemy_tactic_id" text
);
ALTER TABLE "public"."battle_replay_sessions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."bbs_posts" (
"id" uuid NOT NULL,
"thread_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"author_name" text NOT NULL,
"author_avatar_url" text,
"content" text NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."bbs_posts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."bbs_read_states" (
"user_id" uuid NOT NULL,
"thread_id" uuid NOT NULL,
"last_read_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."bbs_read_states" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."bbs_threads" (
"id" uuid NOT NULL,
"category" text NOT NULL,
"title" text NOT NULL,
"content" text NOT NULL,
"user_id" uuid NOT NULL,
"author_name" text NOT NULL,
"author_avatar_url" text,
"created_at" timestamp with time zone NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."bbs_threads" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."billing_asset_lots" (
"id" uuid NOT NULL,
"order_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"present_id" uuid NOT NULL,
"item_id" text NOT NULL,
"issued_quantity" integer NOT NULL,
"remaining_quantity" integer NOT NULL,
"issued_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone NOT NULL,
"claimed_at" timestamp with time zone,
"expired_quantity" integer NOT NULL,
"source_lot_id" uuid
);
ALTER TABLE "public"."billing_asset_lots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."billing_grants" (
"order_id" uuid NOT NULL,
"stripe_session_id" text NOT NULL,
"user_id" uuid NOT NULL,
"items" jsonb NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."billing_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."billing_orders" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"product_id" text NOT NULL,
"amount_jpy" integer NOT NULL,
"product_snapshot" jsonb NOT NULL,
"stripe_session_id" text,
"status" text NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"granted_at" timestamp with time zone,
"billing_mode" text NOT NULL
);
ALTER TABLE "public"."billing_orders" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."billing_products" (
"id" text NOT NULL,
"title" text NOT NULL,
"amount_jpy" integer,
"price_dia" integer,
"items" jsonb NOT NULL,
"purchase_limit" integer NOT NULL,
"validity_days" integer
);
ALTER TABLE "public"."billing_products" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."billing_shop_receipts" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"product_id" text NOT NULL,
"price_dia" integer NOT NULL,
"items" jsonb NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."billing_shop_receipts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."board_posts" (
"id" uuid NOT NULL,
"category" text NOT NULL,
"title" text NOT NULL,
"content" text NOT NULL,
"author_id" uuid,
"author_name" text NOT NULL,
"author_avatar" text,
"author_character_id" text,
"replies_count" integer,
"created_at" timestamp with time zone,
"updated_at" timestamp with time zone,
"user_id" uuid,
"author_avatar_url" text,
"target_type" text NOT NULL,
"target_id" uuid,
"is_system" boolean NOT NULL,
"reply_to_message_id" uuid,
"raid_rescue_id" uuid
);
ALTER TABLE "public"."board_posts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_action_resource_master" (
"version" text NOT NULL,
"resource_type" text NOT NULL,
"natural_max" integer NOT NULL,
"hard_cap" integer NOT NULL,
"recovery_amount" integer NOT NULL,
"recovery_interval_seconds" integer NOT NULL,
"entry_cost" integer
);
ALTER TABLE "public"."canonical_action_resource_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_character_growth_assignments" (
"version" text NOT NULL,
"character_id" text NOT NULL,
"growth_pattern_id" text NOT NULL
);
ALTER TABLE "public"."canonical_character_growth_assignments" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_character_growth_exponents" (
"growth_pattern_id" text NOT NULL,
"hp" numeric NOT NULL,
"atk" numeric NOT NULL,
"def" numeric NOT NULL,
"spd" numeric NOT NULL,
"luk" numeric NOT NULL
);
ALTER TABLE "public"."canonical_character_growth_exponents" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_character_master" (
"version" text NOT NULL,
"character_id" text NOT NULL,
"display_name" text NOT NULL,
"rarity" text NOT NULL,
"attribute" text NOT NULL,
"hometown" text NOT NULL,
"lv1_hp" integer NOT NULL,
"lv1_atk" integer NOT NULL,
"lv1_def" integer NOT NULL,
"lv1_spd" integer NOT NULL,
"lv1_luk" integer NOT NULL,
"lv100_hp" integer NOT NULL,
"lv100_atk" integer NOT NULL,
"lv100_def" integer NOT NULL,
"lv100_spd" integer NOT NULL,
"lv100_luk" integer NOT NULL
);
ALTER TABLE "public"."canonical_character_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_daily_activity_claims" (
"game_day" date NOT NULL,
"user_id" uuid NOT NULL,
"source_key" text NOT NULL,
"source_ref" uuid,
"reward_payload" jsonb NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."canonical_daily_activity_claims" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_daily_ranking_reward_master" (
"version" text NOT NULL,
"ranking_type" text NOT NULL,
"rank_min" integer NOT NULL,
"rank_max" integer NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_daily_ranking_reward_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_equipment_lb_slot_options" (
"version" text NOT NULL,
"category" text NOT NULL,
"unlock_level" integer NOT NULL,
"options" jsonb NOT NULL
);
ALTER TABLE "public"."canonical_equipment_lb_slot_options" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_equipment_lb_steps" (
"version" text NOT NULL,
"plus_val" integer NOT NULL,
"flat_stat_multiplier" numeric(5,4) NOT NULL,
"equivalent_cost" integer NOT NULL,
"fixed_options" jsonb NOT NULL
);
ALTER TABLE "public"."canonical_equipment_lb_steps" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_equipment_master" (
"version" text NOT NULL,
"equipment_id" text NOT NULL,
"display_name" text NOT NULL,
"rarity" text NOT NULL,
"category" text NOT NULL,
"base_stats" jsonb NOT NULL,
"fixed_effects" jsonb NOT NULL,
"exclusive_character_id" text,
"random_options" boolean NOT NULL
);
ALTER TABLE "public"."canonical_equipment_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_gameplay_master_versions" (
"version" text NOT NULL,
"status" text NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."canonical_gameplay_master_versions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_guild_donation_master" (
"id" text NOT NULL,
"cash_cost" integer NOT NULL,
"guild_exp" integer NOT NULL,
"daily_per_member" integer NOT NULL,
"version" text NOT NULL
);
ALTER TABLE "public"."canonical_guild_donation_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_guild_exp_source_master" (
"source" text NOT NULL,
"exp_grant" integer NOT NULL,
"daily_per_member" integer NOT NULL,
"event_threshold" integer NOT NULL,
"enabled" boolean NOT NULL,
"version" text NOT NULL
);
ALTER TABLE "public"."canonical_guild_exp_source_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_guild_progression_master" (
"level" integer NOT NULL,
"required_exp" integer NOT NULL,
"cumulative_exp" integer NOT NULL,
"member_cap" integer NOT NULL,
"version" text NOT NULL,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_guild_progression_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_guild_recruitment_master" (
"mode" text NOT NULL,
"accepts_direct_join" boolean NOT NULL,
"accepts_new_application" boolean NOT NULL,
"version" text NOT NULL
);
ALTER TABLE "public"."canonical_guild_recruitment_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_guild_role_master" (
"role" text NOT NULL,
"permissions" jsonb NOT NULL,
"version" text NOT NULL
);
ALTER TABLE "public"."canonical_guild_role_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_item_master" (
"version" text NOT NULL,
"item_id" text NOT NULL,
"display_name" text NOT NULL,
"category" text NOT NULL,
"description" text NOT NULL,
"stackable" boolean NOT NULL,
"max_stack" integer,
"usage_type" text NOT NULL,
"source_categories" jsonb NOT NULL,
"expiry_policy" text NOT NULL,
"runtime_usage" jsonb NOT NULL,
"asset_path" text,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_item_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_master_freeze_versions" (
"domain" text NOT NULL,
"version" text NOT NULL,
"payload" jsonb NOT NULL,
"is_production_enabled" boolean NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."canonical_master_freeze_versions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_preapply_compatibility_audit" (
"audit_key" text NOT NULL,
"patrol_rows_preserved" integer NOT NULL,
"mission_entitlements_before" integer NOT NULL,
"mission_entitlements_preserved" integer NOT NULL,
"mission_entitlements_unmigrated" integer NOT NULL,
"reward_quantity_before" bigint NOT NULL,
"reward_quantity_preserved" bigint NOT NULL,
"cash_before" bigint NOT NULL,
"cash_preserved" bigint NOT NULL,
"reward_breakdown_before" jsonb NOT NULL,
"reward_breakdown_preserved" jsonb NOT NULL,
"completed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."canonical_preapply_compatibility_audit" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_pvp_production_master" (
"version" text NOT NULL,
"payload" jsonb NOT NULL,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_pvp_production_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_pvp_ranking_rewards" (
"version" text NOT NULL,
"rank_min" integer NOT NULL,
"rank_max" integer NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL
);
ALTER TABLE "public"."canonical_pvp_ranking_rewards" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_quest_encounter_master" (
"version" text NOT NULL,
"encounter_id" text NOT NULL,
"quest_id" text NOT NULL,
"town_id" text NOT NULL,
"difficulty" text NOT NULL,
"members" jsonb NOT NULL,
"normal_attack_power_bp" integer NOT NULL,
"tuning_status" text NOT NULL,
"is_production_enabled" boolean NOT NULL,
"enemy_tactic" text
);
ALTER TABLE "public"."canonical_quest_encounter_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_quest_enemy_pool_entries" (
"version" text NOT NULL,
"pool_key" text NOT NULL,
"area_id" text NOT NULL,
"difficulty" text NOT NULL,
"rarity" text NOT NULL,
"character_id" text NOT NULL,
"growth_pattern" text NOT NULL,
"weight" integer NOT NULL,
"local_affinity" boolean NOT NULL,
"skill_loadout" jsonb NOT NULL,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_quest_enemy_pool_entries" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_quest_master" (
"version" text NOT NULL,
"quest_id" text NOT NULL,
"town_id" text NOT NULL,
"difficulty" text NOT NULL,
"display_name" text NOT NULL,
"display_order" integer NOT NULL,
"duration_sec" integer NOT NULL,
"vitality_cost" integer NOT NULL,
"user_exp" integer NOT NULL,
"cash_reward" integer NOT NULL,
"first_clear_user_exp" integer NOT NULL,
"reward_pool_id" text NOT NULL,
"first_clear_reward_pool_id" text,
"enemy_encounter_id" text,
"unlock_condition" text NOT NULL,
"is_production_enabled" boolean NOT NULL,
"daily_first_clear_cash" integer NOT NULL,
"enemy_pool_key" text
);
ALTER TABLE "public"."canonical_quest_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_quest_resource_cost" (
"version" text NOT NULL,
"difficulty" text NOT NULL,
"vitality_cost" integer NOT NULL
);
ALTER TABLE "public"."canonical_quest_resource_cost" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_quest_reward_pool_items" (
"version" text NOT NULL,
"reward_pool_id" text NOT NULL,
"roll_index" integer NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"probability_bp" integer NOT NULL
);
ALTER TABLE "public"."canonical_quest_reward_pool_items" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_raid_boss_master" (
"boss_id" text NOT NULL,
"town_id" text NOT NULL,
"display_name" text NOT NULL,
"profile_type" text NOT NULL,
"attribute" text NOT NULL,
"reference_level" integer NOT NULL,
"max_hp" bigint NOT NULL,
"atk" integer NOT NULL,
"def" integer NOT NULL,
"spd" integer NOT NULL,
"luk" integer NOT NULL,
"skill_loadout" jsonb NOT NULL,
"tuning_status" text NOT NULL,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_raid_boss_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_raid_production_master" (
"version" text NOT NULL,
"payload" jsonb NOT NULL,
"is_production_enabled" boolean NOT NULL
);
ALTER TABLE "public"."canonical_raid_production_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_raid_reward_master" (
"version" text NOT NULL,
"reward_type" text NOT NULL,
"reward_key" text NOT NULL,
"finalized_battles" integer,
"raid_points_consumed" integer,
"rank_min" integer,
"rank_max" integer,
"item_id" text NOT NULL,
"quantity" integer NOT NULL
);
ALTER TABLE "public"."canonical_raid_reward_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_raid_variants" (
"raid_variant_id" text NOT NULL,
"area_id" text NOT NULL,
"raid_name" text NOT NULL,
"max_hp" bigint NOT NULL,
"atk" integer NOT NULL,
"def" integer NOT NULL,
"spd" integer NOT NULL,
"member_character_ids" jsonb NOT NULL,
"is_production_enabled" boolean NOT NULL,
"version" text NOT NULL
);
ALTER TABLE "public"."canonical_raid_variants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_reward_supply_sources" (
"version" text NOT NULL,
"source" text NOT NULL,
"status" text NOT NULL,
"authority" text NOT NULL,
"notes" text NOT NULL
);
ALTER TABLE "public"."canonical_reward_supply_sources" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_skill_master" (
"version" text NOT NULL,
"skill_id" text NOT NULL,
"display_name" text NOT NULL,
"rarity" text NOT NULL,
"kind" text NOT NULL,
"activation_type" text NOT NULL,
"cooldown" integer,
"available_from_round" integer NOT NULL,
"target" text NOT NULL,
"effects" jsonb NOT NULL,
"exclusive_character_id" text
);
ALTER TABLE "public"."canonical_skill_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."canonical_user_level_master" (
"version" text NOT NULL,
"level" integer NOT NULL,
"required_exp" integer,
"cumulative_exp" integer NOT NULL,
"unlock_keys" jsonb NOT NULL
);
ALTER TABLE "public"."canonical_user_level_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."character_awakening_master" (
"awakening_level" integer NOT NULL,
"hp_bonus" integer,
"atk_bonus" integer,
"def_bonus" integer,
"spd_bonus" integer,
"luk_bonus" integer,
"required_cash" bigint
);
ALTER TABLE "public"."character_awakening_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."character_battle_master" (
"character_id" text NOT NULL,
"display_name" text NOT NULL,
"alignment" text NOT NULL,
"growth_pattern_id" text NOT NULL,
"rarity_multiplier" numeric NOT NULL
);
ALTER TABLE "public"."character_battle_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."character_cosmetics" (
"user_character_id" uuid NOT NULL,
"cosmetic_id" text NOT NULL,
"acquired_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone
);
ALTER TABLE "public"."character_cosmetics" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."character_growth_patterns" (
"pattern_id" text NOT NULL,
"name" text NOT NULL,
"hp_gain" numeric,
"atk_gain" numeric,
"def_gain" numeric,
"spd_gain" numeric,
"luk_gain" numeric,
"base_hp" integer,
"base_atk" integer,
"base_def" integer,
"base_spd" integer,
"base_luk" integer
);
ALTER TABLE "public"."character_growth_patterns" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."character_level_up_master" (
"level" integer NOT NULL,
"cost_cash" integer NOT NULL,
"required_material_count" integer NOT NULL,
"required_exp" integer NOT NULL
);
ALTER TABLE "public"."character_level_up_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."character_release_master" (
"character_id" text NOT NULL,
"display_name" text NOT NULL,
"rarity" text NOT NULL,
"alignment" text NOT NULL,
"growth_pattern_id" text NOT NULL,
"asset_path" text NOT NULL,
"display_order" integer NOT NULL,
"is_enabled" boolean NOT NULL,
"is_provisional" boolean NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."character_release_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."chat_read_states" (
"user_id" uuid NOT NULL,
"target_type" text NOT NULL,
"target_id" uuid NOT NULL,
"last_read_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."chat_read_states" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."client_funnel_events" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"user_id" uuid NOT NULL,
"event_name" text NOT NULL,
"source_screen" text,
"source_cta" text,
"object_id" text,
"metadata" jsonb NOT NULL,
"schema_version" integer NOT NULL,
"occurred_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."client_funnel_events" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."cosmetic_master" (
"id" text NOT NULL,
"owner_scope" text NOT NULL,
"slot" text NOT NULL,
"rarity" text NOT NULL,
"display_name" text NOT NULL,
"asset_key" text,
"preview_key" text,
"source_type" text NOT NULL,
"source_reference" text,
"expires_enabled" boolean NOT NULL,
"metadata" jsonb NOT NULL,
"active" boolean NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."cosmetic_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."direct_messages" (
"id" uuid NOT NULL,
"sender_id" uuid,
"recipient_id" uuid,
"message" text NOT NULL,
"created_at" timestamp with time zone,
"is_read" boolean NOT NULL
);
ALTER TABLE "public"."direct_messages" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."enemies" (
"id" text NOT NULL,
"name" text NOT NULL,
"level" integer,
"hp" integer,
"atk" integer,
"def" integer,
"spd" integer,
"luk" integer,
"enemy_type" text,
"skills" jsonb
);
ALTER TABLE "public"."enemies" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."equipment_battle_master" (
"equipment_id" text NOT NULL,
"display_name" text NOT NULL,
"rarity" text NOT NULL,
"slot_type" text NOT NULL,
"hp" integer NOT NULL,
"atk" integer NOT NULL,
"def" integer NOT NULL,
"spd" integer NOT NULL,
"luk" integer NOT NULL,
"is_exclusive" boolean NOT NULL,
"exclusive_character_id" text
);
ALTER TABLE "public"."equipment_battle_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."equipment_level_up_master" (
"level" integer NOT NULL,
"cost_cash" integer,
"required_exp" integer
);
ALTER TABLE "public"."equipment_level_up_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."equipment_limit_break_master" (
"plus_val" integer NOT NULL,
"success_rate" numeric,
"cost_cash" integer,
"required_hammer" integer
);
ALTER TABLE "public"."equipment_limit_break_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."equipped_cosmetics" (
"user_id" uuid NOT NULL,
"slot" text NOT NULL,
"cosmetic_id" text NOT NULL,
"equipped_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."equipped_cosmetics" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."feature_operating_states" (
"feature_key" text NOT NULL,
"state" text NOT NULL,
"updated_at" timestamp with time zone NOT NULL,
"visibility" boolean NOT NULL,
"mutation_allowed" boolean NOT NULL,
"navigation_allowed" boolean NOT NULL,
"deep_link_allowed" boolean NOT NULL,
"reason_code" text NOT NULL,
"message" text,
"started_at" timestamp with time zone,
"ends_at" timestamp with time zone
);
ALTER TABLE "public"."feature_operating_states" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."friend_requests" (
"id" uuid NOT NULL,
"sender_id" uuid NOT NULL,
"receiver_id" uuid NOT NULL,
"status" text NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"resolved_at" timestamp with time zone
);
ALTER TABLE "public"."friend_requests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gacha_banner_master" (
"id" text NOT NULL,
"banner_type" text NOT NULL,
"gacha_category" text NOT NULL,
"target_item_ids" jsonb NOT NULL,
"pickup_rate" real,
"start_at" timestamp with time zone NOT NULL,
"end_at" timestamp with time zone NOT NULL,
"banner_image_url" text,
"description" text
);
ALTER TABLE "public"."gacha_banner_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gacha_execution_history" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"gacha_id" text NOT NULL,
"payment_source" text NOT NULL,
"pull_count" integer NOT NULL,
"ticket_item_id" text,
"cost_amount" integer NOT NULL,
"pity_before" integer NOT NULL,
"pity_after" integer NOT NULL,
"result_payload" jsonb,
"status" text NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"completed_at" timestamp with time zone
);
ALTER TABLE "public"."gacha_execution_history" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gacha_items_master" (
"id" text NOT NULL,
"gacha_id" text,
"item_type" text NOT NULL,
"item_id" text NOT NULL,
"rarity" text NOT NULL,
"weight" integer,
"is_pickup" boolean NOT NULL
);
ALTER TABLE "public"."gacha_items_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gacha_masters" (
"id" text NOT NULL,
"name" text NOT NULL,
"cost_cash" integer,
"cost_diamond" integer,
"banner_img" text,
"gacha_type" text NOT NULL
);
ALTER TABLE "public"."gacha_masters" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gacha_rarity_rates" (
"gacha_id" text NOT NULL,
"rarity" text NOT NULL,
"weight" integer NOT NULL
);
ALTER TABLE "public"."gacha_rarity_rates" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gameplay_reset_requests" (
"request_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"status" text NOT NULL,
"result" jsonb,
"created_at" timestamp with time zone NOT NULL,
"completed_at" timestamp with time zone
);
ALTER TABLE "public"."gameplay_reset_requests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gameplay_reward_delivery_ledger" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"source_kind" text NOT NULL,
"source_key" text NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"delivered_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."gameplay_reward_delivery_ledger" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."growth_exp_execution_history" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"kind" text NOT NULL,
"owned_id" uuid NOT NULL,
"materials" jsonb NOT NULL,
"result_payload" jsonb,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."growth_exp_execution_history" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_activity_grants" (
"id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"action_type" text NOT NULL,
"source_id" uuid NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_activity_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_base_controls" (
"id" uuid NOT NULL,
"base_id" text NOT NULL,
"guild_id" uuid,
"daily_points" integer,
"is_controlling" boolean,
"total_seasonal_days" integer,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."guild_base_controls" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_cosmetics" (
"guild_id" uuid NOT NULL,
"cosmetic_id" text NOT NULL,
"acquired_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone,
"source_type" text,
"source_reference" text
);
ALTER TABLE "public"."guild_cosmetics" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_decorations" (
"id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"decoration_id" text NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_decorations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_equipped_cosmetics" (
"guild_id" uuid NOT NULL,
"slot" text NOT NULL,
"cosmetic_id" text NOT NULL,
"equipped_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_equipped_cosmetics" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_exp_daily_ledger" (
"id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"source" text NOT NULL,
"jst_date" date NOT NULL,
"exp_granted" integer NOT NULL,
"source_reference_id" uuid,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_exp_daily_ledger" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_exp_daily_progress" (
"guild_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"source" text NOT NULL,
"jst_date" date NOT NULL,
"event_count" integer NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_exp_daily_progress" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_human_response_metrics" (
"join_request_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"joined_user_id" uuid NOT NULL,
"joined_at" timestamp with time zone NOT NULL,
"first_human_response_message_id" uuid,
"first_human_response_at" timestamp with time zone,
"response_seconds" integer,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_human_response_metrics" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_join_requests" (
"id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"status" text NOT NULL,
"requested_at" timestamp with time zone NOT NULL,
"reviewed_at" timestamp with time zone,
"reviewed_by" uuid
);
ALTER TABLE "public"."guild_join_requests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_level_master" (
"level" integer NOT NULL,
"next_xp" integer,
"max_members" integer,
"member_buff_atk" numeric,
"member_buff_hp" numeric
);
ALTER TABLE "public"."guild_level_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_members" (
"id" uuid NOT NULL,
"guild_id" uuid,
"user_id" uuid,
"role" text,
"contribution_points" integer,
"joined_at" timestamp with time zone,
"weekly_contribution" integer NOT NULL,
"total_contribution" integer NOT NULL
);
ALTER TABLE "public"."guild_members" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_recommendation_weights" (
"config_key" text NOT NULL,
"weight" numeric NOT NULL,
"description" text NOT NULL,
"is_provisional" boolean NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."guild_recommendation_weights" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guild_xp_action_master" (
"action_type" text NOT NULL,
"xp_grant" integer,
"contribution_grant" integer
);
ALTER TABLE "public"."guild_xp_action_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."guilds" (
"id" uuid NOT NULL,
"name" text NOT NULL,
"leader_id" uuid,
"level" integer,
"xp" integer,
"funds" bigint,
"main_alignment" text,
"sub_alignment" text,
"banner_id" text,
"decoration_id" text,
"created_at" timestamp with time zone,
"description" text NOT NULL,
"logo_icon" text NOT NULL,
"color_theme" text NOT NULL,
"cash" bigint NOT NULL,
"approval_required" boolean NOT NULL,
"auto_kick_days" integer NOT NULL,
"unlocked_decorations" jsonb NOT NULL,
"unlocked_banners" jsonb NOT NULL,
"equipped_decoration" text,
"equipped_banner" text,
"welcome_message" text,
"recruitment_mode" text NOT NULL,
"is_disbanded" boolean NOT NULL,
"disbanded_at" timestamp with time zone
);
ALTER TABLE "public"."guilds" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_attack_logs" (
"id" uuid NOT NULL,
"match_session_id" uuid NOT NULL,
"attacker_user_id" uuid NOT NULL,
"attacker_guild_id" uuid NOT NULL,
"defender_snapshot_id" uuid,
"battle_session_id" uuid,
"battle_result" text NOT NULL,
"raw_damage" bigint NOT NULL,
"applied_damage" bigint NOT NULL,
"win_damage_multiplier" numeric(3,2) NOT NULL,
"accepted_at" timestamp with time zone NOT NULL,
"resolved_at" timestamp with time zone NOT NULL,
"battle_replay_session_id" uuid
);
ALTER TABLE "public"."gvg_attack_logs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_defense_decks" (
"id" uuid NOT NULL,
"user_id" uuid,
"character_1_id" text,
"character_2_id" text,
"character_3_id" text,
"character_4_id" text,
"character_5_id" text,
"updated_at" timestamp with time zone,
"guild_id" uuid
);
ALTER TABLE "public"."gvg_defense_decks" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_guild_ratings" (
"guild_id" uuid NOT NULL,
"rating" integer NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."gvg_guild_ratings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_guild_season_rankings" (
"season_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"rate" integer NOT NULL,
"rank_tier" text,
"wins" integer NOT NULL,
"losses" integer NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."gvg_guild_season_rankings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_individual_season_rankings" (
"season_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"guild_id" uuid,
"actual_damage" bigint NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."gvg_individual_season_rankings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_match_member_snapshots" (
"id" uuid NOT NULL,
"match_session_id" uuid NOT NULL,
"side" text NOT NULL,
"guild_id" uuid,
"user_id" uuid,
"defense_deck" jsonb NOT NULL,
"defense_is_npc" boolean NOT NULL,
"npc_power" bigint,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."gvg_match_member_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_match_sessions" (
"id" uuid NOT NULL,
"session_key" text NOT NULL,
"scheduled_start_at" timestamp with time zone NOT NULL,
"scheduled_end_at" timestamp with time zone NOT NULL,
"matched_at" timestamp with time zone,
"status" text NOT NULL,
"is_npc_match" boolean NOT NULL,
"guild_a_id" uuid NOT NULL,
"guild_b_id" uuid,
"npc_guild_name" text,
"phases_required" smallint NOT NULL,
"guild_a_phase" smallint NOT NULL,
"guild_b_phase" smallint NOT NULL,
"guild_a_phase_max_hp" bigint NOT NULL,
"guild_b_phase_max_hp" bigint NOT NULL,
"guild_a_phase_hp" bigint NOT NULL,
"guild_b_phase_hp" bigint NOT NULL,
"guild_a_collapses" smallint NOT NULL,
"guild_b_collapses" smallint NOT NULL,
"guild_a_total_applied_damage" bigint NOT NULL,
"guild_b_total_applied_damage" bigint NOT NULL,
"winner_guild_id" uuid,
"result_reason" text,
"created_at" timestamp with time zone NOT NULL,
"completed_at" timestamp with time zone,
"guild_a_last_progress_at" timestamp with time zone,
"guild_b_last_progress_at" timestamp with time zone
);
ALTER TABLE "public"."gvg_match_sessions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_matches" (
"id" uuid NOT NULL,
"season_id" integer,
"day_number" integer,
"base_id" text NOT NULL,
"guild_a_id" uuid,
"guild_b_id" uuid,
"status" text,
"winner_guild_id" uuid,
"is_finals" boolean,
"created_at" timestamp with time zone,
"round" integer NOT NULL
);
ALTER TABLE "public"."gvg_matches" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_rewards_master" (
"rank" integer NOT NULL,
"guild_funds" integer,
"member_diamonds" integer
);
ALTER TABLE "public"."gvg_rewards_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."gvg_season_status" (
"id" integer NOT NULL,
"current_day" integer,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."gvg_season_status" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."home_banner_master" (
"id" text NOT NULL,
"title" text NOT NULL,
"image_url" text NOT NULL,
"destination_type" text NOT NULL,
"destination_value" text,
"priority" integer NOT NULL,
"start_at" timestamp with time zone NOT NULL,
"end_at" timestamp with time zone,
"active" boolean NOT NULL,
"audience" jsonb NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."home_banner_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_account_classification_periods" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"subject_id" uuid NOT NULL,
"classification" text NOT NULL,
"valid_from" timestamp with time zone NOT NULL,
"valid_to" timestamp with time zone,
"reason" text NOT NULL,
"changed_by" uuid,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."kpi_account_classification_periods" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_acquisition_journey_facts" (
"id" uuid NOT NULL,
"journey_id" uuid NOT NULL,
"event_type" text NOT NULL,
"occurred_at" timestamp with time zone NOT NULL,
"recorded_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"idempotency_key" text NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_acquisition_journey_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_acquisition_journeys" (
"journey_id" uuid NOT NULL,
"journey_token_hash" text NOT NULL,
"started_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"first_arrived_at" timestamp with time zone GENERATED ALWAYS AS (started_at) STORED,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_acquisition_journeys" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_acquisition_subject_bindings" (
"journey_id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"bound_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"first_touch_source" text,
"first_touch_fixed_at" timestamp with time zone,
"first_touch_rule_version" text
);
ALTER TABLE "public"."kpi_acquisition_subject_bindings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_aggregation_runs" (
"run_id" uuid NOT NULL,
"category" text NOT NULL,
"period_type" text NOT NULL,
"period_start" date NOT NULL,
"period_end" date NOT NULL,
"status" text NOT NULL,
"requested_by" uuid,
"requested_at" timestamp with time zone NOT NULL,
"started_at" timestamp with time zone,
"finished_at" timestamp with time zone,
"aggregation_version" text NOT NULL,
"exclusion_rule_version" text NOT NULL,
"source_watermark" timestamp with time zone,
"error_code" text,
"error_detail" text
);
ALTER TABLE "public"."kpi_aggregation_runs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_daily_user_activity" (
"activity_date" date NOT NULL,
"subject_id" uuid NOT NULL,
"first_active_at" timestamp with time zone NOT NULL,
"last_active_at" timestamp with time zone NOT NULL,
"source" text NOT NULL
);
ALTER TABLE "public"."kpi_daily_user_activity" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_gacha_execution_facts" (
"subject_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"gacha_id" text NOT NULL,
"gacha_type" text NOT NULL,
"payment_source" text NOT NULL,
"pull_count" integer NOT NULL,
"completed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."kpi_gacha_execution_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_guild_chat_activation_facts" (
"id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"membership_period_id" bigint NOT NULL,
"first_message_fact_id" uuid NOT NULL,
"occurred_at" timestamp with time zone NOT NULL,
"recorded_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL
);
ALTER TABLE "public"."kpi_guild_chat_activation_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_guild_chat_message_facts" (
"id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"membership_period_id" bigint NOT NULL,
"source_message_id" uuid NOT NULL,
"occurred_at" timestamp with time zone NOT NULL,
"recorded_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"idempotency_key" text NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_guild_chat_message_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_guild_conversion_facts" (
"id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"membership_period_id" bigint NOT NULL,
"conversion_type" text NOT NULL,
"occurred_at" timestamp with time zone NOT NULL,
"recorded_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"idempotency_key" text NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_guild_conversion_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_guild_membership_periods" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"guild_id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"joined_at" timestamp with time zone NOT NULL,
"left_at" timestamp with time zone,
"leave_reason" text,
"source_membership_id" uuid,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."kpi_guild_membership_periods" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_marketing_daily_fact_revisions" (
"id" uuid NOT NULL,
"scope_id" uuid NOT NULL,
"platform" text NOT NULL,
"report_date_jst" date NOT NULL,
"source_timezone" text NOT NULL,
"account_key" text NOT NULL,
"campaign_key" text NOT NULL,
"campaign_name" text,
"line_item_key" text,
"line_item_name" text,
"creative_key" text,
"creative_name" text,
"reporting_grain" text NOT NULL,
"spend" numeric(20,6) NOT NULL,
"currency" text NOT NULL,
"impressions" bigint NOT NULL,
"clicks" bigint NOT NULL,
"external_key" text NOT NULL,
"revision" integer NOT NULL,
"batch_id" uuid NOT NULL,
"imported_at" timestamp with time zone NOT NULL,
"idempotency_key" text NOT NULL,
"payload_hash" text NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_marketing_daily_fact_revisions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_marketing_import_batches" (
"id" uuid NOT NULL,
"platform" text NOT NULL,
"source" text NOT NULL,
"imported_at" timestamp with time zone NOT NULL,
"actor_identifier" uuid NOT NULL,
"file_hash" text,
"idempotency_key" text NOT NULL,
"schema_version" integer NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_marketing_import_batches" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_marketing_reporting_scopes" (
"id" uuid NOT NULL,
"platform" text NOT NULL,
"report_date_jst" date NOT NULL,
"account_key" text NOT NULL,
"currency" text NOT NULL,
"reporting_grain" text NOT NULL
);
ALTER TABLE "public"."kpi_marketing_reporting_scopes" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_metric_snapshots" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"run_id" uuid NOT NULL,
"metric_id" text NOT NULL,
"dimension_key" jsonb NOT NULL,
"value" numeric,
"numerator" bigint,
"denominator" bigint,
"value_status" text NOT NULL,
"null_reason" text,
"calculated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."kpi_metric_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_overview_saved_results" (
"period_type" text NOT NULL,
"period_start" date NOT NULL,
"period_end" date NOT NULL,
"generated_at" timestamp with time zone NOT NULL,
"generation_id" uuid NOT NULL,
"definition_version" text NOT NULL,
"payload" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_overview_saved_results" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_subject_identity_transition_facts" (
"id" uuid NOT NULL,
"from_subject_id" uuid NOT NULL,
"to_subject_id" uuid NOT NULL,
"transition_type" text NOT NULL,
"occurred_at" timestamp with time zone NOT NULL,
"recorded_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"idempotency_key" text NOT NULL,
"context_id" uuid NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_subject_identity_transition_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_subjects" (
"subject_id" uuid NOT NULL,
"source_user_id" uuid,
"registered_at" timestamp with time zone NOT NULL,
"registration_type" text NOT NULL,
"first_authenticated_at" timestamp with time zone,
"detached_at" timestamp with time zone,
"deletion_reason" text,
"created_at" timestamp with time zone NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."kpi_subjects" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_tutorial_completion_facts" (
"subject_id" uuid NOT NULL,
"completed_at" timestamp with time zone NOT NULL,
"tutorial_version" text,
"source" text NOT NULL
);
ALTER TABLE "public"."kpi_tutorial_completion_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_tutorial_journey_facts" (
"id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"fact_type" text NOT NULL,
"occurred_at" timestamp with time zone NOT NULL,
"recorded_at" timestamp with time zone NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"idempotency_key" text NOT NULL,
"tutorial_version" text NOT NULL,
"context_id" uuid NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."kpi_tutorial_journey_facts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."kpi_tutorial_mypage_ready_contexts" (
"context_id" uuid NOT NULL,
"subject_id" uuid NOT NULL,
"issued_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone NOT NULL,
"profile_ready" boolean NOT NULL,
"onboarding_ready" boolean NOT NULL,
"identity_leader_ready" boolean NOT NULL,
"guild_membership_resolved" boolean NOT NULL,
"guild_membership_status" text NOT NULL,
"tutorial_version" text NOT NULL,
"source" text NOT NULL,
"schema_version" integer NOT NULL,
"idempotency_key" text NOT NULL,
"acknowledged_at" timestamp with time zone
);
ALTER TABLE "public"."kpi_tutorial_mypage_ready_contexts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."login_bonus_master" (
"day_number" integer NOT NULL,
"item_id" text NOT NULL,
"quantity" integer,
"item_name" text NOT NULL,
"is_featured" boolean NOT NULL
);
ALTER TABLE "public"."login_bonus_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."mission_event_dialog_views" (
"user_id" uuid NOT NULL,
"event_id" text NOT NULL,
"jst_date" date NOT NULL,
"viewed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."mission_event_dialog_views" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."mission_event_telemetry" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"event_id" text NOT NULL,
"user_id" uuid NOT NULL,
"event_name" text NOT NULL,
"mission_id" text,
"jst_date" date NOT NULL,
"source" text,
"metadata" jsonb NOT NULL,
"occurred_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."mission_event_telemetry" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."mission_events" (
"id" text NOT NULL,
"display_name" text NOT NULL,
"start_at" timestamp with time zone NOT NULL,
"progress_end_at" timestamp with time zone NOT NULL,
"claim_deadline" timestamp with time zone,
"time_zone" text NOT NULL,
"banner_image_url" text,
"banner_title" text,
"banner_subtitle" text,
"banner_cta_label" text,
"dialog_image_url" text,
"dialog_body" text,
"primary_cta_label" text,
"secondary_cta_label" text,
"is_enabled" boolean NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."mission_events" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."mission_reward_components" (
"mission_id" text NOT NULL,
"reward_order" smallint NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL
);
ALTER TABLE "public"."mission_reward_components" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."mission_reward_delivery_items" (
"delivery_ledger_id" uuid NOT NULL,
"reward_order" smallint NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"delivered_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."mission_reward_delivery_items" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."mission_reward_delivery_ledger" (
"id" uuid NOT NULL,
"claim_key" text NOT NULL,
"user_mission_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"mission_id" text NOT NULL,
"cycle_date" date,
"resolved_item_id" text,
"item_quantity" integer NOT NULL,
"cash_quantity" integer NOT NULL,
"delivery_status" text NOT NULL,
"delivered_at" timestamp with time zone,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."mission_reward_delivery_ledger" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."missions" (
"id" text NOT NULL,
"category" text NOT NULL,
"trigger_type" text NOT NULL,
"title" text NOT NULL,
"desc_text" text,
"target_value" integer,
"reward_item_id" text,
"reward_qty" integer,
"reward_quantity" integer NOT NULL,
"description" text,
"condition_params" jsonb NOT NULL,
"prerequisite_mission_id" text,
"display_order" integer NOT NULL,
"is_enabled" boolean NOT NULL,
"is_repeatable" boolean NOT NULL,
"is_provisional" boolean NOT NULL,
"display_group" text,
"cash_reward" integer NOT NULL,
"next_mission_id" text,
"repeat_rule" text,
"claim_rule" text,
"preopen" boolean NOT NULL,
"event_id" text
);
ALTER TABLE "public"."missions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_entity_snapshots" (
"season_id" uuid NOT NULL,
"entity_id" uuid NOT NULL,
"score" bigint NOT NULL,
"rank_position" integer NOT NULL
);
ALTER TABLE "public"."monthly_power_entity_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_honor_bindings" (
"reward_version" text NOT NULL,
"ranking_type" text NOT NULL,
"rank_min" integer NOT NULL,
"cosmetic_id" text NOT NULL
);
ALTER TABLE "public"."monthly_power_honor_bindings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_honor_grants" (
"season_id" uuid NOT NULL,
"entity_id" uuid NOT NULL,
"cosmetic_id" text NOT NULL,
"rank_position" integer NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."monthly_power_honor_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_honor_recipients" (
"season_id" uuid NOT NULL,
"entity_id" uuid NOT NULL,
"cosmetic_id" text NOT NULL,
"recipient_user_id" uuid NOT NULL
);
ALTER TABLE "public"."monthly_power_honor_recipients" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_honor_requirements" (
"season_id" uuid NOT NULL,
"entity_id" uuid NOT NULL,
"rank_position" integer NOT NULL,
"honor_label" text NOT NULL
);
ALTER TABLE "public"."monthly_power_honor_requirements" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_member_snapshots" (
"season_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"joined_at" timestamp with time zone,
"continuous_season_days" integer,
"membership_history" jsonb NOT NULL
);
ALTER TABLE "public"."monthly_power_member_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_reward_master" (
"reward_version" text NOT NULL,
"ranking_type" text NOT NULL,
"rank_min" integer NOT NULL,
"rank_max" integer NOT NULL,
"honor_label" text NOT NULL,
"items" jsonb NOT NULL
);
ALTER TABLE "public"."monthly_power_reward_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."monthly_power_season_runs" (
"season_id" uuid NOT NULL,
"reward_version" text NOT NULL,
"eligibility_policy" text,
"snapshotted_at" timestamp with time zone,
"granted_at" timestamp with time zone
);
ALTER TABLE "public"."monthly_power_season_runs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."news" (
"id" bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
"category" text NOT NULL,
"title" text NOT NULL,
"content" text NOT NULL,
"link_url" text,
"start_at" timestamp with time zone NOT NULL,
"end_at" timestamp with time zone,
"created_at" timestamp with time zone NOT NULL,
"is_published" boolean NOT NULL,
"release_key" text
);
ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."operations_feature_state_audit" (
"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
"feature_key" text NOT NULL,
"old_state" text,
"new_state" text NOT NULL,
"actor" uuid,
"changed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."operations_feature_state_audit" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."operations_maintenance_testers" (
"user_id" uuid NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone NOT NULL,
"reason" text NOT NULL
);
ALTER TABLE "public"."operations_maintenance_testers" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."patrol_npcs" (
"id" text NOT NULL,
"quest_id" text,
"npc_name" text NOT NULL,
"npc_level" integer,
"encounter_rate" numeric,
"enemy_data" jsonb
);
ALTER TABLE "public"."patrol_npcs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."payment_transactions" (
"id" uuid NOT NULL,
"user_id" uuid,
"product_id" text NOT NULL,
"amount" integer,
"currency" text,
"status" text,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."presents" (
"id" uuid NOT NULL,
"user_id" uuid,
"item_id" text NOT NULL,
"quantity" integer,
"message" text,
"status" text,
"expire_at" timestamp with time zone,
"created_at" timestamp with time zone,
"sent_at" timestamp with time zone NOT NULL,
"claimed_at" timestamp with time zone,
"source_kind" text,
"source_key" text,
"source_metadata" jsonb NOT NULL
);
ALTER TABLE "public"."presents" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_daily_wins" (
"activity_date" date NOT NULL,
"user_id" uuid NOT NULL,
"wins" integer NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."pvp_daily_wins" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_defense_decks" (
"id" uuid NOT NULL,
"user_id" uuid,
"character_1_id" text,
"character_2_id" text,
"character_3_id" text,
"character_4_id" text,
"character_5_id" text,
"updated_at" timestamp with time zone,
"tactic" text NOT NULL
);
ALTER TABLE "public"."pvp_defense_decks" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_defense_logs" (
"id" uuid NOT NULL,
"user_id" uuid,
"attacker_id" uuid,
"attacker_name" text,
"result" text,
"points_change" integer,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."pvp_defense_logs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_match_rewards_master" (
"result" text NOT NULL,
"diamond_reward" integer,
"cash_reward" integer,
"exp_reward" integer,
"raid_ticket_reward" integer NOT NULL
);
ALTER TABLE "public"."pvp_match_rewards_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_ranking_reward_grants" (
"season_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"rank_position" integer NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."pvp_ranking_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_ranks" (
"id" uuid NOT NULL,
"user_id" uuid,
"rank_points" integer,
"daily_wins" integer,
"season_wins" integer,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."pvp_ranks" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."pvp_rewards_master" (
"id" integer NOT NULL,
"rank_min" integer NOT NULL,
"rank_max" integer NOT NULL,
"diamond_reward" integer,
"cash_reward" integer,
"threshold_points" integer NOT NULL,
"reward_item_id" text NOT NULL,
"reward_quantity" integer NOT NULL
);
ALTER TABLE "public"."pvp_rewards_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quest_raid_encounter_bonus_grants" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"issued_at" timestamp with time zone NOT NULL,
"rule_version" integer NOT NULL,
"cash" bigint,
"user_xp" integer
);
ALTER TABLE "public"."quest_raid_encounter_bonus_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quest_raid_encounter_bonus_items" (
"difficulty" text NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL
);
ALTER TABLE "public"."quest_raid_encounter_bonus_items" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quest_raid_encounter_progress" (
"user_id" uuid NOT NULL,
"first_created" boolean NOT NULL,
"misses" integer NOT NULL
);
ALTER TABLE "public"."quest_raid_encounter_progress" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quest_raid_encounter_settings" (
"singleton" boolean NOT NULL,
"enabled" boolean NOT NULL,
"version" integer NOT NULL,
"probability_bp" integer NOT NULL,
"guaranteed_after" integer NOT NULL,
"personal_active_limit" integer NOT NULL,
"allow_outside_daily" boolean NOT NULL,
"beginner_weight" integer NOT NULL,
"intermediate_weight" integer NOT NULL,
"advanced_weight" integer NOT NULL
);
ALTER TABLE "public"."quest_raid_encounter_settings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quest_raid_encounters" (
"patrol_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"area_id" text NOT NULL,
"status" text NOT NULL,
"difficulty" text,
"variant_id" text,
"room_id" uuid,
"rule_version" integer,
"bonus_items" jsonb,
"created_at" timestamp with time zone NOT NULL,
"acknowledged_at" timestamp with time zone,
"reward_multiplier" integer NOT NULL,
"bonus_cash" bigint,
"bonus_user_xp" integer
);
ALTER TABLE "public"."quest_raid_encounters" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quest_towns" (
"id" text NOT NULL,
"name" text NOT NULL,
"desc_text" text,
"bg_image" text
);
ALTER TABLE "public"."quest_towns" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."quests" (
"id" text NOT NULL,
"town_id" text,
"level_type" text NOT NULL,
"name" text NOT NULL,
"duration_seconds" integer,
"cost_vitality" integer,
"cash_reward" integer,
"exp_reward" integer,
"item_rewards" jsonb
);
ALTER TABLE "public"."quests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_attempt_cost_master" (
"attempt_number" integer NOT NULL,
"currency_type" text NOT NULL,
"cost" integer NOT NULL,
"is_provisional" boolean NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_attempt_cost_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_boss_master" (
"id" text NOT NULL,
"name" text NOT NULL,
"base_hp" bigint,
"base_atk" integer,
"base_def" integer,
"spd" integer,
"duration_minutes" integer,
"rewards" jsonb,
"boss_name" text NOT NULL,
"level" integer NOT NULL,
"max_hp" bigint NOT NULL,
"atk" integer NOT NULL,
"def" integer NOT NULL,
"luk" integer NOT NULL,
"skills" jsonb NOT NULL,
"enabled" boolean NOT NULL,
"profile_type" text,
"attribute" text,
"town_id" text
);
ALTER TABLE "public"."raid_boss_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_bosses" (
"id" uuid NOT NULL,
"boss_id" text NOT NULL,
"current_hp" bigint,
"max_hp" bigint,
"base_id" text,
"status" text,
"expires_at" timestamp with time zone NOT NULL,
"created_at" timestamp with time zone,
"cycle_id" uuid NOT NULL,
"boss_master_id" text,
"spawned_at" timestamp with time zone NOT NULL,
"outcome" text,
"outcome_finalized_at" timestamp with time zone,
"rotation_date" date,
"raid_variant_id" text,
"raid_day_key" text,
"cleared_at" timestamp with time zone,
"respawn_after" timestamp with time zone
);
ALTER TABLE "public"."raid_bosses" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_clear_reward_claims" (
"raid_day_key" text NOT NULL,
"user_id" uuid NOT NULL,
"reward_type" text NOT NULL,
"source_instance_id" uuid NOT NULL,
"ticket_roll" boolean NOT NULL,
"ticket_item_id" text,
"awakening_roll" boolean NOT NULL,
"delivery_status" text NOT NULL,
"last_error" text,
"created_at" timestamp with time zone NOT NULL,
"delivered_at" timestamp with time zone
);
ALTER TABLE "public"."raid_clear_reward_claims" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_clear_reward_deliveries" (
"raid_day_key" text NOT NULL,
"user_id" uuid NOT NULL,
"reward_type" text NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"source_instance_id" uuid NOT NULL,
"delivered_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_clear_reward_deliveries" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_completion_xp_grants" (
"raid_cycle_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"reward_xp" integer NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_completion_xp_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_daily_clear_bonus_ledger" (
"raid_day_key" date NOT NULL,
"user_id" uuid NOT NULL,
"difficulty" text NOT NULL,
"source_instance_id" uuid NOT NULL,
"source_room_id" uuid NOT NULL,
"won" boolean NOT NULL,
"items" jsonb NOT NULL,
"issued_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_daily_clear_bonus_ledger" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_daily_clear_bonus_rules" (
"difficulty" text NOT NULL,
"chance_bp" integer NOT NULL,
"items" jsonb NOT NULL
);
ALTER TABLE "public"."raid_daily_clear_bonus_rules" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_damage_logs" (
"id" uuid NOT NULL,
"boss_id" text NOT NULL,
"user_id" uuid,
"damage" bigint,
"created_at" timestamp with time zone,
"raid_boss_id" text,
"damage_dealt" bigint NOT NULL,
"raid_boss_instance_id" uuid,
"battle_replay_session_id" uuid,
"guild_id" uuid,
"raw_damage" bigint NOT NULL,
"applied_damage" bigint NOT NULL
);
ALTER TABLE "public"."raid_damage_logs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_instance_user_progress" (
"raid_boss_instance_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"finalized_battles" integer NOT NULL,
"raid_points_consumed" integer NOT NULL,
"last_guild_id" uuid,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_instance_user_progress" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_legacy_settings" (
"singleton" boolean NOT NULL,
"enabled" boolean NOT NULL
);
ALTER TABLE "public"."raid_legacy_settings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_production_reward_grants" (
"raid_boss_instance_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"reward_type" text NOT NULL,
"reward_key" text NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_production_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_reward_grants" (
"raid_boss_instance_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"reward_id" integer NOT NULL,
"reward_reason" text NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_rewards_master" (
"id" integer NOT NULL,
"reward_type" text NOT NULL,
"threshold_val" bigint,
"item_id" text NOT NULL,
"quantity" integer,
"reward_xp" integer NOT NULL,
"reward_item_id" text,
"reward_quantity" integer NOT NULL
);
ALTER TABLE "public"."raid_rewards_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_battle_request_cancellations" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"cancelled_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_battle_request_cancellations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_battle_settings" (
"singleton" boolean NOT NULL,
"enabled" boolean NOT NULL
);
ALTER TABLE "public"."raid_room_battle_settings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_battle_start_requests" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"room_id" uuid NOT NULL,
"character_ids" text[] NOT NULL,
"tactic" text NOT NULL,
"replay_session_id" uuid NOT NULL,
"response" jsonb NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"recovery_acknowledged_at" timestamp with time zone
);
ALTER TABLE "public"."raid_room_battle_start_requests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_clear_reward_grants" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"present_id" uuid,
"direct_delivery_id" uuid
);
ALTER TABLE "public"."raid_room_clear_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_clear_reward_items" (
"difficulty" text NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL
);
ALTER TABLE "public"."raid_room_clear_reward_items" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_clear_reward_rules" (
"difficulty" text NOT NULL,
"enabled" boolean NOT NULL,
"minimum_contribution_damage" bigint,
"rule_version" bigint NOT NULL,
"minimum_contribution_bp" integer
);
ALTER TABLE "public"."raid_room_clear_reward_rules" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_clear_rewards" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"rule_version" bigint NOT NULL,
"finalized_battles" bigint NOT NULL,
"contribution_damage" bigint NOT NULL,
"clear_gate" jsonb NOT NULL,
"issued_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_clear_rewards" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_combat_profiles" (
"raid_variant_id" text NOT NULL,
"difficulty_id" text NOT NULL,
"max_hp" bigint NOT NULL,
"profile" jsonb NOT NULL
);
ALTER TABLE "public"."raid_room_combat_profiles" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_combat_snapshots" (
"room_id" uuid NOT NULL,
"profile" jsonb NOT NULL,
"enemy_snapshot" jsonb NOT NULL
);
ALTER TABLE "public"."raid_room_combat_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_creation_requests" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"difficulty_id" text NOT NULL,
"raid_variant_id" text NOT NULL,
"room_id" uuid NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_creation_requests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_creation_settings" (
"singleton" boolean NOT NULL,
"enabled" boolean NOT NULL
);
ALTER TABLE "public"."raid_room_creation_settings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_difficulty_rules" (
"difficulty" text NOT NULL,
"minimum_power" bigint,
"rescue_min_battles" bigint,
"rescue_min_contribution_damage" bigint,
"rule_version" bigint NOT NULL
);
ALTER TABLE "public"."raid_room_difficulty_rules" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_lifecycle_rules" (
"difficulty" text NOT NULL,
"max_active_rooms" integer NOT NULL,
"member_capacity" integer NOT NULL,
"duration_hours" integer NOT NULL
);
ALTER TABLE "public"."raid_room_lifecycle_rules" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_members" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"joined_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_members" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_members" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"rescue_id" uuid NOT NULL,
"joined_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_members" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_publications" (
"id" uuid NOT NULL,
"room_id" uuid NOT NULL,
"requester_user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"channel" text NOT NULL,
"guild_id" uuid,
"ordinal" integer NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_publications" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_requests" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"room_id" uuid NOT NULL,
"response" jsonb NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_requests" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_reward_grants" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"present_id" uuid,
"direct_delivery_id" uuid
);
ALTER TABLE "public"."raid_room_rescue_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_reward_items" (
"difficulty" text NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_reward_items" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_reward_rules" (
"difficulty" text NOT NULL,
"enabled" boolean NOT NULL,
"reward_version" bigint NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_reward_rules" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_rewards" (
"room_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"rule_version" bigint NOT NULL,
"reward_version" bigint NOT NULL,
"finalized_battles" bigint NOT NULL,
"contribution_damage" bigint NOT NULL,
"rescue_gate" jsonb NOT NULL,
"issued_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_rewards" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_room_rescue_settings" (
"singleton" boolean NOT NULL,
"enabled" boolean NOT NULL
);
ALTER TABLE "public"."raid_room_rescue_settings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."raid_rooms" (
"id" uuid NOT NULL,
"raid_boss_instance_id" uuid NOT NULL,
"owner_user_id" uuid NOT NULL,
"difficulty_id" text NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."raid_rooms" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_activity_snapshots" (
"ranking_day_key" date NOT NULL,
"user_id" uuid NOT NULL,
"total_power" bigint NOT NULL,
"guild_id" uuid,
"first_active_at" timestamp with time zone NOT NULL,
"last_active_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_daily_activity_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_entity_snapshots" (
"ranking_day_key" date NOT NULL,
"ranking_type" text NOT NULL,
"ranked_entity_id" uuid NOT NULL,
"score" bigint NOT NULL,
"rank_position" integer NOT NULL,
"snapshotted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_daily_entity_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_finalization_audits" (
"ranking_day_key" date NOT NULL,
"power_recipients" integer NOT NULL,
"guild_recipients" integer NOT NULL,
"pvp_recipients" integer NOT NULL,
"raid_recipients" integer NOT NULL,
"completed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_daily_finalization_audits" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_participation" (
"ranking_day_key" date NOT NULL,
"ranking_type" text NOT NULL,
"user_id" uuid NOT NULL,
"finalized_count" integer NOT NULL,
"first_finalized_at" timestamp with time zone NOT NULL,
"last_finalized_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_daily_participation" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_recipient_snapshots" (
"ranking_day_key" date NOT NULL,
"ranking_type" text NOT NULL,
"ranked_entity_id" uuid NOT NULL,
"recipient_user_id" uuid NOT NULL,
"rank_position" integer NOT NULL,
"score" bigint NOT NULL
);
ALTER TABLE "public"."ranking_daily_recipient_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_reward_awards" (
"id" uuid NOT NULL,
"ranking_day_key" date NOT NULL,
"ranking_type" text NOT NULL,
"recipient_user_id" uuid NOT NULL,
"ranked_entity_id" uuid NOT NULL,
"rank_position" integer NOT NULL,
"score" bigint NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_daily_reward_awards" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_daily_reward_item_grants" (
"award_id" uuid NOT NULL,
"item_id" text NOT NULL,
"quantity" integer NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_daily_reward_item_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_guild_exclusions" (
"guild_id" uuid NOT NULL,
"reason" text NOT NULL,
"registered_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_guild_exclusions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_guild_power_finalization_audits" (
"season_id" uuid NOT NULL,
"ranked_guild_count" integer NOT NULL,
"reward_grant_count" integer NOT NULL,
"completed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_guild_power_finalization_audits" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_guild_power_reward_grants" (
"season_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"cosmetic_id" text NOT NULL,
"rank_position" integer NOT NULL,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_guild_power_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_guild_power_reward_recipients" (
"season_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"recipient_user_id" uuid NOT NULL,
"captured_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_guild_power_reward_recipients" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_guild_power_season_master" (
"season_id" uuid NOT NULL,
"event_key" text NOT NULL,
"display_name" text NOT NULL,
"starts_at" timestamp with time zone NOT NULL,
"ends_at" timestamp with time zone NOT NULL,
"display_period_text" text NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_guild_power_season_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_guild_power_season_snapshots" (
"season_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"guild_name" text NOT NULL,
"total_power" bigint NOT NULL,
"member_count" integer NOT NULL,
"rank_position" integer NOT NULL,
"snapshotted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_guild_power_season_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_pvp_season_snapshots" (
"season_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"rank_points" integer NOT NULL,
"daily_wins" integer NOT NULL,
"season_wins" integer NOT NULL,
"rank_position" integer NOT NULL,
"achieved_at" timestamp with time zone NOT NULL,
"snapshotted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_pvp_season_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_raid_guild_season_snapshots" (
"season_id" uuid NOT NULL,
"guild_id" uuid NOT NULL,
"contribution" bigint NOT NULL,
"rank_position" integer NOT NULL,
"achieved_at" timestamp with time zone NOT NULL,
"snapshotted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_raid_guild_season_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_raid_personal_season_snapshots" (
"season_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"contribution" bigint NOT NULL,
"rank_position" integer NOT NULL,
"achieved_at" timestamp with time zone NOT NULL,
"snapshotted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_raid_personal_season_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_reward_notifications" (
"id" uuid NOT NULL,
"recipient_user_id" uuid NOT NULL,
"period_kind" text NOT NULL,
"period_key" text NOT NULL,
"awarded_at" timestamp with time zone NOT NULL,
"acknowledged_at" timestamp with time zone
);
ALTER TABLE "public"."ranking_reward_notifications" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_season_reward_grants" (
"season_id" uuid NOT NULL,
"ranking_category" text NOT NULL,
"recipient_user_id" uuid NOT NULL,
"ranked_entity_id" uuid NOT NULL,
"rank_position" integer NOT NULL,
"reward_key" text NOT NULL,
"master_reward_id" text NOT NULL,
"resolved_item_id" text NOT NULL,
"quantity" integer NOT NULL,
"present_id" uuid,
"granted_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_season_reward_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_season_transition_audits" (
"season_id" uuid NOT NULL,
"ranking_type" text NOT NULL,
"replay_count" integer NOT NULL,
"post_boundary_user_count" integer NOT NULL,
"before_projection" jsonb NOT NULL,
"expected_projection" jsonb NOT NULL,
"after_projection" jsonb NOT NULL,
"completed_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_season_transition_audits" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."ranking_seasons" (
"id" uuid NOT NULL,
"ranking_type" text NOT NULL,
"starts_at" timestamp with time zone NOT NULL,
"ends_at" timestamp with time zone NOT NULL,
"status" text NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."ranking_seasons" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."skill_battle_master" (
"skill_id" text NOT NULL,
"display_name" text NOT NULL,
"enabled" boolean NOT NULL,
"kind" text NOT NULL,
"target" text NOT NULL,
"power_percent" integer NOT NULL,
"cooldown" integer NOT NULL,
"initial_cooldown" integer NOT NULL,
"status" text,
"status_chance" integer,
"modifier_stat" text,
"modifier_percent" integer,
"modifier_duration" integer,
"exclusive_character_id" text,
"source_revision" text NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."skill_battle_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."skill_limit_break_master" (
"plus_val" integer NOT NULL,
"cost_cash" integer,
"required_book" integer
);
ALTER TABLE "public"."skill_limit_break_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."social_activity_feed" (
"id" uuid NOT NULL,
"activity_type" text NOT NULL,
"actor_user_id" uuid,
"actor_display_name" text NOT NULL,
"guild_id" uuid,
"object_master_id" text,
"display_payload" jsonb NOT NULL,
"permanent" boolean NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."social_activity_feed" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."social_activity_projection_state" (
"projection_key" text NOT NULL,
"subject_user_id" uuid,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."social_activity_projection_state" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."special_gacha_exchange_receipts" (
"user_id" uuid NOT NULL,
"request_id" uuid NOT NULL,
"reward_type" text NOT NULL,
"reward_id" text NOT NULL,
"result_payload" jsonb,
"created_at" timestamp with time zone NOT NULL,
"gacha_id" text
);
ALTER TABLE "public"."special_gacha_exchange_receipts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."special_gacha_pool_groups" (
"gacha_id" text NOT NULL,
"rarity" text NOT NULL,
"is_exclusive" boolean NOT NULL,
"weight" integer NOT NULL
);
ALTER TABLE "public"."special_gacha_pool_groups" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."story_sessions" (
"id" uuid NOT NULL,
"user_id" uuid,
"episode_id" text NOT NULL,
"status" text,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."story_sessions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."title_master" (
"id" text NOT NULL,
"name" text NOT NULL,
"source_type" text NOT NULL,
"source_key" text,
"season_label" text,
"is_active" boolean NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."title_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."tutorial_progress" (
"user_id" uuid NOT NULL,
"step_id" text NOT NULL,
"updated_at" timestamp with time zone NOT NULL,
"completed_at" timestamp with time zone,
"authentication_pending" boolean NOT NULL
);
ALTER TABLE "public"."tutorial_progress" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_account_auth_methods" (
"user_id" uuid NOT NULL,
"auth_method" text NOT NULL,
"authenticated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_account_auth_methods" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_avatar_parts" (
"id" uuid NOT NULL,
"user_id" uuid,
"part_id" text NOT NULL,
"unlocked_at" timestamp with time zone
);
ALTER TABLE "public"."user_avatar_parts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_avatars" (
"id" uuid NOT NULL,
"user_id" uuid,
"gender" text,
"hair_id" text,
"face_id" text,
"outfit_id" text,
"background_id" text,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."user_avatars" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_characters" (
"id" uuid NOT NULL,
"user_id" uuid,
"character_id" text NOT NULL,
"level" integer,
"awakening_level" integer,
"created_at" timestamp with time zone,
"awakening_progress" integer NOT NULL,
"xp" bigint NOT NULL
);
ALTER TABLE "public"."user_characters" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_chats" (
"id" uuid NOT NULL,
"channel" text NOT NULL,
"guild_id" uuid,
"sender_id" uuid,
"sender_name" text NOT NULL,
"sender_avatar" text,
"message" text NOT NULL,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."user_chats" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_cosmetics" (
"user_id" uuid NOT NULL,
"cosmetic_id" text NOT NULL,
"acquired_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone,
"source_type" text,
"source_reference" text
);
ALTER TABLE "public"."user_cosmetics" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_daily_gacha_claims" (
"user_id" uuid NOT NULL,
"gacha_type" text NOT NULL,
"last_claimed_date" date NOT NULL,
"created_at" timestamp with time zone NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_daily_gacha_claims" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_equipments" (
"id" uuid NOT NULL,
"user_id" uuid,
"equipment_id" text NOT NULL,
"level" integer,
"plus_val" integer,
"equipped_character_id" text,
"slot_index" integer,
"random_options" jsonb,
"created_at" timestamp with time zone,
"equipment_master_id" text,
"xp" bigint NOT NULL
);
ALTER TABLE "public"."user_equipments" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_friends" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"friend_id" uuid NOT NULL,
"status" text NOT NULL,
"created_at" timestamp with time zone,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."user_friends" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_funnel_milestones" (
"user_id" uuid NOT NULL,
"milestone" text NOT NULL,
"first_occurred_at" timestamp with time zone NOT NULL,
"last_occurred_at" timestamp with time zone NOT NULL,
"occurrence_count" integer NOT NULL,
"metadata" jsonb NOT NULL
);
ALTER TABLE "public"."user_funnel_milestones" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_gacha_pity_points" (
"user_id" uuid NOT NULL,
"pity_master_id" text NOT NULL,
"current_points" integer NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_gacha_pity_points" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_gvg_ranks" (
"id" uuid NOT NULL,
"user_id" uuid,
"season_points" integer,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."user_gvg_ranks" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_invitations" (
"id" uuid NOT NULL,
"inviter_user_id" uuid,
"invitee_user_id" uuid,
"gift_code" text NOT NULL,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."user_invitations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_items" (
"id" uuid NOT NULL,
"user_id" uuid,
"item_id" text NOT NULL,
"quantity" integer,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."user_items" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_level_master" (
"level" integer NOT NULL,
"next_xp" integer
);
ALTER TABLE "public"."user_level_master" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_lifetime_onboarding_grants" (
"user_id" uuid NOT NULL,
"canonical_payload" jsonb NOT NULL,
"source" text NOT NULL,
"source_reference" uuid,
"canonical_master_version" text NOT NULL,
"first_granted_at" timestamp with time zone NOT NULL,
"created_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_lifetime_onboarding_grants" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_login_bonuses" (
"id" uuid NOT NULL,
"user_id" uuid,
"current_day" integer,
"last_claimed_at" timestamp with time zone,
"total_logins" integer NOT NULL
);
ALTER TABLE "public"."user_login_bonuses" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_main_formations" (
"user_id" uuid NOT NULL,
"slot" smallint NOT NULL,
"user_character_id" uuid NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_main_formations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_missions" (
"id" uuid NOT NULL,
"user_id" uuid,
"mission_id" text NOT NULL,
"current_progress" integer,
"status" text,
"updated_at" timestamp with time zone,
"progress_val" integer NOT NULL,
"claimed_at" timestamp with time zone,
"cycle_date" date
);
ALTER TABLE "public"."user_missions" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_monthly_passes" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"purchased_at" timestamp with time zone NOT NULL,
"expires_at" timestamp with time zone NOT NULL,
"daily_claimed_at" date,
"is_active" boolean
);
ALTER TABLE "public"."user_monthly_passes" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_patrols" (
"id" uuid NOT NULL,
"user_id" uuid,
"course_id" text,
"quest_id" text,
"character_id" text NOT NULL,
"status" text,
"has_battle_event" boolean,
"battle_resolved" boolean,
"battle_result" text,
"rewards_accrued" jsonb,
"started_at" timestamp with time zone,
"expires_at" timestamp with time zone NOT NULL,
"encounter_snapshot" jsonb,
"encounter_party_signature" text,
"hometown_bonus_snapshot" jsonb,
"base_cash_snapshot" bigint
);
ALTER TABLE "public"."user_patrols" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_power_rankings" (
"id" uuid NOT NULL,
"user_id" uuid,
"total_power" integer,
"updated_at" timestamp with time zone
);
ALTER TABLE "public"."user_power_rankings" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_profile_decorations" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"decoration_type" character varying(32) NOT NULL,
"decoration_id" character varying(64) NOT NULL,
"unlocked_at" timestamp with time zone
);
ALTER TABLE "public"."user_profile_decorations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_quest_first_clears" (
"user_id" uuid NOT NULL,
"quest_id" text NOT NULL,
"cleared_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_quest_first_clears" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_raid_daily_attempts" (
"user_id" uuid NOT NULL,
"attempt_date" date NOT NULL,
"attempt_count" integer NOT NULL,
"updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_raid_daily_attempts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_shop_purchases" (
"id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"product_id" text NOT NULL,
"purchase_count" integer NOT NULL,
"last_purchased_at" timestamp with time zone,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."user_shop_purchases" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_skills" (
"id" uuid NOT NULL,
"user_id" uuid,
"skill_card_id" text NOT NULL,
"plus_val" integer,
"equipped_character_id" text,
"slot_index" integer,
"created_at" timestamp with time zone
);
ALTER TABLE "public"."user_skills" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."user_titles" (
"user_id" uuid NOT NULL,
"title_id" text NOT NULL,
"acquired_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."user_titles" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "public"."users" (
"id" uuid NOT NULL,
"username" text NOT NULL,
"bio" text,
"avatar_url" text,
"current_base_id" text,
"level" integer,
"xp" integer,
"cash" bigint,
"neon_diamonds" integer,
"vitality" integer,
"pvp_points" integer NOT NULL,
"pvp_points_last_recovered_at" timestamp with time zone NOT NULL,
"favorite_character_id" text,
"title_equipped" text,
"equipped_background" text,
"equipped_front_effect" text,
"selected_bg_mode" text,
"interior_item" text,
"last_guild_left_at" timestamp with time zone,
"gift_code" text,
"daily_cash_skips_count" integer,
"sound_settings" jsonb,
"created_at" timestamp with time zone,
"raid_attempts_today" integer,
"raid_attempts_reset_at" timestamp with time zone,
"has_shown_guild_dialog" boolean,
"last_active_at" timestamp with time zone,
"last_username_changed_on" date,
"last_bio_changed_on" date,
"guild_id" uuid,
"diamonds" integer NOT NULL,
"vitality_last_recovered_at" timestamp with time zone NOT NULL,
"last_login_date" date,
"updated_at" timestamp with time zone NOT NULL,
"daily_cash_skips_reset_date" date,
"raid_points" integer NOT NULL,
"raid_points_last_recovered_at" timestamp with time zone NOT NULL,
"raid_free_entry_consumed" boolean NOT NULL,
"quest_free_skips_count" integer NOT NULL,
"quest_paid_skips_count" integer NOT NULL,
"quest_skips_reset_date" date
);
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
