-- GAME04 Common Game Core: product-neutral reward delivery and claim authority.
-- Reference patterns: TRIBE NEON accepted commit
-- 826f8b770f36a6f6844d920b0adcd2853188b91d.
-- This migration intentionally defines no reward source, asset catalog, currency,
-- economy value, mission, login bonus, gacha, or presentation rule.

create table public.reward_inbox (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  delivery_request_id uuid not null,
  state text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  claimed_at timestamptz,
  unique (player_id, delivery_request_id),
  constraint reward_inbox_state_valid
    check (state in ('pending', 'claimed')),
  constraint reward_inbox_claim_state_consistent
    check (
      (state = 'pending' and claimed_at is null)
      or (state = 'claimed' and claimed_at is not null)
    )
);

create table public.reward_inbox_entries (
  inbox_id uuid not null references public.reward_inbox(id) on delete cascade,
  entry_index integer not null,
  asset_kind text not null,
  asset_key text not null,
  quantity bigint not null,
  primary key (inbox_id, entry_index),
  constraint reward_inbox_entry_index_nonnegative check (entry_index >= 0),
  constraint reward_inbox_asset_kind_present
    check (asset_kind = btrim(asset_kind) and char_length(asset_kind) between 1 and 64),
  constraint reward_inbox_asset_key_present
    check (asset_key = btrim(asset_key) and char_length(asset_key) between 1 and 160),
  constraint reward_inbox_quantity_positive check (quantity > 0)
);

create table public.reward_receipts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  inbox_id uuid not null unique references public.reward_inbox(id),
  request_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (player_id, request_id)
);

create table public.reward_receipt_entries (
  receipt_id uuid not null references public.reward_receipts(id),
  entry_index integer not null,
  asset_kind text not null,
  asset_key text not null,
  quantity bigint not null,
  primary key (receipt_id, entry_index),
  constraint reward_receipt_entry_index_nonnegative check (entry_index >= 0),
  constraint reward_receipt_asset_kind_present
    check (asset_kind = btrim(asset_kind) and char_length(asset_kind) between 1 and 64),
  constraint reward_receipt_asset_key_present
    check (asset_key = btrim(asset_key) and char_length(asset_key) between 1 and 160),
  constraint reward_receipt_quantity_positive check (quantity > 0)
);

create table public.reward_claim_requests (
  player_id uuid not null references public.players(id) on delete cascade,
  request_id uuid not null,
  inbox_id uuid not null references public.reward_inbox(id),
  receipt_id uuid not null unique references public.reward_receipts(id),
  completed_at timestamptz not null default timezone('utc', now()),
  primary key (player_id, request_id)
);

alter table public.reward_inbox enable row level security;
alter table public.reward_inbox_entries enable row level security;
alter table public.reward_receipts enable row level security;
alter table public.reward_receipt_entries enable row level security;
alter table public.reward_claim_requests enable row level security;

create policy "players can read their own reward inbox"
  on public.reward_inbox for select to authenticated
  using ((select auth.uid()) = player_id);

create policy "players can read their own reward inbox entries"
  on public.reward_inbox_entries for select to authenticated
  using (
    exists (
      select 1
      from public.reward_inbox inbox
      where inbox.id = inbox_id
        and inbox.player_id = (select auth.uid())
    )
  );

create policy "players can read their own reward receipts"
  on public.reward_receipts for select to authenticated
  using ((select auth.uid()) = player_id);

create policy "players can read their own reward receipt entries"
  on public.reward_receipt_entries for select to authenticated
  using (
    exists (
      select 1
      from public.reward_receipts receipt
      where receipt.id = receipt_id
        and receipt.player_id = (select auth.uid())
    )
  );

-- Tables are not client API surfaces. Owner reads and the sole client mutation
-- are exposed as narrow security-definer RPCs below.
revoke all on table public.reward_inbox from public, anon, authenticated;
revoke all on table public.reward_inbox_entries from public, anon, authenticated;
revoke all on table public.reward_receipts from public, anon, authenticated;
revoke all on table public.reward_receipt_entries from public, anon, authenticated;
revoke all on table public.reward_claim_requests from public, anon, authenticated;

create or replace function public.prevent_reward_receipt_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'reward receipts are immutable' using errcode = '55000';
end;
$$;

