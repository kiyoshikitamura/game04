-- NOT APPLIED. Parent only. Target: GAME04 dev lrgyllgzcdcphlbmkknc.
-- Fill the dedicated QA UID, exact username, existing quest record UUID, NEW request UUID.
-- This is an artificial start checkpoint, NOT a reproduced network interruption.
-- Preserve the old battle, its snapshot and its receipts. No DDL / migration / shared master edit.
DO $qa$
DECLARE
 qa_uid uuid := '00000000-0000-0000-0000-000000000000';
 qa_name text := 'FILL_EXACT_DEDICATED_QA_NAME';
 source_id uuid := '00000000-0000-0000-0000-000000000000';
 new_id uuid := '00000000-0000-0000-0000-000000000000';
 prior public.game04_battles%rowtype;
 st jsonb;
 after_start jsonb;
 cost integer;
 attempt_count integer;
 receipt jsonb;
BEGIN
 IF qa_uid='00000000-0000-0000-0000-000000000000'::uuid OR source_id=new_id OR new_id='00000000-0000-0000-0000-000000000000'::uuid THEN
  RAISE EXCEPTION 'FILL_DISTINCT_QA_IDENTIFIERS';
 END IF;
 PERFORM 1 FROM public.users WHERE id=qa_uid AND username=qa_name FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'QA_OWNER_MISMATCH'; END IF;
 IF EXISTS(SELECT 1 FROM public.game04_battles WHERE user_id=qa_uid AND status='started') THEN RAISE EXCEPTION 'EXISTING_PENDING_BATTLE'; END IF;
 IF EXISTS(SELECT 1 FROM public.game04_battles WHERE id=new_id) OR EXISTS(SELECT 1 FROM public.game04_requests WHERE user_id=qa_uid AND request_id=new_id) THEN RAISE EXCEPTION 'NEW_REQUEST_ALREADY_USED'; END IF;
 SELECT * INTO prior FROM public.game04_battles WHERE id=source_id AND user_id=qa_uid AND kind='quest' AND status='settled';
 IF NOT FOUND OR prior.input->>'questMasterVersion' IS DISTINCT FROM 'APPROVED_QUEST65_ROUND17_20260922'
  OR prior.input#>>'{questSnapshot,id}' IS DISTINCT FROM prior.target_id THEN RAISE EXCEPTION 'QA_FORMAL_SOURCE_REQUIRED'; END IF;
 -- Lock/overlay actual wallet and approved Player Lv/EXP using the existing getter.
 -- Use growth getter, not session getter: fixture creation must not trigger login rewards.
 st:=public.game04_get_growth_state(qa_uid);
 IF st IS NULL OR st#>>'{playerProgress,status}' IS DISTINCT FROM 'active' THEN RAISE EXCEPTION 'ACTIVE_QA_STATE_REQUIRED'; END IF;
 attempt_count:=coalesce((st->'questAttempts'->>prior.target_id)::integer,0);
 -- Exact questEnergyCost contract for the persisted formal stage + current QA progression.
 cost:=CASE WHEN st->'clearedStages' ? prior.target_id THEN (prior.input#>>'{questSnapshot,energyCost}')::integer WHEN attempt_count>0 THEN 1 ELSE 0 END;
 IF cost IS NULL OR cost<0 OR (st->>'energy')::integer<cost THEN RAISE EXCEPTION 'QA_ENERGY_PRECONDITION'; END IF;
 after_start:=st||jsonb_build_object(
  'energy',(st->>'energy')::integer-cost,
  'questAttempts',coalesce(st->'questAttempts','{}'::jsonb)||jsonb_build_object(prior.target_id,attempt_count+1),
  'questProgressVersion',prior.input->>'questMasterVersion'
 );
 receipt:=public.game04_commit_growth_state(
  p_user_id=>qa_uid,p_expected_version=>(st->>'version')::bigint,p_state=>after_start,
  p_cash_delta=>0,p_energy_delta=>-cost,p_request_id=>new_id,
  p_battle=>jsonb_build_object('id',new_id,'kind','quest','targetId',prior.target_id,'seed',prior.seed,'input',prior.input,'status','started'),
  p_raid=>NULL,p_raid_expected_version=>NULL,p_receipt=>'{}'::jsonb
 );
 IF NOT EXISTS(SELECT 1 FROM public.game04_battles WHERE id=new_id AND user_id=qa_uid AND status='started' AND input=prior.input AND seed=prior.seed) THEN RAISE EXCEPTION 'START_CHECKPOINT_NOT_SAVED'; END IF;
 RAISE NOTICE 'R06 QA started fixture id=%, target=%, energy cost=%, saved version=%',new_id,prior.target_id,cost,receipt#>>'{state,version}';
END $qa$;
-- Parent saves the before + started row/wallet evidence, then uses the authenticated QA HTTP API:
-- get_state -> pendingBattle.id=new_id
-- quest_battle {stageId: persisted target_id}, requestId=new_id
-- get_state -> pendingBattle=null
-- same quest_battle / requestId again -> same persisted battle result and no additional deltas
-- Keep BOTH the start request and deterministic settlement request receipts; never delete old receipts.
