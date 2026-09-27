-- Common Preview only. Existing deadlines, balances and snapshots are not rewritten.
do $$ begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='production_environment') is distinct from 'soiksqgtmcnspfedmanr' then raise exception 'WRONG_PROJECT';end if;
end $$;

-- Reuse the existing debit/expiry triggers; lock in the same order as claim/commit.
create or replace function public.game04_expire_paid_assets_for_user(p_user_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 perform 1 from public.game04_player_state where user_id=p_user_id for update;
 update public.users set cash=cash,neon_diamonds=neon_diamonds where id=p_user_id
 and exists(select 1 from public.billing_asset_lots where user_id=p_user_id and claimed_at is not null and remaining_quantity>0 and expires_at<=statement_timestamp() and item_id in('CASH','DIAMOND'));
 update public.game04_player_state set state=state where user_id=p_user_id
 and exists(select 1 from public.billing_asset_lots l join public.presents p on p.id=l.present_id where l.user_id=p_user_id and l.claimed_at is not null and l.remaining_quantity>0 and l.expires_at<=statement_timestamp() and p.source_kind='GAME04_PAID_FORMAL');
 perform 1 from public.user_items where user_id=p_user_id order by item_id for update;
 update public.user_items i set quantity=quantity where user_id=p_user_id
 and exists(select 1 from public.billing_asset_lots l where l.user_id=p_user_id and l.item_id=i.item_id and l.claimed_at is not null and l.remaining_quantity>0 and l.expires_at<=statement_timestamp());
 -- BOX stock has never entered a spendable balance.
 perform 1 from public.presents p where p.user_id=p_user_id and p.status='UNCLAIMED'
 and exists(select 1 from public.billing_asset_lots l where l.present_id=p.id and l.claimed_at is null and l.expires_at<=statement_timestamp()) order by p.id for update;
 update public.billing_asset_lots l set expired_quantity=expired_quantity+remaining_quantity,remaining_quantity=0
 where l.user_id=p_user_id and l.claimed_at is null and l.remaining_quantity>0 and l.expires_at<=statement_timestamp()
 and exists(select 1 from public.presents p where p.id=l.present_id and p.status='UNCLAIMED');
 update public.presents p set status='EXPIRED' where p.user_id=p_user_id and p.status='UNCLAIMED'
 and exists(select 1 from public.billing_asset_lots l where l.present_id=p.id and l.claimed_at is null and l.expires_at<=statement_timestamp());
end $$;
revoke all on function public.game04_expire_paid_assets_for_user(uuid) from public,anon,authenticated;
grant execute on function public.game04_expire_paid_assets_for_user(uuid) to service_role;

create or replace function public.billing_refresh_paid_assets()
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 perform public.game04_expire_paid_assets_for_user(uid);
 select jsonb_build_object('server_now',statement_timestamp(),'user_id',uid,
 'dia_total',(select neon_diamonds from public.users where id=uid),
 'dia_paid',(select coalesce(sum(remaining_quantity),0) from public.billing_asset_lots where user_id=uid and item_id='DIAMOND' and claimed_at is not null and expires_at>statement_timestamp()),
 'state',public.game04_get_state(uid),
 'items',coalesce((select jsonb_agg(jsonb_build_object('item_id',item_id,'quantity',quantity)) from public.user_items where user_id=uid),'[]'::jsonb),
 'lots',coalesce((select jsonb_agg(jsonb_build_object('id',id,'item_id',item_id,'quantity',remaining_quantity,'issued_at',issued_at,'expires_at',expires_at,'claimed',claimed_at is not null) order by expires_at,id) from public.billing_asset_lots where user_id=uid and remaining_quantity>0 and expires_at>statement_timestamp()),'[]'::jsonb),
 'history',coalesce((select jsonb_agg(jsonb_build_object('id',id,'item_id',item_id,'issued_quantity',issued_quantity,'remaining_quantity',remaining_quantity,'expired_quantity',expired_quantity,'consumed_quantity',issued_quantity-remaining_quantity-expired_quantity,'issued_at',issued_at,'expires_at',expires_at,'claimed_at',claimed_at) order by expires_at,id) from public.billing_asset_lots where user_id=uid),'[]'::jsonb))
 into result;
 return result;
end $$;
revoke all on function public.billing_refresh_paid_assets() from public,anon;
grant execute on function public.billing_refresh_paid_assets() to authenticated;

CREATE OR REPLACE FUNCTION public.game04_get_state(p_user_id uuid, p_initial jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype;s public.game04_player_state%rowtype;cfg jsonb;recovered integer;recovery_seconds integer;energy_max integer;vip timestamptz;
begin
 perform public.game04_expire_paid_assets_for_user(p_user_id);
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
end $function$
;
notify pgrst,'reload schema';

