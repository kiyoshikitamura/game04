-- Catalog and behavioral acceptance for the GAME04 reward transaction boundary.
-- Run after 20260902000004_reward_transaction_core.sql. The transaction rolls
-- back every fixture and can run without application credentials.

begin;

do $$
declare
  v_table text;
  v_function text;
begin
  foreach v_table in array array[
    'reward_inbox',
    'reward_inbox_entries',
    'reward_claim_requests',
    'reward_receipts',
    'reward_receipt_entries'
  ] loop
    if to_regclass('public.' || v_table) is null then
      raise exception '% table is missing', v_table;
    end if;

    if has_table_privilege('authenticated', 'public.' || v_table, 'INSERT')
      or has_table_privilege('authenticated', 'public.' || v_table, 'UPDATE')
      or has_table_privilege('authenticated', 'public.' || v_table, 'DELETE') then
      raise exception '% exposes direct client mutation', v_table;
    end if;
  end loop;

  if has_table_privilege('authenticated', 'public.player_inventory', 'INSERT')
    or has_table_privilege('authenticated', 'public.player_inventory', 'UPDATE')
    or has_table_privilege('authenticated', 'public.player_inventory', 'DELETE') then
    raise exception 'player_inventory exposes direct client mutation';
  end if;

  foreach v_function in array array[
    'public.get_current_player_reward_inbox()',
    'public.get_current_player_reward_receipts()',
    'public.claim_current_player_reward(uuid,uuid)'
  ] loop
    if not has_function_privilege('authenticated', v_function, 'EXECUTE') then
      raise exception 'authenticated cannot execute %', v_function;
    end if;
  end loop;

  if has_function_privilege(
    'authenticated',
    'public.enqueue_player_reward(uuid,uuid,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated can choose an arbitrary reward payload';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.reward_receipts'::regclass
      and tgname = 'reward_receipts_immutable'
      and not tgisinternal
  ) or not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.reward_receipt_entries'::regclass
      and tgname = 'reward_receipt_entries_immutable'
      and not tgisinternal
  ) then
    raise exception 'immutable receipt triggers are missing';
  end if;
end;
$$;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'reward-owner@example.invalid', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'reward-other@example.invalid', '', now(), now(), now());

insert into public.players (id)
values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002');

do $$
declare
  v_inbox_id uuid;
  v_conflict_inbox_id uuid;
  v_request_id uuid := '30000000-0000-0000-0000-000000000001';
  v_first jsonb;
  v_replay jsonb;
  v_quantity bigint;
  v_count bigint;
  v_conflict_rejected boolean := false;
begin
  v_inbox_id := public.enqueue_player_reward(
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '[{"asset_kind":"test-kind","asset_key":"test-key","quantity":2}]'::jsonb
  );

  perform set_config(
    'request.jwt.claim.sub',
    '10000000-0000-0000-0000-000000000001',
    true
  );
  v_first := public.claim_current_player_reward(v_inbox_id, v_request_id);
  v_replay := public.claim_current_player_reward(v_inbox_id, v_request_id);

  if v_first <> v_replay then
    raise exception 'idempotent replay did not return the original receipt';
  end if;

  select quantity into v_quantity
  from public.player_inventory
  where player_id = '10000000-0000-0000-0000-000000000001'
    and asset_kind = 'test-kind'
    and asset_key = 'test-key';

  if v_quantity <> 2 then
    raise exception 'one request granted %, expected 2', v_quantity;
  end if;

  select count(*) into v_count
  from public.reward_receipts
  where player_id = '10000000-0000-0000-0000-000000000001'
    and request_id = v_request_id;

  if v_count <> 1 then
    raise exception 'one request produced % receipts, expected 1', v_count;
  end if;

  v_conflict_inbox_id := public.enqueue_player_reward(
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    '[{"asset_kind":"conflict-kind","asset_key":"conflict-key","quantity":5}]'::jsonb
  );

  begin
    perform public.claim_current_player_reward(v_conflict_inbox_id, v_request_id);
  exception
    when invalid_parameter_value then v_conflict_rejected := true;
  end;

  if not v_conflict_rejected then
    raise exception 'request ID conflict unexpectedly succeeded';
  end if;

  if exists (
    select 1
    from public.player_inventory
    where player_id = '10000000-0000-0000-0000-000000000001'
      and asset_kind = 'conflict-kind'
      and asset_key = 'conflict-key'
  ) or not exists (
    select 1
    from public.reward_inbox
    where id = v_conflict_inbox_id
      and state = 'pending'
      and claimed_at is null
  ) then
    raise exception 'request ID conflict left a partial effect';
  end if;

  perform set_config(
    'request.jwt.claim.sub',
    '10000000-0000-0000-0000-000000000002',
    true
  );

  begin
    perform public.claim_current_player_reward(
      v_inbox_id,
      '30000000-0000-0000-0000-000000000002'
    );
    raise exception 'cross-player claim unexpectedly succeeded';
  exception
    when no_data_found then null;
  end;

  select quantity into v_quantity
  from public.player_inventory
  where player_id = '10000000-0000-0000-0000-000000000001'
    and asset_kind = 'test-kind'
    and asset_key = 'test-key';

  if v_quantity <> 2 then
    raise exception 'cross-player attempt changed owner inventory';
  end if;

  select count(*) into v_count
  from public.get_current_player_reward_receipts();

  if v_count <> 0 then
    raise exception 'another player can read the owner receipt projection';
  end if;
