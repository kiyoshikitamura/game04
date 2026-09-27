-- Synthetic identities only, no Google login claim; every fixture row is rolled back.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
do $test$
declare qa uuid:=extensions.gen_random_uuid(); oldqa uuid:=extensions.gen_random_uuid();
 r jsonb; rejected boolean; evidence jsonb:='[]'; gift uuid;
begin
 begin
  if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT';end if;
  insert into auth.users(id,is_anonymous) values(qa,true),(oldqa,false);
  insert into public.users(id,username,neon_diamonds,cash) values
   (qa,left(replace(qa::text,'-',''),8),700,1200),(oldqa,left(replace(oldqa::text,'-',''),8),800,1400);
  insert into public.game04_player_state(user_id,state) values
   (qa,'{"progress":"keep","deck":["a"],"items":{"keep":2}}'),(oldqa,'{"existing":"keep"}');
  perform set_config('request.jwt.claim.sub',qa::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa,'role','authenticated','is_anonymous',true)::text,true);
  r:=public.game04_auth_binding(false);
  if (r->>'linked')::boolean then raise exception 'ANON_LINKED';end if;
  rejected:=false;
  begin perform public.game04_auth_binding(true);exception when others then if SQLERRM<>'VERIFIED_IDENTITY_REQUIRED' then raise;end if;rejected:=true;end;
  if not rejected or exists(select 1 from public.account_authentication_reward_grants where user_id=qa) then raise exception 'ANON_REWARDED';end if;
  evidence:=evidence||jsonb_build_array('anonymous status is readable; finalize rejected; no reward');
  update auth.users set is_anonymous=false where id=qa;
  insert into auth.identities(provider_id,user_id,identity_data,provider) values(qa::text,qa,jsonb_build_object('sub',qa),'google');
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa,'role','authenticated','is_anonymous',false)::text,true);
  r:=public.game04_auth_binding(false);
  if (r->>'linked')::boolean or (select neon_diamonds from public.users where id=qa)<>700 then raise exception 'READ_MUTATED';end if;
  r:=public.game04_auth_binding(true);
  if not (r->>'linked')::boolean or not (r->>'rewardGranted')::boolean or r->>'userId'<>qa::text or
   (select neon_diamonds from public.users where id=qa)<>1000 or
   (select cash from public.users where id=qa)<>1200 or
   (select state from public.game04_player_state where user_id=qa)<>'{"progress":"keep","deck":["a"],"items":{"keep":2}}'::jsonb
   then raise exception 'FIRST_AUTH_STORAGE_MISMATCH';end if;
  if exists(select 1 from public.billing_asset_lots where user_id=qa) or exists(select 1 from public.presents where user_id=qa) then raise exception 'DIRECT_NOT_FREE';end if;
  evidence:=evidence||jsonb_build_array('same UID finalization grants direct free300; progress/deck/items/cash unchanged');
  r:=public.game04_auth_binding(true);r:=public.game04_auth_binding(false);
  if (select neon_diamonds from public.users where id=qa)<>1000 or
   (select count(*) from public.account_authentication_reward_grants where user_id=qa)<>1 or
   public.game04_grant_auth_reward(qa,'PRESENT') then raise exception 'RELOGIN_DUPLICATED';end if;
  evidence:=evidence||jsonb_build_array('repeat finalization/session read and BOX path cannot duplicate direct reward');
  insert into auth.identities(provider_id,user_id,identity_data,provider) values(qa::text,qa,jsonb_build_object('sub',qa),'email');
  rejected:=false;
  begin perform public.game04_auth_binding(true);exception when others then if SQLERRM<>'SINGLE_IDENTITY_REQUIRED' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'MULTIPROVIDER_ACCEPTED';end if;
  delete from auth.identities where user_id=qa and provider='email';
  update public.user_account_auth_methods set auth_method='EMAIL' where user_id=qa;
  rejected:=false;
  begin perform public.game04_auth_binding(true);exception when others then if SQLERRM<>'IDENTITY_CONFLICT' then raise;end if;rejected:=true;end;
  if not rejected or (select neon_diamonds from public.users where id=qa)<>1000 then raise exception 'CONFLICT_OVERWRITE';end if;
  evidence:=evidence||jsonb_build_array('multiple identities and mismatched method rejected without overwrite');
  insert into auth.identities(provider_id,user_id,identity_data,provider) values(oldqa::text,oldqa,jsonb_build_object('sub',oldqa),'google');
  insert into public.user_account_auth_methods(user_id,auth_method) values(oldqa,'GOOGLE');
  perform set_config('request.jwt.claim.sub',oldqa::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',oldqa,'role','authenticated')::text,true);
  r:=public.game04_auth_binding(true);r:=public.game04_auth_binding(true);
  select present_id into gift from public.account_authentication_reward_grants where user_id=oldqa;
  if gift is null or (select neon_diamonds from public.users where id=oldqa)<>800 or
   (select count(*) from public.presents where user_id=oldqa)<>1 or
   (select delivery_method from public.account_authentication_reward_grants where user_id=oldqa)<>'PRESENT'
  then raise exception 'EXISTING_ROUTE_MISMATCH';end if;
  perform public.claim_present(gift);r:=public.game04_auth_binding(true);
  if (select neon_diamonds from public.users where id=oldqa)<>1100 or
   (select state from public.game04_player_state where user_id=oldqa)<>'{"existing":"keep"}'::jsonb then raise exception 'EXISTING_CLAIM_MISMATCH';end if;
  evidence:=evidence||jsonb_build_array('existing bound user receives exactly one BOX300; claim and re-login retain balance/state');
  -- Fixture-only reset of this first user's binding to check transactional overflow rollback.
  delete from public.account_authentication_reward_grants where user_id=qa;
  delete from public.user_account_auth_methods where user_id=qa;
  update public.users set neon_diamonds=2147483647 where id=qa;
  perform set_config('request.jwt.claim.sub',qa::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa,'role','authenticated')::text,true);
  rejected:=false;
  begin perform public.game04_auth_binding(true);exception when others then if SQLERRM<>'INVENTORY_LIMIT' then raise;end if;rejected:=true;end;
  if not rejected or exists(select 1 from public.user_account_auth_methods where user_id=qa) or
   exists(select 1 from public.account_authentication_reward_grants where user_id=qa) then raise exception 'PARTIAL_COMMIT';end if;
  evidence:=evidence||jsonb_build_array('overflow rolls back binding and reward ledger atomically');
  update auth.identities set provider='email' where user_id=qa;
  r:=public.game04_auth_binding(false);
  rejected:=false;
  begin perform public.game04_auth_binding(true);exception when others then if SQLERRM<>'EMAIL_CONFIRMATION_AND_PASSWORD_REQUIRED' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'UNVERIFIED_EMAIL_ACCEPTED';end if;
  evidence:=evidence||jsonb_build_array('unconfirmed email cannot finalize or earn reward');
  raise exception using errcode='ZX001',message='rollback fixture';
 exception when sqlstate 'ZX001' then null;
 end;
 if exists(select 1 from auth.users where id in(qa,oldqa)) or exists(select 1 from public.users where id in(qa,oldqa)) then raise exception 'FIXTURE_NOT_ROLLED_BACK';end if;
 perform set_config('game04.auth_evidence',jsonb_build_object('status','PASS','checks',evidence,'fixtureRolledBack',true,'realGoogle',false)::text,true);
end $test$;
select current_setting('game04.auth_evidence')::jsonb as evidence;
commit;
