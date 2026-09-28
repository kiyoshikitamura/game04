-- Disabled campaign by default. New game profiles do not depend on a home visit.
create function public.game04_release_new_player() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform public.game04_grant_release_campaign(new.id);
 return new;
end $$;
revoke all on function public.game04_release_new_player() from public,anon,authenticated;
create trigger game04_release_new_player after insert on public.users
for each row execute function public.game04_release_new_player();
