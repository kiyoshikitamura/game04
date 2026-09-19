-- GAME04 dev only. Freeze migration input before enabling acquisition capture.
-- No old asset rows are changed or deleted. Existing preview duplicate values retained.
lock table public.user_characters,public.user_skills,public.user_equipments,public.gacha_execution_history,public.special_gacha_exchange_receipts in share row exclusive mode;
create table public.game04_legacy_asset_snapshot (
 user_id uuid primary key references public.users(id), assets jsonb not null, created_at timestamptz not null default now()
);
insert into public.game04_legacy_asset_snapshot(user_id,assets)
select u.id,jsonb_build_object(
 'characters',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'character_id',c.character_id,'level',c.level,'awakening_level',c.awakening_level)) from public.user_characters c where c.user_id=u.id),'[]'::jsonb),
 'skills',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'skill_card_id',s.skill_card_id,'plus_val',s.plus_val)) from public.user_skills s where s.user_id=u.id),'[]'::jsonb),
 'equipment',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'equipment_id',e.equipment_id,'level',e.level,'plus_val',e.plus_val)) from public.user_equipments e where e.user_id=u.id),'[]'::jsonb))
from public.users u;
create table public.game04_acquisition_events (
 id text primary key, user_id uuid not null references public.users(id), payload jsonb not null, created_at timestamptz not null default clock_timestamp()
);
create index game04_acquisition_events_user on public.game04_acquisition_events(user_id,created_at,id);
alter table public.game04_legacy_asset_snapshot enable row level security;
alter table public.game04_acquisition_events enable row level security;
revoke all on public.game04_legacy_asset_snapshot,public.game04_acquisition_events from public,anon,authenticated;
grant all on public.game04_legacy_asset_snapshot,public.game04_acquisition_events to service_role;
insert into public.game04_redesign_master(key,status,data) values('acquisition_conversion','PREVIEW_PROVISIONAL_20260919','{"characterDuplicateSouls":10,"skillDuplicateMaterials":2,"characterAtCap":"pending","skillAtCap":"pending"}') on conflict(key) do nothing;

-- Runs in existing authorized writer RPC context; never browser-callable.
create function public.game04_capture_asset_insert() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare body jsonb:=to_jsonb(new); kind text; master_id text; event_id text;
begin
 kind:=case tg_table_name when 'user_characters' then 'character' when 'user_skills' then 'skill' else 'equipment' end;
 master_id:=case kind when 'character' then body->>'character_id' when 'skill' then body->>'skill_card_id' else body->>'equipment_id' end;
 event_id:='asset:'||kind||':'||(body->>'id');
 insert into public.game04_acquisition_events(id,user_id,payload) values(event_id,(body->>'user_id')::uuid,jsonb_build_object('id',event_id,'kind',kind,'masterId',master_id,'legacyId',body->>'id','instanceId',body->>'id')) on conflict(id) do nothing;
 return new;
end $$;
create trigger game04_asset_acquisition after insert on public.user_characters for each row execute function public.game04_capture_asset_insert();
create trigger game04_asset_acquisition after insert on public.user_skills for each row execute function public.game04_capture_asset_insert();
create trigger game04_asset_acquisition after insert on public.user_equipments for each row execute function public.game04_capture_asset_insert();

-- New acquisitions are captured by INSERT above. Only duplicate results are captured here.
-- This includes cap conversions which no longer mutate a character/skill row at all.
create function public.game04_capture_gacha_receipt() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare results jsonb; item jsonb; idx integer:=0; kind text; event_id text; master_id text;
begin
 if tg_table_name='gacha_execution_history' then
  if new.status<>'COMPLETED' then return new; end if;
  if tg_op='UPDATE' and old.status='COMPLETED' then return new; end if;
  results:=new.result_payload->'results';
 else results:=jsonb_build_array(new.result_payload); end if;
 for item in select value from jsonb_array_elements(coalesce(results,'[]'::jsonb)) loop
  idx:=idx+1; kind:=lower(item->>'type');
  if kind not in ('character','skill') or item->>'outcome'='new' then continue; end if;
  master_id:=coalesce(item->>'character_id',item->>'item_id');
  if master_id is null then raise exception 'GAME04_ACQUISITION_RESULT_MISSING_ID'; end if;
  event_id:='receipt:'||tg_table_name||':'||new.user_id||':'||new.request_id||':'||idx;
  insert into public.game04_acquisition_events(id,user_id,payload) values(event_id,new.user_id,jsonb_build_object('id',event_id,'kind',kind,'masterId',master_id)) on conflict(id) do nothing;
 end loop;
 return new;
