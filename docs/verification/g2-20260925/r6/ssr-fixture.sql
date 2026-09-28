-- Parent-only QA fixture. Existing inventory/deck/cash/progress are retained.
-- QA-B: existing SSR Kenshin + soul-unlock Masamune; no unlock ledger injected.
UPDATE public.game04_player_state
SET state = jsonb_set(jsonb_set(state, '{characters}',
  (state->'characters') || jsonb_build_array(jsonb_build_object('id','char_koharu_01','level',1,'awakening',0,'exp',0,'growthVersion','APPROVED_GROWTH_V1_20260921'))),
  '{souls}', coalesce(state->'souls','{}'::jsonb) || jsonb_build_object('char_leo_01',greatest(coalesce((state#>>'{souls,char_leo_01}')::integer,0),80))),
version=version+1, updated_at=now()
WHERE user_id='0fe9ead0-f738-4771-977a-9de7d93454af' AND version=2
 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(state->'characters') c WHERE c->>'id' IN ('char_koharu_01','char_leo_01'))
RETURNING user_id,version,state->'characters' as characters,state->'souls' as souls,state->'unlockedHomeBackgroundIds' as unlocked;
