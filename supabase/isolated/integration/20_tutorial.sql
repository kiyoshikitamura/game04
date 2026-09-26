-- G2 common Preview only. Additive tutorial ownership; existing players unchanged.
begin;
set local lock_timeout='5s';
create table if not exists public.game04_tutorial_players(user_id uuid primary key references public.users(id),created_at timestamptz not null default now());
alter table public.game04_tutorial_players enable row level security;
revoke all on public.game04_tutorial_players from public,anon,authenticated;
grant all on public.game04_tutorial_players to service_role;
create or replace function public.game04_begin_tutorial() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb; temporary_name text;
begin
 if uid is null then raise exception 'authentication required';end if;
 if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if exists(select 1 from public.users where id=uid) then return jsonb_build_object('status','already_initialized');end if;
 temporary_name:='旅'||left(replace(uid::text,'-',''),7);
 result:=public.initialize_current_player(temporary_name);
 insert into public.game04_tutorial_players(user_id) values(uid) on conflict do nothing;
 return result;
end $$;
revoke all on function public.game04_begin_tutorial() from public,anon;
grant execute on function public.game04_begin_tutorial() to authenticated;

create or replace function public.game04_get_session_state(p_user_id uuid,p_initial jsonb default null) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare st jsonb;claim jsonb;
begin
 if p_initial is not null and exists(select 1 from public.game04_tutorial_players where user_id=p_user_id) then
  p_initial:=p_initial||jsonb_build_object('characters','[]'::jsonb,'skills','[]'::jsonb,'deck','[]'::jsonb,'equipment','[]'::jsonb,
   'materials','{"character":0,"skill":0,"equipment":0,"equipmentLb":0,"unlock":0}'::jsonb,
   'tutorial','{"version":"tutorial-fixed-20260925","step":0,"name":"","homeVisits":0,"departed":false,"loginEligible":false,"defeatSeen":false,"defeatPending":false}'::jsonb);
 end if;
 st:=public.game04_get_growth_state(p_user_id,p_initial);
 if st is null then return null;end if;
 if st->'tutorial' is not null and not coalesce((st#>>'{tutorial,loginEligible}')::boolean,false) then return st;end if;
 claim:=public.game04_process_login_bonus(p_user_id);
 if coalesce((claim->>'claimed')::boolean,false) then st:=public.game04_get_growth_state(p_user_id);end if;
 return st;
end $$;
revoke all on function public.game04_get_session_state(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.game04_get_session_state(uuid,jsonb) to service_role;

create or replace function public.game04_commit_tutorial(p_user_id uuid,p_expected_version bigint,p_state jsonb,p_request_id uuid,p_action text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare prior jsonb;before_state jsonb;saved jsonb;nm text;
begin
 perform 1 from public.users where id=p_user_id for update;
 select result into prior from public.game04_requests where user_id=p_user_id and request_id=p_request_id;
 if found then
  if prior#>>'{receipt,tutorialAction}' is distinct from p_action or prior#>'{receipt,tutorialPayload}' is distinct from p_payload then raise exception 'REQUEST_ID_REUSED';end if;
  return prior;
 end if;
 select state into before_state from public.game04_player_state where user_id=p_user_id;
 if before_state->'tutorial' is null then raise exception 'TUTORIAL_NOT_AVAILABLE';end if;
 if p_action not in('tutorial_next','tutorial_home','tutorial_depart','tutorial_dismiss_defeat') then raise exception 'INVALID_TUTORIAL_ACTION';end if;
 if p_action='tutorial_next' and ((before_state#>>'{tutorial,step}')::integer is distinct from (p_payload->>'step')::integer or (p_state#>>'{tutorial,step}')::integer is distinct from (p_payload->>'step')::integer+1) then raise exception 'TUTORIAL_STEP_CONFLICT' using errcode='40001';end if;
 saved:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,0,0,p_request_id,null,null,null,jsonb_build_object('tutorialAction',p_action,'tutorialPayload',p_payload));
 if p_action='tutorial_next' and before_state#>>'{tutorial,step}'='15' then
  nm:=btrim(p_state#>>'{tutorial,name}');
  if nm is null or char_length(nm) not between 1 and 8 or nm ~ '[[:cntrl:]]' then raise exception 'INVALID_NAME';end if;
  update public.users set username=nm where id=p_user_id;
 end if;
 return saved;
end $$;
revoke all on function public.game04_commit_tutorial(uuid,bigint,jsonb,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.game04_commit_tutorial(uuid,bigint,jsonb,uuid,text,jsonb) to service_role;
create or replace function public.game04_process_login_bonus(p_user_id uuid) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare u public.users%rowtype;s public.game04_player_state%rowtype;progress public.user_login_bonuses%rowtype;
 today date:=(statement_timestamp() at time zone 'Asia/Tokyo')::date;step integer;total integer;
 st jsonb;rewards jsonb;receipt jsonb;gems integer:=0;amount integer;path text[];
begin
 select * into u from public.users where id=p_user_id for update;if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then return jsonb_build_object('claimed',false,'reason','STATE_NOT_READY');end if;
 if s.state->'tutorial' is not null and not coalesce((s.state#>>'{tutorial,loginEligible}')::boolean,false) then return jsonb_build_object('claimed',false,'reason','TUTORIAL_FIRST_HOME');end if;
 select * into progress from public.user_login_bonuses where user_id=p_user_id for update;
 if found and (progress.last_claimed_at at time zone 'Asia/Tokyo')::date=today then
  return jsonb_build_object('claimed',false,'already_claimed',true,'current_step',progress.current_day,'total_logins',progress.total_logins,'last_claimed_date',today,'delivery','DIRECT','masterVersion',case when s.state->>'loginBonusLastDate'=today::text then s.state->>'loginBonusVersion' else null end);
 end if;
 step:=case when progress.user_id is null then 1 else progress.current_day%30+1 end;total:=coalesce(progress.total_logins,0)+1;
 st:=s.state||jsonb_build_object('loginBonusVersion','game04-login-30-v1-20260921','loginBonusLastDate',today);
 st:=jsonb_set(st,'{souls}',coalesce(st->'souls','{}'));st:=jsonb_set(st,'{souls,char_reiji_01}',to_jsonb(coalesce((st#>>'{souls,char_reiji_01}')::integer,0)+2));
 rewards:=jsonb_build_array(jsonb_build_object('kind','soul','id','char_reiji_01','amount',2),jsonb_build_object('kind','cash','amount',10000));
 if step in (3,8,13,18,23,28) then
  st:=jsonb_set(st,'{growthInventory}',coalesce(st->'growthInventory','{"expItems":{"character":{"small":0,"medium":0,"large":0,"xlarge":0},"equipment":{"small":0,"medium":0,"large":0,"xlarge":0}},"carryExp":{"character":0,"equipment":0},"genericSouls":{"N":0,"R":0,"SR":0,"SSR":0},"soulSelectors":{"N":0,"R":0,"SR":0,"SSR":0}}'));
  st:=jsonb_set(st,'{growthInventory,expItems}',coalesce(st#>'{growthInventory,expItems}','{}'));
  st:=jsonb_set(st,'{growthInventory,expItems,character}',coalesce(st#>'{growthInventory,expItems,character}','{"small":0,"medium":0,"large":0,"xlarge":0}'));
  st:=jsonb_set(st,'{growthInventory,expItems,equipment}',coalesce(st#>'{growthInventory,expItems,equipment}','{"small":0,"medium":0,"large":0,"xlarge":0}'));
  st:=jsonb_set(st,'{growthInventory,expItems,character,large}',to_jsonb(coalesce((st#>>'{growthInventory,expItems,character,large}')::integer,0)+1));
  st:=jsonb_set(st,'{growthInventory,expItems,equipment,large}',to_jsonb(coalesce((st#>>'{growthInventory,expItems,equipment,large}')::integer,0)+2));
  rewards:=rewards||jsonb_build_array(jsonb_build_object('kind','character_exp_item','id','large','amount',1),jsonb_build_object('kind','equipment_exp_item','id','large','amount',2));
 end if;
 if step in (5,20,10,25,15,30) then
  path:=array['questTicketGrants',case when step in (5,20) then 'SPECIAL_TICKET_CHARACTER' when step in (10,25) then 'SPECIAL_TICKET_SKILL' else 'SPECIAL_TICKET_EQUIPMENT' end];
  amount:=case when step in (10,25) then 2 else 1 end;st:=jsonb_set(st,'{questTicketGrants}',coalesce(st->'questTicketGrants','{}'));
  st:=jsonb_set(st,path,to_jsonb(coalesce((st#>>path)::integer,0)+amount));rewards:=rewards||jsonb_build_array(jsonb_build_object('kind','ticket','id',path[2],'amount',amount));
 end if;
 if step in (7,14,21) then gems:=100;end if;
 receipt:=jsonb_build_object('claimed',true,'already_claimed',false,'current_step',step,'day_number',step,'total_logins',total,'last_claimed_date',today,'delivery','DIRECT','rewards',rewards,'freeDiamonds',gems,'masterVersion','game04-login-30-v1-20260921');
 st:=jsonb_set(st,'{loginBonusReceipt}',receipt);update public.users set cash=cash+10000,neon_diamonds=neon_diamonds+gems where id=p_user_id;
 update public.game04_player_state set state=st,version=version+1,updated_at=statement_timestamp() where user_id=p_user_id;
 insert into public.user_login_bonuses(user_id,current_day,total_logins,last_claimed_at) values(p_user_id,step,total,statement_timestamp())
 on conflict(user_id) do update set current_day=excluded.current_day,total_logins=excluded.total_logins,last_claimed_at=excluded.last_claimed_at;
 return receipt;
end $$;


commit;
