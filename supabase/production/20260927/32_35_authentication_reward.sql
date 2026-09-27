-- GAME03 approved reward contract, adapted to GAME04's current wallet and same-UID binding.
-- Development only. Preserve common PK ledger semantics and PRESENT/DIRECT exclusivity.

do $$ begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='production_environment') is distinct from 'soiksqgtmcnspfedmanr' then raise exception 'WRONG_PROJECT'; end if;
 if to_regclass('public.account_authentication_reward_grants') is not null then raise exception 'REWARD_LEDGER_ALREADY_EXISTS_REVIEW_REQUIRED';end if;
end $$;
create table public.account_authentication_reward_grants(
 user_id uuid primary key references public.users(id) on delete cascade,
 reward_key text not null default 'ACCOUNT_AUTHENTICATION_20260918',
 delivery_method text not null check(delivery_method in ('DIRECT','PRESENT')),
 quantity integer not null check(quantity=300),
 present_id uuid references public.presents(id),
 granted_at timestamptz not null default clock_timestamp()
);
alter table public.account_authentication_reward_grants enable row level security;
revoke all on public.account_authentication_reward_grants from public,anon,authenticated;
grant all on public.account_authentication_reward_grants to service_role;

create or replace function public.game04_grant_auth_reward(p_user_id uuid,p_delivery text)
returns boolean language plpgsql security definer set search_path='' as $$
declare n integer; gift uuid; wallet bigint;
begin
 if p_delivery not in ('DIRECT','PRESENT') or p_delivery is null then raise exception 'INVALID_DELIVERY';end if;
 select neon_diamonds into wallet from public.users where id=p_user_id for update;
 if not found then raise exception 'PLAYER_NOT_FOUND';end if;
 if not exists(select 1 from public.game04_player_state where user_id=p_user_id) or
    not exists(select 1 from public.user_account_auth_methods m join auth.users u on u.id=m.user_id
      where m.user_id=p_user_id and not u.is_anonymous
      and (select count(*) from auth.identities i where i.user_id=p_user_id)=1
      and exists(select 1 from auth.identities i where i.user_id=p_user_id and i.provider=lower(m.auth_method))
      and (m.auth_method='GOOGLE' or (m.auth_method='EMAIL' and u.email_confirmed_at is not null and length(u.encrypted_password)>0)))
 then raise exception 'VERIFIED_BINDING_REQUIRED';end if;
 insert into public.account_authentication_reward_grants(user_id,delivery_method,quantity)
 values(p_user_id,p_delivery,300) on conflict(user_id) do nothing;
 get diagnostics n=row_count;
 if n=0 then return false;end if;
 if p_delivery='DIRECT' then
  if wallet<0 or wallet>2147483647-300 then raise exception 'INVENTORY_LIMIT';end if;
  update public.users set neon_diamonds=neon_diamonds+300 where id=p_user_id;
 else
  insert into public.presents(user_id,item_id,quantity,message,status,expire_at,source_kind,source_key,source_metadata)
  values(p_user_id,'DIA',300,'アカウント連携特典','UNCLAIMED',clock_timestamp()+interval '30 days',
   'ACCOUNT_AUTHENTICATION_REWARD','ACCOUNT_AUTHENTICATION_20260918','{"delivery_method":"PRESENT","game":"GAME04"}')
  returning id into gift;
  update public.account_authentication_reward_grants set present_id=gift where user_id=p_user_id;
 end if;
 -- Free reward: never creates or extends a paid asset lot.
 return true;
end $$;
revoke all on function public.game04_grant_auth_reward(uuid,text) from public,anon,authenticated;
grant execute on function public.game04_grant_auth_reward(uuid,text) to service_role;

