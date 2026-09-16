SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.finalize_expired_raid_instance(p_instance_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_instance public.raid_bosses%rowtype; v_user record;
begin
 select * into v_instance from public.raid_bosses where id=p_instance_id for update;
 if not found or v_instance.outcome_finalized_at is not null then return; end if;
 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_instance_id) then return; end if;

 if v_instance.status='ACTIVE' and v_instance.current_hp>0 and v_instance.expires_at>clock_timestamp() then return; end if;
 if v_instance.current_hp=0 then
  update public.raid_bosses set status='CLEARED',outcome='DEFEAT_SUCCESS',outcome_finalized_at=now(),cleared_at=now(),respawn_after=now()+interval '5 minutes',raid_day_key=coalesce(raid_day_key,rotation_date::text) where id=p_instance_id returning * into v_instance;
  for v_user in select user_id from public.raid_instance_user_progress where raid_boss_instance_id=p_instance_id and finalized_battles>0 loop
   perform public.grant_canonical_raid_day_clear_reward(p_instance_id,v_user.user_id);
  end loop;
 else
  update public.raid_bosses set status='EXPIRED',outcome='TIMEOUT_FAILURE',outcome_finalized_at=now() where id=p_instance_id;
 end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.grant_canonical_raid_day_clear_reward(p_instance_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_instance public.raid_bosses%rowtype; v_claim public.raid_clear_reward_claims%rowtype; v_item record; v_inserted boolean; v_row_count integer;
begin
 select * into v_instance from public.raid_bosses where id=p_instance_id for update;
 if not found or v_instance.status<>'CLEARED' or v_instance.raid_day_key is null then return jsonb_build_object('eligible',false); end if;

 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_instance_id) then return jsonb_build_object('eligible',false); end if;
 if not exists(select 1 from public.raid_instance_user_progress where raid_boss_instance_id=p_instance_id and user_id=p_user_id and finalized_battles>0) then return jsonb_build_object('eligible',false); end if;
 insert into public.raid_clear_reward_claims(raid_day_key,user_id,reward_type,source_instance_id)
 values(v_instance.raid_day_key,p_user_id,'CLEAR_REWARD',p_instance_id)
 on conflict do nothing; get diagnostics v_row_count=row_count; v_inserted:=v_row_count=1;
 select * into v_claim from public.raid_clear_reward_claims where raid_day_key=v_instance.raid_day_key and user_id=p_user_id and reward_type='CLEAR_REWARD' for update;
 if v_inserted then
  update public.raid_clear_reward_claims set ticket_roll=random()<0.30,ticket_item_id=public.resolve_canonical_reward_item('NORMAL_GACHA_TICKET_RANDOM'),awakening_roll=random()<0.01
  where raid_day_key=v_instance.raid_day_key and user_id=p_user_id and reward_type='CLEAR_REWARD' returning * into v_claim;
 end if;
 if not v_inserted and v_claim.delivery_status='DELIVERED' then return jsonb_build_object('eligible',true,'already_claimed',true); end if;
 begin
  for v_item in select * from (values('SKILL_MANUAL'::text,1,true),(v_claim.ticket_item_id,1,v_claim.ticket_roll),('AWAKENING_BOOK',1,v_claim.awakening_roll)) x(item_id,quantity,selected) where selected loop
   insert into public.raid_clear_reward_deliveries values(v_claim.raid_day_key,p_user_id,'CLEAR_REWARD',v_item.item_id,v_item.quantity,v_claim.source_instance_id,now()) on conflict do nothing;
   if found then insert into public.presents(user_id,item_id,quantity,message,status,expire_at) values(p_user_id,v_item.item_id,v_item.quantity,'レイドクリア報酬','UNCLAIMED',now()+interval '30 days'); end if;
  end loop;
  update public.raid_clear_reward_claims set delivery_status='DELIVERED',delivered_at=now(),last_error=null where raid_day_key=v_claim.raid_day_key and user_id=p_user_id and reward_type='CLEAR_REWARD';
 exception when others then
  update public.raid_clear_reward_claims set delivery_status='PENDING',last_error=sqlstate where raid_day_key=v_claim.raid_day_key and user_id=p_user_id and reward_type='CLEAR_REWARD';
 end;
 return jsonb_build_object('eligible',true,'already_claimed',not v_inserted,'ticket_roll',v_claim.ticket_roll,'awakening_roll',v_claim.awakening_roll);
end $function$
;
CREATE OR REPLACE FUNCTION public.sync_active_users()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_day date;
  v_count integer;
  v_power bigint;
  v_guild_id uuid;
begin
  if v_uid is null then
    raise exception 'not authorized' using errcode = '42501';
  end if;


  v_day := (v_now at time zone 'Asia/Tokyo')::date;
  update public.users set last_active_at = v_now where id = v_uid;


  if not found then
    select count(*) into v_count
    from public.users
    where last_active_at >= v_now - interval '5 minutes';
    return v_count;
  end if;


  v_power := public.calculate_user_total_power(v_uid);
  select member.guild_id into v_guild_id
  from public.guild_members member
  where member.user_id = v_uid
  limit 1;


  insert into public.ranking_daily_activity_snapshots(
    ranking_day_key, user_id, total_power, guild_id, first_active_at, last_active_at
  ) values (
    v_day, v_uid, v_power, v_guild_id, v_now, v_now
  )
  on conflict (ranking_day_key, user_id) do update
  set total_power = excluded.total_power,
      guild_id = excluded.guild_id,
      first_active_at = least(public.ranking_daily_activity_snapshots.first_active_at, excluded.first_active_at),
      last_active_at = greatest(public.ranking_daily_activity_snapshots.last_active_at, excluded.last_active_at);


  perform public.kpi_record_daily_activity(v_uid, v_now);


  select count(*) into v_count
  from public.users
  where last_active_at >= v_now - interval '5 minutes';
  return v_count;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_guild_member_joined()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_subject_id uuid;
