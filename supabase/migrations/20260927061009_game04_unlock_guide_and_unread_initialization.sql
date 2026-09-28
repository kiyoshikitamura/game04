-- Only the isolated GAME04 Preview receives this migration in this task.
create table public.game04_territory_guide (user_id uuid primary key references public.users(id) on delete cascade, shown_at timestamptz, reservation uuid, reserved_until timestamptz);
alter table public.game04_territory_guide enable row level security;
revoke all on public.game04_territory_guide from anon,authenticated;
create function public.game04_territory_guide(p_visit uuid,p_action text default 'reserve') returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); r public.game04_territory_guide;
begin
 if uid is null then raise exception 'Authentication required';end if;
 if p_action not in ('reserve','shown','release') then raise exception 'Invalid action';end if;
 if not exists(select 1 from public.game04_player_state where user_id=uid and state->'clearedStages' ? 'mino-5') then return '{}'::jsonb;end if;
 insert into public.game04_territory_guide(user_id) values(uid) on conflict do nothing;
 select * into r from public.game04_territory_guide where user_id=uid for update;
 if p_action='release' then update public.game04_territory_guide set reservation=null,reserved_until=null where user_id=uid and reservation=p_visit;return '{}'::jsonb;end if;
 if p_action='shown' then
  if r.shown_at is not null then return '{"recorded":true}'::jsonb;end if;
  if r.reservation=p_visit then update public.game04_territory_guide set shown_at=statement_timestamp(),reservation=null,reserved_until=null where user_id=uid;return '{"recorded":true}'::jsonb;end if;
  return '{}'::jsonb;
 end if;
 if r.shown_at is not null or (r.reservation is not null and r.reservation<>p_visit and r.reserved_until>statement_timestamp()) then return '{}'::jsonb;end if;
 update public.game04_territory_guide set reservation=p_visit,reserved_until=statement_timestamp()+interval '90 seconds' where user_id=uid;
 return '{"show":true}'::jsonb;
end $$;
revoke all on function public.game04_territory_guide(uuid,text) from public,anon;
grant execute on function public.game04_territory_guide(uuid,text) to authenticated;
-- Count is read-only. The first count must not consume unread messages.
create or replace function public.get_chat_unread_counts() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); gid uuid; joined timestamptz; n integer; g integer:=0;
begin
 if uid is null then raise exception 'Authentication required';end if;
 select coalesce(created_at,'epoch'::timestamptz) into joined from public.users where id=uid;
 select count(*)::integer into n from public.board_posts where target_type='GLOBAL' and created_at>coalesce((select last_read_at from public.chat_read_states where user_id=uid and target_type='GLOBAL' and target_id='00000000-0000-0000-0000-000000000000'),joined,'epoch'::timestamptz) and coalesce(user_id,author_id) is distinct from uid;
 select guild_id into gid from public.guild_members where user_id=uid;
 if gid is not null then select count(*)::integer into g from public.board_posts where target_type='GUILD' and target_id=gid and created_at>coalesce((select last_read_at from public.chat_read_states where user_id=uid and target_type='GUILD' and target_id=gid),joined,'epoch'::timestamptz) and coalesce(user_id,author_id) is distinct from uid;end if;
 return jsonb_build_object('GLOBAL',n,'GUILD',g);
end $$;
revoke all on function public.get_chat_unread_counts() from public,anon;
grant execute on function public.get_chat_unread_counts() to authenticated;
