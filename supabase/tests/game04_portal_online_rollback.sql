-- Isolated preview only. Fixtures and Vault entry roll back together.
begin;
do $$
declare u uuid:=gen_random_uuid(); v uuid:=gen_random_uuid(); job jsonb; result jsonb; token text:=repeat('t',64); n integer;
begin
  if has_function_privilege('anon','public.game04_record_portal_activity()','execute') then raise exception 'anon activity access'; end if;
  if has_function_privilege('authenticated','public.game04_claim_portal_job(text,timestamptz)','execute') then raise exception 'public worker access'; end if;
  if has_table_privilege('authenticated','public.game04_portal_jobs','select') then raise exception 'public audit access'; end if;
  insert into auth.users(id,is_anonymous) values(u,true),(v,false);
  delete from game04_portal_private.activity;
  perform set_config('request.jwt.claim.sub',u::text,true);
  perform public.game04_record_portal_activity();
  perform public.game04_record_portal_activity();
  select count(*) into n from game04_portal_private.activity;
  if n<>1 then raise exception 'multiple operations/tabs did not dedupe'; end if;
  if not exists(select 1 from game04_portal_private.activity where user_id=u and last_operation_at between clock_timestamp()-interval '2 seconds' and clock_timestamp()) then raise exception 'anonymous/pre-profile activity absent'; end if;
  perform set_config('request.jwt.claim.sub',v::text,true);
  perform public.game04_record_portal_activity();
  update game04_portal_private.activity set last_operation_at=clock_timestamp()-interval '5 minutes 1 second' where user_id=v;
  perform vault.create_secret(token,'game04_portal_job_token');
  job:=public.game04_claim_portal_job(token,clock_timestamp());
  result:=public.game04_prepare_portal_attempt((job->>'id')::uuid,1);
  if result->>'status'<>'ready' or (result->>'online_count')::int<>1 then raise exception 'count/expiry failed: %',result; end if;
  result:=public.game04_claim_portal_job(token,clock_timestamp());
  if result->>'status'<>'duplicate' then raise exception 'duplicate claim accepted'; end if;
  result:=public.game04_claim_portal_job(token,clock_timestamp()-interval '1 minute');
  if result->>'status'<>'stale' then raise exception 'old job accepted'; end if;
  update game04_portal_private.activity set last_operation_at=clock_timestamp()-interval '5 minutes 1 second';
  update public.game04_portal_jobs set status='retry' where id=(job->>'id')::uuid;
  result:=public.game04_prepare_portal_attempt((job->>'id')::uuid,2);
  if (result->>'online_count')::int<>0 then raise exception 'normal zero not returned'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  begin
    perform public.game04_record_portal_activity();
    raise exception 'unauthenticated activity accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.game04_claim_portal_job(repeat('x',64),clock_timestamp());
    raise exception 'wrong job token accepted';
  exception when insufficient_privilege then null; end;
  raise notice 'PASS: identity/dedupe/anonymous/expiry/zero/job-auth/stale/duplicate/privileges';
end $$;
rollback;
