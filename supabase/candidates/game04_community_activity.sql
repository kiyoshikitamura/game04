-- Read-only candidate; apply in G2's coordinated window, never during G3 acceptance.
-- Formal G3 immutable receipts are the source; do not wrap/replace its commit RPC.
create or replace function public.game04_get_community_activity(p_limit integer default 20)
returns table(id text, activity_type text, actor_user_id uuid, actor_display_name text,
 object_master_id text, display_payload jsonb, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 return query
 with events as (
   select feed.id::text, feed.activity_type, feed.actor_user_id, feed.actor_display_name,
     feed.object_master_id, feed.display_payload, feed.created_at
   from public.social_activity_feed feed
   where feed.created_at between statement_timestamp()-interval '24 hours' and statement_timestamp()
     and ((feed.activity_type='SYSTEM_NEWS' and feed.actor_user_id is null and exists (
       select 1 from public.news n where n.id::text=feed.display_payload->>'news_id' and n.is_published
         and n.start_at<=statement_timestamp() and (n.end_at is null or n.end_at>statement_timestamp())))
       or (feed.activity_type in ('SSR_CHARACTER','SSR_SKILL','SSR_EQUIPMENT','RAID_HELP_REQUEST','RAID_BOSS_DEFEATED')
         and exists(select 1 from public.users u where u.id=feed.actor_user_id and u.favorite_character_id is not null)))
   union all
   select 'gacha:'||request.user_id||':'||request.request_id||':'||item.ordinality,
     'SSR_'||upper(item.value->>'category'), request.user_id, player.username,
     item.value->>'id', jsonb_build_object('item_name',item.value->>'name'), request.created_at
   from public.game04_requests request
   join public.users player on player.id=request.user_id
   cross join lateral jsonb_array_elements(case
     when jsonb_typeof(request.result#>'{receipt,formalGachaReceipt,results}')='array'
     then request.result#>'{receipt,formalGachaReceipt,results}' else '[]'::jsonb end) with ordinality item(value,ordinality)
   where request.created_at between statement_timestamp()-interval '24 hours' and statement_timestamp()
     and request.result->>'operation' in ('normal_gacha','special_gacha')
     and item.value->>'rarity'='SSR' and item.value->>'category' in ('character','skill','equipment')
     and coalesce(item.value->>'id','')<>'' and coalesce(item.value->>'name','')<>''
 )
 select event.id,event.activity_type,event.actor_user_id,event.actor_display_name,event.object_master_id,event.display_payload,event.created_at
 from events event where not exists (
   select 1 from public.kpi_subjects subject join public.kpi_account_classification_periods classification on classification.subject_id=subject.subject_id
   where subject.source_user_id=event.actor_user_id and classification.classification in ('qa','test')
     and classification.valid_from<=event.created_at and (classification.valid_to is null or event.created_at<classification.valid_to))
 order by event.created_at desc,event.id desc limit greatest(1,least(coalesce(p_limit,20),50));
end; $$;
revoke all on function public.game04_get_community_activity(integer) from public, anon;
grant execute on function public.game04_get_community_activity(integer) to authenticated;
-- Exchange publication is intentionally excluded pending an explicit product rule.
-- Existing receipts in the rolling 24h window are projected automatically, with
-- stable user/request/ordinal IDs. No backfill or new event writes are required.