end;
$$;

do $$
begin
  perform public.enqueue_player_reward(
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '[{"asset_kind":"atomic-kind","asset_key":"atomic-key","quantity":3}]'::jsonb
  );
end;
$$;

create function public.test_reject_reward_receipt_insert()
returns trigger
language plpgsql
as $$
begin
  raise exception 'forced receipt failure';
end;
$$;

create trigger test_reject_reward_receipt_insert
before insert on public.reward_receipts
for each row execute function public.test_reject_reward_receipt_insert();

do $$
declare
  v_inbox_id uuid;
  v_failed boolean := false;
  v_count bigint;
begin
  select id into strict v_inbox_id
  from public.reward_inbox
  where player_id = '10000000-0000-0000-0000-000000000001'
    and delivery_request_id = '20000000-0000-0000-0000-000000000002';

  perform set_config(
    'request.jwt.claim.sub',
    '10000000-0000-0000-0000-000000000001',
    true
  );

  begin
    perform public.claim_current_player_reward(
      v_inbox_id,
      '30000000-0000-0000-0000-000000000003'
    );
  exception
    when others then v_failed := true;
  end;

  if not v_failed then
    raise exception 'forced receipt failure did not abort the claim';
  end if;

  select count(*) into v_count
  from public.player_inventory
  where player_id = '10000000-0000-0000-0000-000000000001'
    and asset_kind = 'atomic-kind'
    and asset_key = 'atomic-key';

  if v_count <> 0 then
    raise exception 'inventory delta survived a failed receipt insert';
  end if;

  if not exists (
    select 1
    from public.reward_inbox
    where id = v_inbox_id
      and state = 'pending'
      and claimed_at is null
  ) then
    raise exception 'inbox claim state survived a failed receipt insert';
  end if;

  if exists (
    select 1
    from public.reward_claim_requests
    where player_id = '10000000-0000-0000-0000-000000000001'
      and request_id = '30000000-0000-0000-0000-000000000003'
  ) then
    raise exception 'claim request survived a failed receipt insert';
  end if;
end;
$$;

drop trigger test_reject_reward_receipt_insert on public.reward_receipts;
drop function public.test_reject_reward_receipt_insert();

do $$
declare
  v_receipt_id uuid;
  v_failed boolean := false;
begin
  select id into strict v_receipt_id
  from public.reward_receipts
  where player_id = '10000000-0000-0000-0000-000000000001'
    and request_id = '30000000-0000-0000-0000-000000000001';

  begin
    update public.reward_receipts
    set created_at = created_at
    where id = v_receipt_id;
  exception
    when others then v_failed := true;
  end;

  if not v_failed then
    raise exception 'receipt update unexpectedly succeeded';
  end if;
end;
$$;

rollback;