begin
  v_subject_id := public.kpi_ensure_subject(new.user_id, new.joined_at, null);


  update public.kpi_guild_membership_periods
  set left_at = new.joined_at,
      leave_reason = 'transfer'
  where subject_id = v_subject_id
    and left_at is null
    and guild_id <> new.guild_id;


  if not exists (
    select 1 from public.kpi_guild_membership_periods
    where subject_id = v_subject_id and guild_id = new.guild_id and left_at is null
  ) then
    insert into public.kpi_guild_membership_periods(
      guild_id, subject_id, joined_at, leave_reason, source_membership_id
    ) values (
      new.guild_id, v_subject_id, new.joined_at, null, new.id
    );
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_guild_member_leaving()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  update public.kpi_guild_membership_periods period
  set left_at = clock_timestamp(),
      leave_reason = coalesce(nullif(current_setting('app.kpi_guild_leave_reason', true), ''), 'unknown')
  from public.kpi_subjects subject
  where subject.source_user_id = old.user_id
    and period.subject_id = subject.subject_id
    and period.guild_id = old.guild_id
    and period.left_at is null;
  return old;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.enforce_kpi_classification_no_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if exists (
    select 1
    from public.kpi_account_classification_periods existing
    where existing.subject_id = new.subject_id
      and existing.id <> coalesce(new.id, -1)
      and tstzrange(existing.valid_from, coalesce(existing.valid_to, 'infinity'::timestamptz), '[)')
          && tstzrange(new.valid_from, coalesce(new.valid_to, 'infinity'::timestamptz), '[)')
  ) then
    raise exception 'KPI classification periods overlap' using errcode = '23P01';
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_jst_day_start(p_date date)
 RETURNS timestamp with time zone
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select p_date::timestamp at time zone 'Asia/Tokyo';
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_is_subject_excluded(p_subject_id uuid, p_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists (
    select 1
    from public.kpi_account_classification_periods period
    where period.subject_id = p_subject_id
      and period.classification in ('admin', 'qa', 'test', 'fraud_suspended')
      and period.valid_from <= p_at
      and (period.valid_to is null or period.valid_to > p_at)
  );
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_acquisition(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if p_period_type not in ('daily', 'monthly') then
    raise exception 'acquisition supports daily or monthly periods';
  end if;
  if p_period_type = 'monthly'
     and (p_period_start <> date_trunc('month', p_period_start)::date
          or p_period_end <> (p_period_start + interval '1 month')::date) then
    raise exception 'monthly period must be one complete calendar month';
  end if;


  with buckets as (
    select day_value::date bucket_start,
           day_value::date + 1 bucket_end,
           jsonb_build_object('date', day_value::date) dimension_key,
           public.kpi_jst_day_start(day_value::date + 8) tutorial_deadline
    from generate_series(
      p_period_start::timestamp,
      (p_period_end - 1)::timestamp,
      interval '1 day'
    ) generated(day_value)
    where p_period_type = 'daily'
    union all
    select p_period_start,
           p_period_end,
           jsonb_build_object('month', to_char(p_period_start, 'YYYY-MM')),
           public.kpi_jst_day_start(p_period_end + 7)
    where p_period_type = 'monthly'
  ), counts as (
    select bucket.*,
      (select count(*)
       from public.kpi_subjects subject
       where subject.registered_at >= public.kpi_jst_day_start(bucket.bucket_start)
         and subject.registered_at < public.kpi_jst_day_start(bucket.bucket_end)
         and not public.kpi_is_subject_excluded(subject.subject_id, subject.registered_at)) new_total,
      (select count(*)
       from public.kpi_subjects subject
       where subject.registration_type = 'anonymous'
         and subject.registered_at >= public.kpi_jst_day_start(bucket.bucket_start)
         and subject.registered_at < public.kpi_jst_day_start(bucket.bucket_end)
         and not public.kpi_is_subject_excluded(subject.subject_id, subject.registered_at)) new_anonymous,
      (select count(*)
       from public.kpi_subjects subject
       where subject.first_authenticated_at >= public.kpi_jst_day_start(bucket.bucket_start)
         and subject.first_authenticated_at < public.kpi_jst_day_start(bucket.bucket_end)
         and not public.kpi_is_subject_excluded(subject.subject_id, subject.first_authenticated_at)) new_authenticated,
      (select count(*)
       from public.kpi_subjects subject
       join public.kpi_tutorial_completion_facts completion using(subject_id)
       where subject.registered_at >= public.kpi_jst_day_start(bucket.bucket_start)
         and subject.registered_at < public.kpi_jst_day_start(bucket.bucket_end)
         and completion.completed_at < least(bucket.tutorial_deadline, p_watermark)
         and not public.kpi_is_subject_excluded(subject.subject_id, subject.registered_at)
         and not public.kpi_is_subject_excluded(subject.subject_id, completion.completed_at)) tutorial_completed
    from buckets bucket
  )
  insert into public.kpi_metric_snapshots(
    run_id, metric_id, dimension_key, value, numerator, denominator,
    value_status, null_reason, calculated_at
  )
  select p_run_id,
         metric.metric_id,
         counts.dimension_key,
         metric.value,
         metric.numerator,
         metric.denominator,
         case
           when metric.metric_id = 'tutorial.completion_rate' and p_watermark < counts.tutorial_deadline
             then 'provisional'
           when p_watermark < public.kpi_jst_day_start(counts.bucket_end)
             then 'provisional'
           else 'final'
         end,
         metric.null_reason,
         clock_timestamp()
  from counts
  cross join lateral (
    values
      ('user.new_anonymous', counts.new_anonymous::numeric, counts.new_anonymous, null::bigint, null::text),
      ('user.new_authenticated', counts.new_authenticated::numeric, counts.new_authenticated, null::bigint, null::text),
      ('user.new_total', counts.new_total::numeric, counts.new_total, null::bigint, null::text),
      ('tutorial.completion_rate',
        case when counts.new_total = 0 then null else counts.tutorial_completed::numeric / counts.new_total end,
        counts.tutorial_completed,
        counts.new_total,
        case when counts.new_total = 0 then 'zero_denominator' else null end)
  ) metric(metric_id, value, numerator, denominator, null_reason);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_active_retention(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if p_period_type = 'daily' then
    insert into public.kpi_metric_snapshots(
      run_id, metric_id, dimension_key, value, numerator, value_status, calculated_at
    )
    select p_run_id,
           'active.dau',
           jsonb_build_object('date', day_value::date),
           count(activity.subject_id)::numeric,
           count(activity.subject_id),
           case when p_watermark < public.kpi_jst_day_start(day_value::date + 1) then 'provisional' else 'final' end,
           clock_timestamp()
    from generate_series(
      p_period_start::timestamp,
      (p_period_end - 1)::timestamp,
      interval '1 day'
    ) generated(day_value)
    left join public.kpi_daily_user_activity activity
      on activity.activity_date = day_value::date
     and not public.kpi_is_subject_excluded(activity.subject_id, activity.last_active_at)
    group by day_value;
  elsif p_period_type = 'monthly' then
    if p_period_start <> date_trunc('month', p_period_start)::date
       or p_period_end <> (p_period_start + interval '1 month')::date then
      raise exception 'monthly period must be one complete calendar month';
    end if;
    insert into public.kpi_metric_snapshots(
      run_id, metric_id, dimension_key, value, numerator, value_status, calculated_at
    )
    select p_run_id,
           'active.mau',
           jsonb_build_object('month', to_char(p_period_start, 'YYYY-MM')),
           count(distinct activity.subject_id)::numeric,
           count(distinct activity.subject_id),
           case when p_watermark < public.kpi_jst_day_start(p_period_end) then 'provisional' else 'final' end,
           clock_timestamp()
    from public.kpi_daily_user_activity activity
    where activity.activity_date >= p_period_start
      and activity.activity_date < p_period_end
      and not public.kpi_is_subject_excluded(activity.subject_id, activity.last_active_at);
  elsif p_period_type = 'cohort' then
    with cohort_days as (
      select generated::date cohort_date
      from generate_series(
        p_period_start::timestamp,
        (p_period_end - 1)::timestamp,
        interval '1 day'
      ) generated
    ), offsets(day_number) as (
      values (1), (2), (3), (4), (5), (6), (7), (14), (21), (30), (60)
    ), cohort_members as (
      select day.cohort_date, subject.subject_id
      from cohort_days day
      join public.kpi_subjects subject
        on subject.registered_at >= public.kpi_jst_day_start(day.cohort_date)
       and subject.registered_at < public.kpi_jst_day_start(day.cohort_date + 1)
       and not public.kpi_is_subject_excluded(subject.subject_id, subject.registered_at)
    ), result as (
      select day.cohort_date,
             offset_row.day_number,
             public.kpi_jst_day_start(day.cohort_date + offset_row.day_number + 1) observation_end,
             count(member.subject_id) denominator_value,
             count(activity.subject_id) numerator_value
      from cohort_days day
      cross join offsets offset_row
      left join cohort_members member on member.cohort_date = day.cohort_date
      left join public.kpi_daily_user_activity activity
        on activity.subject_id = member.subject_id
       and activity.activity_date = day.cohort_date + offset_row.day_number
       and not public.kpi_is_subject_excluded(activity.subject_id, activity.last_active_at)
      group by day.cohort_date, offset_row.day_number
    )
    insert into public.kpi_metric_snapshots(
      run_id, metric_id, dimension_key, value, numerator, denominator,
      value_status, null_reason, calculated_at
    )
    select p_run_id,
           format('retention.d%s', lpad(day_number::text, 2, '0')),
           jsonb_build_object('cohort_date', cohort_date, 'day', day_number),
           case
             when p_watermark < observation_end or denominator_value = 0 then null
             else numerator_value::numeric / denominator_value
           end,
           case when p_watermark < observation_end then null else numerator_value end,
           case when p_watermark < observation_end then null else denominator_value end,
           case when p_watermark < observation_end then 'provisional' else 'final' end,
           case
             when p_watermark < observation_end then 'observation_incomplete'
             when denominator_value = 0 then 'zero_denominator'
             else null
           end,
           clock_timestamp()
    from result;
  else
    raise exception 'active_retention supports daily, monthly, or cohort periods';
  end if;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_guild(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if p_period_type <> 'daily' then
    raise exception 'guild supports daily periods only';
  end if;


  with days as (
    select generated::date metric_date,
           public.kpi_jst_day_start(generated::date + 1) period_end_at
    from generate_series(
      p_period_start::timestamp,
      (p_period_end - 1)::timestamp,
      interval '1 day'
    ) generated
  ), valid_guilds as (
    select day.metric_date, day.period_end_at, guild.id guild_id
    from days day
    join public.guilds guild
      on guild.created_at < day.period_end_at
     and (guild.disbanded_at is null or guild.disbanded_at >= day.period_end_at)
    where not exists (
      select 1
      from public.kpi_subjects leader
      where leader.source_user_id = guild.leader_id
        and public.kpi_is_subject_excluded(leader.subject_id, day.period_end_at - interval '1 microsecond')
    )
  ), member_counts as (
    select valid.metric_date, valid.period_end_at, valid.guild_id,
           count(distinct membership.subject_id) member_count
    from valid_guilds valid
    left join public.kpi_guild_membership_periods membership
      on membership.guild_id = valid.guild_id
     and membership.joined_at < valid.period_end_at
     and (membership.left_at is null or membership.left_at >= valid.period_end_at)
     and not public.kpi_is_subject_excluded(
       membership.subject_id,
       valid.period_end_at - interval '1 microsecond'
     )
    group by valid.metric_date, valid.period_end_at, valid.guild_id
  ), active_guilds as (
    select member.metric_date, member.guild_id,
           count(distinct activity.subject_id) active_members
    from member_counts member
    join public.kpi_guild_membership_periods membership
      on membership.guild_id = member.guild_id
     and membership.joined_at < member.period_end_at
     and (membership.left_at is null or membership.left_at >= member.period_end_at)
    join public.kpi_daily_user_activity activity
      on activity.subject_id = membership.subject_id
     and activity.activity_date = member.metric_date
     and not public.kpi_is_subject_excluded(activity.subject_id, activity.last_active_at)
    group by member.metric_date, member.guild_id
  )
  insert into public.kpi_metric_snapshots(
    run_id, metric_id, dimension_key, value, numerator, value_status, calculated_at
  )
  select p_run_id,
         'guild.valid_count',
         jsonb_build_object('date', day.metric_date),
         count(valid.guild_id)::numeric,
         count(valid.guild_id),
         case when p_watermark < day.period_end_at then 'provisional' else 'final' end,
         clock_timestamp()
  from days day
  left join valid_guilds valid on valid.metric_date = day.metric_date
  group by day.metric_date, day.period_end_at
  union all
  select p_run_id,
         'guild.member_count',
         jsonb_build_object('date', member.metric_date, 'guild_id', member.guild_id),
         member.member_count::numeric,
         member.member_count,
         case when p_watermark < member.period_end_at then 'provisional' else 'final' end,
         clock_timestamp()
  from member_counts member
  union all
  select p_run_id,
         'guild.active_count',
         jsonb_build_object('date', day.metric_date),
         count(active.guild_id) filter (where active.active_members >= 3)::numeric,
         count(active.guild_id) filter (where active.active_members >= 3),
         case when p_watermark < day.period_end_at then 'provisional' else 'final' end,
         clock_timestamp()
  from days day
  left join active_guilds active on active.metric_date = day.metric_date
  group by day.metric_date, day.period_end_at;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_content(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if p_period_type not in ('daily', 'monthly') then
    raise exception 'content supports daily or monthly periods';
  end if;
  if p_period_type = 'monthly'
     and (p_period_start <> date_trunc('month', p_period_start)::date
          or p_period_end <> (p_period_start + interval '1 month')::date) then
    raise exception 'monthly period must be one complete calendar month';
  end if;


  with buckets as (
    select day_value::date bucket_start,
           day_value::date + 1 bucket_end,
           jsonb_build_object('date', day_value::date) dimension_key
    from generate_series(
      p_period_start::timestamp,
      (p_period_end - 1)::timestamp,
      interval '1 day'
    ) generated(day_value)
    where p_period_type = 'daily'
    union all
    select p_period_start,
           p_period_end,
           jsonb_build_object('month', to_char(p_period_start, 'YYYY-MM'))
    where p_period_type = 'monthly'
  ), types(gacha_type, metric_id) as (
    values
      ('CHARACTER', 'gacha.free10.character'),
      ('SKILL', 'gacha.free10.skill'),
      ('EQUIPMENT', 'gacha.free10.equipment')
  )
  insert into public.kpi_metric_snapshots(
    run_id, metric_id, dimension_key, value, numerator, value_status, calculated_at
  )
  select p_run_id,
         type_row.metric_id,
         bucket.dimension_key,
         count(fact.request_id)::numeric,
         count(fact.request_id),
         case when p_watermark < public.kpi_jst_day_start(bucket.bucket_end) then 'provisional' else 'final' end,
         clock_timestamp()
  from buckets bucket
  cross join types type_row
  left join public.kpi_gacha_execution_facts fact
    on fact.gacha_type = type_row.gacha_type
   and fact.payment_source = 'free'
   and fact.pull_count = 10
   and fact.completed_at >= public.kpi_jst_day_start(bucket.bucket_start)
   and fact.completed_at < public.kpi_jst_day_start(bucket.bucket_end)
   and not public.kpi_is_subject_excluded(fact.subject_id, fact.completed_at)
  group by bucket.bucket_start, bucket.bucket_end, bucket.dimension_key,
           type_row.gacha_type, type_row.metric_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_revenue(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_payment_closed boolean;
begin
  select state = 'CLOSED' and not visibility and not mutation_allowed
  into v_payment_closed
  from public.feature_operating_states
  where feature_key = 'PAYMENT';


  if not coalesce(v_payment_closed, false) then
    raise exception 'formal revenue KPI definitions F10-F13 are not fixed';
  end if;


  insert into public.kpi_metric_snapshots(
    run_id, metric_id, dimension_key, value, value_status, null_reason, calculated_at
  )
  select p_run_id,
         metric_id,
         jsonb_build_object('period_start', p_period_start, 'period_end', p_period_end),
         null,
         'not_applicable',
         'payment_closed',
         clock_timestamp()
  from unnest(array['revenue.pu', 'revenue.gross', 'revenue.arppu', 'revenue.arpu']) metric_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_latest_kpi_snapshots(p_category text, p_period_type text, p_period_start date, p_period_end date)
 RETURNS TABLE(run_id uuid, metric_id text, dimension_key jsonb, value numeric, numerator bigint, denominator bigint, value_status text, null_reason text, calculated_at timestamp with time zone, source_watermark timestamp with time zone, finished_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'admin role required' using errcode = '42501';
  end if;


  return query
  with latest_run as (
    select run.run_id, run.source_watermark, run.finished_at
    from public.kpi_aggregation_runs run
    where run.category = p_category
      and run.period_type = p_period_type
      and run.period_start = p_period_start
      and run.period_end = p_period_end
      and run.status = 'succeeded'
    order by run.finished_at desc
    limit 1
  )
  select latest.run_id,
         snapshot.metric_id,
         snapshot.dimension_key,
         snapshot.value,
         snapshot.numerator,
         snapshot.denominator,
         snapshot.value_status,
         snapshot.null_reason,
         snapshot.calculated_at,
         latest.source_watermark,
         latest.finished_at
  from latest_run latest
  join public.kpi_metric_snapshots snapshot on snapshot.run_id = latest.run_id
  order by snapshot.metric_id, snapshot.dimension_key;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_kpi_refresh_run(p_run_id uuid)
 RETURNS TABLE(run_id uuid, category text, period_type text, period_start date, period_end date, status text, requested_at timestamp with time zone, started_at timestamp with time zone, finished_at timestamp with time zone, source_watermark timestamp with time zone, error_code text, error_detail text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'admin role required' using errcode = '42501';
  end if;


  return query
  select run.run_id,
         run.category,
         run.period_type,
         run.period_start,
         run.period_end,
         run.status,
         run.requested_at,
         run.started_at,
         run.finished_at,
         run.source_watermark,
         run.error_code,
         run.error_detail
  from public.kpi_aggregation_runs run
  where run.run_id = p_run_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_active_timeseries_v2(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_total_metric text:=case when p_period_type='daily' then 'active.dau' else 'active.mau' end;v_auth_metric text:=case when p_period_type='daily' then 'active.dau_authenticated' else 'active.mau_authenticated' end;v_anon_metric text:=case when p_period_type='daily' then 'active.dau_anonymous' else 'active.mau_anonymous' end;v_dimension jsonb:=case when p_period_type='daily' then jsonb_build_object('date',p_period_start) else jsonb_build_object('month',to_char(p_period_start,'YYYY-MM')) end;v_period_end_at timestamptz:=public.kpi_jst_day_start(p_period_end);
begin
 if p_period_type not in('daily','monthly')then raise exception 'active timeseries supports daily or monthly periods';end if;
 with a as(select distinct activity.subject_id from public.kpi_daily_user_activity activity where activity.activity_date>=p_period_start and activity.activity_date<p_period_end and not public.kpi_is_subject_excluded(activity.subject_id,activity.last_active_at)),c as(select count(*) total_count,count(*)filter(where s.registration_type='authenticated' or s.first_authenticated_at<v_period_end_at)authenticated_count,count(*)filter(where s.registration_type<>'authenticated' and(s.first_authenticated_at is null or s.first_authenticated_at>=v_period_end_at))anonymous_count from a join public.kpi_subjects s using(subject_id))
 insert into public.kpi_metric_snapshots(run_id,metric_id,dimension_key,value,numerator,value_status,calculated_at)
 select p_run_id,m.metric_id,v_dimension,m.metric_value::numeric,m.metric_value,case when p_watermark<v_period_end_at then 'provisional' else 'final' end,clock_timestamp() from c cross join lateral(values(v_total_metric,total_count),(v_auth_metric,authenticated_count),(v_anon_metric,anonymous_count))m(metric_id,metric_value);
end;$function$
;
CREATE OR REPLACE FUNCTION public.bind_kpi_acquisition_subject_v1(p_token text, p_source text DEFAULT 'web_v1'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  return public.bind_kpi_acquisition_subject_v2(array[p_token],p_source);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_overview_saved_results(p_today date DEFAULT ((now() AT TIME ZONE 'Asia/Tokyo'::text))::date)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_from date := (date_trunc('month',p_today) - interval '11 months')::date;
  v_generated timestamptz := clock_timestamp();
  v_generation uuid := gen_random_uuid();
  v_count integer;
begin
  if p_today is null or p_today > (now() at time zone 'Asia/Tokyo')::date then raise exception 'invalid observation date'; end if;
  if not pg_try_advisory_xact_lock(hashtextextended('kpi-overview-saved-results-v1',0)) then return 0; end if;
  -- 同一statement snapshotで全期間を計算し、成功時だけ全行を置換する。
  with periods as materialized (
    select 'daily'::text kind,d::date start_at,d::date+1 end_at from generate_series(v_from::timestamp,p_today::timestamp,interval '1 day') d
    union all
    select 'monthly',m::date,(m+interval '1 month')::date from generate_series(v_from::timestamp,date_trunc('month',p_today),interval '1 month') m
  ), all_subjects as materialized (
    select s.*,(s.registered_at at time zone 'Asia/Tokyo')::date registered_date
    from public.kpi_subjects s where s.registered_at < public.kpi_jst_day_start(p_today+1)
      and not public.kpi_is_subject_excluded(s.subject_id,s.registered_at)
  ), subjects as materialized (
    select * from all_subjects where registered_date>=v_from
  ), evidence as (
    select f.subject_id,f.completed_at from public.kpi_tutorial_completion_facts f join subjects s using(subject_id)
    union all
    select f.subject_id,f.completed_at from public.kpi_canonical_tutorial_completions_v1 f join subjects s using(subject_id)
    union all
    select s.subject_id,m.first_occurred_at from subjects s join public.user_funnel_milestones m
      on m.user_id=s.source_user_id and m.milestone='tutorial_complete'
  ), completions as materialized (
    -- source_user_idは既存unique indexで一意。detached subjectの履歴はsubject単位で維持。
    select e.subject_id,min(e.completed_at) completed_at from evidence e
    where not public.kpi_is_subject_excluded(e.subject_id,e.completed_at) group by e.subject_id
  ), memberships as materialized (
    select m.*,
      (select count(*) from public.kpi_guild_conversion_facts f where f.membership_period_id=m.id
        and not public.kpi_is_subject_excluded(f.subject_id,f.occurred_at)) conversion_count,
      exists(select 1 from public.kpi_guild_conversion_facts f where f.membership_period_id=m.id and f.conversion_type='CREATE'
        and not public.kpi_is_subject_excluded(f.subject_id,f.occurred_at)) created,
      exists(select 1 from public.kpi_guild_conversion_facts f where f.membership_period_id=m.id and f.conversion_type='JOIN'
        and not public.kpi_is_subject_excluded(f.subject_id,f.occurred_at)) joined,
      exists(select 1 from public.kpi_guild_chat_activation_facts f where f.membership_period_id=m.id
        and not public.kpi_is_subject_excluded(f.subject_id,f.occurred_at)) canonical_chat,
      exists(select 1 from public.board_posts b join subjects s on s.source_user_id=b.user_id
        where s.subject_id=m.subject_id and b.target_type='GUILD' and b.is_system=false and b.target_id=m.guild_id
          and b.created_at>=m.joined_at and (m.left_at is null or b.created_at<m.left_at)) legacy_chat
    from public.kpi_guild_membership_periods m join completions c using(subject_id) where m.joined_at>=c.completed_at
  ), membership_summary as materialized (
    select subject_id,count(*) membership_count,sum(conversion_count) conversion_count,
      bool_or(created) created,bool_or(joined) joined,bool_or(canonical_chat) canonical_chat,
      bool_or(canonical_chat or legacy_chat) activated from memberships group by subject_id
  ), flags as materialized (
    select s.subject_id,s.registered_date,c.completed_at,m.membership_count,m.conversion_count,m.created,m.joined,m.canonical_chat,m.activated from subjects s left join completions c using(subject_id)
      left join membership_summary m using(subject_id)
  ), activity as materialized (
    select a.subject_id,a.activity_date from public.kpi_daily_user_activity a
    where a.activity_date>=v_from and a.activity_date<=p_today
      and not public.kpi_is_subject_excluded(a.subject_id,a.last_active_at)
  ), cohort_counts as (
    select p.kind,p.start_at,p.end_at,count(f.subject_id) new_users,count(f.completed_at) tutorial_n,
      count(*) filter(where f.membership_count>0) guild_n,count(*) filter(where f.activated) chat_n,
      coalesce(sum(f.membership_count),0) membership_count,coalesce(sum(f.conversion_count),0) conversion_count,
      count(*) filter(where f.created) created,count(*) filter(where f.joined) joined,bool_or(f.canonical_chat) canonical_chat
    from periods p left join flags f on f.registered_date>=p.start_at and f.registered_date<p.end_at group by p.kind,p.start_at,p.end_at
  ), retained as (
    select p.kind,p.start_at,d.day,count(f.subject_id) all_count,
      count(f.subject_id) filter(where f.registered_date+d.day<p_today) mature_count,
      count(a.subject_id) filter(where f.registered_date+d.day<p_today) retained_count
    from periods p cross join generate_series(1,5) d(day)
    left join flags f on f.registered_date>=p.start_at and f.registered_date<p.end_at
    left join activity a on a.subject_id=f.subject_id and a.activity_date=f.registered_date+d.day
    group by p.kind,p.start_at,d.day
  ), retention_json as (
    select kind,start_at,jsonb_agg(jsonb_build_object('day',day)||public.kpi_overview_saved_rate(
      case when mature_count>0 then retained_count end, nullif(mature_count,0),
      (array[.38,.30,.26,.23,.21]::numeric[])[day],case when mature_count<all_count then 'mature_cohorts_only' end) order by day) retention
    from retained group by kind,start_at
  ), active_counts as (
    -- MAUは日次合計ではなく、月の活動集合内で重複除外する。
    select p.kind,p.start_at,count(distinct a.subject_id) active_users from periods p
    left join activity a on a.activity_date>=p.start_at and a.activity_date<p.end_at group by p.kind,p.start_at
  ), guild_days as materialized (
    select * from public.kpi_effective_active_guild_daily_v1 where activity_date>=v_from and activity_date<=p_today
  ), guild_counts as (
    -- 月次は月内に1日以上、既存の日次条件を満たしたdistinct guild。
    select p.kind,p.start_at,count(distinct g.guild_id) filter(where g.is_active_guild) active_guilds,
      count(distinct g.guild_id) filter(where g.is_effective_active_guild) effective_active_guilds
    from periods p left join guild_days g on g.activity_date>=p.start_at and g.activity_date<p.end_at group by p.kind,p.start_at
  ), cumulative as (
    select p.kind,p.start_at,count(s.subject_id) total_registered from periods p left join all_subjects s on s.registered_date<p.end_at group by p.kind,p.start_at
  ), source_names as (select unnest(array['meta','x','organic','direct','unknown']) source),
  source_subjects as materialized (
    select s.subject_id,s.registered_date,c.completed_at,coalesce(ft.first_source,'unknown') source,
      ft.journey_id,ft.first_touch_rule_version,ft.first_arrived_at,s.registered_at,
      exists(select 1 from public.kpi_guild_conversion_facts g where g.subject_id=s.subject_id
        and g.conversion_type='JOIN' and not public.kpi_is_subject_excluded(g.subject_id,g.occurred_at)) joined
    from subjects s left join completions c using(subject_id) left join public.kpi_subject_first_touch_v1 ft using(subject_id)
  ), source_cohorts as (
    select p.kind,p.start_at,n.source,count(s.subject_id) game_start,count(s.completed_at) tutorial,
      count(s.subject_id) filter(where s.completed_at is not null and s.joined) guild_join,
      count(s.subject_id) filter(where s.journey_id is null) unbound,
      count(s.subject_id) filter(where s.journey_id is not null and s.source='unknown') canonical_unknown,
      count(s.subject_id) filter(where s.first_arrived_at>s.registered_at) post_game_start_capture,
      count(s.subject_id) filter(where s.first_touch_rule_version='legacy-source-v1') legacy
    from periods p cross join source_names n left join source_subjects s
      on s.source=n.source and s.registered_date>=p.start_at and s.registered_date<p.end_at
    group by p.kind,p.start_at,n.source
  ), source_retained as (
    select p.kind,p.start_at,n.source,d.day,count(s.subject_id) total,
      count(s.subject_id) filter(where s.registered_date+d.day<p_today) mature,
      count(a.subject_id) filter(where s.registered_date+d.day<p_today) retained
    from periods p cross join source_names n cross join (values(1),(3)) d(day)
    left join source_subjects s on s.source=n.source and s.registered_date>=p.start_at and s.registered_date<p.end_at
    left join activity a on a.subject_id=s.subject_id and a.activity_date=s.registered_date+d.day
    group by p.kind,p.start_at,n.source,d.day
  ), source_retention_json as (
    select kind,start_at,source,jsonb_object_agg('d'||day,
      public.kpi_source_rate_v1(case when mature>0 then retained end,nullif(mature,0),
        case when mature=0 then 'immature_cohorts' when mature<total then 'mature_cohorts_only' end)
      ||jsonb_build_object('immature_subjects',total-mature)) retention
    from source_retained group by kind,start_at,source
  ), source_landings as materialized (
    select j.journey_id,j.metadata->>'utm_source' source,(j.first_arrived_at at time zone 'Asia/Tokyo')::date arrived_date,
      s.subject_id started_subject
    from public.kpi_acquisition_valid_journeys_v1 j
    left join public.kpi_acquisition_subject_bindings b using(journey_id)
    left join all_subjects s on s.subject_id=b.subject_id and b.first_touch_source is not null
    where j.first_arrived_at>=public.kpi_jst_day_start(v_from)
      and j.first_arrived_at<public.kpi_jst_day_start(p_today+1)
      and (b.subject_id is null or (b.source<>'qa_v1'
        and not public.kpi_is_subject_excluded(b.subject_id,j.first_arrived_at)))
  ), source_landing_counts as (
    select p.kind,p.start_at,n.source,count(j.journey_id) journeys,count(j.started_subject) started
    from periods p cross join source_names n left join source_landings j
      on j.source=n.source and j.arrived_date>=p.start_at and j.arrived_date<p.end_at
    group by p.kind,p.start_at,n.source
  ), source_json as (
    select c.kind,c.start_at,jsonb_build_object('definition_version','acquisition-source-v1',
      'sources',jsonb_object_agg(c.source,jsonb_build_object(
        'journeys',l.journeys,'landing_game_start',l.started,
        'game_start_rate',public.kpi_source_rate_v1(l.started,l.journeys),
        'game_start',c.game_start,'tutorial_complete',c.tutorial,'guild_join',c.guild_join,
        'tutorial_rate',public.kpi_source_rate_v1(c.tutorial,c.game_start),
        'guild_rate',public.kpi_source_rate_v1(c.guild_join,c.game_start),
        'd1',r.retention->'d1','d3',r.retention->'d3',
        'coverage',jsonb_build_object('unbound',c.unbound,'canonical_unknown',c.canonical_unknown,
          'post_game_start_capture',c.post_game_start_capture,'legacy_source',c.legacy)))) payload
    from source_cohorts c join source_landing_counts l using(kind,start_at,source)
      join source_retention_json r using(kind,start_at,source) group by c.kind,c.start_at
  ), engagement as materialized (
    select * from public.kpi_daily_engagement_v1(v_from,p_today)
  ), payment as (
    select case when exists(select 1 from public.feature_operating_states where feature_key='PAYMENT'
      and state='CLOSED' and not visibility and not mutation_allowed) then 'payment_closed' else 'definition_unavailable' end reason
  )
  insert into public.kpi_overview_saved_results(period_type,period_start,period_end,generated_at,generation_id,definition_version,payload)
  select c.kind,c.start_at,c.end_at,v_generated,v_generation,'kpi-overview-saved-v1',
    jsonb_build_object('date',case when c.kind='daily' then to_char(c.start_at,'YYYY-MM-DD') else to_char(c.start_at,'YYYY-MM') end,
      'from',c.start_at,'to',least(c.end_at-1,p_today),'partial',c.end_at>p_today,
      'new_users',c.new_users,'active_users',a.active_users,'total_registered',u.total_registered,
      'tutorial',public.kpi_overview_saved_rate(c.tutorial_n,c.new_users,.6)||jsonb_build_object('authority','tutorial_completion_union_v1','authority_label','統合計測（既存完了＋MyPage・重複除外）'),
      'guild',public.kpi_overview_saved_rate(c.guild_n,c.tutorial_n,.4)||jsonb_build_object(
        'authority',case when c.membership_count>0 and c.conversion_count=c.membership_count then 'canonical' else 'membership_periods' end,
        'create',case when c.membership_count>0 and c.conversion_count=c.membership_count then c.created end,
        'join',case when c.membership_count>0 and c.conversion_count=c.membership_count then c.joined end),
      'chat',public.kpi_overview_saved_rate(c.chat_n,c.guild_n,.3)||jsonb_build_object('authority',case when c.canonical_chat then 'canonical_and_legacy' else 'legacy_surviving_posts' end),
      'retention',r.retention,'active_guilds',g.active_guilds,'effective_active_guilds',g.effective_active_guilds,
      'monetization',jsonb_build_object('payers',null,'payer_rate',null,'revenue',null,'arppu',null,'arpu',null,'reason',payment.reason),
      'generated_at',v_generated,'acquisition_source_v1',sj.payload)
    || case when c.kind='daily' then jsonb_build_object(
      'social_active', public.kpi_overview_saved_rate(e.social_active_uu,e.guild_dau,null)
        || jsonb_build_object('status',case when e.guild_dau>0 then 'OBSERVED' else 'NOT_READY' end,
          'authority','social-active-daily-v1','authority_label','Guild所属DAU・4種投稿の重複除外'),
      'raid_point_consumption', public.kpi_overview_saved_rate(e.raid_point_active_uu,e.dau,null)
        || jsonb_build_object('status',case when e.dau>0 then 'OBSERVED' else 'NOT_READY' end,
          'authority','raid-point-daily-v1','authority_label','JST日合計3 Point以上 / DAU')
    ) else '{}'::jsonb end
  from cohort_counts c join active_counts a using(kind,start_at) join cumulative u using(kind,start_at)
    join retention_json r using(kind,start_at) join guild_counts g using(kind,start_at) cross join payment join source_json sj using(kind,start_at)
    left join engagement e on c.kind='daily' and e.activity_date=c.start_at
  on conflict(period_type,period_start) do update set period_end=excluded.period_end,generated_at=excluded.generated_at,
    generation_id=excluded.generation_id,definition_version=excluded.definition_version,payload=excluded.payload;
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$
;
CREATE OR REPLACE FUNCTION public._raid_room_add_member_v1(p_room_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_room public.raid_rooms%rowtype;
 v_boss public.raid_bosses%rowtype;
 v_capacity integer;
 v_count bigint;
 v_now timestamptz;
begin
 if current_setting('transaction_isolation') <> 'read committed' then
   raise exception 'read committed required' using errcode='25001';
 end if;
 if p_room_id is null or p_user_id is null then raise exception 'invalid membership input' using errcode='22023'; end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002'; end if;
 -- 戦闘確定と同じInstanceを先にロックし、終了判定と定員判定を直列化する。
 select * into v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id for update;
 if not found then raise exception 'instance unavailable' using errcode='P0002'; end if;
 select * into v_room from public.raid_rooms where id=p_room_id for update;
 if not found or v_room.raid_boss_instance_id<>v_boss.id then
   raise exception 'room changed' using errcode='40001';
 end if;
 if v_room.owner_user_id=p_user_id or exists(
   select 1 from public.raid_room_members where room_id=p_room_id and user_id=p_user_id
 ) then
   return jsonb_build_object('roomId',p_room_id,'userId',p_user_id,'status','already_joined');
 end if;
 v_now := clock_timestamp();
 if v_boss.status is distinct from 'ACTIVE' or v_boss.current_hp is null or v_boss.current_hp<=0
   or v_boss.expires_at is null or v_boss.expires_at<=v_now or v_boss.outcome_finalized_at is not null then
   raise exception 'room inactive' using errcode='22023';
 end if;
 select member_capacity into v_capacity from public.raid_room_lifecycle_rules where difficulty=v_room.difficulty_id;
 if not found then raise exception 'lifecycle rule unavailable' using errcode='22023'; end if;
 -- 参照RPCと同じ集合。旧確定参加者が存在する場合も人数から脱落させない。
 select count(*) into v_count from (
   select v_room.owner_user_id as user_id
   union select user_id from public.raid_room_members where room_id=p_room_id
   union select user_id from public.raid_instance_user_progress
     where raid_boss_instance_id=v_boss.id and finalized_battles>0
 ) participants;
 if v_count>=v_capacity and not exists(
   select 1 from public.raid_instance_user_progress
   where raid_boss_instance_id=v_boss.id and user_id=p_user_id and finalized_battles>0
 ) then raise exception 'room full' using errcode='22023'; end if;
 insert into public.raid_room_members(room_id,user_id,joined_at) values(p_room_id,p_user_id,v_now);
 return jsonb_build_object('roomId',p_room_id,'userId',p_user_id,'status','joined');
end;
$function$
;
CREATE OR REPLACE FUNCTION public.create_raid_room_v1(p_difficulty_id text, p_raid_variant_id text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_uid uuid := auth.uid();
 v_level integer;
 v_enabled boolean;
 v_power bigint;
 v_gate jsonb;
 v_rule public.raid_room_lifecycle_rules%rowtype;
 v_variant public.canonical_raid_variants%rowtype;
 v_request public.raid_room_creation_requests%rowtype;
 v_instance uuid;
 v_room uuid;
 v_now timestamptz;
 v_daily jsonb;
 v_launch jsonb;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if current_setting('transaction_isolation') <> 'read committed' then
   raise exception 'read committed required' using errcode='25001';
 end if;
 if p_request_id is null or p_difficulty_id is null or p_raid_variant_id is null
   or p_difficulty_id not in ('beginner','intermediate','advanced','expert') then
   raise exception 'invalid creation input' using errcode='22023';
 end if;
 -- 設定無効時は再送も拒否する。作成済みRoomの参照は既存参照RPCを使う。
 select enabled into v_enabled from public.raid_room_creation_settings where singleton for share;
 if v_enabled is distinct from true then
   raise exception 'room creation disabled' using errcode='55000';
 end if;
 -- ユーザー単位で異なる難度を含む再送を直列化。全生成経路のロック順を揃える。
 select level into v_level from public.users where id=v_uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501'; end if;
 select * into v_request from public.raid_room_creation_requests where user_id=v_uid and request_id=p_request_id;
 if found then
   if v_request.difficulty_id<>p_difficulty_id or v_request.raid_variant_id<>p_raid_variant_id then
     raise exception 'request payload conflict' using errcode='22023';
   end if;
   return public.raid_room_projection_v1(v_request.room_id);
 end if;
 if v_level is null or v_level<5 then raise exception 'raid level requirement' using errcode='42501'; end if;
 -- 難度枠を先にロックし、待機後に総合力と生成時刻を取得する。
 select * into v_rule from public.raid_room_lifecycle_rules where difficulty=p_difficulty_id for update;
 if not found then raise exception 'lifecycle rule unavailable' using errcode='22023'; end if;
 -- 空編成を既存集計関数のcoalesceで0として判定しない。初級には総合力制限がない。
 if p_difficulty_id<>'beginner' and not exists(
   select 1 from public.user_main_formations where user_id=v_uid
 ) then raise exception 'power unavailable' using errcode='42501'; end if;
 v_power := public.calculate_user_total_power(v_uid);
 if p_difficulty_id<>'beginner' and (v_power is null or v_power<0) then
   raise exception 'power unavailable' using errcode='42501';
 end if;
 v_gate := public._raid_room_power_gate_v1(p_difficulty_id,v_power);
 if v_gate->>'status' is distinct from 'passed' then
   raise exception 'raid power requirement' using errcode='42501';
 end if;
 select * into v_variant from public.canonical_raid_variants
   where raid_variant_id=p_raid_variant_id and is_production_enabled;
 if not found or v_variant.max_hp is null or v_variant.max_hp<=0 then
   raise exception 'raid variant unavailable' using errcode='22023';
 end if;
 select profile into v_launch from public.raid_room_combat_profiles
 where raid_variant_id=p_raid_variant_id and difficulty_id=p_difficulty_id;
 if not found then raise exception 'raid launch profile unavailable' using errcode='55000'; end if;
 v_variant.max_hp := (v_launch->>'maxHp')::bigint;
 -- Successful same-request receipts above are returned before any new-day target check.
 loop
  v_daily := private.raid_daily_targets_v1();
  v_now := clock_timestamp();
  exit when v_daily->>'dateJst' = ((v_now at time zone 'Asia/Tokyo')::date)::text;
 end loop;
 if not exists(select 1 from jsonb_array_elements(v_daily->'targets') t where t->>'variantId'=p_raid_variant_id) then
  raise exception 'raid variant outside daily targets' using errcode='22023';
 end if;
 v_instance := gen_random_uuid();
 -- 日次グループとの識別のみ。旧writerを遮断するものではないため設定は無効で出荷。
 insert into public.raid_bosses(id,boss_id,boss_master_id,current_hp,max_hp,base_id,status,
   spawned_at,expires_at,cycle_id,rotation_date,raid_variant_id,raid_day_key)
 values(v_instance,v_variant.raid_variant_id,v_variant.raid_variant_id,v_variant.max_hp,v_variant.max_hp,
   lower(v_variant.area_id),'ACTIVE',v_now,v_now+make_interval(hours=>v_rule.duration_hours),
   gen_random_uuid(),(v_now at time zone 'Asia/Tokyo')::date,v_variant.raid_variant_id,'ROOM:'||v_instance::text);
 v_room := (public._raid_room_register_v1(v_instance,v_uid,p_difficulty_id)->>'roomId')::uuid;
 insert into public.raid_room_combat_snapshots(room_id,profile,enemy_snapshot)
 values(v_room,v_launch,public._raid_room_launch_enemy_snapshot_v1(v_launch,v_instance,v_variant.max_hp));
 insert into public.raid_room_creation_requests(user_id,request_id,difficulty_id,raid_variant_id,room_id)
 values(v_uid,p_request_id,p_difficulty_id,p_raid_variant_id,v_room);
 -- Room登録・所有者参加・再送台帳まで同一transaction。資源消費や戦闘開始は行わない。
 return public.raid_room_projection_v1(v_room);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_preopen_guild_power_ranking(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_season public.ranking_seasons%rowtype;
  v_master public.ranking_guild_power_season_master%rowtype;
  v_my_guild_id uuid;
  v_rows jsonb:='[]'::jsonb;
  v_self jsonb;
  v_updated_at timestamptz;
  v_is_final boolean;
  v_is_current_context boolean;
  v_self_status text;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then
    raise exception 'invalid pagination' using errcode='22023';
  end if;
  select master.* into strict v_master from public.ranking_guild_power_season_master master
  where master.event_key='PREOPEN_GUILD_POWER_2026';
  select * into strict v_season from public.ranking_seasons where id=v_master.season_id;
  if clock_timestamp()>=v_season.starts_at and v_season.status='PREPARING' then
    perform public.activate_preopen_guild_power_season();
    select * into strict v_season from public.ranking_seasons where id=v_master.season_id;
  end if;
  if clock_timestamp()>=v_season.ends_at and v_season.status<>'CLOSED' then
    perform public.finalize_preopen_guild_power_season();
    select * into strict v_season from public.ranking_seasons where id=v_master.season_id;
  end if;
  select member.guild_id into v_my_guild_id from public.guild_members member
  where member.user_id=v_uid;
  v_is_final:=v_season.status='CLOSED';
  v_is_current_context:=clock_timestamp()>=v_season.starts_at and not exists(
    select 1 from public.ranking_seasons newer
    where newer.ranking_type=v_season.ranking_type
      and newer.starts_at>v_season.starts_at
  );

  if v_is_final then
    select coalesce(jsonb_agg(to_jsonb(page) order by page.rank_position,page.guild_id),'[]'::jsonb)
    into v_rows from (
      select snapshot.guild_id,snapshot.guild_name name,snapshot.total_power current_power,
        snapshot.total_power score,snapshot.member_count,snapshot.rank_position,snapshot.snapshotted_at updated_at
      from public.ranking_guild_power_season_snapshots snapshot
      where snapshot.season_id=v_season.id
      order by snapshot.rank_position,snapshot.guild_id limit p_limit offset p_offset
    ) page;
    -- Number the complete snapshot BEFORE selecting self; tied ranks are not row offsets.
    select to_jsonb(self_row) into v_self from (
      select snapshot.guild_id,snapshot.guild_name name,snapshot.total_power current_power,
        snapshot.total_power score,snapshot.member_count,snapshot.rank_position,snapshot.snapshotted_at updated_at,
        row_number() over(order by snapshot.rank_position,snapshot.guild_id)::integer row_position
      from public.ranking_guild_power_season_snapshots snapshot
      where snapshot.season_id=v_season.id
    ) self_row where self_row.guild_id=v_my_guild_id;
    select max(snapshot.snapshotted_at) into v_updated_at
    from public.ranking_guild_power_season_snapshots snapshot where snapshot.season_id=v_season.id;
  elsif clock_timestamp()>=v_season.starts_at and clock_timestamp()<v_season.ends_at then
    with totals as (
      select guild.id guild_id,guild.name,
        sum(public.calculate_user_total_power(member.user_id))::bigint current_power,
        count(*)::integer member_count
      from public.guilds guild join public.guild_members member on member.guild_id=guild.id
      where not exists(select 1 from public.ranking_guild_exclusions exclusion where exclusion.guild_id=guild.id)
      group by guild.id,guild.name
      having sum(public.calculate_user_total_power(member.user_id))>0
    ), ranked as (
      select totals.*,totals.current_power score,
        rank() over(order by totals.current_power desc)::integer rank_position,
        row_number() over(order by totals.current_power desc,totals.guild_id)::integer row_position
      from totals
    )
    select
      coalesce(
        jsonb_agg(to_jsonb(ranked)-'row_position' order by ranked.rank_position,ranked.guild_id)
          filter(where ranked.row_position>p_offset and ranked.row_position<=p_offset+p_limit),
        '[]'::jsonb
      ),
      (jsonb_agg(to_jsonb(ranked))
        filter(where ranked.guild_id=v_my_guild_id))->0
    into v_rows,v_self
    from ranked;
    v_updated_at:=clock_timestamp();
  else
    -- Before opening or during the short server-only finalization interval.
    v_rows:='[]'::jsonb;
    v_self:=null;
    v_updated_at:=v_season.updated_at;
  end if;

  v_self_status := case
    when v_self is not null then 'RANKED'
    when v_my_guild_id is null then 'NO_GUILD'
    when clock_timestamp()<v_season.starts_at then 'NOT_STARTED'
    when v_is_final then 'NO_SNAPSHOT'
    when exists(select 1 from public.ranking_guild_exclusions e where e.guild_id=v_my_guild_id) then 'EXCLUDED'
    else 'NO_RANKING_RECORD' end;
  return jsonb_build_object(
    'season_id',v_season.id,'event_key',v_master.event_key,
    'display_name',v_master.display_name,'display_period_text',v_master.display_period_text,
    'starts_at',v_season.starts_at,'ends_at',v_season.ends_at,'status',v_season.status,
    'is_finalized',v_is_final,'is_current_context',v_is_current_context,
    'server_updated_at',v_updated_at,
    'rows',v_rows,'self_guild',v_self,'self_status',v_self_status
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_snapshots(p_category text, p_period_type text, p_period_start date, p_period_end date, p_requested_by uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_run_id uuid;v_watermark timestamptz:=clock_timestamp();v_error_state text;v_error_message text;
begin
 if p_category not in('acquisition','active_retention','guild','content','revenue')then raise exception 'unsupported KPI category';end if;if p_period_type not in('daily','monthly','cohort')then raise exception 'unsupported KPI period type';end if;if p_period_end<=p_period_start or p_period_end>p_period_start+31 then raise exception 'KPI period must contain between 1 and 31 days';end if;
 insert into public.kpi_aggregation_runs(category,period_type,period_start,period_end,status,requested_by,aggregation_version,exclusion_rule_version,source_watermark)values(p_category,p_period_type,p_period_start,p_period_end,'pending',p_requested_by,'p0-v2-timeseries','period-classification-v1',v_watermark)returning run_id into v_run_id;
 begin
  if not pg_try_advisory_xact_lock(hashtextextended(concat_ws(':',p_category,p_period_type,p_period_start,p_period_end),0))then raise exception 'KPI refresh already running for this category and period';end if;perform set_config('statement_timeout','15000',true);update public.kpi_aggregation_runs set status='running',started_at=clock_timestamp()where run_id=v_run_id;
  case p_category when 'acquisition'then perform public.refresh_kpi_acquisition_v2(v_run_id,p_period_type,p_period_start,p_period_end,v_watermark);when 'active_retention'then if p_period_type='cohort'then perform public.refresh_kpi_active_retention(v_run_id,p_period_type,p_period_start,p_period_end,v_watermark);else perform public.refresh_kpi_active_timeseries_v2(v_run_id,p_period_type,p_period_start,p_period_end,v_watermark);end if;when 'guild'then perform public.refresh_kpi_guild_timeseries_v2(v_run_id,p_period_type,p_period_start,p_period_end,v_watermark);when 'content'then perform public.refresh_kpi_content(v_run_id,p_period_type,p_period_start,p_period_end,v_watermark);when 'revenue'then perform public.refresh_kpi_revenue(v_run_id,p_period_type,p_period_start,p_period_end);end case;
  update public.kpi_aggregation_runs set status='succeeded',finished_at=clock_timestamp()where run_id=v_run_id;
 exception when query_canceled then delete from public.kpi_metric_snapshots where run_id=v_run_id;update public.kpi_aggregation_runs set status='failed',finished_at=clock_timestamp(),error_code='57014',error_detail='KPI refresh exceeded statement timeout'where run_id=v_run_id;when others then get stacked diagnostics v_error_state=returned_sqlstate,v_error_message=message_text;delete from public.kpi_metric_snapshots where run_id=v_run_id;update public.kpi_aggregation_runs set status='failed',finished_at=clock_timestamp(),error_code=v_error_state,error_detail=left(v_error_message,2000)where run_id=v_run_id;end;return v_run_id;
end;$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_acquisition_v2(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
 perform public.refresh_kpi_acquisition(p_run_id,p_period_type,p_period_start,p_period_end,p_watermark);
 insert into public.kpi_metric_snapshots(run_id,metric_id,dimension_key,value,numerator,value_status,calculated_at)
 select p_run_id,m.metric_id,p.dimension_key,m.metric_value::numeric,m.metric_value,
  case when p_watermark<p.period_end_at then 'provisional' else 'final' end,clock_timestamp()
 from (select case when p_period_type='daily' then jsonb_build_object('date',p_period_start) else jsonb_build_object('month',to_char(p_period_start,'YYYY-MM')) end dimension_key,public.kpi_jst_day_start(p_period_end) period_end_at)p
 cross join lateral(values
 ('user.new_authenticated_eop',(select count(*) from public.kpi_subjects s where s.registered_at>=public.kpi_jst_day_start(p_period_start) and s.registered_at<p.period_end_at and(s.registration_type='authenticated' or s.first_authenticated_at<p.period_end_at)and not public.kpi_is_subject_excluded(s.subject_id,s.registered_at))),
 ('user.new_anonymous_eop',(select count(*) from public.kpi_subjects s where s.registered_at>=public.kpi_jst_day_start(p_period_start) and s.registered_at<p.period_end_at and s.registration_type<>'authenticated' and(s.first_authenticated_at is null or s.first_authenticated_at>=p.period_end_at)and not public.kpi_is_subject_excluded(s.subject_id,s.registered_at))))m(metric_id,metric_value);
end;$function$
;
CREATE OR REPLACE FUNCTION public.refresh_kpi_guild_timeseries_v2(p_run_id uuid, p_period_type text, p_period_start date, p_period_end date, p_watermark timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
 if p_period_type not in('daily','monthly')then raise exception 'guild timeseries supports daily or monthly periods';end if;
 if p_period_type='monthly' and(p_period_start<>date_trunc('month',p_period_start)::date or p_period_end<>(p_period_start+interval '1 month')::date)then raise exception 'monthly period must be one complete calendar month';end if;
 with b as(select public.kpi_jst_day_start(p_period_start) period_start_at,public.kpi_jst_day_start(p_period_end) period_end_at,case when p_period_type='daily' then jsonb_build_object('date',p_period_start)else jsonb_build_object('month',to_char(p_period_start,'YYYY-MM'))end dimension_key),v as(select g.id from public.guilds g,b where g.created_at<b.period_end_at and(g.disbanded_at is null or g.disbanded_at>=b.period_end_at)and not exists(select 1 from public.kpi_subjects l where l.source_user_id=g.leader_id and public.kpi_is_subject_excluded(l.subject_id,b.period_end_at-interval '1 microsecond'))),d as(select x::date metric_date,public.kpi_jst_day_start(x::date+1)day_end_at from generate_series(p_period_start::timestamp,(p_period_end-1)::timestamp,interval '1 day')x),a as(select d.metric_date,mp.guild_id,count(distinct ua.subject_id)active_members from d join public.kpi_guild_membership_periods mp on mp.joined_at<d.day_end_at and(mp.left_at is null or mp.left_at>=d.day_end_at)join public.kpi_daily_user_activity ua on ua.subject_id=mp.subject_id and ua.activity_date=d.metric_date and not public.kpi_is_subject_excluded(ua.subject_id,ua.last_active_at)join v on v.id=mp.guild_id group by d.metric_date,mp.guild_id),z as(select(select count(*)from v)::bigint valid_count,(select count(distinct guild_id)from a where active_members>=3)::bigint active_count,(select count(distinct mp.subject_id)from public.kpi_guild_membership_periods mp join v on v.id=mp.guild_id cross join b where mp.joined_at<b.period_end_at and(mp.left_at is null or mp.left_at>=b.period_end_at)and not public.kpi_is_subject_excluded(mp.subject_id,b.period_end_at-interval '1 microsecond'))::bigint member_total,(select count(*)from public.guilds g,b where g.created_at>=b.period_start_at and g.created_at<b.period_end_at)::bigint created_count,(select count(*)from public.guilds g,b where g.disbanded_at>=b.period_start_at and g.disbanded_at<b.period_end_at)::bigint disbanded_count)
 insert into public.kpi_metric_snapshots(run_id,metric_id,dimension_key,value,numerator,denominator,value_status,null_reason,calculated_at)
 select p_run_id,m.metric_id,b.dimension_key,m.metric_value,m.numerator,m.denominator,case when p_watermark<b.period_end_at then 'provisional' else 'final' end,m.null_reason,clock_timestamp()from z cross join b cross join lateral(values('guild.valid_count',z.valid_count::numeric,z.valid_count,null::bigint,null::text),('guild.active_count',z.active_count::numeric,z.active_count,null::bigint,null::text),('guild.active_rate',case when z.valid_count=0 then null else z.active_count::numeric/z.valid_count end,z.active_count,z.valid_count,case when z.valid_count=0 then 'zero_denominator' else null end),('guild.member_total',z.member_total::numeric,z.member_total,null::bigint,null::text),('guild.member_average',case when z.valid_count=0 then null else z.member_total::numeric/z.valid_count end,z.member_total,z.valid_count,case when z.valid_count=0 then 'zero_denominator' else null end),('guild.created_count',z.created_count::numeric,z.created_count,null::bigint,null::text),('guild.disbanded_count',z.disbanded_count::numeric,z.disbanded_count,null::bigint,null::text))m(metric_id,metric_value,numerator,denominator,null_reason);
end;$function$
;
CREATE OR REPLACE FUNCTION public.kpi_v249_current_subject()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_subject uuid; v_user uuid := auth.uid(); v_session uuid;
begin
  if v_user is null or auth.jwt()->>'role' is distinct from 'authenticated' then
    raise exception 'Valid authenticated session required' using errcode = '42501';
  end if;
  begin v_session := (auth.jwt()->>'session_id')::uuid;
  exception when invalid_text_representation then
    raise exception 'Invalid session context' using errcode = '42501';
  end;
  if v_session is null or not exists (
    select 1 from auth.sessions where id = v_session and user_id = v_user
      and (not_after is null or not_after > clock_timestamp())
  ) then raise exception 'Session is not active' using errcode = '42501'; end if;
  select subject_id into v_subject from public.kpi_subjects
  where source_user_id = v_user and detached_at is null;
  if v_subject is null then
    raise exception 'Game Start subject does not exist' using errcode = '42501';
  end if;
  return v_subject;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.begin_kpi_acquisition_journey_v1(p_token text, p_source text DEFAULT 'web_v1'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_hash text; v_row public.kpi_acquisition_journeys%rowtype;
begin
  -- Token must be generated with a CSPRNG by the server/browser. Never logged by
  -- the future API. PostgreSQL/API query logging must redact RPC parameters.
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' or p_source is null
     or p_source not in ('web_v1','server_v1','qa_v1')
     or (auth.jwt()->>'role' is distinct from 'service_role' and p_source<>'web_v1') then
    raise exception 'Invalid acquisition request' using errcode = '22023';
  end if;
  v_hash := encode(sha256(convert_to(p_token,'UTF8')),'hex');
  perform pg_advisory_xact_lock(hashtextextended('kpi249:journey:'||v_hash,0));
  select * into v_row from public.kpi_acquisition_journeys where journey_token_hash = v_hash;
  if found then
    if v_row.source is distinct from p_source then
      raise exception 'Conflicting journey retry' using errcode = '23505';
    end if;
    return v_row.journey_id;
  end if;
  insert into public.kpi_acquisition_journeys(journey_token_hash,source)
  values(v_hash,p_source) returning * into v_row;
  return v_row.journey_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_kpi_acquisition_observation_v1(p_token text, p_event_type text, p_idempotency_key text, p_metadata jsonb DEFAULT '{}'::jsonb, p_source text DEFAULT 'web_v1'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_journey uuid; v_row public.kpi_acquisition_journey_facts%rowtype;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$'
     or p_event_type is null or p_event_type not in
       ('TITLE_ARRIVED','TAP_TO_START','WORLD_INTRO_STARTED','WORLD_INTRO_COMPLETED','NAME_COMPLETED','WORLD_INTRO_VIEWED','WORLD_INTRO_SKIPPED')
     or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_.:-]{1,128}$'
     or p_source is null or p_source not in ('web_v1','server_v1','qa_v1')
     or not public.kpi_v249_metadata_valid(p_metadata)
     or (auth.jwt()->>'role' is distinct from 'service_role' and (p_source<>'web_v1' or p_metadata ? 'qa')) then
    raise exception 'Invalid acquisition observation' using errcode = '22023';
  end if;
  select journey_id into v_journey from public.kpi_acquisition_journeys
  where journey_token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
  if v_journey is null then raise exception 'Unknown journey' using errcode = '42501'; end if;
  select * into v_row from public.kpi_acquisition_journey_facts
  where journey_id = v_journey and idempotency_key = p_idempotency_key;
  if found then
    if v_row.event_type is distinct from p_event_type or v_row.source is distinct from p_source
       or v_row.metadata is distinct from p_metadata then
      raise exception 'Conflicting observation retry' using errcode = '23505';
    end if;
    return v_row.id;
  end if;
  -- No inferred ordering and no writes to Game Start subjects. NAME_COMPLETED
  -- is an observation; the successful binding/registered_at remains authority.
  insert into public.kpi_acquisition_journey_facts(journey_id,event_type,idempotency_key,metadata,source)
  values(v_journey,p_event_type,p_idempotency_key,p_metadata,p_source) returning * into v_row;
  return v_row.id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_kpi_subject_identity_transition_v1(p_from_subject_id uuid, p_to_subject_id uuid, p_transition_type text, p_context_id uuid, p_idempotency_key text, p_metadata jsonb DEFAULT '{}'::jsonb, p_source text DEFAULT 'server_v1'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_row public.kpi_subject_identity_transition_facts%rowtype;
begin
  if p_transition_type not in ('AUTH_LINK_SAME_SUBJECT','ACCOUNT_SWITCH_TO_EXISTING')
    or p_from_subject_id is null or p_to_subject_id is null or p_context_id is null
    or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_.:-]{1,128}$'
    or p_source not in ('server_v1','qa_v1') or not public.kpi_v249_metadata_valid(p_metadata)
    or not exists(select 1 from public.kpi_subjects where subject_id=p_from_subject_id)
    or not exists(select 1 from public.kpi_subjects where subject_id=p_to_subject_id) then
    raise exception 'Invalid identity transition' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('kpi249:identity:'||p_idempotency_key,0));
  select * into v_row from public.kpi_subject_identity_transition_facts where idempotency_key=p_idempotency_key;
  if found then
    if to_jsonb(v_row)-array['id','occurred_at','recorded_at'] is distinct from
      jsonb_build_object('from_subject_id',p_from_subject_id,'to_subject_id',p_to_subject_id,
       'transition_type',p_transition_type,'source',p_source,'schema_version',1,'idempotency_key',p_idempotency_key,
       'context_id',p_context_id,'metadata',p_metadata) then
      raise exception 'Conflicting identity retry' using errcode='23505'; end if;
    return v_row.id;
  end if;
  insert into public.kpi_subject_identity_transition_facts(from_subject_id,to_subject_id,transition_type,
    source,idempotency_key,context_id,metadata)
  values(p_from_subject_id,p_to_subject_id,p_transition_type,p_source,p_idempotency_key,p_context_id,p_metadata)
  returning * into v_row; return v_row.id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_v249_guild_member_joined()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_period bigint; v_subject uuid; v_type text;
begin
  select p.id,p.subject_id into v_period,v_subject from public.kpi_guild_membership_periods p
    join public.kpi_subjects s on s.subject_id=p.subject_id
    where p.source_membership_id=new.id and s.source_user_id=new.user_id;
  if v_period is null then raise exception 'KPI membership period missing'; end if;
  select case when g.leader_id=new.user_id and new.role='MASTER' then 'CREATE' else 'JOIN' end
    into v_type from public.guilds g where g.id=new.guild_id;
  insert into public.kpi_guild_conversion_facts(subject_id,guild_id,membership_period_id,conversion_type,
    occurred_at,source,idempotency_key)
  values(v_subject,new.guild_id,v_period,v_type,new.joined_at,'server_v1','guild-membership:'||new.id);
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_v249_guild_chat_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_period bigint; v_subject uuid; v_fact uuid;
begin
  if new.target_type<>'GUILD' or new.user_id is null or new.is_system then return new; end if;
  select p.id,p.subject_id into v_period,v_subject from public.kpi_guild_membership_periods p
    join public.kpi_subjects s on s.subject_id=p.subject_id
    where s.source_user_id=new.user_id and p.guild_id=new.target_id and p.joined_at<=new.created_at
      and (p.left_at is null or new.created_at<=p.left_at)
    order by p.joined_at desc limit 1;
  if v_period is null then raise exception 'Guild chat membership period missing'; end if;
  insert into public.kpi_guild_chat_message_facts(subject_id,guild_id,membership_period_id,source_message_id,
    occurred_at,source,idempotency_key)
  values(v_subject,new.target_id,v_period,new.id,new.created_at,'server_v1','guild-message:'||new.id)
  returning id into v_fact;
  insert into public.kpi_guild_chat_activation_facts(subject_id,guild_id,membership_period_id,
    first_message_fact_id,occurred_at,source)
  values(v_subject,new.target_id,v_period,v_fact,new.created_at,'server_v1')
  on conflict(membership_period_id) do nothing;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.create_kpi_marketing_import_batch_v1(p_source text, p_actor_identifier uuid, p_file_hash text, p_idempotency_key text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_row public.kpi_marketing_import_batches%rowtype; v_admin boolean;
begin
  v_admin := auth.jwt()->>'role'='service_role' or coalesce(auth.jwt()->'app_metadata'->>'role','')='admin';
  if not v_admin or p_source not in ('x_ads_manager_manual','x_ads_manager_import')
    or p_actor_identifier is null or (p_file_hash is not null and p_file_hash !~ '^[a-f0-9]{64}$')
    or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_.:-]{1,128}$'
    or not public.kpi_v249_metadata_valid(p_metadata)
    or (auth.jwt()->>'role'<>'service_role' and p_actor_identifier is distinct from auth.uid()) then
    raise exception 'Invalid marketing batch request' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended('kpi249:marketing-batch:'||p_idempotency_key,0));
  select * into v_row from public.kpi_marketing_import_batches where idempotency_key=p_idempotency_key;
  if found then
    if v_row.source is distinct from p_source or v_row.actor_identifier is distinct from p_actor_identifier
      or v_row.file_hash is distinct from p_file_hash or v_row.metadata is distinct from p_metadata then
      raise exception 'Conflicting marketing batch retry' using errcode='23505'; end if;
    return v_row.id; end if;
  insert into public.kpi_marketing_import_batches(platform,source,actor_identifier,file_hash,idempotency_key,metadata)
  values('X',p_source,p_actor_identifier,p_file_hash,p_idempotency_key,p_metadata) returning * into v_row;
  return v_row.id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_kpi_marketing_daily_revision_v1(p_batch_id uuid, p_report_date_jst date, p_account_key text, p_campaign_key text, p_campaign_name text, p_line_item_key text, p_line_item_name text, p_creative_key text, p_creative_name text, p_reporting_grain text, p_spend numeric, p_currency text, p_impressions bigint, p_clicks bigint, p_external_key text, p_revision integer, p_idempotency_key text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_row public.kpi_marketing_daily_fact_revisions%rowtype; v_scope uuid; v_payload text;
begin
  if not (auth.jwt()->>'role'='service_role' or coalesce(auth.jwt()->'app_metadata'->>'role','')='admin')
    or not exists(select 1 from public.kpi_marketing_import_batches where id=p_batch_id)
    or not public.kpi_v249_metadata_valid(p_metadata) then
    raise exception 'Invalid marketing revision request' using errcode='42501'; end if;
  v_payload:=jsonb_build_object('batch_id',p_batch_id,'date',p_report_date_jst,'account',p_account_key,
    'campaign',p_campaign_key,'campaign_name',p_campaign_name,'line_item',p_line_item_key,
    'line_item_name',p_line_item_name,'creative',p_creative_key,'creative_name',p_creative_name,
    'grain',p_reporting_grain,'spend',p_spend,'currency',p_currency,'impressions',p_impressions,
    'clicks',p_clicks,'external_key',p_external_key,'revision',p_revision,'metadata',p_metadata)::text;
  perform pg_advisory_xact_lock(hashtextextended('kpi249:marketing:'||p_idempotency_key,0));
  select * into v_row from public.kpi_marketing_daily_fact_revisions where idempotency_key=p_idempotency_key;
  if found then
    if v_row.payload_hash<>encode(sha256(convert_to(v_payload,'UTF8')),'hex') then
      raise exception 'Conflicting marketing revision retry' using errcode='23505'; end if;
    return v_row.id; end if;
  insert into public.kpi_marketing_reporting_scopes(platform,report_date_jst,account_key,currency,reporting_grain)
  values('X',p_report_date_jst,p_account_key,p_currency,p_reporting_grain)
  on conflict(platform,report_date_jst,account_key,currency) do update set reporting_grain=excluded.reporting_grain
    where public.kpi_marketing_reporting_scopes.reporting_grain=excluded.reporting_grain
  returning id into v_scope;
  if v_scope is null then raise exception 'Mixed reporting grain for coverage scope' using errcode='23505'; end if;
  insert into public.kpi_marketing_daily_fact_revisions(scope_id,platform,report_date_jst,source_timezone,
    account_key,campaign_key,campaign_name,line_item_key,line_item_name,creative_key,creative_name,
    reporting_grain,spend,currency,impressions,clicks,external_key,revision,batch_id,idempotency_key,payload_hash,metadata)
  values(v_scope,'X',p_report_date_jst,'Asia/Tokyo',p_account_key,p_campaign_key,p_campaign_name,
    p_line_item_key,p_line_item_name,p_creative_key,p_creative_name,p_reporting_grain,p_spend,p_currency,
    p_impressions,p_clicks,p_external_key,p_revision,p_batch_id,p_idempotency_key,
    encode(sha256(convert_to(v_payload,'UTF8')),'hex'),p_metadata) returning * into v_row;
  return v_row.id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_v250_landing_metadata_valid(p_metadata jsonb)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
select coalesce(case
  when p_metadata is null or jsonb_typeof(p_metadata)<>'object' then false
  when octet_length(p_metadata::text)>4096 then false
  when not p_metadata ?& array['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
    'referrer','landing_path','fbclid','x_click_id'] then false
  when coalesce(p_metadata->>'utm_source','') not in ('meta','x','organic','direct','unknown') then false
  when p_metadata ? 'capture_version' and (
    p_metadata->>'capture_version' is distinct from 'first-touch-source-v2'
    or not p_metadata ? 'utm_source_raw') then false
  else not exists(select 1 from jsonb_each(p_metadata) e where
    (e.key not in ('utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer',
      'landing_path','fbclid','x_click_id') and (
      p_metadata->>'capture_version' is distinct from 'first-touch-source-v2'
      or e.key not in ('capture_version','utm_source_raw','truncated_fields')))
    or jsonb_typeof(e.value) not in ('string','null')
    or (jsonb_typeof(e.value)='string' and length(e.value #>> '{}')>
      case when e.key in ('referrer','landing_path') then 1024 else 256 end))
end,false);
$function$
;
CREATE OR REPLACE FUNCTION public.record_kpi_acquisition_landing_v1(p_token text, p_metadata jsonb, p_source text DEFAULT 'web_v1'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_journey uuid;
  v_existing_metadata jsonb;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$'
     or p_source is null or p_source <> 'web_v1'
     or not public.kpi_v250_landing_metadata_valid(p_metadata)
     or auth.jwt()->>'role' is null
     or auth.jwt()->>'role' not in ('anon', 'authenticated', 'service_role') then
    raise exception 'Invalid acquisition Landing' using errcode = '22023';
  end if;

  v_journey := public.begin_kpi_acquisition_journey_v1(p_token, p_source);

  select metadata
  into v_existing_metadata
  from public.kpi_acquisition_journeys
  where journey_id = v_journey
  for update;

  if v_existing_metadata <> '{}'::jsonb
     and v_existing_metadata is distinct from p_metadata then
    raise exception 'Conflicting Landing attribution retry' using errcode = '23505';
  end if;

  if v_existing_metadata = '{}'::jsonb then
    update public.kpi_acquisition_journeys
    set metadata = p_metadata
    where journey_id = v_journey;
  end if;

  perform public.record_kpi_acquisition_observation_v1(
    p_token,
    'TITLE_ARRIVED',
    'title_arrived:v1',
    '{}'::jsonb,
    p_source
  );

  return v_journey;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_overview_saved_rate(n bigint, d bigint, t numeric, r text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
select jsonb_build_object('numerator',n,'denominator',d,'value',n::numeric/nullif(d,0),'target',t,
  'status',case when d is null or d=0 then 'NOT_READY' when n::numeric/d>=t then 'PASS' else 'FAIL' end,
  'reason',case when d=0 then 'zero_denominator' when d is null then 'immature_cohorts' else r end,
  'observation_status',case when d is null then 'incomplete' when r='mature_cohorts_only' then 'partial' else 'complete' end);
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_guard_acquisition_first_touch()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if tg_table_name='kpi_acquisition_subject_bindings' then
    if old.first_touch_source is not null and (tg_op='DELETE' or to_jsonb(new) is distinct from to_jsonb(old)) then
      raise exception 'Canonical First Touch is immutable' using errcode='23514';
    end if;
    if tg_op='UPDATE' and (new.journey_id is distinct from old.journey_id or new.subject_id is distinct from old.subject_id) then
      raise exception 'Acquisition binding identity is immutable' using errcode='23514';
    end if;
  elsif tg_op='UPDATE' then
    if (to_jsonb(new)-'metadata'-'first_arrived_at') is distinct from (to_jsonb(old)-'metadata'-'first_arrived_at')
      or (old.metadata<>'{}'::jsonb and new.metadata is distinct from old.metadata) then
      raise exception 'Acquisition Journey is immutable' using errcode='23514';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.bind_kpi_acquisition_subject_v2(p_tokens text[], p_source text DEFAULT 'web_v1'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_subject uuid := public.kpi_v249_current_subject();
  v_token text; v_journey uuid; v_existing public.kpi_acquisition_subject_bindings%rowtype;
  v_selected record;
begin
  if p_source is distinct from 'web_v1' or p_tokens is null or cardinality(p_tokens) not between 1 and 16
    or exists(select 1 from unnest(p_tokens) t where t is null or t !~ '^[a-f0-9]{64}$') then
    raise exception 'Invalid binding request' using errcode='22023';
  end if;
  -- 全writerがSubjectを先にロックする。Subjectはclient引数で受けない。
  perform 1 from public.kpi_subjects where subject_id=v_subject for update;
  for v_token in select distinct t from unnest(p_tokens) t order by t loop
    select journey_id into v_journey from public.kpi_acquisition_journeys
      where journey_token_hash=encode(sha256(convert_to(v_token,'UTF8')),'hex') and source=p_source for update;
    if v_journey is null then raise exception 'Unknown journey' using errcode='42501'; end if;
    select * into v_existing from public.kpi_acquisition_subject_bindings where journey_id=v_journey;
    if found then
      if v_existing.subject_id is distinct from v_subject or v_existing.source is distinct from p_source then
        raise exception 'Journey already bound with different payload' using errcode='23505';
      end if;
    else
      insert into public.kpi_acquisition_subject_bindings(journey_id,subject_id,source)
        values(v_journey,v_subject,p_source);
    end if;
  end loop;
  if not exists(select 1 from public.kpi_acquisition_subject_bindings
    where subject_id=v_subject and first_touch_source is not null) then
    select j.journey_id,j.metadata into v_selected
      from public.kpi_acquisition_subject_bindings b join public.kpi_acquisition_valid_journeys_v1 j using(journey_id)
      where b.subject_id=v_subject and b.source<>'qa_v1'
        and not public.kpi_is_subject_excluded(v_subject,j.first_arrived_at)
      order by j.first_arrived_at,j.journey_id limit 1;
    if found then
      update public.kpi_acquisition_subject_bindings set
        first_touch_source=v_selected.metadata->>'utm_source',first_touch_fixed_at=clock_timestamp(),
        first_touch_rule_version=case when v_selected.metadata->>'capture_version'='first-touch-source-v2'
          then 'first-touch-source-v2' else 'legacy-source-v1' end
        where journey_id=v_selected.journey_id and first_touch_source is null;
    end if;
  end if;
  return v_subject;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_source_rate_v1(n bigint, d bigint, r text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
select jsonb_build_object('numerator',n,'denominator',d,'value',n::numeric/nullif(d,0),
  'status',case when n is null or d is null or d=0 then 'NOT_READY' else 'AVAILABLE' end,
  'reason',case when d=0 then 'zero_denominator' else r end);
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_daily_engagement_v1(p_from date, p_to date)
 RETURNS TABLE(activity_date date, dau bigint, guild_dau bigint, social_active_uu bigint, raid_point_active_uu bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
with activity as materialized (
  -- 保存済みOverviewと同一のCanonical DAU・除外Authority。
  select a.activity_date,a.subject_id,s.source_user_id,
    exists(select 1 from public.kpi_guild_membership_periods m
      where m.subject_id=a.subject_id
        and m.joined_at<public.kpi_jst_day_start(a.activity_date+1)
        and (m.left_at is null or m.left_at>=public.kpi_jst_day_start(a.activity_date+1))) guild_member
  from public.kpi_daily_user_activity a
  left join public.kpi_subjects s using(subject_id)
  where a.activity_date between p_from and p_to
    and not public.kpi_is_subject_excluded(a.subject_id,a.last_active_at)
), actions as (
  -- Guild/Global Chatは現存する人間投稿。削除後も残る旧Activation Factとは区別する。
  select b.user_id,b.created_at
  from public.board_posts b
  where b.created_at>=public.kpi_jst_day_start(p_from)
    and b.created_at<public.kpi_jst_day_start(p_to+1)
    and b.target_type in ('GUILD','GLOBAL') and not b.is_system and b.user_id is not null
    and char_length(trim(b.content)) between 1 and 140
    and (b.target_type='GLOBAL' or exists(
      select 1 from public.kpi_guild_membership_periods m join public.kpi_subjects s using(subject_id)
      where s.source_user_id=b.user_id and m.guild_id=b.target_id
        and m.joined_at<=b.created_at and (m.left_at is null or b.created_at<m.left_at)))
  union all
  select d.sender_id,d.created_at from public.direct_messages d
  where d.created_at>=public.kpi_jst_day_start(p_from)
    and d.created_at<public.kpi_jst_day_start(p_to+1)
    and d.sender_id<>d.recipient_id and char_length(trim(d.message)) between 1 and 140
  union all
  -- スレッドの本文投稿と返信投稿は別Authority。どちらもBBS投稿。
  select t.user_id,t.created_at from public.bbs_threads t
  where t.created_at>=public.kpi_jst_day_start(p_from)
    and t.created_at<public.kpi_jst_day_start(p_to+1)
    and t.category in ('RECRUIT','STRATEGY_CHAT')
    and char_length(trim(t.title)) between 1 and 50 and char_length(trim(t.content)) between 1 and 200
  union all
  select p.user_id,p.created_at from public.bbs_posts p
  join public.bbs_threads t on t.id=p.thread_id
  where p.created_at>=public.kpi_jst_day_start(p_from)
    and p.created_at<public.kpi_jst_day_start(p_to+1)
    and t.category in ('RECRUIT','STRATEGY_CHAT') and char_length(trim(p.content)) between 1 and 200
), social as (
  select distinct a.activity_date,a.subject_id
  from activity a join actions x on x.user_id=a.source_user_id
    and x.created_at>=public.kpi_jst_day_start(a.activity_date)
    and x.created_at<public.kpi_jst_day_start(a.activity_date+1)
  where a.guild_member and not public.kpi_is_subject_excluded(a.subject_id,x.created_at)
), raid as (
  -- 開始transactionで減算と同時に記録されたcost。無料・Cash・Diamondや完了回数は使わない。
  select a.activity_date,a.subject_id
  from activity a join public.battle_replay_sessions r on r.requester_user_id=a.source_user_id
    and r.created_at>=public.kpi_jst_day_start(a.activity_date)
    and r.created_at<public.kpi_jst_day_start(a.activity_date+1)
  where r.battle_mode='RAID' and r.resolution_authority='RAID_SERVER'
    and r.official_context->>'costType'='RAID_POINT'
    and not public.kpi_is_subject_excluded(a.subject_id,r.created_at)
  group by a.activity_date,a.subject_id
  having sum(case when jsonb_typeof(r.official_context->'cost')='number'
      and r.official_context->>'cost' ~ '^[0-9]+$'
    then (r.official_context->>'cost')::numeric else 0 end)>=3
)
select d::date,count(a.subject_id),count(a.subject_id) filter(where a.guild_member),
  count(s.subject_id),count(r.subject_id)
from generate_series(p_from::timestamp,p_to::timestamp,interval '1 day') d
left join activity a on a.activity_date=d::date
left join social s on s.activity_date=a.activity_date and s.subject_id=a.subject_id
left join raid r on r.activity_date=a.activity_date and r.subject_id=a.subject_id
group by d order by d;
$function$
;
CREATE OR REPLACE FUNCTION public.raid_room_can_read_v1(p_room_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select auth.uid() is not null and exists (
    select 1
    from public.raid_rooms r
    join public.raid_bosses b on b.id = r.raid_boss_instance_id
    where r.id = p_room_id
      and (
        (
          b.status = 'ACTIVE'
          and b.current_hp > 0
          and b.expires_at > statement_timestamp()
          and b.outcome_finalized_at is null
          and (
            b.raid_day_key like 'DAILY:%'
            or r.owner_user_id = auth.uid()
            or exists (
              select 1 from public.raid_room_members m
              where m.room_id = r.id and m.user_id = auth.uid()
            )
            or exists (
              select 1 from public.raid_instance_user_progress p
              where p.raid_boss_instance_id = r.raid_boss_instance_id
                and p.user_id = auth.uid() and p.finalized_battles > 0
            )
            or exists (
              select 1
              from public.raid_room_rescue_publications rp
              where rp.room_id = r.id
                and (
                  rp.channel = 'ACTIVITY'
                  or (
                    rp.channel = 'GUILD'
                    and exists (
                      select 1 from public.guild_members gm
                      where gm.user_id = auth.uid() and gm.guild_id = rp.guild_id
                    )
                  )
                )
            )
          )
        )
        or r.owner_user_id = auth.uid()
        or exists (
          select 1 from public.raid_room_members m
          where m.room_id = r.id and m.user_id = auth.uid()
        )
        or exists (
          select 1 from public.raid_instance_user_progress p
          where p.raid_boss_instance_id = r.raid_boss_instance_id
            and p.user_id = auth.uid() and p.finalized_battles > 0
        )
      )
  );
$function$
;
CREATE OR REPLACE FUNCTION public.list_raid_rooms_v1(p_difficulty_id text DEFAULT NULL::text, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_items jsonb; v_count integer;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit is null or p_limit < 1 or p_limit > 100 or p_offset is null or p_offset < 0 or p_offset > 1000000
    or (p_difficulty_id is not null and p_difficulty_id not in ('beginner','intermediate','advanced','expert')) then
    raise exception 'invalid pagination or difficulty' using errcode='22023';
  end if;
  with page as (
    select r.id,r.created_at from public.raid_rooms r
    where (p_difficulty_id is null or r.difficulty_id=p_difficulty_id)
      and public.raid_room_can_read_v1(r.id)
    order by r.created_at desc,r.id limit p_limit + 1 offset p_offset
  ), numbered as (select *,row_number() over(order by created_at desc,id) n from page)
  select coalesce(jsonb_agg(public.raid_room_projection_v1(id) order by created_at desc,id)
    filter(where n <= p_limit),'[]'::jsonb),count(*) into v_items,v_count from numbered;
  return jsonb_build_object('rooms',v_items,'nextOffset',case when v_count > p_limit then p_offset+p_limit else null end);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_participants_v1(p_room_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_items jsonb; v_count integer; v_instance uuid;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.raid_rooms r where r.id=p_room_id and (
    r.owner_user_id=auth.uid() or exists(select 1 from public.raid_room_members m where m.room_id=r.id and m.user_id=auth.uid())
    or exists(select 1 from public.raid_instance_user_progress p where p.raid_boss_instance_id=r.raid_boss_instance_id and p.user_id=auth.uid() and p.finalized_battles>0))) then
    raise exception 'room unavailable' using errcode='P0002';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 100 or p_offset is null or p_offset < 0 or p_offset > 1000000 then
    raise exception 'invalid pagination' using errcode='22023';
  end if;
  select raid_boss_instance_id into v_instance from public.raid_rooms where id=p_room_id;
  with members as (
    select owner_user_id as user_id from public.raid_rooms where id=p_room_id
    union select user_id from public.raid_room_members where room_id=p_room_id
    union select user_id from public.raid_instance_user_progress
      where raid_boss_instance_id=v_instance and finalized_battles>0
  ), page as (
    select m.user_id,coalesce(p.finalized_battles,0) finalized_battles
    from members m left join public.raid_instance_user_progress p
      on p.raid_boss_instance_id=v_instance and p.user_id=m.user_id
    order by m.user_id limit p_limit+1 offset p_offset
  ), numbered as (select *,row_number() over(order by user_id) n from page), projected as (
    select p.n,p.user_id,jsonb_build_object(
      'roomId',p_room_id,
      'player',jsonb_build_object('userId',u.id,'name',u.username,'leaderIconUrl',jsonb_build_object('status','unknown')),
      'currentGuild',case when membership.guild_id is not null and current_guild.id is null
        then jsonb_build_object('status','unknown')
        else jsonb_build_object('status','available','value',case when current_guild.id is null then null
          else jsonb_build_object('guildId',current_guild.id,'name',current_guild.name) end) end,
      'battleGuildSnapshot',case when latest.id is null or (latest.guild_id is not null and battle_guild.id is null)
        then jsonb_build_object('status','unknown')
        else jsonb_build_object('status','available','value',case when latest.guild_id is null then null
          else jsonb_build_object('guildId',latest.guild_id,'name',battle_guild.name) end) end,
      'finalizedBattles',jsonb_build_object('status','available','value',p.finalized_battles),
      'rawDamage',case when damage.log_count=0 then jsonb_build_object('status','unknown')
        else jsonb_build_object('status','available','value',damage.raw_damage) end,
      'appliedDamage',case when damage.log_count=0 then jsonb_build_object('status','unknown')
        else jsonb_build_object('status','available','value',damage.applied_damage) end
    ) dto
    from numbered p join public.users u on u.id=p.user_id
    left join public.guild_members membership on membership.user_id=p.user_id
    left join public.guilds current_guild on current_guild.id=membership.guild_id
    left join lateral (
      select l.id,l.guild_id from public.raid_damage_logs l
      where l.raid_boss_instance_id=v_instance and l.user_id=p.user_id
      order by l.created_at desc,l.id desc limit 1
    ) latest on true
    left join public.guilds battle_guild on battle_guild.id=latest.guild_id
    left join lateral (
      select count(*) log_count,sum(l.raw_damage) raw_damage,sum(l.applied_damage) applied_damage
      from public.raid_damage_logs l where l.raid_boss_instance_id=v_instance and l.user_id=p.user_id
    ) damage on true
  ) select coalesce(jsonb_agg(dto order by user_id) filter(where n<=p_limit),'[]'::jsonb),count(*)
    into v_items,v_count from projected;
  return jsonb_build_object('participants',v_items,'nextOffset',case when v_count>p_limit then p_offset+p_limit else null end);
end $function$
;
CREATE OR REPLACE FUNCTION public._raid_room_power_gate_v1(p_difficulty text, p_power bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
declare
  v_minimum bigint;
  v_actual bigint := case when p_power >= 0 then p_power else null end;
  v_status text;
  v_reason text;
begin
  if p_difficulty is null or p_difficulty not in ('beginner', 'intermediate', 'advanced', 'expert') then
    v_status := 'unknown';
    v_reason := 'invalid_difficulty';
  else
    select r.minimum_power into v_minimum
      from public.raid_room_difficulty_rules r where r.difficulty = p_difficulty;
    if not found then
      v_status := 'unknown';
      v_reason := 'rule_unavailable';
    elsif v_minimum is null then
      -- 初級は総合力条件だけを通過。参加許可全体を意味しない。
      v_status := 'passed';
      v_reason := 'no_power_restriction';
    elsif v_actual is null then
      v_status := 'unknown';
      v_reason := case when p_power is null then 'power_unavailable' else 'invalid_power' end;
    elsif v_actual >= v_minimum then
      v_status := 'passed';
      v_reason := 'meets_minimum';
    else
      v_status := 'failed';
      v_reason := 'below_minimum';
    end if;
  end if;
  return jsonb_build_object('status', v_status, 'minimumPower', v_minimum,
    'actualPower', v_actual, 'reason', v_reason);
end;
$function$
;
CREATE OR REPLACE FUNCTION public._raid_room_rescue_gate_v1(p_difficulty text, p_via_rescue boolean, p_finalized_battles bigint, p_contribution_damage bigint, p_room_cleared boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
declare
  v_rule public.raid_room_difficulty_rules%rowtype;
  v_status text := 'unknown';
  v_reason text;
begin
  if p_difficulty is null or p_difficulty not in ('beginner', 'intermediate', 'advanced', 'expert') then
    v_reason := 'invalid_difficulty';
  else
    select r.* into v_rule from public.raid_room_difficulty_rules r where r.difficulty = p_difficulty;
    if not found then
      v_reason := 'rule_unavailable';
    elsif v_rule.rescue_min_battles is null or v_rule.rescue_min_contribution_damage is null then
      v_reason := 'thresholds_unconfigured';
    elsif p_finalized_battles < 0 or p_contribution_damage < 0 then
      v_reason := 'invalid_input';
    elsif p_via_rescue is null or p_finalized_battles is null
      or p_contribution_damage is null or p_room_cleared is null then
      v_reason := 'input_unavailable';
    elsif p_via_rescue and p_room_cleared
      and p_finalized_battles >= v_rule.rescue_min_battles
      and p_contribution_damage >= v_rule.rescue_min_contribution_damage then
      v_status := 'succeeded';
      v_reason := 'conditions_met';
    else
      v_status := 'not_succeeded';
      v_reason := 'conditions_not_met';
    end if;
  end if;
  return jsonb_build_object('status', v_status, 'reason', v_reason,
    'ruleVersion', v_rule.rule_version,
    'minimumBattles', v_rule.rescue_min_battles,
    'minimumContributionDamage', v_rule.rescue_min_contribution_damage);
end;
$function$
;
CREATE OR REPLACE FUNCTION public._raid_room_register_v1(p_instance_id uuid, p_owner_user_id uuid, p_difficulty_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_rule public.raid_room_lifecycle_rules%rowtype;
 v_boss public.raid_bosses%rowtype;
 v_room public.raid_rooms%rowtype;
 v_now timestamptz;
 v_count bigint;
begin
 if current_setting('transaction_isolation') <> 'read committed' then
   raise exception 'read committed required' using errcode='25001';
 end if;
 if p_instance_id is null or p_owner_user_id is null or p_difficulty_id is null then
   raise exception 'invalid registration input' using errcode='22023';
 end if;
 -- 同難度の枠確認と登録を直列化。待機後の別SQLで最新の確定行を数える。
 select * into v_rule from public.raid_room_lifecycle_rules where difficulty=p_difficulty_id for update;
 if not found then raise exception 'lifecycle rule unavailable' using errcode='22023'; end if;
 select * into v_boss from public.raid_bosses where id=p_instance_id for update;
 if not found then raise exception 'instance unavailable' using errcode='P0002'; end if;
 select * into v_room from public.raid_rooms where raid_boss_instance_id=p_instance_id;
 if found then
   if v_room.owner_user_id<>p_owner_user_id or v_room.difficulty_id<>p_difficulty_id then
     raise exception 'registration conflict' using errcode='22023';
   end if;
   -- 終了後の再送も登録済み事実のみ返す。再開・再参加を許可しない。
   return jsonb_build_object('roomId',v_room.id,'status','already_registered');
 end if;
 v_now := clock_timestamp();
 if v_boss.status is distinct from 'ACTIVE' or v_boss.current_hp is null or v_boss.current_hp<=0
   or v_boss.expires_at is null or v_boss.expires_at<=v_now
   or v_boss.outcome_finalized_at is not null then
   raise exception 'instance inactive' using errcode='22023';
 end if;
 if v_boss.spawned_at is null or not isfinite(v_boss.spawned_at) or v_boss.spawned_at>v_now
   or v_boss.expires_at is distinct from v_boss.spawned_at + make_interval(hours=>v_rule.duration_hours) then
   raise exception 'invalid instance lifetime' using errcode='22023';
 end if;
 if v_boss.current_hp is distinct from v_boss.max_hp
   or exists(select 1 from public.raid_instance_user_progress where raid_boss_instance_id=p_instance_id)
   or exists(select 1 from public.raid_damage_logs where raid_boss_instance_id=p_instance_id) then
   raise exception 'instance already used' using errcode='22023';
 end if;
 select count(*) into v_count from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
 where r.difficulty_id=p_difficulty_id and b.status='ACTIVE' and b.current_hp>0
   and b.expires_at>v_now and b.outcome_finalized_at is null;
 if v_count>=v_rule.max_active_rooms then raise exception 'active room limit reached' using errcode='22023'; end if;
 insert into public.raid_rooms(raid_boss_instance_id,owner_user_id,difficulty_id,created_at)
 values(p_instance_id,p_owner_user_id,p_difficulty_id,v_boss.spawned_at) returning * into v_room;
 insert into public.raid_room_members(room_id,user_id,joined_at) values(v_room.id,p_owner_user_id,v_now);
 return jsonb_build_object('roomId',v_room.id,'status','registered');
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_briefing_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_room record;v_level integer;v_power bigint;v_gate jsonb;
 v_joined boolean;v_reason text;v_status text;v_count bigint;v_capacity integer;v_enabled boolean;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 select r.*,b.status,b.current_hp,b.expires_at,b.spawned_at,b.outcome_finalized_at,b.base_id,
 b.raid_variant_id,v.raid_name into v_room from public.raid_rooms r
 join public.raid_bosses b on b.id=r.raid_boss_instance_id
 left join public.canonical_raid_variants v on v.raid_variant_id=b.raid_variant_id where r.id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002'; end if;
 select level into v_level from public.users where id=v_uid;
 v_joined:=exists(select 1 from public.raid_room_members where room_id=p_room_id and user_id=v_uid);
 v_power:=public.calculate_user_total_power(v_uid);
 if v_room.difficulty_id<>'beginner' and not exists(select 1 from public.user_main_formations where user_id=v_uid) then v_power:=null;end if;
 v_gate:=public._raid_room_power_gate_v1(v_room.difficulty_id,v_power);
 v_status:=v_gate->>'status';v_reason:=v_gate->>'reason';
 select member_capacity into v_capacity from public.raid_room_lifecycle_rules where difficulty=v_room.difficulty_id;
 select count(*) into v_count from (
 select v_room.owner_user_id user_id union select user_id from public.raid_room_members where room_id=p_room_id
 union select user_id from public.raid_instance_user_progress where raid_boss_instance_id=v_room.raid_boss_instance_id and finalized_battles>0) m;
 if v_level is null or v_level<5 then v_status:='failed';v_reason:='level_requirement';
 elsif v_room.status is distinct from 'ACTIVE' or v_room.current_hp is null or v_room.current_hp<=0
  or v_room.expires_at is null or v_room.expires_at<=now() or v_room.spawned_at is null or v_room.spawned_at>now()
  or v_room.outcome_finalized_at is not null then v_status:='failed';v_reason:='room_ended';
 elsif v_capacity is null then v_status:='unknown';v_reason:='rule_unavailable';
 elsif not v_joined and v_count>=v_capacity then v_status:='failed';v_reason:='room_full';end if;
 select enabled into v_enabled from public.raid_room_battle_settings where singleton;
 return jsonb_build_object('roomId',p_room_id,'raidBossInstanceId',v_room.raid_boss_instance_id,
 'raidVariantId',v_room.raid_variant_id,'bossName',v_room.raid_name,'baseId',v_room.base_id,
 'membershipStatus',case when v_joined then 'joined' else 'not_joined' end,
 'joinEligibility',v_gate||jsonb_build_object('status',v_status,'reason',v_reason),
 'battleStartEnabled',coalesce(v_enabled,false));
end $function$
;
CREATE OR REPLACE FUNCTION public.register_raid_room_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_level integer;v_brief jsonb;v_result jsonb;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 select level into v_level from public.users where id=v_uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501';end if;
 if exists(select 1 from public.raid_room_members where room_id=p_room_id and user_id=v_uid) then
 return jsonb_build_object('roomId',p_room_id,'membershipStatus','already_joined');end if;
 v_brief:=public.get_raid_room_briefing_v1(p_room_id);
 if v_brief#>>'{joinEligibility,status}' is distinct from 'passed' then raise exception 'raid participation requirement' using errcode='42501';end if;
 -- private helperがboss/Roomをロック後に期限と定員を再検証する。
 v_result:=public._raid_room_add_member_v1(p_room_id,v_uid);
 return jsonb_build_object('roomId',p_room_id,'membershipStatus',v_result->>'status');
end $function$
;
CREATE OR REPLACE FUNCTION public.start_raid_room_battle_v1(p_room_id uuid, p_character_ids text[], p_tactic text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_user public.users%rowtype;v_instance record;v_room public.raid_rooms%rowtype;
 v_request public.raid_room_battle_start_requests%rowtype;v_enabled boolean;v_power bigint;v_gate jsonb;v_response jsonb;
 v_cost integer;v_cost_type text;v_guild uuid;v_players jsonb;v_enemy jsonb:='[]';v_member text;
 v_entry record;v_skill_refs jsonb;v_skills jsonb;v_replay uuid;v_seed bigint;v_slot integer:=0;v_started_at timestamptz;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 if p_room_id is null or p_request_id is null or p_tactic is null
 or p_tactic not in('ATTACK_PRIORITY','HEAL_PRIORITY','SKILL_PRIORITY','BALANCED','WEAKNESS_FOCUS')
 or p_character_ids is null or cardinality(p_character_ids) not between 1 and 5
 or array_position(p_character_ids,null) is not null
 or (select count(distinct x) from unnest(p_character_ids) x)<>cardinality(p_character_ids)
 then raise exception 'invalid battle input' using errcode='22023';end if;
 select enabled into v_enabled from public.raid_room_battle_settings where singleton for share;
 if v_enabled is distinct from true then raise exception 'room battle disabled' using errcode='55000';end if;
 select * into v_user from public.users where id=v_uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501';end if;
 if exists(select 1 from public.raid_room_battle_request_cancellations where user_id=v_uid and request_id=p_request_id)
 then raise exception 'battle request cancelled' using errcode='23514';end if;
 select * into v_request from public.raid_room_battle_start_requests where user_id=v_uid and request_id=p_request_id;
 if found then
 if v_request.room_id<>p_room_id or v_request.character_ids is distinct from p_character_ids or v_request.tactic<>p_tactic
 then raise exception 'request payload conflict' using errcode='22023';end if;
 return v_request.response;end if;
 if v_user.level is null or v_user.level<5 then raise exception 'raid level requirement' using errcode='42501';end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002';end if;
 select boss.*,variant.raid_name,variant.atk,variant.def,variant.spd,variant.member_character_ids into v_instance
 from public.raid_bosses boss join public.canonical_raid_variants variant on variant.raid_variant_id=boss.raid_variant_id
 where boss.id=v_room.raid_boss_instance_id and variant.is_production_enabled for update of boss;
 if not found then raise exception 'raid instance unavailable' using errcode='P0002';end if;
 if v_instance.status is distinct from 'ACTIVE' or v_instance.current_hp is null or v_instance.current_hp<=0
 or v_instance.expires_at is null or v_instance.expires_at<=clock_timestamp()
 or v_instance.spawned_at is null or v_instance.spawned_at>clock_timestamp() or v_instance.outcome_finalized_at is not null
 then raise exception 'room ended' using errcode='23514';end if;
 if not exists(select 1 from public.raid_room_members where room_id=p_room_id and user_id=v_uid)
 then raise exception 'room membership required' using errcode='42501';end if;
 v_players:=public.build_server_battle_snapshot(v_uid,p_character_ids,'PLAYER');
 if v_players is null or jsonb_array_length(v_players)<>cardinality(p_character_ids)
 or (select count(distinct x->>'id') from jsonb_array_elements(v_players) x)<>cardinality(p_character_ids)
 then raise exception 'invalid snapshot' using errcode='23514';end if;
 if exists(select 1 from jsonb_array_elements(v_players) x cross join (values('hp'),('atk'),('def')) k(key)
 where jsonb_typeof(x->'stats'->k.key) is distinct from 'number')
 then raise exception 'invalid snapshot stats' using errcode='23514';end if;
 if exists(select 1 from jsonb_array_elements(v_players) x cross join (values('hp'),('atk'),('def')) k(key)
 where (x->'stats'->>k.key)::numeric<0 or (x->'stats'->>k.key)::numeric>2147483647
 or trunc((x->'stats'->>k.key)::numeric)<>(x->'stats'->>k.key)::numeric
 or (k.key='hp' and (x->'stats'->>k.key)::numeric=0))
 then raise exception 'invalid snapshot stats' using errcode='23514';end if;
 select sum((x#>>'{stats,hp}')::bigint+(x#>>'{stats,atk}')::bigint+(x#>>'{stats,def}')::bigint) into v_power
 from jsonb_array_elements(v_players) x;
 v_gate:=public._raid_room_power_gate_v1(v_room.difficulty_id,v_power);
 if v_gate->>'status' is distinct from 'passed' then raise exception 'raid power requirement' using errcode='42501';end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_uid);
 select * into v_user from public.users where id=v_uid;
 if v_user.raid_free_entry_consumed is false then
 v_cost:=0;v_cost_type:='FREE_FIRST';update public.users set raid_free_entry_consumed=true where id=v_uid;
 elsif v_user.raid_points>=1 then
 v_cost:=1;v_cost_type:='RAID_POINT';update public.users set raid_points=raid_points-1,
 raid_points_last_recovered_at=case when raid_points=5 then now() else raid_points_last_recovered_at end where id=v_uid;
 v_user.raid_points:=v_user.raid_points-1;
 else raise exception 'insufficient Raid points' using errcode='23514';end if;
 select guild_id into v_guild from public.guild_members where user_id=v_uid;

 select enemy_snapshot into v_enemy from public.raid_room_combat_snapshots where room_id=p_room_id;
 if not found then
 v_enemy := '[]'::jsonb;
 -- Rooms created before this delta retain the original enemy construction.
 for v_member in select value from jsonb_array_elements_text(v_instance.member_character_ids) loop
  v_slot:=v_slot+1; select * into v_entry from public.canonical_quest_enemy_pool_entries where version='2026-08-30' and character_id=v_member and difficulty='HARD' order by(local_affinity)desc,weight desc limit 1;
  v_skill_refs:=coalesce(v_entry.skill_loadout,(select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id=v_member order by skill_id limit 2)s),(select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id is null order by skill_id limit 2)s),'[]'::jsonb);
  select coalesce(jsonb_agg(jsonb_build_object('id',s.skill_id,'name',s.display_name,'activationType',s.activation_type,'cooldown',s.cooldown,'availableFromRound',s.available_from_round,'target',s.target,'effects',s.effects,'exclusiveCharacterId',s.exclusive_character_id) order by x.ordinality),'[]') into v_skills from jsonb_array_elements_text(v_skill_refs) with ordinality x(skill_id,ordinality) join public.canonical_skill_master s on s.version='2026-08-21' and s.skill_id=x.skill_id;
  v_enemy:=v_enemy||jsonb_build_array(jsonb_build_object('id','raid_'||v_instance.id||'_'||v_slot,'characterId',v_member,'name',coalesce((select display_name from public.canonical_character_master where version='2026-08-21' and character_id=v_member),v_member),'team','ENEMY','alignment',coalesce((select attribute from public.canonical_character_master where version='2026-08-21' and character_id=v_member),'NEUTRAL'),'level',30,'stats',jsonb_build_object('hp',ceil(v_instance.max_hp::numeric/5),'atk',v_instance.atk,'def',v_instance.def,'spd',v_instance.spd,'luk',0),'equippedSkillRefs',v_skill_refs,'skills',v_skills,'equipment','[]'::jsonb));
 end loop;
 end if;
 if jsonb_array_length(v_enemy)<>5 then raise exception 'invalid enemy formation' using errcode='23514';end if;
 v_started_at:=clock_timestamp();
 if v_instance.expires_at<=v_started_at then raise exception 'room ended' using errcode='23514';end if;
 v_seed:=floor(random()*2147483646)::bigint+1;
 insert into public.battle_replay_sessions(requester_user_id,battle_mode,source_reference_id,tactic_id,random_seed,player_snapshot,enemy_snapshot,resolution_authority,finalization_status,official_context)
 values(v_uid,'RAID',v_instance.id,p_tactic,v_seed,v_players,v_enemy,'RAID_SERVER','PENDING',
 jsonb_build_object('guildIdSnapshot',v_guild,'costType',v_cost_type,'cost',v_cost,'remainingRaidPoints',v_user.raid_points,
 'bossHpAtStart',v_instance.current_hp,'bossMaxHp',v_instance.max_hp,'baseId',v_instance.base_id,
 'raidDayKey',v_instance.raid_day_key,'raidVariantId',v_instance.raid_variant_id,
 'roomId',p_room_id,'raidRoomVersion',1,'difficultyId',v_room.difficulty_id,'formationPower',v_power,
 'roomExpiresAt',v_instance.expires_at,'startedAt',v_started_at)) returning id into v_replay;
 v_response:=jsonb_build_object('room_id',p_room_id,'replay_session_id',v_replay,'player_snapshot',v_players,
 'enemy_snapshot',v_enemy,'cost_type',v_cost_type,'cost',v_cost,'remaining_raid_points',v_user.raid_points,'guild_id_snapshot',v_guild);
 insert into public.raid_room_battle_start_requests(user_id,request_id,room_id,character_ids,tactic,replay_session_id,response)
 values(v_uid,p_request_id,p_room_id,p_character_ids,p_tactic,v_replay,v_response);
 return v_response;
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_battle_route_v1(p_replay_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_replay public.battle_replay_sessions%rowtype; v_room public.raid_rooms%rowtype;
begin
 select * into v_replay from public.battle_replay_sessions where id=p_replay_id;
 if not found or v_replay.battle_mode<>'RAID' or v_replay.resolution_authority<>'RAID_SERVER' then
  raise exception 'official Raid replay required' using errcode='42501'; end if;
 select * into v_room from public.raid_rooms where raid_boss_instance_id=v_replay.source_reference_id;
 if not found then
  if v_replay.official_context ? 'roomId' or exists(select 1 from public.raid_room_battle_start_requests where replay_session_id=p_replay_id) then
   raise exception 'Room authority mismatch' using errcode='23514'; end if;
  return 'LEGACY';
 end if;
 if v_replay.official_context->>'roomId' is distinct from v_room.id::text
 or v_replay.official_context->>'raidRoomVersion' is distinct from '1'
 or not exists(select 1 from public.raid_room_battle_start_requests q
  where q.replay_session_id=p_replay_id and q.user_id=v_replay.requester_user_id and q.room_id=v_room.id
   and q.tactic=v_replay.tactic_id and q.response->>'replay_session_id'=p_replay_id::text
   and q.response->>'room_id'=v_room.id::text)
 then raise exception 'Room start receipt missing or mismatched' using errcode='23514'; end if;
 return 'ROOM';
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_expired_raid_room_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_instance public.raid_bosses%rowtype; v_now timestamptz;
begin
 select b.* into v_instance from public.raid_bosses b join public.raid_rooms r on r.raid_boss_instance_id=b.id
 where r.id=p_room_id for update of b;
 if not found then raise exception 'Room missing' using errcode='P0002'; end if;
 v_now:=clock_timestamp();
 if v_instance.status='ACTIVE' and v_instance.outcome_finalized_at is null and v_instance.expires_at<=v_now then
  update public.raid_bosses set status='EXPIRED',outcome='TIMEOUT_FAILURE',outcome_finalized_at=v_now
  where id=v_instance.id returning * into v_instance;
 end if;
 return jsonb_build_object('roomId',p_room_id,'state',lower(v_instance.status),'outcome',v_instance.outcome,'remainingBossHp',v_instance.current_hp);
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_raid_room_battle_v1(p_replay_id uuid, p_result jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
  v_replay public.battle_replay_sessions%rowtype;
  v_instance public.raid_bosses%rowtype;
  v_room public.raid_rooms%rowtype;
  v_now timestamptz;
  v_late boolean;
  v_raw bigint;
  v_applied bigint;
  v_remaining bigint;
  v_total bigint;
  v_progress public.raid_instance_user_progress%rowtype;
  v_final jsonb;
begin
  select * into v_replay
  from public.battle_replay_sessions
  where id = p_replay_id
  for update;

  if not found
     or v_replay.battle_mode <> 'RAID'
     or v_replay.resolution_authority <> 'RAID_SERVER' then
    raise exception 'not an official Raid replay' using errcode = '42501';
  end if;
  if public.get_raid_battle_route_v1(p_replay_id)<>'ROOM' then
    raise exception 'Room replay required' using errcode='42501';
  end if;
  if v_replay.finalization_status = 'FINALIZED' then
    return v_replay.finalization_result;
  end if;
  if v_replay.status <> 'PENDING'
     or v_replay.finalization_status <> 'PENDING' then
    raise exception 'Raid replay is not finalizable' using errcode = '23514';
  end if;

  perform public.validate_official_battle_result(p_result);
  select * into v_instance
  from public.raid_bosses
  where id = v_replay.source_reference_id
  for update;
  if not found or v_instance.raid_day_key is null or v_instance.raid_variant_id is null then
    raise exception 'Canonical Raid instance missing' using errcode = 'P0002';
  end if;

  select * into strict v_room from public.raid_rooms where raid_boss_instance_id=v_instance.id;
  -- 開始時刻は255が生成したもの。期限前に正規開始済みの戦闘だけを保存する。
  if v_replay.official_context->>'startedAt' is null
    or (v_replay.official_context->>'startedAt')::timestamptz>=v_instance.expires_at then
    raise exception 'Room battle did not start before expiry' using errcode='23514'; end if;
  v_now:=clock_timestamp();
  v_late:=v_instance.status<>'ACTIVE' or v_instance.outcome_finalized_at is not null
    or v_instance.expires_at<=v_now or v_instance.current_hp<=0;
  v_raw := greatest(coalesce((p_result->>'playerRawDamage')::bigint, 0), 0);
  v_applied := case when v_late then 0 else least(v_raw,greatest(v_instance.current_hp,0)) end;
  v_remaining := greatest(v_instance.current_hp-v_applied,0);
  if not v_late then
    update public.raid_bosses set current_hp=v_remaining,
      status=case when v_remaining=0 then 'CLEARED' else status end,
      outcome=case when v_remaining=0 then 'DEFEAT_SUCCESS' else outcome end,
      outcome_finalized_at=case when v_remaining=0 then v_now else outcome_finalized_at end,
      cleared_at=case when v_remaining=0 then v_now else cleared_at end
    where id=v_instance.id returning * into v_instance;
  elsif v_instance.status='ACTIVE' and v_instance.outcome_finalized_at is null and v_instance.expires_at<=v_now then
    update public.raid_bosses set status='EXPIRED',outcome='TIMEOUT_FAILURE',outcome_finalized_at=v_now
    where id=v_instance.id returning * into v_instance;
  end if;

  insert into public.raid_damage_logs(
    boss_id, raid_boss_id, user_id, damage, damage_dealt,
    raid_boss_instance_id, battle_replay_session_id, guild_id,
    raw_damage, applied_damage
  ) values (
    v_instance.boss_id, v_instance.boss_id, v_replay.requester_user_id,
    v_raw, v_raw, v_instance.id, p_replay_id,
    nullif(v_replay.official_context->>'guildIdSnapshot', '')::uuid,
    v_raw, v_applied
  );

  insert into public.raid_instance_user_progress(
    raid_boss_instance_id, user_id, finalized_battles,
    raid_points_consumed, last_guild_id
  ) values (
    v_instance.id, v_replay.requester_user_id, 1,
    case when v_replay.official_context->>'costType' = 'RAID_POINT' then 1 else 0 end,
    nullif(v_replay.official_context->>'guildIdSnapshot', '')::uuid
  )
  on conflict(raid_boss_instance_id, user_id) do update set
    finalized_battles = public.raid_instance_user_progress.finalized_battles + 1,
    raid_points_consumed = public.raid_instance_user_progress.raid_points_consumed
      + excluded.raid_points_consumed,
    last_guild_id = excluded.last_guild_id,
    updated_at = clock_timestamp()
  returning * into v_progress;

  select coalesce(sum(raw_damage), 0) into v_total
  from public.raid_damage_logs
  where raid_boss_instance_id = v_instance.id
    and user_id = v_replay.requester_user_id;

  v_final := p_result || jsonb_build_object(
    'mode', 'RAID',
    'roomId', v_room.id,
    'roomOutcome', v_instance.outcome,
    'lateFinalization', v_late,
    'raidInstanceId', v_instance.id,
    'baseId', v_instance.base_id,
    'raidDayKey', v_instance.raid_day_key,
    'raidVariantId', v_instance.raid_variant_id,
    'rawDamage', v_raw,
    'appliedDamage', v_applied,
    'remainingBossHp', v_remaining,
    'personalContribution', v_total,
    'guildIdSnapshot', v_replay.official_context->>'guildIdSnapshot',
    'participationProgress', to_jsonb(v_progress)
  );

  insert into public.battle_replay_events(
    battle_replay_session_id, event_index, round_number, event_type, payload
  )
  select p_replay_id,
         greatest(coalesce((event.value->>'index')::integer, event.ordinality::integer - 1), 0),
         greatest(coalesce((event.value->>'round')::integer, 1), 1),
         coalesce(nullif(event.value->>'type', ''), 'UNKNOWN'),
         coalesce(event.value->'payload', '{}'::jsonb)
  from jsonb_array_elements(p_result->'events') with ordinality event(value, ordinality)
  on conflict do nothing;

  update public.battle_replay_sessions
  set status = 'RESOLVED',
      result = v_final,
      resolved_at = clock_timestamp(),
      finalization_status = 'FINALIZED',
      finalized_at = clock_timestamp(),
      finalization_result = v_final
  where id = p_replay_id;

  -- Replay行lockとFINALIZED早期returnにより、正式確定ごとに1回だけ加算。
  perform public.evaluate_mission_progress(v_replay.requester_user_id, 'RAID_FINALIZED', 1);
  return v_final;
end
$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_battle_result_v1(p_replay_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_replay public.battle_replay_sessions%rowtype;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 select * into v_replay from public.battle_replay_sessions where id=p_replay_id and requester_user_id=auth.uid();
 if not found then raise exception 'owned replay missing' using errcode='P0002'; end if;
 if public.get_raid_battle_route_v1(p_replay_id)<>'ROOM' then raise exception 'Room replay required' using errcode='42501'; end if;
 if v_replay.finalization_status='FINALIZED' then return v_replay.finalization_result; end if;
 return null;
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_battle_start_receipt_v1(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_uid uuid:=auth.uid();
 v_request public.raid_room_battle_start_requests%rowtype;
 v_replay public.battle_replay_sessions%rowtype;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_request_id is null then raise exception 'request id required' using errcode='22023'; end if;
 select * into v_request from public.raid_room_battle_start_requests
 where user_id=v_uid and request_id=p_request_id;
 if not found then return null; end if;
 select * into v_replay from public.battle_replay_sessions
 where id=v_request.replay_session_id and requester_user_id=v_uid;
 if not found then raise exception 'owned Room replay missing' using errcode='23514'; end if;
 if public.get_raid_battle_route_v1(v_request.replay_session_id) is distinct from 'ROOM'
 or v_request.room_id::text is distinct from v_replay.official_context->>'roomId'
 or v_request.tactic is distinct from v_replay.tactic_id
 or v_request.response->>'replay_session_id' is distinct from v_replay.id::text
 or v_request.response->>'room_id' is distinct from v_request.room_id::text
 or v_request.response->'player_snapshot' is distinct from v_replay.player_snapshot
 or v_request.response->'enemy_snapshot' is distinct from v_replay.enemy_snapshot then
  raise exception 'Room start receipt mismatch' using errcode='23514';
 end if;
 return v_request.response;
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_expired_raid_rooms_v1(p_limit integer DEFAULT 100)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_room record;
 v_now timestamptz:=clock_timestamp();
 v_count integer:=0;
begin
 if p_limit is null or p_limit<1 or p_limit>1000 then
  raise exception 'batch limit must be between 1 and 1000' using errcode='22023';
 end if;
 for v_room in
  select r.id from public.raid_rooms r
  join public.raid_bosses b on b.id=r.raid_boss_instance_id
  where b.status='ACTIVE' and b.outcome_finalized_at is null and b.expires_at<=v_now
  order by b.expires_at,b.id limit p_limit for update of b skip locked
 loop
  perform public.finalize_expired_raid_room_v1(v_room.id);
  v_count:=v_count+1;
 end loop;
 return v_count;
end $function$
;
CREATE OR REPLACE FUNCTION public.list_raid_room_battle_recoveries_v1(p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_request record;v_receipt jsonb;v_items jsonb:='[]'::jsonb;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if p_limit is null or p_limit<1 or p_limit>100 then raise exception 'limit must be between 1 and 100' using errcode='22023';end if;
 for v_request in select * from public.raid_room_battle_start_requests
 where user_id=v_uid and recovery_acknowledged_at is null
 order by created_at,request_id limit p_limit
 loop
  v_receipt:=public.get_raid_room_battle_start_receipt_v1(v_request.request_id);
  if v_receipt is null then raise exception 'Room start receipt missing' using errcode='23514';end if;
  v_items:=v_items||jsonb_build_array(jsonb_build_object(
   'requestId',v_request.request_id,'roomId',v_request.room_id,
   'payload',jsonb_build_object('p_room_id',v_request.room_id,'p_character_ids',v_request.character_ids,
    'p_tactic',v_request.tactic,'p_request_id',v_request.request_id),'receipt',v_receipt));
 end loop;
 return v_items;
end $function$
;
CREATE OR REPLACE FUNCTION public.acknowledge_raid_room_battle_recovery_v1(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_request public.raid_room_battle_start_requests%rowtype;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if p_request_id is null then raise exception 'request id required' using errcode='22023';end if;
 select * into v_request from public.raid_room_battle_start_requests
 where user_id=v_uid and request_id=p_request_id for update;
 if not found then raise exception 'owned Room start request missing' using errcode='P0002';end if;
 perform public.get_raid_room_battle_start_receipt_v1(p_request_id);
 if not exists(select 1 from public.battle_replay_sessions where id=v_request.replay_session_id
  and requester_user_id=v_uid and finalization_status='FINALIZED') then
  raise exception 'Room battle not finalized' using errcode='23514';end if;
 update public.raid_room_battle_start_requests
 set recovery_acknowledged_at=coalesce(recovery_acknowledged_at,clock_timestamp())
 where user_id=v_uid and request_id=p_request_id;
 return jsonb_build_object('status','acknowledged','requestId',p_request_id);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_rescue_v1(p_rescue_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_publication public.raid_room_rescue_publications%rowtype;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 select * into v_publication from public.raid_room_rescue_publications where id=p_rescue_id;
 if not found then raise exception 'rescue unavailable' using errcode='P0002';end if;
 if v_publication.channel='GUILD' and not exists(select 1 from public.guild_members where user_id=auth.uid() and guild_id=v_publication.guild_id) then
 raise exception 'guild membership required' using errcode='42501';end if;
 return jsonb_build_object('rescueId',v_publication.id,'roomId',v_publication.room_id,'channel',v_publication.channel,'guildId',v_publication.guild_id);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_rescue_status_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_activity integer;v_guild integer;v_member public.raid_room_rescue_members%rowtype;v_count bigint:=0;v_damage bigint:=0;
 v_via boolean;v_enabled boolean;v_has_guild boolean;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002';end if;
 select * into v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id;
 select count(*) filter(where channel='ACTIVITY'),count(*) filter(where channel='GUILD') into v_activity,v_guild from public.raid_room_rescue_publications where room_id=p_room_id;
 select * into v_member from public.raid_room_rescue_members where room_id=p_room_id and user_id=v_uid;
 v_via:=found;
 if v_via then
  select count(*),coalesce(sum(l.raw_damage),0) into v_count,v_damage
  from public.raid_damage_logs l join public.battle_replay_sessions b on b.id=l.battle_replay_session_id
  where l.raid_boss_instance_id=v_room.raid_boss_instance_id and l.user_id=v_uid
   and b.requester_user_id=v_uid and b.source_reference_id=v_room.raid_boss_instance_id
   and b.battle_mode='RAID' and b.resolution_authority='RAID_SERVER'
   and b.finalization_status='FINALIZED' and b.finalized_at>=v_member.joined_at;
 end if;
 select enabled into v_enabled from public.raid_room_rescue_settings where singleton;
 select exists(select 1 from public.guild_members where user_id=v_uid) into v_has_guild;
 return jsonb_build_object('roomId',p_room_id,'isOwner',v_room.owner_user_id=v_uid,
 'requestEnabled',coalesce(v_enabled,false) and v_room.owner_user_id=v_uid and v_boss.status='ACTIVE' and v_boss.current_hp>0 and v_boss.expires_at>statement_timestamp() and v_boss.outcome_finalized_at is null and (v_activity<3 or (v_has_guild and v_guild<3)),
 'activityCount',v_activity,'guildCount',v_guild,'maxPerChannel',3,
 'viaRescue',v_via,'finalizedBattles',v_count,'contributionDamage',v_damage,
 'rescueGate',public._raid_room_rescue_gate_v1(v_room.difficulty_id,v_via,v_count,v_damage,coalesce(v_boss.outcome='DEFEAT_SUCCESS',false)));
end $function$
;
CREATE OR REPLACE FUNCTION public._raid_room_rescue_reward_progress_v1(p_room_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_member public.raid_room_rescue_members%rowtype;v_via boolean;v_count bigint:=0;v_damage bigint:=0;
begin
 select * into strict v_room from public.raid_rooms where id=p_room_id;
 select * into strict v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id;
 select * into v_member from public.raid_room_rescue_members where room_id=p_room_id and user_id=p_user_id;
 v_via:=found and v_room.owner_user_id<>p_user_id;
 if v_via then
  select count(*),coalesce(sum(l.raw_damage),0) into v_count,v_damage
  from public.raid_damage_logs l
  join public.battle_replay_sessions b on b.id=l.battle_replay_session_id
  join public.raid_room_battle_start_requests s on s.replay_session_id=b.id and s.user_id=p_user_id and s.room_id=p_room_id
  where l.raid_boss_instance_id=v_room.raid_boss_instance_id and l.user_id=p_user_id
   and b.requester_user_id=p_user_id and b.source_reference_id=v_room.raid_boss_instance_id
   and b.battle_mode='RAID' and b.resolution_authority='RAID_SERVER'
   and b.official_context->>'roomId'=p_room_id::text
   and b.finalization_status='FINALIZED' and b.finalized_at>=v_member.joined_at
   and (b.official_context->>'startedAt')::timestamptz>=v_member.joined_at
   and (b.official_context->>'startedAt')::timestamptz<v_boss.expires_at
   and (v_boss.outcome_finalized_at is null or (b.official_context->>'startedAt')::timestamptz<v_boss.outcome_finalized_at);
 end if;
 return jsonb_build_object('finalizedBattles',v_count,'contributionDamage',v_damage,
  'rescueGate',public._raid_room_rescue_gate_v1(v_room.difficulty_id,v_via,v_count,v_damage,
    coalesce(v_boss.outcome='DEFEAT_SUCCESS',false)));
end $function$
;
CREATE OR REPLACE FUNCTION public.on_raid_room_rescue_reward_finalized_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room uuid;
begin
 if old.finalization_status='FINALIZED' or new.finalization_status<>'FINALIZED'
  or new.battle_mode<>'RAID' or new.resolution_authority<>'RAID_SERVER' then return new;end if;
 select id into v_room from public.raid_rooms where raid_boss_instance_id=new.source_reference_id;
 if found then perform public._issue_raid_room_rescue_rewards_v1(v_room);end if;
 return new;
end $function$
;