end $$;
create trigger game04_gacha_acquisition after insert or update on public.gacha_execution_history for each row execute function public.game04_capture_gacha_receipt();
create trigger game04_pity_acquisition after insert on public.special_gacha_exchange_receipts for each row execute function public.game04_capture_gacha_receipt();

-- One snapshot RPC avoids REST row limits and makes pending events replayable after master FIX.
create function public.game04_acquisition_input(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object(
 'legacy',coalesce((select assets from public.game04_legacy_asset_snapshot where user_id=p_user_id),'{"characters":[],"skills":[],"equipment":[]}'::jsonb),
 'events',coalesce((select jsonb_agg(payload order by created_at,id) from public.game04_acquisition_events where user_id=p_user_id),'[]'::jsonb),
 'master',(select data from public.game04_redesign_master where key='acquisition_conversion'))
$$;
revoke all on function public.game04_capture_asset_insert(),public.game04_capture_gacha_receipt(),public.game04_acquisition_input(uuid) from public,anon,authenticated;
grant execute on function public.game04_capture_asset_insert(),public.game04_capture_gacha_receipt(),public.game04_acquisition_input(uuid) to service_role;

-- Formal mission contents are intentionally empty; server grant plumbing can be tested independently.
insert into public.game04_redesign_master(key,status,data) values('missions','FORMAL_MASTER_PENDING','{"enabled":false,"missions":[]}') on conflict(key) do nothing;
-- Rename only visual-stage Master data. Saved personal checkpoint fields remain readable but unused.
update public.game04_redesign_master m set data=jsonb_set(data,'{raids}',(
 select jsonb_agg(case when r ? 'checkpoints' then (r-'checkpoints')||jsonb_build_object('appearanceLevels',r->'checkpoints') else r end)
 from jsonb_array_elements(m.data->'raids') r
)),updated_at=now() where key='release_manifest' and jsonb_typeof(data->'raids')='array' and jsonb_array_length(data->'raids')>0;

-- Current UI uses request-id overloads (5 args delegates to 6 args; free always 6 args).
-- These obsolete direct overloads cannot produce acquisition receipts.
revoke execute on function public.execute_character_gacha(uuid,text,integer,text),public.execute_asset_gacha(uuid,text,integer,text),public.execute_character_gacha_core_20260812(uuid,text,integer,text),public.execute_asset_gacha_core_20260812(uuid,text,integer,text) from public,anon,authenticated;

-- Legacy Present/Login/Mission use user_items for explicit Character/Skill IDs.
-- Match only current GAME04 master IDs; no speculative Item->Material conversion.
create function public.game04_capture_named_asset_item() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare delta integer; kind text; manifest jsonb; i integer; event_id text;
begin
 delta:=new.quantity-case when tg_op='INSERT' then 0 else old.quantity end;
 if delta<=0 then return new; end if;
 select data into manifest from public.game04_redesign_master where key='release_manifest';
 if exists(select 1 from jsonb_array_elements(coalesce(manifest->'characters','[]'::jsonb)) m where m->>'id'=new.item_id) then kind:='character';
 elsif exists(select 1 from jsonb_array_elements(coalesce(manifest->'skills','[]'::jsonb)) m where m->>'id'=new.item_id) then kind:='skill';
 else return new; end if;
 for i in 1..delta loop
  event_id:='item_asset:'||gen_random_uuid();
  insert into public.game04_acquisition_events(id,user_id,payload) values(event_id,new.user_id,jsonb_build_object('id',event_id,'kind',kind,'masterId',new.item_id));
 end loop;
 return new;
end $$;
create trigger game04_named_asset_acquisition after insert or update on public.user_items for each row execute function public.game04_capture_named_asset_item();
revoke all on function public.game04_capture_named_asset_item() from public,anon,authenticated;
grant execute on function public.game04_capture_named_asset_item() to service_role;