-- Existing P03 identity checks retained; reward and binding are atomic.
create or replace function public.game04_auth_binding(p_finalize boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_anonymous boolean;
  v_email_confirmed timestamptz;
  v_password boolean;
  v_count integer;
  v_provider text;
  v_method text;
  v_existing boolean;
  v_reward boolean := false;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  select u.is_anonymous, u.email_confirmed_at, coalesce(length(u.encrypted_password), 0) > 0
    into v_anonymous, v_email_confirmed, v_password from auth.users u where u.id = v_uid;
  if not found then raise exception 'AUTH_REQUIRED'; end if;
  if not exists(select 1 from public.users where id = v_uid)
    or not exists(select 1 from public.game04_player_state where user_id = v_uid)
    then raise exception 'PLAYER_NOT_FOUND'; end if;
  perform 1 from public.users where id = v_uid for update;
  select count(*), min(provider) into v_count, v_provider from auth.identities where user_id = v_uid;
  select auth_method into v_method from public.user_account_auth_methods where user_id = v_uid for update;
  if v_anonymous then
    if p_finalize then raise exception 'VERIFIED_IDENTITY_REQUIRED'; end if;
    return jsonb_build_object('userId', v_uid, 'linked', false, 'method', null, 'needsPassword', false);
  end if;
  if v_count <> 1 or v_provider not in ('email', 'google') then raise exception 'SINGLE_IDENTITY_REQUIRED'; end if;
  if v_method is not null and v_method <> upper(v_provider) then raise exception 'IDENTITY_CONFLICT'; end if;
  if v_provider = 'email' and (v_email_confirmed is null or not v_password) then
    if p_finalize then raise exception 'EMAIL_CONFIRMATION_AND_PASSWORD_REQUIRED'; end if;
    return jsonb_build_object('userId', v_uid, 'linked', false, 'method', 'EMAIL', 'needsPassword', v_email_confirmed is not null);
  end if;
  if p_finalize then
    v_existing := v_method is not null;
    insert into public.user_account_auth_methods(user_id, auth_method) values(v_uid, upper(v_provider))
      on conflict(user_id) do nothing;
    select auth_method into v_method from public.user_account_auth_methods where user_id = v_uid for update;
    if v_method <> upper(v_provider) then raise exception 'IDENTITY_CONFLICT'; end if;
    v_reward := public.game04_grant_auth_reward(v_uid, case when v_existing then 'PRESENT' else 'DIRECT' end);
  end if;
  return jsonb_build_object('userId', v_uid, 'linked', v_method is not null, 'method', upper(v_provider), 'needsPassword', false, 'rewardGranted', v_reward, 'rewardAmount', case when v_reward then 300 else 0 end);
end; $$;
revoke all on function public.game04_auth_binding(boolean) from public, anon;
grant execute on function public.game04_auth_binding(boolean) to authenticated;
comment on function public.game04_auth_binding(boolean) is 'GAME04 same-UID binding with one-time free 300 reward. No player creation, merge or tutorial mutation.';

-- Already formally bound accounts receive BOX only. Current development preflight count=0.
-- Recover a pre-existing canonical BOX grant into the same ledger before any delivery.
insert into public.account_authentication_reward_grants(user_id,delivery_method,quantity,present_id)
select distinct on(user_id) user_id,'PRESENT',300,id from public.presents
where source_kind='ACCOUNT_AUTHENTICATION_REWARD' and source_key='ACCOUNT_AUTHENTICATION_20260918'
 and item_id in('DIA','DIAMOND') and quantity=300 order by user_id,created_at
on conflict(user_id) do nothing;
do $$ declare target record;begin
 for target in select m.user_id from public.user_account_auth_methods m
 join public.game04_player_state s on s.user_id=m.user_id
 join auth.users u on u.id=m.user_id
 where not u.is_anonymous and (select count(*) from auth.identities i where i.user_id=m.user_id)=1
 and exists(select 1 from auth.identities i where i.user_id=m.user_id and i.provider=lower(m.auth_method))
 and (m.auth_method='GOOGLE' or (m.auth_method='EMAIL' and u.email_confirmed_at is not null and length(u.encrypted_password)>0))
 order by m.user_id
 loop perform public.game04_grant_auth_reward(target.user_id,'PRESENT');end loop;
end $$;
notify pgrst,'reload schema';

