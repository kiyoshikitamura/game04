-- Catalog-level acceptance for the GAME04 inventory boundary.
-- Run after 20260902000003_inventory_core.sql.

do $$
begin
  if to_regclass('public.player_inventory') is null then
    raise exception 'player_inventory table is missing';
  end if;

  if to_regprocedure('public.get_current_player_inventory()') is null then
    raise exception 'inventory projection RPC is missing';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.get_current_player_inventory()',
    'EXECUTE'
  ) then
    raise exception 'authenticated cannot execute inventory projection';
  end if;

  if has_table_privilege('authenticated', 'public.player_inventory', 'SELECT')
    or has_table_privilege('authenticated', 'public.player_inventory', 'INSERT')
    or has_table_privilege('authenticated', 'public.player_inventory', 'UPDATE')
    or has_table_privilege('authenticated', 'public.player_inventory', 'DELETE') then
    raise exception 'player_inventory exposes direct client table privileges';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'player_inventory'
      and policyname = 'players can read their own inventory'
      and roles = array['authenticated']::name[]
      and cmd = 'SELECT'
  ) then
    raise exception 'owner-read inventory policy is missing';
  end if;
end;
$$;
