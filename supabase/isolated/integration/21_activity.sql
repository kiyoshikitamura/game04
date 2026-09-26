begin;
create table if not exists public.game04_progression_activity (
 actor_id uuid not null references public.users(id), achievement_key text not null, kind text not null, object_id text not null,
 title text not null, request_id uuid not null, created_at timestamptz not null default statement_timestamp(), primary key(actor_id,achievement_key));
alter table public.game04_progression_activity enable row level security;
revoke all on public.game04_progression_activity from public,anon,authenticated;
grant all on public.game04_progression_activity to service_role;
create or replace function public.game04_capture_progression_activity() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare e jsonb;
begin
 for e in select value from jsonb_array_elements(coalesce(new.result#>'{receipt,activityEvents}','[]'::jsonb)) loop
  if e->>'kind' not in('SSR_SOUL_UNLOCK','QUEST_AREA_CLEAR','TERRITORY_FINAL_CLEAR','CHARACTER_MAX_AWAKEN','SKILL_MAX_LB','EQUIPMENT_MAX_LB') then raise exception 'INVALID_ACTIVITY_KIND';end if;
  insert into public.game04_progression_activity(actor_id,achievement_key,kind,object_id,title,request_id)
  values((e->>'actorId')::uuid,e->>'key',e->>'kind',e->>'objectId',e->>'title',new.request_id) on conflict do nothing;
 end loop;
 return new;
end $$;
revoke all on function public.game04_capture_progression_activity() from public,anon,authenticated;
grant execute on function public.game04_capture_progression_activity() to service_role;
drop trigger if exists game04_capture_progression_activity on public.game04_requests;
create trigger game04_capture_progression_activity after insert or update of result on public.game04_requests for each row execute function public.game04_capture_progression_activity();

create or replace function public.game04_get_community_activity(p_limit integer default 20)
returns table(id text,activity_type text,actor_user_id uuid,actor_display_name text,object_master_id text,display_payload jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 return query with events as (
 select 'achievement:'||a.actor_id||':'||a.achievement_key as id,a.kind activity_type,a.actor_id actor_user_id,u.username actor_display_name,a.object_id object_master_id,jsonb_build_object('title',a.title) display_payload,a.created_at
 from public.game04_progression_activity a join public.users u on u.id=a.actor_id
 union all
 select 'gacha:'||q.user_id||':'||q.request_id,
 case when q.result->>'operation'='special_gacha_exchange' then 'SSR_EXCHANGE' else 'SSR_SUMMON' end,q.user_id,u.username,null::text,
 jsonb_build_object('title',string_agg('SSR「'||(x.value->>'name')||'」'||case when (x.value->>'convertedAmount')::integer>0 then '（'||case when x.value->>'category'='character' then '固有魂' else 'LB素材' end||' +'||(x.value->>'convertedAmount')||'）' else '' end,'・' order by x.ordinality)||case when q.result->>'operation'='special_gacha_exchange' then 'を交換で獲得' else 'を召喚で獲得' end),q.created_at
 from public.game04_requests q join public.users u on u.id=q.user_id cross join lateral jsonb_array_elements(coalesce(q.result#>'{receipt,formalGachaReceipt,results}','[]'::jsonb)) with ordinality x(value,ordinality)
 where q.result->>'operation' in('normal_gacha','special_gacha','special_gacha_exchange') and x.value->>'rarity'='SSR'
 group by q.user_id,q.request_id,u.username,q.created_at,q.result->>'operation'
 union all
 select 'news:'||n.id,'SYSTEM_NEWS',null::uuid,null::text,null::text,jsonb_build_object('news_id',n.id,'title',n.title,'content',n.content,'link_url',n.link_url),n.start_at from public.news n where n.is_published and n.start_at<=statement_timestamp() and (n.end_at is null or n.end_at>statement_timestamp())
 ) select e.id,e.activity_type,e.actor_user_id,e.actor_display_name,e.object_master_id,e.display_payload,e.created_at from events e
 where e.created_at between statement_timestamp()-interval '24 hours' and statement_timestamp()
 and not exists(select 1 from public.kpi_subjects s join public.kpi_account_classification_periods c on c.subject_id=s.subject_id where s.source_user_id=e.actor_user_id and c.classification in('qa','test') and c.valid_from<=e.created_at and (c.valid_to is null or e.created_at<c.valid_to))
 order by e.created_at desc,e.id desc limit greatest(1,least(coalesce(p_limit,20),50));
end $$;
revoke all on function public.game04_get_community_activity(integer) from public,anon;
grant execute on function public.game04_get_community_activity(integer) to authenticated;
commit;
