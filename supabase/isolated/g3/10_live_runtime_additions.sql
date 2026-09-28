-- Exact live-only R8 definitions captured read-only from lrgyllgzcdcphlbmkknc on 2026-09-25.
-- Complements reviewed GAME04-only runtime source slices; no data copy.

-- Live paid-balance/diamond projection. This intentionally supersedes the older GAME04 runtime source slice.
create or replace function public.game04_get_state(p_user_id uuid,p_initial jsonb default null) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare u public.users%rowtype;s public.game04_player_state%rowtype;cfg jsonb;recovered integer;recovery_seconds integer;energy_max integer;vip timestamptz;
begin
 select * into u from public.users where id=p_user_id for update;if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 update public.users set neon_diamonds=neon_diamonds,cash=cash where id=p_user_id returning * into u;
 select data into cfg from public.game04_redesign_master where key='runtime';energy_max:=(cfg->>'energyMax')::integer;recovery_seconds:=(cfg->>'energyRecoverySeconds')::integer;
 recovered:=greatest(0,floor(extract(epoch from(now()-coalesce(u.vitality_last_recovered_at,now())))/recovery_seconds)::integer);
 if u.vitality<energy_max and recovered>0 then
  update public.users set vitality=least(energy_max,vitality+recovered),vitality_last_recovered_at=case when vitality+recovered>=energy_max then now() else coalesce(vitality_last_recovered_at,now())+make_interval(secs=>recovered*recovery_seconds) end where id=p_user_id returning * into u;
 elsif u.vitality>=energy_max then update public.users set vitality_last_recovered_at=now() where id=p_user_id returning * into u;end if;
 if p_initial is not null then insert into public.game04_player_state(user_id,state) values(p_user_id,p_initial) on conflict(user_id) do nothing;end if;
 if exists(select 1 from public.billing_asset_lots l join public.presents p on p.id=l.present_id where l.user_id=p_user_id and l.claimed_at is not null
  and l.remaining_quantity>0 and l.expires_at<=statement_timestamp() and p.source_kind='GAME04_PAID_FORMAL') then
  update public.game04_player_state set state=state where user_id=p_user_id;
 end if;
 select * into s from public.game04_player_state where user_id=p_user_id;if not found then return null;end if;
 select expires_at into vip from public.game04_vip_entitlements where user_id=p_user_id;
 return s.state||jsonb_build_object('userId',p_user_id,'version',s.version,'cash',u.cash,'diamonds',u.neon_diamonds,'energy',u.vitality,'energyMax',energy_max,'vipExpiresAt',vip);
end $$;

create or replace function public.game04_get_session_state(p_user_id uuid,p_initial jsonb default null) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare st jsonb; claim jsonb;
begin
 st:=public.game04_get_growth_state(p_user_id,p_initial);
 if st is null then return null;end if;
 claim:=public.game04_process_login_bonus(p_user_id);
 if coalesce((claim->>'claimed')::boolean,false) then st:=public.game04_get_growth_state(p_user_id);end if;
 return st;
end $$;

