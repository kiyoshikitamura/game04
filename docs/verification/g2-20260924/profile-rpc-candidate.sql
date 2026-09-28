-- Parent-owned limited development DB change. No table grants or asset migration.
-- Existing daily-change and maintenance triggers continue to run.
create or replace function private.game04_update_own_profile(
  p_username text default null,
  p_bio text default null,
  p_title_id text default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_user public.users%rowtype;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  select * into v_user from public.users where id=v_uid for update;
  if not found then raise exception 'player profile not found' using errcode='P0002'; end if;
  if p_username is not null and (char_length(btrim(p_username))<1 or char_length(btrim(p_username))>8) then
    raise exception 'Username must be between 1 and 8 characters' using errcode='22023';
  end if;
  if p_bio is not null and char_length(btrim(p_bio))>200 then
    raise exception 'Bio must be 200 characters or fewer' using errcode='22023';
  end if;
  if p_title_id is not null and p_title_id is distinct from v_user.title_equipped
    and not exists (select 1 from public.user_titles where user_id=v_uid and title_id=p_title_id) then
    raise exception 'Title is not owned' using errcode='42501';
  end if;
  if p_title_id is not null and p_title_id is distinct from v_user.title_equipped then
    update public.users set title_equipped=p_title_id where id=v_uid;
  end if;
  update public.users set
    username=case when p_username is null then username else btrim(p_username) end,
    bio=case when p_bio is null then bio else btrim(p_bio) end
  where id=v_uid returning * into v_user;
  return jsonb_build_object('id',v_user.id,'username',v_user.username,'bio',v_user.bio,'title',v_user.title_equipped);
end;
$$;
revoke all on function private.game04_update_own_profile(text,text,text) from public,anon;
grant execute on function private.game04_update_own_profile(text,text,text) to authenticated;
create or replace function public.game04_update_own_profile(
 p_username text default null,p_bio text default null,p_title_id text default null
) returns jsonb language sql security invoker set search_path = ''
as $$ select private.game04_update_own_profile(p_username,p_bio,p_title_id) $$;
revoke all on function public.game04_update_own_profile(text,text,text) from public,anon;
grant execute on function public.game04_update_own_profile(text,text,text) to authenticated;
