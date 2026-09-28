-- P03 candidate only. G2 owner must approve before application; no gameplay mutation.
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
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  select u.is_anonymous, u.email_confirmed_at, coalesce(length(u.encrypted_password), 0) > 0
    into v_anonymous, v_email_confirmed, v_password from auth.users u where u.id = v_uid;
  if not found then raise exception 'AUTH_REQUIRED'; end if;
  if not exists(select 1 from public.users where id = v_uid)
    or not exists(select 1 from public.game04_player_state where user_id = v_uid)
    then raise exception 'PLAYER_NOT_FOUND'; end if;
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
    insert into public.user_account_auth_methods(user_id, auth_method) values(v_uid, upper(v_provider))
      on conflict(user_id) do nothing;
    select auth_method into v_method from public.user_account_auth_methods where user_id = v_uid for update;
    if v_method <> upper(v_provider) then raise exception 'IDENTITY_CONFLICT'; end if;
  end if;
  return jsonb_build_object('userId', v_uid, 'linked', v_method is not null, 'method', upper(v_provider), 'needsPassword', false);
end; $$;
revoke all on function public.game04_auth_binding(boolean) from public, anon;
grant execute on function public.game04_auth_binding(boolean) to authenticated;
comment on function public.game04_auth_binding(boolean) is 'GAME04 verified same-UID binding. No player creation, merge, reward or tutorial mutation.';
