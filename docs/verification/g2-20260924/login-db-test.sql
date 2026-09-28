begin;
do $test$
declare uid uuid:='b9003819-973a-47b2-a1ef-9e503c60bb7b'; s jsonb; r jsonb; a jsonb; target integer; before_cash bigint; before_gems bigint; before_soul integer; previous_total integer; prev_version bigint;
begin
if not exists(select 1 from public.users where id=uid and username='G2QA独立E') then raise exception 'QA_USER_MISMATCH';end if;
foreach target in array array[3,5,7,30] loop
 insert into public.user_login_bonuses(user_id,current_day,total_logins,last_claimed_at) values(uid,target-1,target-1,now()-interval '2 days') on conflict(user_id) do update set current_day=target-1,last_claimed_at=now()-interval '2 days';
 select cash,neon_diamonds into before_cash,before_gems from public.users where id=uid;
 s:=public.game04_get_growth_state(uid); before_soul:=coalesce((s#>>'{souls,char_reiji_01}')::int,0);
 r:=public.game04_process_login_bonus(uid);
 if not coalesce((r->>'claimed')::boolean,false) or (r->>'day_number')::int<>target then raise exception 'BAD_DAY %',target;end if;
 a:=public.game04_get_growth_state(uid);
 if (a->>'cash')::bigint<>before_cash+10000 or (a#>>'{souls,char_reiji_01}')::int<>before_soul+2 then raise exception 'BASE_REWARDS %',target;end if;
 if (a->>'diamonds')::bigint<>before_gems+(case when target=7 then 100 else 0 end) then raise exception 'GEMS %',target;end if;
 if target=3 and (a#>>'{growthInventory,expItems,character,large}')::int<>coalesce((s#>>'{growthInventory,expItems,character,large}')::int,0)+1 then raise exception 'EXP';end if;
 if target=5 and (a#>>'{questTicketGrants,SPECIAL_TICKET_CHARACTER}')::int<>coalesce((s#>>'{questTicketGrants,SPECIAL_TICKET_CHARACTER}')::int,0)+1 then raise exception 'TICKET';end if;
 if target=30 and (a#>>'{questTicketGrants,SPECIAL_TICKET_EQUIPMENT}')::int<>coalesce((s#>>'{questTicketGrants,SPECIAL_TICKET_EQUIPMENT}')::int,0)+1 then raise exception 'DAY30';end if;
 prev_version:=(a->>'version')::bigint;
 r:=public.game04_process_login_bonus(uid);
 if (r->>'claimed')::boolean or (public.game04_get_session_state(uid)->>'version')::bigint<>prev_version then raise exception 'DUPLICATE %',target;end if;
end loop;
end $test$;
select 'PASS: formal login days3/5/7/30 rewards, receipt, same-day/session replay. QA transaction rolled back.' as result;
rollback;