create trigger reward_receipts_immutable
before update or delete on public.reward_receipts
for each row execute function public.prevent_reward_receipt_mutation();

create trigger reward_receipt_entries_immutable
before update or delete on public.reward_receipt_entries
for each row execute function public.prevent_reward_receipt_mutation();

-- Server-only delivery boundary. A trusted server rule supplies the player and
-- payload; authenticated clients cannot call this function or write its tables.
create or replace function public.enqueue_player_reward(
  p_player_id uuid,
  p_delivery_request_id uuid,
  p_entries jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inbox_id uuid;
begin
  if p_player_id is null or p_delivery_request_id is null then
    raise exception 'player and delivery request are required' using errcode = '22023';
  end if;

  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) = 0 then
    raise exception 'reward entries must be a non-empty array' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('reward-delivery:' || p_player_id::text || ':' || p_delivery_request_id::text, 0)
  );

  select inbox.id into v_inbox_id
  from public.reward_inbox inbox
  where inbox.player_id = p_player_id
    and inbox.delivery_request_id = p_delivery_request_id;

  if v_inbox_id is not null then
    return v_inbox_id;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_entries) entry
    where jsonb_typeof(entry) <> 'object'
      or nullif(btrim(entry ->> 'asset_kind'), '') is null
      or char_length(btrim(entry ->> 'asset_kind')) > 64
      or nullif(btrim(entry ->> 'asset_key'), '') is null
      or char_length(btrim(entry ->> 'asset_key')) > 160
      or (entry ->> 'quantity') is null
      or (entry ->> 'quantity') !~ '^[1-9][0-9]*$'
      or (entry ->> 'quantity')::numeric > 9223372036854775807
  ) then
    raise exception 'invalid reward entry' using errcode = '22023';
  end if;

  insert into public.reward_inbox (player_id, delivery_request_id)
  values (p_player_id, p_delivery_request_id)
  returning id into v_inbox_id;

  insert into public.reward_inbox_entries (
    inbox_id,
    entry_index,
    asset_kind,
    asset_key,
    quantity
  )
  select v_inbox_id,
         (entry.ordinality - 1)::integer,
         btrim(entry.value ->> 'asset_kind'),
         btrim(entry.value ->> 'asset_key'),
         (entry.value ->> 'quantity')::bigint
  from jsonb_array_elements(p_entries) with ordinality as entry(value, ordinality);

  return v_inbox_id;
end;
$$;

