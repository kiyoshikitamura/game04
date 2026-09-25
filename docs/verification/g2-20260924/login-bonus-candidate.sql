-- GAME04 dev only. Keeps existing cumulative day and last claim; never backfills missed days.
CREATE OR REPLACE FUNCTION public.game04_process_login_bonus(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SET search_path TO public,pg_temp AS $function$
declare u public.users%rowtype; s public.game04_player_state%rowtype; progress public.user_login_bonuses%rowtype;
 today date:=(statement_timestamp() at time zone 'Asia/Tokyo')::date; step integer; total integer;
 st jsonb; rewards jsonb; receipt jsonb; row jsonb; gems integer:=0; amount integer; path text[];
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then return jsonb_build_object('claimed',false,'reason','STATE_NOT_READY');end if;
 select * into progress from public.user_login_bonuses where user_id=p_user_id for update;
 if found and (progress.last_claimed_at at time zone 'Asia/Tokyo')::date=today then
  return jsonb_build_object('claimed',false,'already_claimed',true,'current_step',progress.current_day,'total_logins',progress.total_logins,'last_claimed_date',today,'delivery','DIRECT','masterVersion',case when s.state->>'loginBonusLastDate'=today::text then s.state->>'loginBonusVersion' else null end);
 end if;
 step:=case when progress.user_id is null then 1 else progress.current_day%30+1 end;
 total:=coalesce(progress.total_logins,0)+1;
 st:=s.state||jsonb_build_object('loginBonusVersion','game04-login-30-v1-20260921','loginBonusLastDate',today);
 st:=jsonb_set(st,'{souls}',coalesce(st->'souls','{}'::jsonb));
 st:=jsonb_set(st,'{souls,char_reiji_01}',to_jsonb(coalesce((st#>>'{souls,char_reiji_01}')::integer,0)+2));
 rewards:=jsonb_build_array(jsonb_build_object('kind','soul','id','char_reiji_01','amount',2),jsonb_build_object('kind','cash','amount',10000));
 if step in (3,8,13,18,23,28) then
  st:=jsonb_set(st,'{growthInventory}',coalesce(st->'growthInventory','{"expItems":{"character":{"small":0,"medium":0,"large":0,"xlarge":0},"equipment":{"small":0,"medium":0,"large":0,"xlarge":0}},"carryExp":{"character":0,"equipment":0},"genericSouls":{"N":0,"R":0,"SR":0,"SSR":0},"soulSelectors":{"N":0,"R":0,"SR":0,"SSR":0}}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems}',coalesce(st#>'{growthInventory,expItems}','{}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems,character}',coalesce(st#>'{growthInventory,expItems,character}','{"small":0,"medium":0,"large":0,"xlarge":0}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems,equipment}',coalesce(st#>'{growthInventory,expItems,equipment}','{"small":0,"medium":0,"large":0,"xlarge":0}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems,character,large}',to_jsonb(coalesce((st#>>'{growthInventory,expItems,character,large}')::integer,0)+1));
  st:=jsonb_set(st,'{growthInventory,expItems,equipment,large}',to_jsonb(coalesce((st#>>'{growthInventory,expItems,equipment,large}')::integer,0)+2));
  rewards:=rewards||jsonb_build_array(jsonb_build_object('kind','character_exp_item','id','large','amount',1),jsonb_build_object('kind','equipment_exp_item','id','large','amount',2));
 end if;
 if step in (5,20,10,25,15,30) then
  path:=array['questTicketGrants',case when step in (5,20) then 'SPECIAL_TICKET_CHARACTER' when step in (10,25) then 'SPECIAL_TICKET_SKILL' else 'SPECIAL_TICKET_EQUIPMENT' end];
  amount:=case when step in (10,25) then 2 else 1 end;
  st:=jsonb_set(st,'{questTicketGrants}',coalesce(st->'questTicketGrants','{}'::jsonb));
  st:=jsonb_set(st,path,to_jsonb(coalesce((st#>>path)::integer,0)+amount));
  rewards:=rewards||jsonb_build_array(jsonb_build_object('kind','ticket','id',path[2],'amount',amount));
 end if;
 if step in (7,14,21) then gems:=100;end if;
 receipt:=jsonb_build_object('claimed',true,'already_claimed',false,'current_step',step,'day_number',step,'total_logins',total,'last_claimed_date',today,'delivery','DIRECT','rewards',rewards,'freeDiamonds',gems,'masterVersion','game04-login-30-v1-20260921');
 st:=jsonb_set(st,'{loginBonusReceipt}',receipt);
 update public.users set cash=cash+10000,neon_diamonds=neon_diamonds+gems where id=p_user_id;
 -- Ticket delta trigger delivers to the existing ticket inventory in the same transaction.
 update public.game04_player_state set state=st,version=version+1,updated_at=statement_timestamp() where user_id=p_user_id;
 insert into public.user_login_bonuses(user_id,current_day,total_logins,last_claimed_at)
 values(p_user_id,step,total,statement_timestamp()) on conflict(user_id) do update
 set current_day=excluded.current_day,total_logins=excluded.total_logins,last_claimed_at=excluded.last_claimed_at;
 return receipt;
end $function$;
REVOKE ALL ON FUNCTION public.game04_process_login_bonus(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_process_login_bonus(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.process_login_bonus()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public,pg_temp AS $function$
begin
 if auth.uid() is null then raise exception 'Player authentication required';end if;
 return public.game04_process_login_bonus(auth.uid());
end $function$;
REVOKE ALL ON FUNCTION public.process_login_bonus() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.process_login_bonus() TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.game04_get_session_state(p_user_id uuid,p_initial jsonb DEFAULT NULL::jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path TO public,pg_temp AS $function$
declare st jsonb; claim jsonb;
begin
 st:=public.game04_get_growth_state(p_user_id,p_initial);
 if st is null then return null;end if;
 claim:=public.game04_process_login_bonus(p_user_id);
 if coalesce((claim->>'claimed')::boolean,false) then
  st:=public.game04_get_growth_state(p_user_id);
 end if;
 return st;
end $function$;
REVOKE ALL ON FUNCTION public.game04_get_session_state(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_get_session_state(uuid,jsonb) TO service_role;
