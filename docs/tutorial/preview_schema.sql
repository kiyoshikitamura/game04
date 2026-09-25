-- GAME04 dev only. Review snapshots are never imported into gameplay tables.
create table if not exists public.game04_tutorial_preview_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null default 0 check (revision >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.game04_tutorial_preview_states enable row level security;
revoke all on public.game04_tutorial_preview_states from anon, authenticated;
grant select, insert, update on public.game04_tutorial_preview_states to authenticated;
create policy tutorial_preview_select on public.game04_tutorial_preview_states for select to authenticated using ((select auth.uid()) = user_id);
create policy tutorial_preview_insert on public.game04_tutorial_preview_states for insert to authenticated with check ((select auth.uid()) = user_id);
create policy tutorial_preview_update on public.game04_tutorial_preview_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
comment on table public.game04_tutorial_preview_states is 'Isolated tutorial review snapshots; owner editable, no production rewards or wallet authority.';
