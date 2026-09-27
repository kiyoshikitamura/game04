begin;
do $$
declare a uuid:='e6e9a324-0dfb-4042-b490-6e0a1ebc056c'; b uuid:='c2c1d890-2d72-4afd-86b3-d638c1c222e2'; t timestamptz:=clock_timestamp()-interval '5 seconds'; dm uuid; r jsonb;
begin
 if (select count(*) from public.users where (id=a and username='UI検証A') or (id=b and username='UI検証B'))<>2 then raise exception 'QA guard';end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 insert into public.chat_read_states(user_id,target_type,target_id,last_read_at) values(a,'GLOBAL','00000000-0000-0000-0000-000000000000',t) on conflict(user_id,target_type,target_id) do update set last_read_at=t;
 insert into public.board_posts(user_id,author_id,author_name,content,target_type,created_at) values(b,b,'UI検証B','未読検証・rollback専用','GLOBAL',t+interval '1 second'),(a,a,'UI検証A','自分の投稿・rollback専用','GLOBAL',t+interval '2 seconds'),(b,b,'UI検証B','後着・rollback専用','GLOBAL',t+interval '3 seconds');
 r:=public.get_chat_unread_counts();if (r->>'GLOBAL')::int<>2 then raise exception 'self counted or unread missing: %',r;end if;
 insert into public.direct_messages(sender_id,recipient_id,message) values(b,a,'DM未読検証・rollback専用') returning id into dm;
 perform public.game04_mark_chat_channel_seen('GLOBAL',t+interval '1 second');
 r:=public.get_chat_unread_counts();if (r->>'GLOBAL')::int<>1 then raise exception 'unseen arrival swallowed';end if;
 if (select is_read from public.direct_messages where id=dm) then raise exception 'global read marked DM';end if;
 perform public.mark_direct_message_read(dm);
 r:=public.get_chat_unread_counts();if (r->>'GLOBAL')::int<>1 then raise exception 'DM read marked global';end if;
 perform public.game04_mark_chat_channel_seen('GLOBAL',t+interval '3 seconds');
 r:=public.get_chat_unread_counts();if (r->>'GLOBAL')::int<>0 then raise exception 'read did not clear';end if;
 perform public.game04_mark_chat_channel_seen('GLOBAL',t+interval '1 second');
 r:=public.get_chat_unread_counts();if (r->>'GLOBAL')::int<>0 then raise exception 'position regressed';end if;
end $$;
rollback;
select 'PASS: dedicated QA A/B global + DM, own-send excluded, independent tabs, later arrivals retained, monotonic read position, refetch. Rolled back; no message published.' result;
