-- Dedicated G2継続QA only. Visual fixture, not natural progression or G4 acceptance.
do $qa$ declare uid uuid := '2b544996-e7f4-4e88-a5d2-b20f1f50b4b2'; s jsonb; addskills jsonb; begin
if not exists(select 1 from public.users where id=uid and username='G2継続QA') then raise exception 'QA_OWNER_MISMATCH'; end if;
select state into s from public.game04_player_state where user_id=uid for update;
select coalesce(jsonb_agg(jsonb_build_object('id','SKD'||lpad(n::text,3,'0'),'level',0)),'[]'::jsonb) into addskills from generate_series(1,72) n where not exists(select 1 from jsonb_array_elements(s->'skills') v where v->>'id'='SKD'||lpad(n::text,3,'0'));
s:=jsonb_set(s,'{skills}',s->'skills'||addskills);
s:=jsonb_set(s,'{clearedStages}',(select jsonb_agg(distinct v) from jsonb_array_elements((s->'clearedStages')||'["mikawa-1", "mikawa-2", "mikawa-3", "owari-1", "owari-2", "owari-3", "owari-4", "mino-1", "mino-2", "mino-3", "mino-4", "mino-5", "omi-1", "omi-2", "omi-3", "omi-4", "omi-5", "kai-1", "kai-2", "kai-3", "kai-4", "kai-5", "kai-6", "echigo-1", "echigo-2", "echigo-3", "echigo-4", "echigo-5", "echigo-6", "kyoto-1", "kyoto-2", "kyoto-3", "kyoto-4", "kyoto-5", "kyoto-6", "kyoto-7", "kyoto-8", "izumo-1", "izumo-2", "izumo-3", "izumo-4", "izumo-5", "izumo-6", "izumo-7", "izumo-8", "satsuma-1", "satsuma-2", "satsuma-3", "satsuma-4", "satsuma-5", "satsuma-6", "satsuma-7", "satsuma-8", "satsuma-9", "satsuma-10", "sekigahara-1", "sekigahara-2", "sekigahara-3", "sekigahara-4", "sekigahara-5", "sekigahara-6", "sekigahara-7", "sekigahara-8", "sekigahara-9", "sekigahara-10"]'::jsonb) v));
update public.game04_player_state set state=s,version=version+1 where user_id=uid;
end $qa$;
select version,jsonb_array_length(state->'skills') skill_count,jsonb_array_length(state->'clearedStages') stage_count from public.game04_player_state where user_id='2b544996-e7f4-4e88-a5d2-b20f1f50b4b2';
