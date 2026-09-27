-- Browser-distinct title arrivals. No IP, email, fingerprint or raw browser ID stored.
create table if not exists public.game04_title_arrivals (
 event_id uuid primary key,
 visitor_hash text not null,
 user_id uuid,
 arrived_at timestamptz not null default clock_timestamp()
);
create index if not exists game04_title_arrivals_time_idx on public.game04_title_arrivals(arrived_at,visitor_hash);
create index if not exists game04_title_arrivals_visitor_idx on public.game04_title_arrivals(visitor_hash,user_id);
alter table public.game04_title_arrivals enable row level security;
revoke all on public.game04_title_arrivals from public,anon,authenticated;
grant select,insert,update,delete on public.game04_title_arrivals to service_role;

-- Narrow anonymous write endpoint: server timestamps, hashed random ID, auth.uid only.
create or replace function public.game04_record_title_arrival_v1(p_event_id uuid,p_visitor_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_hash text; v_user uuid:=auth.uid();
begin
 if p_event_id is null or p_visitor_id is null then raise exception 'Missing arrival identifiers'; end if;
 v_hash:=encode(sha256(convert_to(p_visitor_id::text,'UTF8')),'hex');
 insert into public.game04_title_arrivals(event_id,visitor_hash,user_id)
 values(p_event_id,v_hash,v_user)
 on conflict(event_id) do update set user_id=coalesce(game04_title_arrivals.user_id,excluded.user_id)
 where game04_title_arrivals.visitor_hash=excluded.visitor_hash;
end $$;
revoke all on function public.game04_record_title_arrival_v1(uuid,uuid) from public;
grant execute on function public.game04_record_title_arrival_v1(uuid,uuid) to anon,authenticated,service_role;

create or replace function public.game04_title_uu_v1(p_from date,p_to date,p_period text)
returns jsonb language plpgsql stable security invoker set search_path='' set statement_timeout='10s' as $$
declare v_result jsonb;
begin
 if p_from is null or p_to is null or p_period is null or p_period not in ('daily','monthly') or p_from>p_to or p_to-p_from>366 then
  raise exception 'Invalid title UU range';
 end if;
 with periods as (
  select d::date start_day,least(case when p_period='daily' then d::date+1 else (d+interval '1 month')::date end,p_to+1) end_day,
   to_char(d,case when p_period='daily' then 'YYYY-MM-DD' else 'YYYY-MM' end) key
  from generate_series(case when p_period='daily' then p_from::timestamp else date_trunc('month',p_from::timestamp) end,
   p_to::timestamp,case when p_period='daily' then interval '1 day' else interval '1 month' end) d
 ), started as (select min(arrived_at) at from public.game04_title_arrivals),
 excluded as (
  select distinct visitor_hash from public.game04_title_arrivals a
  where a.user_id is not null and public.game04_kpi_excluded_v1(a.user_id,statement_timestamp())
 ), counts as (
  select p.key,case when s.at is null or (p.end_day::timestamp at time zone 'Asia/Tokyo')<=s.at then null
   else (select count(distinct a.visitor_hash) from public.game04_title_arrivals a
    where a.arrived_at>=(p.start_day::timestamp at time zone 'Asia/Tokyo') and a.arrived_at<(p.end_day::timestamp at time zone 'Asia/Tokyo')
    and not exists(select 1 from excluded e where e.visitor_hash=a.visitor_hash)) end as title_uu
  from periods p cross join started s
 )
 select jsonb_build_object('measured_from',(select at from started),'rows',(select jsonb_agg(to_jsonb(c) order by c.key desc) from counts c)) into v_result;
 return v_result;
end $$;
revoke all on function public.game04_title_uu_v1(date,date,text) from public,anon,authenticated;
grant execute on function public.game04_title_uu_v1(date,date,text) to service_role;
