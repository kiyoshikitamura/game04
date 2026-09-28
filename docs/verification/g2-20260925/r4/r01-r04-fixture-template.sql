-- NOT APPLIED. Parent substitutes the dedicated QA UUID and exact QA username.
-- GAME04 dev lrgyllgzcdcphlbmkknc ONLY. No production/user migration.
-- R01/R04: unresolved assets are intentionally retained, never selected by auto equip.
do $qa$
declare uid uuid := '00000000-0000-0000-0000-000000000000'; expected_name text := 'G2QA_R4'; s jsonb; target text;
begin
 if not exists(select 1 from public.users where id=uid and username=expected_name) then raise exception 'QA_OWNER_MISMATCH'; end if;
 select state into s from public.game04_player_state where user_id=uid for update;
 if s is null then raise exception 'INITIALIZE_QA_VIA_AUTHENTICATED_API_FIRST'; end if;
 if exists(select 1 from jsonb_array_elements(s->'skills') v where v->>'id'='G2QA_R4_UNKNOWN_SKILL') then raise exception 'ALREADY_PREPARED'; end if;
 target := s#>>'{characters,0,id}';
 s := jsonb_set(s,'{skills}',s->'skills'||'[{"id":"G2QA_R4_UNKNOWN_SKILL","level":10}]'::jsonb);
 s := jsonb_set(s,'{equipment}',s->'equipment'||'[{"instanceId":"G2QA_R4_UNKNOWN_EQUIP","masterId":"G2QA_R4_UNKNOWN_MASTER","level":100,"lb":10}]'::jsonb);
 s := jsonb_set(s,array['souls',target],to_jsonb(coalesce((s#>>array['souls',target])::int,0)+34),true);
 update public.game04_player_state set state=s,version=version+1 where user_id=uid;
end $qa$;
