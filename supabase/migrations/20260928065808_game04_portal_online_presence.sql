-- Independent of DAU, registration and gameplay state. No polling triggers.
create schema if not exists game04_portal_private;
revoke all on schema game04_portal_private from public, anon, authenticated;
create table game04_portal_private.activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_operation_at timestamptz not null
);
alter table game04_portal_private.activity enable row level security;
create index activity_last_operation_idx on game04_portal_private.activity(last_operation_at);

create function public.game04_record_portal_activity() returns void
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'authentication required' using errcode='42501'; end if;
  insert into game04_portal_private.activity(user_id,last_operation_at)
    values(actor,clock_timestamp())
    on conflict(user_id) do update set last_operation_at=excluded.last_operation_at;
end $$;
revoke all on function public.game04_record_portal_activity() from public, anon;
grant execute on function public.game04_record_portal_activity() to authenticated;

create table public.game04_portal_jobs (
  id uuid primary key default gen_random_uuid(),
  slot timestamptz not null unique,
  scheduled_at timestamptz not null,
  created_at timestamptz not null default clock_timestamp(),
  finished_at timestamptz,
  status text not null default 'claimed',
  online_count bigint check(online_count >= 0),
  http_status integer,
  result text
);
create table public.game04_portal_attempts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.game04_portal_jobs(id),
  attempt integer not null check(attempt between 1 and 2),
  sent_at timestamptz not null,
  online_count bigint not null check(online_count >= 0),
  finished_at timestamptz,
  http_status integer,
  result text not null default 'sending',
  unique(job_id,attempt)
);
alter table public.game04_portal_jobs enable row level security;
alter table public.game04_portal_attempts enable row level security;
revoke all on public.game04_portal_jobs, public.game04_portal_attempts from public, anon, authenticated;
grant select,insert,update on public.game04_portal_jobs, public.game04_portal_attempts to service_role;

-- Only the job worker service role can call this. The internal credential stays
-- in Vault, generated independently per project by the production setup script.
create function public.game04_claim_portal_job(p_token text,p_scheduled_at timestamptz)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare expected text; job uuid; now_at timestamptz := clock_timestamp();
begin
  select decrypted_secret into expected from vault.decrypted_secrets where name='game04_portal_job_token';
  if expected is null or p_token is null or length(p_token)<32 or
    extensions.digest(p_token,'sha256') <> extensions.digest(expected,'sha256') then
    raise exception 'unauthorized job' using errcode='42501';
  end if;
  if p_scheduled_at is null or p_scheduled_at < now_at - interval '45 seconds'
    or p_scheduled_at > now_at + interval '5 seconds' then return jsonb_build_object('status','stale'); end if;
  insert into public.game04_portal_jobs(slot,scheduled_at)
    values(date_bin(interval '5 minutes',p_scheduled_at,timestamptz '2000-01-01'),p_scheduled_at)
    on conflict(slot) do nothing returning id into job;
  return jsonb_build_object('status',case when job is null then 'duplicate' else 'claimed' end,'id',job);
end $$;
revoke all on function public.game04_claim_portal_job(text,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_claim_portal_job(text,timestamptz) to service_role;

create function public.game04_prepare_portal_attempt(p_job_id uuid,p_attempt integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare job public.game04_portal_jobs; now_at timestamptz := clock_timestamp(); n bigint; attempt_id uuid;
begin
  select * into job from public.game04_portal_jobs where id=p_job_id for update;
  if job.id is null or job.status not in ('claimed','retry') or p_attempt not between 1 and 2 then
    return jsonb_build_object('status','rejected');
  end if;
  if now_at > job.scheduled_at + interval '45 seconds' then
    update public.game04_portal_jobs set status='failed',result='stale',finished_at=now_at where id=job.id;
    return jsonb_build_object('status','stale');
  end if;
  -- Inclusive five-minute cutoff. PK deduplicates operations/tabs; anonymous
  -- auth users and users without a gameplay profile are intentionally included.
  begin
    select count(*) into n from game04_portal_private.activity
      where last_operation_at >= now_at - interval '5 minutes' and last_operation_at <= now_at;
  exception when others then
    update public.game04_portal_jobs set status='failed',result='aggregation_failed',finished_at=now_at where id=job.id;
    return jsonb_build_object('status','aggregation_failed');
  end;
  insert into public.game04_portal_attempts(job_id,attempt,sent_at,online_count)
    values(job.id,p_attempt,now_at,n) returning id into attempt_id;
  update public.game04_portal_jobs set status='sending',online_count=n where id=job.id;
  return jsonb_build_object('status','ready','id',attempt_id,'online_count',n,'counted_at',now_at);
end $$;
revoke all on function public.game04_prepare_portal_attempt(uuid,integer) from public,anon,authenticated;
grant execute on function public.game04_prepare_portal_attempt(uuid,integer) to service_role;