create or replace function public.game04_acquisition_input(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object('legacy','{"characters":[],"skills":[],"equipment":[]}'::jsonb,
 'events',coalesce((select jsonb_agg(payload order by created_at,id) from public.game04_acquisition_events where user_id=p_user_id),'[]'::jsonb),
 'master',(select data from public.game04_redesign_master where key='acquisition_conversion'))
$$;

create or replace function public.game04_deliver_quest_tickets() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare ticket text;before_amount bigint;after_amount bigint;
begin
 for ticket in select jsonb_object_keys(coalesce(new.state->'questTicketGrants','{}')||coalesce(old.state->'questTicketGrants','{}')) loop
  if ticket not in ('SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT') then raise exception 'INVALID_QUEST_TICKET';end if;
  if coalesce(new.state#>>array['questTicketGrants',ticket],'0')!~'^[0-9]+$' then raise exception 'INVALID_QUEST_TICKET_AMOUNT';end if;
  before_amount:=coalesce((old.state#>>array['questTicketGrants',ticket])::bigint,0);after_amount:=coalesce((new.state#>>array['questTicketGrants',ticket])::bigint,0);
  if after_amount<before_amount or after_amount>2147483647 then raise exception 'INVALID_QUEST_TICKET_AMOUNT';end if;
  if after_amount>before_amount then insert into public.user_items(user_id,item_id,quantity) values(new.user_id,ticket,(after_amount-before_amount)::integer)
   on conflict(user_id,item_id) do update set quantity=user_items.quantity+excluded.quantity,updated_at=now();end if;
 end loop;return new;
end $$;

create or replace function public.game04_process_login_bonus(p_user_id uuid) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare u public.users%rowtype;s public.game04_player_state%rowtype;progress public.user_login_bonuses%rowtype;
 today date:=(statement_timestamp() at time zone 'Asia/Tokyo')::date;step integer;total integer;
 st jsonb;rewards jsonb;receipt jsonb;gems integer:=0;amount integer;path text[];
begin
 select * into u from public.users where id=p_user_id for update;if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then return jsonb_build_object('claimed',false,'reason','STATE_NOT_READY');end if;
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

create or replace function public.game04_paid_item_path(p_item text) returns text[] language sql immutable security invoker set search_path='' as $$
 select case p_item when 'RAID_UNLOCK_TICKET' then array['materials','unlock'] when 'ENERGY_DRINK' then array['energyDrinks']
 when 'SKILL_LB_PART' then array['materials','skill'] when 'EQUIP_LB_PART' then array['materials','equipmentLb']
 when 'SOUL_SELECTOR_SSR' then array['growthInventory','soulSelectors','SSR'] when 'CHAR_EXP_XL' then array['growthInventory','expItems','character','xlarge']
 when 'EQUIP_EXP_XL' then array['growthInventory','expItems','equipment','xlarge'] else null end
$$;

create or replace function public.kpi_is_subject_excluded(p_subject_id uuid,p_at timestamptz) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.kpi_account_classification_periods period where period.subject_id=p_subject_id
 and period.classification in ('admin','qa','test','fraud_suspended') and period.valid_from<=p_at and (period.valid_to is null or period.valid_to>p_at))
$$;

create or replace function public.billing_apply_lot_delta(p_user uuid,p_item text,p_old bigint,p_new bigint) returns bigint
language plpgsql security definer set search_path='' as $$
declare v_lot public.billing_asset_lots;v_expired bigint:=0;v_spend bigint:=greatest(p_old-p_new,0);v_take bigint;v_paid_balance bigint;
begin
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item and claimed_at is not null and remaining_quantity>0
 and not exists(select 1 from public.presents fp where fp.id=billing_asset_lots.present_id and fp.source_kind='GAME04_PAID_FORMAL') order by expires_at,id for update loop
  if v_lot.expires_at<=statement_timestamp() then v_expired:=v_expired+v_lot.remaining_quantity;update public.billing_asset_lots set expired_quantity=expired_quantity+remaining_quantity,remaining_quantity=0 where id=v_lot.id;end if;
 end loop;
 if p_old-v_expired<v_spend then raise exception 'EXPIRED_ASSET_BALANCE';end if;
 if p_item='DIAMOND' then
  select coalesce(sum(remaining_quantity),0) into v_paid_balance from public.billing_asset_lots where user_id=p_user and item_id=p_item and claimed_at is not null and remaining_quantity>0
  and not exists(select 1 from public.presents fp where fp.id=billing_asset_lots.present_id and fp.source_kind='GAME04_PAID_FORMAL');
  v_spend:=greatest(0,v_spend-greatest(0,p_old-v_expired-v_paid_balance));
 end if;
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item and claimed_at is not null and remaining_quantity>0
 and not exists(select 1 from public.presents fp where fp.id=billing_asset_lots.present_id and fp.source_kind='GAME04_PAID_FORMAL') order by expires_at,id for update loop
  exit when v_spend=0;v_take:=least(v_spend,v_lot.remaining_quantity);update public.billing_asset_lots set remaining_quantity=remaining_quantity-v_take where id=v_lot.id;v_spend:=v_spend-v_take;
 end loop;return p_new-v_expired;
end $$;
create or replace function public.billing_asset_balance_trigger() returns trigger language plpgsql security definer set search_path='' as $$
begin if tg_table_name='users' then new.cash:=public.billing_apply_lot_delta(old.id,'CASH',old.cash,new.cash);else new.quantity:=public.billing_apply_lot_delta(old.user_id,old.item_id,old.quantity,new.quantity);end if;return new;end $$;
create or replace function public.billing_dia_balance_trigger() returns trigger language plpgsql security definer set search_path='' as $$
begin new.neon_diamonds:=public.billing_apply_lot_delta(old.id,'DIAMOND',old.neon_diamonds,new.neon_diamonds);return new;end $$;

create or replace function public.game04_formal_paid_balance_trigger() returns trigger language plpgsql security definer set search_path='' as $$
declare item text;path text[];before_qty bigint;after_qty bigint;expired bigint;spend bigint;take_qty bigint;lot public.billing_asset_lots;
begin
 for item in select distinct l.item_id from public.billing_asset_lots l join public.presents p on p.id=l.present_id
 where l.user_id=new.user_id and l.claimed_at is not null and l.remaining_quantity>0 and p.source_kind='GAME04_PAID_FORMAL' loop
  path:=public.game04_paid_item_path(item);if path is null then raise exception 'UNSUPPORTED_PAID_FORMAL_ITEM';end if;
  if jsonb_typeof(old.state#>path) is distinct from 'number' or jsonb_typeof(new.state#>path) is distinct from 'number' then raise exception 'INVALID_PAID_FORMAL_INVENTORY';end if;
  before_qty:=(old.state#>>path)::bigint;after_qty:=(new.state#>>path)::bigint;if before_qty<0 or after_qty<0 then raise exception 'INVALID_PAID_FORMAL_INVENTORY';end if;
  expired:=0;spend:=greatest(before_qty-after_qty,0);
  for lot in select l.* from public.billing_asset_lots l join public.presents p on p.id=l.present_id where l.user_id=new.user_id and l.item_id=item
   and l.claimed_at is not null and l.remaining_quantity>0 and p.source_kind='GAME04_PAID_FORMAL' order by l.expires_at,l.id for update of l loop
   if lot.expires_at<=statement_timestamp() then expired:=expired+lot.remaining_quantity;update public.billing_asset_lots set expired_quantity=expired_quantity+remaining_quantity,remaining_quantity=0 where id=lot.id;end if;
  end loop;
  if before_qty-expired<spend then raise exception 'EXPIRED_ASSET_BALANCE';end if;
  for lot in select l.* from public.billing_asset_lots l join public.presents p on p.id=l.present_id where l.user_id=new.user_id and l.item_id=item
   and l.claimed_at is not null and l.remaining_quantity>0 and p.source_kind='GAME04_PAID_FORMAL' order by l.expires_at,l.id for update of l loop
   exit when spend=0;take_qty:=least(spend,lot.remaining_quantity);update public.billing_asset_lots set remaining_quantity=remaining_quantity-take_qty where id=lot.id;spend:=spend-take_qty;
  end loop;
  new.state:=jsonb_set(new.state,path,to_jsonb(after_qty-expired));
 end loop;
 if new.state is distinct from old.state and new.version=old.version then new.version:=old.version+1;new.updated_at:=clock_timestamp();end if;return new;
end $$;

drop trigger if exists billing_item_lots on public.user_items;
drop trigger if exists billing_cash_lots on public.users;
drop trigger if exists billing_dia_lots on public.users;
drop trigger if exists game04_formal_paid_lots on public.game04_player_state;
drop trigger if exists game04_deliver_quest_tickets on public.game04_player_state;
create trigger billing_item_lots before update of quantity on public.user_items for each row execute function public.billing_asset_balance_trigger();
create trigger billing_cash_lots before update of cash on public.users for each row execute function public.billing_asset_balance_trigger();
create trigger billing_dia_lots before update of neon_diamonds on public.users for each row execute function public.billing_dia_balance_trigger();
create trigger game04_formal_paid_lots before update of state on public.game04_player_state for each row execute function public.game04_formal_paid_balance_trigger();
create trigger game04_deliver_quest_tickets after update of state on public.game04_player_state for each row execute function public.game04_deliver_quest_tickets();

revoke all on function public.game04_get_session_state(uuid,jsonb),public.game04_acquisition_input(uuid),public.game04_deliver_quest_tickets(),public.game04_process_login_bonus(uuid),public.game04_paid_item_path(text),
 public.kpi_is_subject_excluded(uuid,timestamptz),public.billing_apply_lot_delta(uuid,text,bigint,bigint),public.billing_asset_balance_trigger(),public.billing_dia_balance_trigger(),public.game04_formal_paid_balance_trigger() from public,anon,authenticated;
grant execute on function public.game04_get_session_state(uuid,jsonb),public.game04_acquisition_input(uuid),public.game04_deliver_quest_tickets(),public.game04_process_login_bonus(uuid),public.game04_paid_item_path(text),
 public.kpi_is_subject_excluded(uuid,timestamptz),public.billing_apply_lot_delta(uuid,text,bigint,bigint),public.billing_asset_balance_trigger(),public.billing_dia_balance_trigger(),public.game04_formal_paid_balance_trigger() to service_role;
