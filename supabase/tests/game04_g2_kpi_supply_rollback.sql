-- Parent only: GAME04 dev after game04_g2_kpi_supply.sql. Dedicated QA only, ROLLBACK mandatory.
-- SQL fixture/ledger acceptance, not UI claim or real purchase acceptance.
begin;
do $$
declare uid uuid:='d6dabf02-3eb2-430e-8352-561f8d735469'; r jsonb; n bigint;
 stamp timestamptz:=statement_timestamp(); from_at timestamptz:=statement_timestamp()-interval '1 second';
 to_at timestamptz:=statement_timestamp()+interval '1 minute'; pid uuid:=gen_random_uuid();
begin
 if not exists(select 1 from public.game04_player_state where user_id=uid) then raise exception 'Dedicated QA missing';end if;
 if has_function_privilege('anon','public.game04_kpi_supply_daily(timestamptz,timestamptz)','EXECUTE')
  or has_function_privilege('authenticated','public.game04_kpi_supply_daily(timestamptz,timestamptz)','EXECUTE')
  or has_table_privilege('authenticated','public.game04_login_deliveries','INSERT') then raise exception 'Public privilege leak';end if;
 -- Reset only today's measurement fixture and last-access marker within this rollback.
 perform 1 from public.users where id=uid for update;
 delete from public.game04_login_deliveries where user_id=uid and login_date=(stamp at time zone 'Asia/Tokyo')::date;
 update public.user_login_bonuses set last_claimed_at=stamp-interval '1 day' where user_id=uid;
 r:=public.game04_process_login_bonus(uid);
 if r->>'claimed' is distinct from 'true' then raise exception 'Formal producer did not grant';end if;
 select count(*) into n from public.game04_login_deliveries where user_id=uid and login_date=(stamp at time zone 'Asia/Tokyo')::date;
 if n<>1 then raise exception 'Login capture expected 1, got %',n;end if;
 r:=public.game04_process_login_bonus(uid);
 if r->>'already_claimed' is distinct from 'true' then raise exception 'Repeated login was not rejected';end if;
 update public.user_login_bonuses set total_logins=total_logins where user_id=uid;
 select count(*) into n from public.game04_login_deliveries where user_id=uid and login_date=(stamp at time zone 'Asia/Tokyo')::date;
 if n<>1 then raise exception 'Repeated login duplicated history';end if;
 -- QA source must be excluded even when subject classification is missing.
 insert into public.presents(id,user_id,item_id,quantity,status,claimed_at,expire_at,source_kind,source_metadata)
 values(pid,uid,'ENERGY_DRINK',3,'CLAIMED',stamp,stamp+interval '1 day','GAME04_QA',
 '{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free"}');
 select coalesce(sum(event_count),0) into n from public.game04_kpi_supply_daily(from_at,to_at)
 where action='present_claim' and classification='excluded' and reward_id='ENERGY_DRINK';
 if n<1 then raise exception 'QA present omitted or included incorrectly';end if;
 -- Compare exact fixture contribution rather than assuming unrelated event counts are zero.
 delete from public.presents where id=pid;
 if n-1<>(select coalesce(sum(event_count),0) from public.game04_kpi_supply_daily(from_at,to_at)
  where action='present_claim' and classification='excluded' and reward_id='ENERGY_DRINK') then
  raise exception 'Present claim not counted exactly once';end if;
 insert into public.presents(id,user_id,item_id,quantity,status,claimed_at,expire_at,source_kind,source_metadata)
 values(pid,uid,'ENERGY_DRINK',3,'CLAIMED',stamp,stamp-interval '1 second','GAME04_QA',
 '{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free"}');
 if n-1<>(select coalesce(sum(event_count),0) from public.game04_kpi_supply_daily(from_at,to_at)
  where action='present_claim' and classification='excluded' and reward_id='ENERGY_DRINK') then
  raise exception 'Expired-at-claim fixture counted';end if;
 begin
  perform public.game04_kpi_supply_daily(to_at,from_at);
  raise exception 'Invalid range accepted';
 exception when others then
  if sqlerrm<>'Invalid measurement range' then raise;end if;
 end;
 raise notice 'PASS: formal login capture/repeat, QA present exact count/expiry, role restrictions, range. ROLLBACK follows.';
end $$;
rollback;
