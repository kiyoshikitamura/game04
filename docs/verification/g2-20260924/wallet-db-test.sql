begin;
select set_config('request.jwt.claim.sub','b9003819-973a-47b2-a1ef-9e503c60bb7b',true);
do $test$
declare uid uuid:='b9003819-973a-47b2-a1ef-9e503c60bb7b'; s jsonb; a jsonb; r jsonb; rid uuid:=gen_random_uuid(); before_balance integer;
begin
 if not exists(select 1 from public.users where id=uid and username='G2QA独立E') then raise exception 'QA_USER_MISMATCH'; end if;
 s:=public.game04_get_growth_state(uid);
 if (s->>'energyMax')::int<>100 then raise exception 'ENERGY_MAX';end if;
 before_balance:=(s->>'diamonds')::int;
 a:=jsonb_set(jsonb_set(s,'{diamonds}',to_jsonb(before_balance-50)),'{energyDrinks}',to_jsonb(coalesce((s->>'energyDrinks')::int,0)+1));
 r:=public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,a,before_balance,50,0,rid);
 if (r#>>'{state,diamonds}')::int<>before_balance-50 then raise exception 'DEBIT_FAILED';end if;
 perform public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,a,before_balance,50,0,rid);
 if (select neon_diamonds from public.users where id=uid)<>before_balance-50 then raise exception 'DUPLICATE_DEBIT';end if;
 begin
  perform public.game04_commit_shop_exchange(uid,-1,jsonb_set(a,'{diamonds}',to_jsonb(before_balance-100)),before_balance-50,50,0,gen_random_uuid());
  raise exception 'CONFLICT_NOT_REJECTED';
 exception when serialization_failure then null;
 
 end;
 if (select neon_diamonds from public.users where id=uid)<>before_balance-50 then raise exception 'FAILED_DEBIT';end if;
 update public.users set vitality=99,vitality_last_recovered_at=now()-interval '299 seconds' where id=uid;
 s:=public.game04_get_growth_state(uid);if (s->>'energy')::int<>99 then raise exception 'RECOVERY_EARLY';end if;
 update public.users set vitality_last_recovered_at=now()-interval '300 seconds' where id=uid;
 s:=public.game04_get_growth_state(uid);if (s->>'energy')::int<>100 then raise exception 'RECOVERY_LATE';end if;
 update public.users set vitality=149 where id=uid;
 s:=public.game04_get_growth_state(uid);if (s->>'energy')::int<>149 then raise exception 'OVERFLOW_CLIPPED';end if;
 perform public.game04_update_own_profile(null,'G2 rollback-only profile test',null);
 if (select bio from public.users where id=uid)<>'G2 rollback-only profile test' then raise exception 'PROFILE_SAVE';end if;
end $test$;
select 'PASS: atomic exchange, retry, failed debit rollback, 299/300s recovery, overflow, self profile. All QA changes rolled back.' as result;
rollback;