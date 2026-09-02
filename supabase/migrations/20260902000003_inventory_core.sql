-- GAME04 Common Game Core: product-neutral inventory ownership.
-- Reference patterns: TRIBE NEON accepted commit
-- 826f8b770f36a6f6844d920b0adcd2853188b91d.
-- This migration intentionally defines no character, equipment, item, rarity,
-- economy, growth, duplicate, gacha, or presentation rules.

create table if not exists public.player_inventory (
  player_id uuid not null references public.players(id) on delete cascade,
  asset_kind text not null,
  asset_key text not null,
  quantity bigint not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (player_id, asset_kind, asset_key),
  constraint player_inventory_asset_kind_present
    check (asset_kind = btrim(asset_kind) and char_length(asset_kind) between 1 and 64),
  constraint player_inventory_asset_key_present
    check (asset_key = btrim(asset_key) and char_length(asset_key) between 1 and 160),
  constraint player_inventory_positive_quantity
    check (quantity > 0)
);

alter table public.player_inventory enable row level security;

create policy "players can read their own inventory"
  on public.player_inventory for select to authenticated
  using ((select auth.uid()) = player_id);

-- The table is not a client mutation surface. A future reward transaction will
-- own all grants and consumption, including its idempotency boundary.
revoke all on table public.player_inventory from public, anon, authenticated;

create or replace function public.get_current_player_inventory()
returns table (
  asset_kind text,
  asset_key text,
  quantity bigint,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select inventory.asset_kind,
         inventory.asset_key,
         inventory.quantity,
         inventory.updated_at
  from public.player_inventory inventory
  where inventory.player_id = auth.uid()
  order by inventory.asset_kind, inventory.asset_key;
$$;

revoke all on function public.get_current_player_inventory() from public, anon;
grant execute on function public.get_current_player_inventory() to authenticated;
