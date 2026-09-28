-- Keep privilege elevation in an unexposed schema; the public RPC is invoker.
alter function public.game04_record_portal_activity() set schema game04_portal_private;
grant usage on schema game04_portal_private to authenticated;
create function public.game04_record_portal_activity() returns void
language sql security invoker set search_path = '' as $$
  select game04_portal_private.game04_record_portal_activity();
$$;
revoke all on function public.game04_record_portal_activity() from public,anon;
grant execute on function public.game04_record_portal_activity() to authenticated;
