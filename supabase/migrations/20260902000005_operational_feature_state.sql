-- GAME04 product-neutral availability control and administration audit.
-- This migration intentionally defines no gameplay feature, product event,
-- content schedule, economy rule, or GAME03-specific operational state.

create table public.operational_feature_states (
  feature_key text primary key,
  state text not null,
  message_code text,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint operational_feature_key_valid
    check (feature_key ~ '^[a-z][a-z0-9_.-]{0,63}$'),
  constraint operational_feature_state_valid
    check (state in ('enabled', 'maintenance', 'disabled')),
  constraint operational_message_code_valid
    check (message_code is null or message_code ~ '^[a-z][a-z0-9_.-]{0,63}$')
);

create table public.operational_state_requests (
  request_id uuid primary key,
  feature_key text not null,
  requested_state text not null,
  message_code text,
  audit_id uuid not null unique,
  completed_at timestamptz not null default timezone('utc', now()),
  constraint operational_request_feature_key_valid
    check (feature_key ~ '^[a-z][a-z0-9_.-]{0,63}$'),
  constraint operational_request_state_valid
    check (requested_state in ('enabled', 'maintenance', 'disabled')),
  constraint operational_request_message_code_valid
    check (message_code is null or message_code ~ '^[a-z][a-z0-9_.-]{0,63}$')
);

create table public.operational_state_audit (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  feature_key text not null,
  previous_state text,
  next_state text not null,
  message_code text,
  changed_at timestamptz not null default timezone('utc', now())
);

alter table public.operational_state_requests
  add constraint operational_state_requests_audit_fk
  foreign key (audit_id) references public.operational_state_audit(id);

alter table public.operational_feature_states enable row level security;
alter table public.operational_state_requests enable row level security;
alter table public.operational_state_audit enable row level security;

revoke all on table public.operational_feature_states from public, anon, authenticated;
revoke all on table public.operational_state_requests from public, anon, authenticated;
revoke all on table public.operational_state_audit from public, anon, authenticated;

insert into public.operational_feature_states (feature_key, state)
values ('application', 'enabled');

create or replace function public.prevent_operational_audit_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'operational audit is immutable' using errcode = '55000';
end;
$$;

create trigger operational_state_audit_immutable
before update or delete on public.operational_state_audit
for each row execute function public.prevent_operational_audit_mutation();

create or replace function public.get_public_operational_state()
returns table (
  feature_key text,
  state text,
  message_code text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select value.feature_key, value.state, value.message_code, value.updated_at
  from public.operational_feature_states value
  order by value.feature_key;
$$;

create or replace function public.set_operational_feature_state(
  p_request_id uuid,
  p_feature_key text,
  p_state text,
  p_message_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.operational_state_requests;
  v_current public.operational_feature_states;
  v_audit_id uuid;
  v_message_code text := nullif(btrim(p_message_code), '');
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  if p_request_id is null
    or p_feature_key is null
    or p_feature_key !~ '^[a-z][a-z0-9_.-]{0,63}$'
    or p_state not in ('enabled', 'maintenance', 'disabled')
    or (v_message_code is not null and v_message_code !~ '^[a-z][a-z0-9_.-]{0,63}$') then
    raise exception 'invalid operational state request' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('operational-state:' || p_request_id::text, 0));

  select request.* into v_request
  from public.operational_state_requests request
  where request.request_id = p_request_id;

  if v_request.request_id is not null then
    if v_request.feature_key <> p_feature_key
      or v_request.requested_state <> p_state
      or v_request.message_code is distinct from v_message_code then
      raise exception 'request ID was already used for another operation' using errcode = '22023';
    end if;

    return jsonb_build_object(
      'audit_id', v_request.audit_id,
      'request_id', v_request.request_id,
      'feature_key', v_request.feature_key,
      'state', v_request.requested_state,
      'message_code', v_request.message_code,
      'replayed', true
    );
  end if;

  select value.* into v_current
  from public.operational_feature_states value
  where value.feature_key = p_feature_key
  for update;

  insert into public.operational_state_audit (
    request_id,
    feature_key,
    previous_state,
    next_state,
    message_code
  ) values (
    p_request_id,
    p_feature_key,
    v_current.state,
    p_state,
    v_message_code
  ) returning id into v_audit_id;

  insert into public.operational_feature_states (
    feature_key,
    state,
    message_code,
    updated_at
  ) values (
    p_feature_key,
    p_state,
    v_message_code,
    timezone('utc', now())
  ) on conflict (feature_key) do update
  set state = excluded.state,
      message_code = excluded.message_code,
      updated_at = excluded.updated_at;

  insert into public.operational_state_requests (
    request_id,
    feature_key,
    requested_state,
    message_code,
    audit_id
  ) values (
    p_request_id,
    p_feature_key,
    p_state,
    v_message_code,
    v_audit_id
  );

  return jsonb_build_object(
    'audit_id', v_audit_id,
    'request_id', p_request_id,
    'feature_key', p_feature_key,
    'state', p_state,
    'message_code', v_message_code,
    'replayed', false
  );
end;
$$;

revoke all on function public.prevent_operational_audit_mutation() from public, anon, authenticated;
revoke all on function public.get_public_operational_state() from public;
revoke all on function public.set_operational_feature_state(uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.get_public_operational_state() to anon, authenticated;
grant execute on function public.set_operational_feature_state(uuid, text, text, text) to service_role;
