-- Aggregate progress only; never exposes account identifiers or player state.
create or replace function public.game04_quest_invasion_counts()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with areas(n,id,last) as (
 values (1,'mikawa',5),(2,'owari',5),(3,'mino',5),(4,'omi',5),
 (5,'kai',6),(6,'echigo',6),(7,'kyoto',8),(8,'izumo',8),
 (9,'satsuma',10),(10,'sekigahara',10)
), stages as (
 select n,id,k,id||'-'||k stage_id,
 lag(id||'-'||k) over(order by n,k) previous_id
 from areas cross join lateral generate_series(1,last) k
), area_steps as (
 select *,lag(id||'-'||last) over(order by n) previous_final from areas
), players as materialized (
 select coalesce(state->'clearedStages','[]'::jsonb) cleared,
 coalesce((state->'questAttempts'->>'mikawa-1')::integer,0)>0 started
 from public.game04_player_state
 where (select auth.uid()) is not null
), stage_counts as (
 select s.stage_id,count(*) filter(where
 (case when s.previous_id is null then p.started else p.cleared ? s.previous_id end)
 and not (p.cleared ? s.stage_id)) amount
 from stages s left join players p on true group by s.stage_id
), area_counts as (
 select a.id,count(*) filter(where
 (case when a.previous_final is null then p.started else p.cleared ? a.previous_final end)
 and not (p.cleared ? (a.id||'-'||a.last))) amount
 from area_steps a left join players p on true group by a.id
)
select jsonb_build_object(
 'stages',(select jsonb_object_agg(stage_id,amount) from stage_counts),
 'areas',(select jsonb_object_agg(id,amount) from area_counts)
);
$$;
revoke all on function public.game04_quest_invasion_counts() from public, anon;
grant execute on function public.game04_quest_invasion_counts() to authenticated;
comment on function public.game04_quest_invasion_counts() is
'Accounts with the predecessor cleared and target uncleared; first stage/area requires mikawa-1 questAttempts > 0. No recency filter.';
