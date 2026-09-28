-- Preserve existing chat_read_states. Advance only to a successfully loaded message,
-- not the current clock (which can swallow messages arriving during a slow read).
create or replace function public.game04_mark_chat_channel_seen(p_target_type text,p_seen_at timestamptz) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); target uuid:='00000000-0000-0000-0000-000000000000';
begin
 if uid is null then raise exception 'Authentication required';end if;
 if p_target_type not in ('GLOBAL','GUILD') or p_seen_at is null or p_seen_at>clock_timestamp() then raise exception 'Invalid read position';end if;
 if p_target_type='GUILD' then select guild_id into target from public.guild_members where user_id=uid; if target is null then raise exception 'Guild membership required';end if;end if;
 if not exists(select 1 from public.board_posts where target_type=p_target_type and (p_target_type='GLOBAL' or target_id=target) and created_at=p_seen_at) then return;end if;
 insert into public.chat_read_states(user_id,target_type,target_id,last_read_at) values(uid,p_target_type,target,p_seen_at)
 on conflict(user_id,target_type,target_id) do update set last_read_at=greatest(public.chat_read_states.last_read_at,excluded.last_read_at);
end $$;
revoke all on function public.game04_mark_chat_channel_seen(text,timestamptz) from public,anon;
grant execute on function public.game04_mark_chat_channel_seen(text,timestamptz) to authenticated;