create or replace function public.get_current_player_reward_inbox()
returns table (
  inbox_id uuid,
  state text,
  created_at timestamptz,
  claimed_at timestamptz,
  entries jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select inbox.id,
         inbox.state,
         inbox.created_at,
         inbox.claimed_at,
         coalesce(
           jsonb_agg(
             jsonb_build_object(
               'asset_kind', entry.asset_kind,
               'asset_key', entry.asset_key,
               'quantity', entry.quantity
             ) order by entry.entry_index
           ) filter (where entry.inbox_id is not null),
           '[]'::jsonb
         )
  from public.reward_inbox inbox
  left join public.reward_inbox_entries entry on entry.inbox_id = inbox.id
  where inbox.player_id = auth.uid()
  group by inbox.id
  order by inbox.created_at, inbox.id;
$$;

create or replace function public.get_current_player_reward_receipts()
returns table (
  receipt_id uuid,
  inbox_id uuid,
  request_id uuid,
  created_at timestamptz,
  entries jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select receipt.id,
         receipt.inbox_id,
         receipt.request_id,
         receipt.created_at,
         coalesce(
           jsonb_agg(
             jsonb_build_object(
               'asset_kind', entry.asset_kind,
               'asset_key', entry.asset_key,
               'quantity', entry.quantity
             ) order by entry.entry_index
           ) filter (where entry.receipt_id is not null),
           '[]'::jsonb
         )
  from public.reward_receipts receipt
  left join public.reward_receipt_entries entry on entry.receipt_id = receipt.id
  where receipt.player_id = auth.uid()
  group by receipt.id
  order by receipt.created_at desc, receipt.id desc;
$$;

create or replace function public.claim_current_player_reward(
  p_inbox_id uuid,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := auth.uid();
  v_request public.reward_claim_requests;
  v_inbox public.reward_inbox;
  v_receipt_id uuid;
  v_result jsonb;
begin
  if v_player_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_inbox_id is null or p_request_id is null then
    raise exception 'inbox and request are required' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('reward-claim:' || v_player_id::text || ':' || p_request_id::text, 0)
  );

  select request.* into v_request
  from public.reward_claim_requests request
  where request.player_id = v_player_id
    and request.request_id = p_request_id;

  if v_request.receipt_id is not null then
    if v_request.inbox_id <> p_inbox_id then
      raise exception 'request ID was already used for another inbox' using errcode = '22023';
    end if;

    select jsonb_build_object(
      'receipt_id', receipt.id,
      'inbox_id', receipt.inbox_id,
      'request_id', receipt.request_id,
      'created_at', receipt.created_at,
      'entries', coalesce(
        jsonb_agg(
          jsonb_build_object(
            'asset_kind', entry.asset_kind,
            'asset_key', entry.asset_key,
            'quantity', entry.quantity
          ) order by entry.entry_index
        ) filter (where entry.receipt_id is not null),
        '[]'::jsonb
      )
    ) into v_result
    from public.reward_receipts receipt
    left join public.reward_receipt_entries entry on entry.receipt_id = receipt.id
    where receipt.id = v_request.receipt_id
    group by receipt.id;

    return v_result;
  end if;

  select inbox.* into v_inbox
  from public.reward_inbox inbox
  where inbox.id = p_inbox_id
    and inbox.player_id = v_player_id
  for update;

  if v_inbox.id is null then
    raise exception 'reward inbox entry not found' using errcode = 'P0002';
  end if;

  if v_inbox.state <> 'pending' then
    raise exception 'reward inbox entry was already claimed' using errcode = '55000';
  end if;

  insert into public.player_inventory (player_id, asset_kind, asset_key, quantity)
  select v_player_id,
         entry.asset_kind,
         entry.asset_key,
         sum(entry.quantity)
  from public.reward_inbox_entries entry
  where entry.inbox_id = v_inbox.id
  group by entry.asset_kind, entry.asset_key
  on conflict (player_id, asset_kind, asset_key) do update
  set quantity = public.player_inventory.quantity + excluded.quantity,
      updated_at = timezone('utc', now());

  insert into public.reward_receipts (player_id, inbox_id, request_id)
  values (v_player_id, v_inbox.id, p_request_id)
  returning id into v_receipt_id;

  insert into public.reward_receipt_entries (
    receipt_id,
    entry_index,
    asset_kind,
    asset_key,
    quantity
  )
  select v_receipt_id,
         entry.entry_index,
         entry.asset_kind,
         entry.asset_key,
         entry.quantity
  from public.reward_inbox_entries entry
  where entry.inbox_id = v_inbox.id
  order by entry.entry_index;

  update public.reward_inbox
  set state = 'claimed',
      claimed_at = timezone('utc', now())
  where id = v_inbox.id;

  insert into public.reward_claim_requests (player_id, request_id, inbox_id, receipt_id)
  values (v_player_id, p_request_id, v_inbox.id, v_receipt_id);

  select jsonb_build_object(
    'receipt_id', receipt.id,
    'inbox_id', receipt.inbox_id,
    'request_id', receipt.request_id,
    'created_at', receipt.created_at,
    'entries', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'asset_kind', entry.asset_kind,
          'asset_key', entry.asset_key,
          'quantity', entry.quantity
        ) order by entry.entry_index
      ),
      '[]'::jsonb
    )
  ) into v_result
  from public.reward_receipts receipt
  join public.reward_receipt_entries entry on entry.receipt_id = receipt.id
  where receipt.id = v_receipt_id
  group by receipt.id;

  return v_result;
end;
$$;

revoke all on function public.prevent_reward_receipt_mutation() from public, anon, authenticated;
revoke all on function public.enqueue_player_reward(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.get_current_player_reward_inbox() from public, anon;
revoke all on function public.get_current_player_reward_receipts() from public, anon;
revoke all on function public.claim_current_player_reward(uuid, uuid) from public, anon;

grant execute on function public.enqueue_player_reward(uuid, uuid, jsonb) to service_role;
grant execute on function public.get_current_player_reward_inbox() to authenticated;
grant execute on function public.get_current_player_reward_receipts() to authenticated;
grant execute on function public.claim_current_player_reward(uuid, uuid) to authenticated;
