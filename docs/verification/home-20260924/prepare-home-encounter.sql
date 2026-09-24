-- QA seed + live API/body UI verification only. Not evidence of natural encounter generation.
-- Read-only identity lookup; DO block requires exactly one dedicated QA user.
select id, username from public.users where username = '本陣QA924';

DO $home_fixture$
DECLARE qa_id uuid; qa_count integer; fixture jsonb; applied_at timestamptz := clock_timestamp();
BEGIN
  select count(*), min(id::text)::uuid into qa_count, qa_id from public.users where username = '本陣QA924';
  if qa_count <> 1 then raise exception 'Expected exactly one 本陣QA924 user'; end if;
  if qa_id <> 'd7f49823-b334-4874-8667-e32e06dc836f'::uuid then raise exception 'Unexpected dedicated QA identity'; end if;
  fixture := '{"raidSnapshot":{"id":"encounter_a1_ERB01","masterVersion":"GAME04_RAID_FORMAL_20260923","characterId":"char_noa_01","area":1,"name":"柴田勝家","type":"encounter","enemy":{"id":"encounter_a1_ERB01","name":"柴田勝家","image":"/creative/characters/battle/char_noa_01.png","element":"earth","level":10,"stats":{"hp":6500,"atk":480,"def":80,"sp":100,"luk":0},"initialSp":100,"hitSpGain":10,"initialCount":7,"actionCount":7,"order":0,"boss":true,"skills":[],"passives":[{"id":"balance_v2_P05","type":"P05","name":"通常攻撃ダメージ","stat":"atk","percent":12,"level":0,"target":"self"}]},"enemies":[{"id":"encounter_a1_ERB01","name":"柴田勝家","image":"/creative/characters/battle/char_noa_01.png","element":"earth","level":10,"stats":{"hp":6500,"atk":480,"def":80,"sp":100,"luk":0},"initialSp":100,"hitSpGain":10,"initialCount":7,"actionCount":7,"order":0,"boss":true,"skills":[],"passives":[{"id":"balance_v2_P05","type":"P05","name":"通常攻撃ダメージ","stat":"atk","percent":12,"level":0,"target":"self"}]}],"energyCost":20,"durationMinutes":60,"maxParticipants":10,"maxLevel":1,"appearanceLevels":[1],"appearanceImages":{},"enemyGrowthPerLevel":0,"sharedHpGrowthPerLevel":0,"victoryMultiplier":1.5,"sharedHp":39000,"participationRewards":[],"victoryRewards":[{"kind":"cash","amount":3000},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"equipment_exp_item","id":"small","amount":5},{"kind":"soul","id":"char_noa_01","amount":1,"chance":0.75}],"playerExp":80,"defeatRewards":[{"kind":"soul","id":"char_noa_01","amount":1},{"kind":"character_exp_item","id":"large","amount":1},{"kind":"equipment_exp_item","id":"large","amount":1},{"kind":"skill_material","amount":2},{"kind":"equipment_lb","amount":2},{"kind":"cash","amount":5000}]},"id":"5b72bc0a-bbc0-44d1-a6ad-26489157fd18","masterId":"encounter_a1_ERB01","ownerId":"00000000-0000-4000-8000-000000000001","level":1,"hp":39000,"maxHp":39000,"createdAt":"2026-09-23T17:47:54.962Z","expiresAt":"2026-09-23T18:47:54.962Z","status":"active","rescueCount":0,"rescueWindowStartedAt":"2026-09-23T17:47:54.962Z","participants":[{"userId":"00000000-0000-4000-8000-000000000001","name":"本陣QA924","wins":0,"attempts":0,"totalDamage":0,"joinedLevel":1}],"settledBattleIds":[],"rewardGrants":[]}'::jsonb;
  fixture := jsonb_set(fixture, '{ownerId}', to_jsonb(qa_id::text));
  fixture := jsonb_set(fixture, '{participants,0,userId}', to_jsonb(qa_id::text));
  -- Keep formal 60-minute duration; seed the room late in its lifetime for a 10-minute observation window.
  fixture := jsonb_set(fixture, '{createdAt}', to_jsonb(applied_at - interval '50 minutes'));
  fixture := jsonb_set(fixture, '{rescueWindowStartedAt}', to_jsonb(applied_at - interval '50 minutes'));
  fixture := jsonb_set(fixture, '{expiresAt}', to_jsonb(applied_at + interval '10 minutes'));
  insert into public.game04_raid_rooms(id, state) values ('5b72bc0a-bbc0-44d1-a6ad-26489157fd18', fixture);
END $home_fixture$;

select id, state->>'ownerId' as owner_id, state->>'masterId' as master_id, state->>'expiresAt' as expires_at from public.game04_raid_rooms where id = '5b72bc0a-bbc0-44d1-a6ad-26489157fd18';
