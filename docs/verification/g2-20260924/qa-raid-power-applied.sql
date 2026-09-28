-- EXECUTED on GAME04 dev only after E stopped. 2026-09-24. Result version18.
-- Synthetic QA power fixture, NOT natural progression, G4, or balance acceptance.
-- Parent must set expected_version to the observed version after E finishes.
DO $fixture$
DECLARE
 qa constant uuid := '229ac838-28c3-48e4-a86a-45a25fbf72b9';
 expected_version bigint := 17;
 ids constant text[] := ARRAY['char_alice_01','char_gou_01','char_kageyama_01'];
 current_state jsonb; current_version bigint; next_characters jsonb;
BEGIN
 SELECT state,version INTO current_state,current_version
 FROM public.game04_player_state WHERE user_id=qa FOR UPDATE;
 IF NOT FOUND OR current_version<>expected_version THEN
  RAISE EXCEPTION 'QA_STATE_VERSION_CONFLICT expected=% actual=%',expected_version,current_version;
 END IF;
 IF EXISTS(SELECT 1 FROM public.game04_battles WHERE user_id=qa AND status='started') THEN
  RAISE EXCEPTION 'QA_BATTLE_STILL_STARTED';
 END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(current_state->'characters') c WHERE c->>'id'=ANY(ids))<>3 THEN
  RAISE EXCEPTION 'QA_CHARACTER_SET_MISMATCH';
 END IF;
 -- All three existing masters are N: formal Lv100 cumulative EXP is 300000.
 SELECT jsonb_agg(CASE WHEN c->>'id'=ANY(ids) THEN c||jsonb_build_object(
  'level',100,'awakening',5,'exp',300000,'growthVersion','APPROVED_GROWTH_V1_20260921'
 ) ELSE c END ORDER BY ordinal)
 INTO next_characters FROM jsonb_array_elements(current_state->'characters') WITH ORDINALITY AS owned(c,ordinal);
 UPDATE public.game04_player_state
 SET state=jsonb_set(current_state,'{characters}',next_characters),version=version+1,updated_at=now()
 WHERE user_id=qa AND version=expected_version;
 IF NOT FOUND THEN RAISE EXCEPTION 'QA_STATE_CAS_CONFLICT'; END IF;
END $fixture$;
SELECT version,state->'characters' AS characters FROM public.game04_player_state
WHERE user_id='229ac838-28c3-48e4-a86a-45a25fbf72b9';
