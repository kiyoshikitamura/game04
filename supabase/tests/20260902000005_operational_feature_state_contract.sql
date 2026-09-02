-- Catalog and behavioral acceptance for product-neutral operational state.
-- The transaction rolls back every state change and may be safely replayed.

begin;

do $$
begin
  if to_regclass('public.operational_feature_states') is null
    or to_regclass('public.operational_state_requests') is null
    or to_regclass('public.operational_state_audit') is null then
    raise exception 'operational state tables are missing';
  end if;

  if has_table_privilege('anon', 'public.operational_feature_states', 'SELECT')
    or has_table_privilege('authenticated', 'public.operational_feature_states', 'SELECT')
    or has_table_privilege('authenticated', 'public.operational_feature_states', 'UPDATE') then
    raise exception 'operational tables expose direct client access';
  end if;

  if not has_function_privilege('anon', 'public.get_public_operational_state()', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.get_public_operational_state()', 'EXECUTE') then
    raise exception 'public operational projection is unavailable';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.set_operational_feature_state(uuid,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated can mutate operational state';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.operational_state_audit'::regclass
      and tgname = 'operational_state_audit_immutable'
      and not tgisinternal
  ) then
    raise exception 'operational audit immutability trigger is missing';
  end if;
end;
$$;

do $$
declare
  v_request_id uuid := '40000000-0000-0000-0000-000000000001';
  v_first jsonb;
  v_replay jsonb;
  v_denied boolean := false;
  v_conflict boolean := false;
  v_count bigint;
  v_state text;
begin
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  begin
    perform public.set_operational_feature_state(
      v_request_id,
      'application',
      'maintenance',
      'system.maintenance'
    );
  exception when insufficient_privilege then
    v_denied := true;
  end;
  if not v_denied then
    raise exception 'authenticated operational mutation unexpectedly succeeded';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_first := public.set_operational_feature_state(
    v_request_id,
    'application',
    'maintenance',
    'system.maintenance'
  );
  v_replay := public.set_operational_feature_state(
    v_request_id,
    'application',
    'maintenance',
    'system.maintenance'
  );

  if (v_first ->> 'audit_id') <> (v_replay ->> 'audit_id')
    or (v_first ->> 'replayed')::boolean
    or not (v_replay ->> 'replayed')::boolean then
    raise exception 'idempotent operational replay is invalid';
  end if;

  begin
    perform public.set_operational_feature_state(
      v_request_id,
      'application',
      'disabled',
      'system.maintenance'
    );
  exception when invalid_parameter_value then
    v_conflict := true;
  end;
  if not v_conflict then
    raise exception 'conflicting operational replay unexpectedly succeeded';
  end if;

  select state into v_state
  from public.get_public_operational_state()
  where feature_key = 'application';
  if v_state <> 'maintenance' then
    raise exception 'public projection returned %', v_state;
  end if;

  select count(*) into v_count
  from public.operational_state_audit
  where request_id = v_request_id;
  if v_count <> 1 then
    raise exception 'request produced % audit records, expected 1', v_count;
  end if;
end;
$$;

do $$
declare
  v_failed boolean := false;
begin
  begin
    update public.operational_state_audit
    set changed_at = changed_at
    where request_id = '40000000-0000-0000-0000-000000000001';
  exception when object_not_in_prerequisite_state then
    v_failed := true;
  end;
  if not v_failed then
    raise exception 'operational audit update unexpectedly succeeded';
  end if;
end;
$$;

rollback;
