SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.get_public_pvp_rankings(p_daily boolean, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_today date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date; v_season uuid:=public.current_ranking_season_id('PVP');
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
  return coalesce((select jsonb_agg(to_jsonb(ranked) order by ranked.rank_position) from (
    select row_data.*,dense_rank() over(order by row_data.score desc,row_data.user_id) rank_position from (
      select rank.user_id,player.username,player.avatar_url,coalesce(rank.rank_points,1000) rank_points,
        coalesce(daily.wins,0) daily_wins,coalesce(power.total_power,0) current_power,
        member.guild_id,guild.name guild_name,v_season season_id,
        case when p_daily then coalesce(daily.wins,0) else coalesce(rank.rank_points,1000) end score
      from public.pvp_ranks rank join public.users player on player.id=rank.user_id
      left join public.pvp_daily_wins daily on daily.user_id=rank.user_id and daily.activity_date=v_today
      left join public.user_power_rankings power on power.user_id=rank.user_id
      left join public.guild_members member on member.user_id=rank.user_id left join public.guilds guild on guild.id=member.guild_id
    ) row_data order by score desc,user_id limit p_limit offset p_offset
  ) ranked),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_pvp_opponents(p_user_id uuid, p_my_points integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_my_power bigint; v_result jsonb;
begin
 if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not authorized' using errcode='42501'; end if;
 select coalesce(total_power,0) into v_my_power from public.user_power_rankings where user_id=p_user_id;
 with candidates as (
  select player.id,player.username,coalesce(rank.rank_points,1000) rating,coalesce(power.total_power,0) total_power,coalesce(deck.tactic,'BALANCED') tactic,
   deck.character_1_id,deck.character_2_id,deck.character_3_id,deck.character_4_id,deck.character_5_id,
   case
    when abs(coalesce(rank.rank_points,1000)-coalesce(p_my_points,1000))<=300 and (coalesce(v_my_power,0)<=0 or coalesce(power.total_power,0)*10000 between v_my_power*7000 and v_my_power*14000) then 1
    when abs(coalesce(rank.rank_points,1000)-coalesce(p_my_points,1000))<=500 and (coalesce(v_my_power,0)<=0 or coalesce(power.total_power,0)*10000 between v_my_power*5000 and v_my_power*18000) then 2
    else 3 end match_tier
  from public.users player join public.pvp_defense_decks deck on deck.user_id=player.id
  left join public.pvp_ranks rank on rank.user_id=player.id left join public.user_power_rankings power on power.user_id=player.id
  where player.id<>p_user_id and deck.character_1_id is not null
 ), selected as (select * from candidates order by match_tier,abs(rating-coalesce(p_my_points,1000)),id limit 5)
 select coalesce(jsonb_agg(jsonb_build_object('opponent_user_id',id,'opponent_username',username,'opponent_points',rating,'opponent_power',total_power,'opponent_rank',(select count(distinct r.rank_points)+1 from public.pvp_ranks r where r.rank_points>selected.rating),'match_tier',match_tier,
  'rating_difference',rating-coalesce(p_my_points,1000),'opponent_class',case when rating-coalesce(p_my_points,1000)>=101 then 'STRONGER' when rating-coalesce(p_my_points,1000)<=-101 then 'WEAKER' else 'EQUAL' end,
  'win_rating_delta',public.canonical_pvp_rating_delta(coalesce(p_my_points,1000),rating,'WIN'),'loss_rating_delta',public.canonical_pvp_rating_delta(coalesce(p_my_points,1000),rating,'LOSS'),
  'tactic',tactic,'defense_character_ids',to_jsonb(array_remove(array[character_1_id,character_2_id,character_3_id,character_4_id,character_5_id]::text[],null)),
  'defense_characters',coalesce((select jsonb_agg(jsonb_build_object('slot',slot.slot_no,'character_master_id',release.character_id,'display_name',release.display_name,'rarity',release.rarity,'level',coalesce(owned.level,1),'asset_identifier',release.asset_path) order by slot.slot_no) from (values(1,character_1_id),(2,character_2_id),(3,character_3_id),(4,character_4_id),(5,character_5_id))slot(slot_no,owned_or_master_id) left join public.user_characters owned on owned.user_id=selected.id and owned.id::text=slot.owned_or_master_id join public.character_release_master release on release.character_id=coalesce(owned.character_id,slot.owned_or_master_id) and release.is_enabled where slot.owned_or_master_id is not null),'[]'::jsonb)) order by match_tier,abs(rating-coalesce(p_my_points,1000)),id),'[]'::jsonb) into v_result from selected;
 return v_result;
end $function$
;
CREATE OR REPLACE FUNCTION public.get_pvp_opponents_page(p_user_id uuid, p_my_points integer, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_my_power bigint;
  v_total integer;
  v_effective_offset integer;
  v_items jsonb;
  v_first_pvp_pending boolean;
begin
  if auth.uid() is null or auth.uid()<>p_user_id then
    raise exception 'not authorized' using errcode='42501';
  end if;
  if p_offset < 0 or p_offset > 10000 then
    raise exception 'invalid pagination' using errcode='22023';
  end if;

  select coalesce(total_power,0) into v_my_power
  from public.user_power_rankings where user_id=p_user_id;
  v_first_pvp_pending := not exists(
    select 1 from public.user_funnel_milestones
    where user_id=p_user_id and milestone='first_pvp'
  );

  select count(distinct player.id)::integer into v_total
  from public.users player
  join public.user_main_formations formation on formation.user_id=player.id
  where player.id<>p_user_id;

  v_effective_offset := case
    when v_total=0 then 0
    when p_offset>=v_total then 0
    else p_offset
  end;

  with daily_scores as (
    select rank.user_id,coalesce(daily.wins,0) score
    from public.pvp_ranks rank
    left join public.pvp_daily_wins daily
      on daily.user_id=rank.user_id
     and daily.activity_date=(clock_timestamp() at time zone 'Asia/Tokyo')::date
  ), daily_ranked as (
    select user_id,dense_rank() over(order by score desc,user_id) rank_position
    from daily_scores
  ), candidates as (
    select player.id,player.username,coalesce(rank.rank_points,1000) rating,
      coalesce(power.total_power,0) total_power,'BALANCED'::text tactic,
      array_agg(formation.user_character_id::text order by formation.slot) character_ids,
      daily_ranked.rank_position opponent_rank,
      case
        when abs(coalesce(rank.rank_points,1000)-coalesce(p_my_points,1000))<=300
          and (coalesce(v_my_power,0)<=0 or coalesce(power.total_power,0)::bigint*10000 between v_my_power*7000 and v_my_power*14000) then 1
        when abs(coalesce(rank.rank_points,1000)-coalesce(p_my_points,1000))<=500
          and (coalesce(v_my_power,0)<=0 or coalesce(power.total_power,0)::bigint*10000 between v_my_power*5000 and v_my_power*18000) then 2
        else 3
      end match_tier
    from public.users player
    join public.user_main_formations formation on formation.user_id=player.id
    left join public.pvp_ranks rank on rank.user_id=player.id
    left join public.user_power_rankings power on power.user_id=player.id
    left join daily_ranked on daily_ranked.user_id=player.id
    where player.id<>p_user_id
    group by player.id,player.username,rank.rank_points,power.total_power,daily_ranked.rank_position
  ), selected as (
    select * from candidates
    order by
      case when v_first_pvp_pending and v_my_power>0 and total_power<v_my_power then 0 else 1 end,
      case when v_first_pvp_pending then abs(v_my_power-total_power) else match_tier end,
      match_tier,abs(rating-coalesce(p_my_points,1000)),id
    limit 5 offset v_effective_offset
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'opponent_user_id',id,'opponent_username',username,'opponent_points',rating,
    'opponent_power',total_power,'opponent_rank',opponent_rank,'match_tier',match_tier,
    'rating_difference',rating-coalesce(p_my_points,1000),
    'opponent_class',case when total_power<coalesce(v_my_power,0) then 'WEAKER' when total_power>coalesce(v_my_power,0) then 'STRONGER' else 'EQUAL' end,
    'win_rating_delta',public.canonical_pvp_rating_delta(coalesce(p_my_points,1000),rating,'WIN'),
    'loss_rating_delta',public.canonical_pvp_rating_delta(coalesce(p_my_points,1000),rating,'LOSS'),
    'tactic',tactic,'defense_character_ids',to_jsonb(character_ids),
    'defense_characters',coalesce((
      select jsonb_agg(jsonb_build_object(
        'slot',picked.ordinality,'character_master_id',release.character_id,
        'display_name',release.display_name,'rarity',release.rarity,
        'level',coalesce(owned.level,1),'asset_identifier',release.asset_path
      ) order by picked.ordinality)
      from unnest(selected.character_ids) with ordinality picked(owned_id,ordinality)
      join public.user_characters owned on owned.user_id=selected.id and owned.id::text=picked.owned_id
      join public.character_release_master release on release.character_id=owned.character_id and release.is_enabled
    ),'[]'::jsonb)
  ) order by
    case when v_first_pvp_pending and v_my_power>0 and total_power<v_my_power then 0 else 1 end,
    case when v_first_pvp_pending then abs(v_my_power-total_power) else match_tier end,
    match_tier,abs(rating-coalesce(p_my_points,1000)),id),'[]'::jsonb)
  into v_items from selected;

  return jsonb_build_object(
    'items',v_items,'total_count',v_total,'offset',v_effective_offset,
    'next_offset',case when v_total<=5 then 0 when v_effective_offset+5>=v_total then 0 else v_effective_offset+5 end
  );
end $function$
;
CREATE OR REPLACE FUNCTION public.get_pvp_rankings_page(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid();
begin if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if; if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
 return jsonb_build_object('rows',coalesce((with totals as(select rank.user_id,u.username,rank.rank_points score,rank.updated_at achieved_at,coalesce(power.total_power,0) total_power from public.pvp_ranks rank join public.users u on u.id=rank.user_id left join public.user_power_rankings power on power.user_id=rank.user_id),ranked as(select *,rank() over(order by score desc) rank_position from totals) select jsonb_agg(to_jsonb(page) order by score desc,achieved_at,user_id) from(select * from ranked order by score desc,achieved_at,user_id limit p_limit offset p_offset)page),'[]'::jsonb),'selfRank',(with totals as(select user_id,rank_points score,updated_at achieved_at from public.pvp_ranks),ranked as(select *,rank() over(order by score desc) rank_position from totals) select to_jsonb(ranked) from ranked where user_id=v_uid));
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_rankings(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select public.get_raid_rankings(p_instance_id,100,0) $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_rankings(p_instance_id uuid, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
 return jsonb_build_object('status','RETIRED','individual','[]'::jsonb,'guild','[]'::jsonb,'selfRank',null,'season_id',null,'starts_at',null,'ends_at',null);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_season_rankings(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
 return jsonb_build_object('status','RETIRED','individual','[]'::jsonb,'guild','[]'::jsonb,'selfRank',null,'season_id',null,'starts_at',null,'ends_at',null);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_recommended_guilds(p_limit integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user uuid:=auth.uid();
begin
 if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
 return coalesce((with weights as (
  select max(weight) filter(where config_key='active_member_7d') active_member,
   max(weight) filter(where config_key='raid_participant_7d') raid_participant,
   max(weight) filter(where config_key='chat_member_7d') chat_member,
   max(weight) filter(where config_key='activity_contributor_7d') activity_contributor,
   max(weight) filter(where config_key='target_fill_bonus') target_fill,
   max(weight) filter(where config_key='instant_join_bonus') instant_join,
   max(weight) filter(where config_key='raid_contribution_scale') raid_scale,
   max(weight) filter(where config_key='guild_power_scale') power_scale,
   max(weight) filter(where config_key='inactive_14d_penalty') inactive_penalty,
   max(weight) filter(where config_key='stale_request_penalty') stale_penalty,
   max(weight) filter(where config_key='rotation_range') rotation_range
  from public.guild_recommendation_weights
 ),scored as(
  select g.id guild_id,g.name,g.description,g.level,g.approval_required,g.recruitment_mode,
   stats.member_count,stats.member_limit,stats.fill_ratio,stats.active_members_7d,stats.raid_participants_7d,
   stats.raid_contribution_7d,stats.chatters_7d,stats.activity_contributors_7d,stats.guild_power,stats.stale_requests,
   round((stats.active_members_7d*coalesce(w.active_member,18)+stats.raid_participants_7d*coalesce(w.raid_participant,16)
    +stats.chatters_7d*coalesce(w.chat_member,10)+stats.activity_contributors_7d*coalesce(w.activity_contributor,12)
    +case when stats.fill_ratio between .5 and .8 and stats.active_members_7d>0 then coalesce(w.target_fill,45) else 0 end
    +case when g.recruitment_mode='OPEN_JOIN' then coalesce(w.instant_join,12) else 0 end
    +ln(greatest(stats.raid_contribution_7d,0)+1)*coalesce(w.raid_scale,4)
    +ln(greatest(stats.guild_power,0)+1)*coalesce(w.power_scale,2)
    -case when stats.last_active_at<now()-interval '14 days' or stats.last_active_at is null then coalesce(w.inactive_penalty,60) else 0 end
    -stats.stale_requests*coalesce(w.stale_penalty,8)
    +(abs(hashtextextended(v_user::text||':'||g.id::text||':'||date_trunc('week',now())::text,0))%greatest(coalesce(w.rotation_range,9)::integer,1)))::numeric,2) recommendation_score
  from public.guilds g cross join weights w cross join lateral(
   select (select count(*) from public.guild_members gm where gm.guild_id=g.id)::integer member_count,
    public.canonical_guild_member_cap(g.id)::integer member_limit,
    (select count(*)::numeric/greatest(public.canonical_guild_member_cap(g.id),1) from public.guild_members gm where gm.guild_id=g.id) fill_ratio,
    (select count(distinct gm.user_id) from public.guild_members gm join public.users u on u.id=gm.user_id where gm.guild_id=g.id and u.last_active_at>=now()-interval '7 days')::integer active_members_7d,
    (select count(distinct r.user_id) from public.raid_damage_logs r where r.guild_id=g.id and r.created_at>=now()-interval '7 days')::integer raid_participants_7d,
    coalesce((select sum(r.raw_damage) from public.raid_damage_logs r where r.guild_id=g.id and r.created_at>=now()-interval '7 days'),0)::bigint raid_contribution_7d,
    (select count(distinct b.user_id) from public.board_posts b where b.target_type='GUILD' and b.target_id=g.id and b.created_at>=now()-interval '7 days')::integer chatters_7d,
    (select count(distinct a.user_id) from public.guild_exp_daily_ledger a where a.guild_id=g.id and a.created_at>=now()-interval '7 days')::integer activity_contributors_7d,
    coalesce((select sum(p.total_power) from public.guild_members gm join public.user_power_rankings p on p.user_id=gm.user_id where gm.guild_id=g.id),0)::bigint guild_power,
    (select count(*) from public.guild_join_requests j where j.guild_id=g.id and j.status='PENDING' and j.requested_at<now()-interval '72 hours')::integer stale_requests,
    (select max(u.last_active_at) from public.guild_members gm join public.users u on u.id=gm.user_id where gm.guild_id=g.id) last_active_at
  )stats where not g.is_disbanded and g.recruitment_mode<>'CLOSED' and stats.member_count<stats.member_limit
 ) select jsonb_agg(to_jsonb(s) order by s.recommendation_score desc,s.guild_id)
 from(select * from scored order by recommendation_score desc,guild_id limit least(greatest(coalesce(p_limit,5),3),5))s),'[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_user_setup_status()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid());
$function$
;
CREATE OR REPLACE FUNCTION public.grant_canonical_daily_ranking_reward(p_ranking_day_key date, p_ranking_type text, p_recipient_user_id uuid, p_ranked_entity_id uuid, p_rank_position integer, p_score bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_award_id uuid; v_reward record; v_granted integer:=0; v_master_count integer;
begin
  if p_ranking_type='RAID_PERSONAL' then return 0; end if;
  if p_ranking_type not in ('POWER','GUILD_POWER','PVP','RAID_PERSONAL')
     or p_rank_position not between 1 and 100 then
    raise exception 'invalid daily ranking award' using errcode='22023';
  end if;
  select count(*) into v_master_count
  from public.canonical_daily_ranking_reward_master master
  where master.version='2026-09-03' and master.is_production_enabled
    and master.ranking_type=p_ranking_type
    and p_rank_position between master.rank_min and master.rank_max;
  if v_master_count<>2 then
    raise exception 'daily ranking reward master must resolve exactly two items' using errcode='23514';
  end if;

  insert into public.ranking_daily_reward_awards(
    ranking_day_key,ranking_type,recipient_user_id,ranked_entity_id,rank_position,score
  ) values(p_ranking_day_key,p_ranking_type,p_recipient_user_id,p_ranked_entity_id,p_rank_position,p_score)
  on conflict(ranking_day_key,ranking_type,recipient_user_id) do nothing
  returning id into v_award_id;
  if v_award_id is null then return 0; end if;

  for v_reward in
    select master.item_id,master.quantity
    from public.canonical_daily_ranking_reward_master master
    where master.version='2026-09-03' and master.is_production_enabled
      and master.ranking_type=p_ranking_type
      and p_rank_position between master.rank_min and master.rank_max
    order by master.item_id
  loop
    insert into public.ranking_daily_reward_item_grants(award_id,item_id,quantity)
    values(v_award_id,v_reward.item_id,v_reward.quantity);
    insert into public.user_items(user_id,item_id,quantity)
    values(p_recipient_user_id,v_reward.item_id,v_reward.quantity)
    on conflict(user_id,item_id) do update set
      quantity=public.user_items.quantity+excluded.quantity,updated_at=clock_timestamp();
    v_granted:=v_granted+1;
  end loop;

  insert into public.ranking_reward_notifications(
    recipient_user_id,period_kind,period_key,awarded_at,acknowledged_at
  ) values(p_recipient_user_id,'DAILY',p_ranking_day_key::text,clock_timestamp(),null)
  on conflict(recipient_user_id,period_kind,period_key) do update set
    awarded_at=excluded.awarded_at,acknowledged_at=null;
  return v_granted;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.grant_canonical_guild_daily_exp(p_user_id uuid, p_source text, p_source_reference_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_guild uuid;v_exp integer;v_day date:=public.guild_jst_date();v_result jsonb;
begin
 select guild_id into v_guild from public.guild_members where user_id=p_user_id;
 if v_guild is null then return jsonb_build_object('status','not_in_guild'); end if;
 select exp_grant into v_exp from public.canonical_guild_exp_source_master where source=p_source and enabled and daily_per_member=1;
 if not found then raise exception 'unsupported Guild EXP source'; end if;
 insert into public.guild_exp_daily_ledger(guild_id,user_id,source,jst_date,exp_granted,source_reference_id)
 values(v_guild,p_user_id,p_source,v_day,v_exp,p_source_reference_id) on conflict(guild_id,user_id,source,jst_date) do nothing;
 if not found then return jsonb_build_object('status','already_recorded','source',p_source); end if;
 v_result:=public.apply_canonical_guild_exp(v_guild,v_exp);
 return jsonb_build_object('status','granted','source',p_source,'expGained',v_exp,'guild',v_result);
end $function$
;
CREATE OR REPLACE FUNCTION public.grant_mission_reward_bundle(p_delivery_ledger_id uuid, p_user_id uuid, p_mission_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_component record;
  v_mission public.missions%rowtype;
  v_item_id text;
  v_rewards jsonb := '[]'::jsonb;
  v_has_components boolean;
  v_order smallint := 0;
begin
  select * into strict v_mission from public.missions where id = p_mission_id;
  select exists(select 1 from public.mission_reward_components where mission_id=p_mission_id)
    into v_has_components;

  if v_has_components then
    for v_component in
      select reward_order,item_id,quantity from public.mission_reward_components
      where mission_id=p_mission_id order by reward_order
    loop
      v_item_id := public.resolve_canonical_reward_item(v_component.item_id);
      insert into public.mission_reward_delivery_items(delivery_ledger_id,reward_order,item_id,quantity)
      values(p_delivery_ledger_id,v_component.reward_order,v_item_id,v_component.quantity);
      perform public.grant_present_payload(p_user_id,v_item_id,v_component.quantity);
      v_rewards := v_rewards || jsonb_build_array(jsonb_build_object(
        'item_id',v_item_id,'quantity',v_component.quantity
      ));
      v_order := greatest(v_order,v_component.reward_order);
    end loop;
  else
    -- The caller resolves legacy random rewards once into the delivery ledger.
    -- Reuse that value so the audit row and actual direct grant cannot diverge.
    select resolved_item_id into v_item_id
    from public.mission_reward_delivery_ledger where id=p_delivery_ledger_id;
    if coalesce(v_item_id,'')<>'' and coalesce(v_mission.reward_quantity,0)>0 then
      v_order := 1;
      insert into public.mission_reward_delivery_items(delivery_ledger_id,reward_order,item_id,quantity)
      values(p_delivery_ledger_id,v_order,v_item_id,v_mission.reward_quantity);
      perform public.grant_present_payload(p_user_id,v_item_id,v_mission.reward_quantity);
      v_rewards := v_rewards || jsonb_build_array(jsonb_build_object(
        'item_id',v_item_id,'quantity',v_mission.reward_quantity
      ));
    end if;
  end if;

  if coalesce(v_mission.cash_reward,0)>0 then
    v_order := v_order + 1;
    insert into public.mission_reward_delivery_items(delivery_ledger_id,reward_order,item_id,quantity)
    values(p_delivery_ledger_id,v_order,'CASH',v_mission.cash_reward);
    perform public.grant_present_payload(p_user_id,'CASH',v_mission.cash_reward);
    v_rewards := v_rewards || jsonb_build_array(jsonb_build_object(
      'item_id','CASH','quantity',v_mission.cash_reward
    ));
  end if;
  return v_rewards;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.grant_present_payload(p_user_id uuid, p_item_id text, p_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_quantity <= 0 THEN RAISE EXCEPTION 'Invalid present quantity'; END IF;

  IF p_item_id = 'CASH' THEN
    UPDATE public.users SET cash = cash + p_quantity WHERE id = p_user_id;
  ELSIF p_item_id IN ('DIA', 'DIAMOND') THEN
    UPDATE public.users SET neon_diamonds = neon_diamonds + p_quantity WHERE id = p_user_id;
  ELSIF EXISTS (
    SELECT 1 FROM public.equipment_battle_master WHERE equipment_id = p_item_id
  ) THEN
    INSERT INTO public.user_equipments (
      user_id, equipment_id, equipment_master_id, level, plus_val
    )
    SELECT p_user_id, p_item_id, p_item_id, 1, 0
    FROM generate_series(1, p_quantity);
  ELSE
    INSERT INTO public.user_items (user_id, item_id, quantity)
    VALUES (p_user_id, p_item_id, p_quantity)
    ON CONFLICT (user_id, item_id) DO UPDATE
    SET quantity = public.user_items.quantity + EXCLUDED.quantity;
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.guard_equipped_title_ownership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.title_equipped IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_titles AS owned
    WHERE owned.user_id = NEW.id
      AND owned.title_id = NEW.title_equipped
  ) THEN
    RAISE EXCEPTION 'Equipped title must be owned by the user';
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.guard_gvg_defense_deck_lock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user_id UUID;
BEGIN
  v_user_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END;
  IF EXISTS (
    SELECT 1
    FROM public.guild_members member
    JOIN public.gvg_match_sessions match ON match.guild_a_id = member.guild_id OR match.guild_b_id = member.guild_id
    WHERE member.user_id = v_user_id
      AND match.status = 'ACTIVE'
      AND now() >= match.scheduled_start_at AND now() < match.scheduled_end_at
  ) THEN
    RAISE EXCEPTION 'GvG defense decks are locked during active GvG';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.reject_friend_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('FRIEND'); return public.reject_friend_request_core_20260823(p_request_id); end $function$
;
CREATE OR REPLACE FUNCTION public.exchange_special_gacha_reward(p_gacha_id text, p_reward_type text, p_reward_id text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=auth.uid(); prior public.special_gacha_exchange_receipts; result jsonb; points integer;
begin
 if u is null then raise exception 'not authorized'; end if;
 if p_request_id is null then raise exception 'request_id is required'; end if;
 perform 1 from public.users where id=u for update;
 select * into prior from public.special_gacha_exchange_receipts where user_id=u and request_id=p_request_id;
 if found then
  if prior.gacha_id is distinct from p_gacha_id or prior.reward_type is distinct from p_reward_type or prior.reward_id is distinct from p_reward_id then raise exception 'request_id was already used for a different exchange'; end if;
  return prior.result_payload;
 end if;
 if not exists(select 1 from public.feature_operating_states where feature_key='SPECIAL_GACHA' and state='OPEN') then raise exception 'special gacha is closed'; end if;
 if p_gacha_id is null or p_gacha_id not in ('CHAR_JUSTICE_EVIL_SPECIAL','CHAR_ORDER_CHAOS_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL')
  or not exists(select 1 from public.gacha_items_master where gacha_id=p_gacha_id and item_type=p_reward_type and item_id=p_reward_id and rarity='SSR') then raise exception 'invalid pity reward'; end if;
 result:=public._exchange_pity_reward_per_banner(u,p_reward_type,p_reward_id,p_gacha_id);
 select current_points into points from public.user_gacha_pity_points where user_id=u and pity_master_id='pity_banner:'||p_gacha_id;
 result:=result||jsonb_build_object('current_points',points,'gacha_id',p_gacha_id);
 insert into public.special_gacha_exchange_receipts(user_id,request_id,gacha_id,reward_type,reward_id,result_payload) values(u,p_request_id,p_gacha_id,p_reward_type,p_reward_id,result);
 return result;
end $function$
;
CREATE OR REPLACE FUNCTION public.get_special_gacha_catalog_v2()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 with original as (select public.get_special_gacha_catalog() value)
 select value || jsonb_build_object('pity_scope','PER_GACHA','gachas',
  (select jsonb_agg(g.value||jsonb_build_object('pity_points',
   coalesce((select current_points from public.user_gacha_pity_points where user_id=auth.uid() and pity_master_id='pity_banner:'||(g.value->>'id')),0))
   order by g.value->>'id') from jsonb_array_elements(value->'gachas') g)) from original
$function$
;
CREATE OR REPLACE FUNCTION public.activate_formal_open_next_day_seasons_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare n int;
begin
 perform pg_advisory_xact_lock(hashtextextended('ranking-season:PVP',0));
 lock table public.ranking_seasons in share row exclusive mode;
 if clock_timestamp()<'2026-09-15 15:00:00+00'::timestamptz then return jsonb_build_object('status','SCHEDULED');end if;
 select count(*) into n from public.ranking_seasons where ranking_type in('PVP','POWER','GUILD_POWER')
   and starts_at='2026-09-15 15:00:00+00' and ends_at='2026-09-30 15:00:00+00' and status='PREPARING';
 if n=0 then return jsonb_build_object('status','NO_PENDING');end if;
 if clock_timestamp()>='2026-09-30 15:00:00+00'::timestamptz then raise exception 'Missed activation requires review';end if;
 if exists(select 1 from public.ranking_seasons where ranking_type in('PVP','POWER','GUILD_POWER') and status<>'CLOSED'
   and starts_at<>'2026-09-15 15:00:00+00'::timestamptz) then raise exception 'Conflicting current season';end if;
 if (select count(*) from public.ranking_seasons where ranking_type in('PVP','POWER','GUILD_POWER')
  and starts_at='2026-09-15 15:00:00+00' and ends_at='2026-09-30 15:00:00+00' and status in('PREPARING','ACTIVE'))<>3 then raise exception 'Incomplete reservation';end if;
 if (select count(*) from public.monthly_power_season_runs r join public.ranking_seasons s on s.id=r.season_id
   where s.starts_at='2026-09-15 15:00:00+00' and s.ranking_type in('POWER','GUILD_POWER'))<>2 then raise exception 'Reward registration required';end if;
 update public.ranking_seasons set status='ACTIVE',updated_at=clock_timestamp()
 where ranking_type in('PVP','POWER','GUILD_POWER') and starts_at='2026-09-15 15:00:00+00' and status='PREPARING';
 return jsonb_build_object('status','ACTIVATED');
end $function$
;
CREATE OR REPLACE FUNCTION public.get_upcoming_ranking_seasons_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'season_id', planned.id, 'ranking_type', planned.ranking_type,
      'starts_at', planned.starts_at, 'ends_at', planned.ends_at, 'status', planned.status
    ) order by planned.ranking_type)
    from (
      select distinct on (season.ranking_type) season.*
      from public.ranking_seasons season
      where season.ranking_type in ('POWER', 'GUILD_POWER', 'PVP')
        and season.status in ('PREPARING', 'ACTIVE')
        and season.starts_at > statement_timestamp()
        and season.ends_at > season.starts_at
        and not exists (
          select 1 from public.ranking_seasons current_season
          where current_season.ranking_type = season.ranking_type
            and current_season.status = 'ACTIVE'
            and current_season.starts_at <= statement_timestamp()
            and current_season.ends_at > statement_timestamp()
        )
      order by season.ranking_type, season.starts_at, season.id
    ) planned
  ), '[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.grant_raid_completion_xp(p_boss_id text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_boss public.raid_bosses%ROWTYPE;
  v_participant RECORD;
  v_reward_xp INTEGER;
  v_granted INTEGER := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.raid_damage_logs
    WHERE boss_id = p_boss_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Raid participation is required';
  END IF;

  SELECT * INTO v_boss
  FROM public.raid_bosses
  WHERE boss_id = p_boss_id AND status = 'DEFEATED'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raid boss is not defeated';
  END IF;

  FOR v_participant IN
    SELECT user_id, SUM(damage)::BIGINT AS total_damage
    FROM public.raid_damage_logs
    WHERE boss_id = p_boss_id
    GROUP BY user_id
  LOOP
    SELECT COALESCE(MAX(reward_xp), 0) INTO v_reward_xp
    FROM public.raid_rewards_master
    WHERE reward_type = 'DEFEAT_XP'
      AND threshold_val <= v_participant.total_damage;

    IF v_reward_xp > 0 THEN
      INSERT INTO public.raid_completion_xp_grants (raid_cycle_id, user_id, reward_xp)
      VALUES (v_boss.cycle_id, v_participant.user_id, v_reward_xp)
      ON CONFLICT DO NOTHING;
      IF FOUND THEN
        PERFORM public.apply_user_xp(v_participant.user_id, v_reward_xp);
        v_granted := v_granted + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_granted;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.guard_daily_profile_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_today DATE := (now() AT TIME ZONE 'Asia/Tokyo')::DATE;
BEGIN
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    IF char_length(btrim(NEW.username)) = 0 OR char_length(NEW.username) > 8 THEN
      RAISE EXCEPTION 'Username must be between 1 and 8 characters';
    END IF;
    IF OLD.last_username_changed_on = v_today THEN RAISE EXCEPTION 'Username can only be changed once per day'; END IF;
    NEW.last_username_changed_on := v_today;
  END IF;
  IF NEW.bio IS DISTINCT FROM OLD.bio THEN
    IF char_length(COALESCE(NEW.bio, '')) > 200 THEN RAISE EXCEPTION 'Bio must be 200 characters or fewer'; END IF;
    IF OLD.last_bio_changed_on = v_today THEN RAISE EXCEPTION 'Bio can only be changed once per day'; END IF;
    NEW.last_bio_changed_on := v_today;
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.guard_gvg_membership_lock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_guild_ids UUID[];
BEGIN
  v_guild_ids := ARRAY_REMOVE(ARRAY[
    CASE WHEN TG_OP <> 'INSERT' THEN OLD.guild_id ELSE NULL END,
    CASE WHEN TG_OP <> 'DELETE' THEN NEW.guild_id ELSE NULL END
  ], NULL);
  IF EXISTS (
    SELECT 1 FROM public.gvg_match_sessions match
    WHERE match.status = 'ACTIVE'
      AND now() >= match.scheduled_start_at AND now() < match.scheduled_end_at
      AND (match.guild_a_id = ANY(v_guild_ids) OR match.guild_b_id = ANY(v_guild_ids))
  ) THEN
    RAISE EXCEPTION 'Guild membership and roles are locked during active GvG';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.guard_preopen_guild_power_cutoff()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season_id uuid;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_status text;
  v_finalized boolean;
begin
  select season.id,season.starts_at,season.ends_at,season.status,
    exists(select 1 from public.ranking_guild_power_finalization_audits audit
           where audit.season_id=season.id)
  into strict v_season_id,v_starts_at,v_ends_at,v_status,v_finalized
  from public.ranking_guild_power_season_master master
  join public.ranking_seasons season on season.id=master.season_id
  where master.event_key='PREOPEN_GUILD_POWER_2026';

  if clock_timestamp()<v_starts_at then
    return null;
  end if;
  if v_status='PREPARING' then
    perform public.activate_preopen_guild_power_season();
  end if;
  if v_finalized then
    return null;
  elsif clock_timestamp()>=v_ends_at then
    perform public.finalize_preopen_guild_power_season();
  else
    -- Pre-cutoff work is admitted by season-row/share then advisory/share.
    -- The finalizer uses the same order with exclusive modes and waits for it.
    perform 1 from public.ranking_seasons where id=v_season_id for share;
    -- A transaction admitted before cutoff holds a shared lock through commit.
    -- The finalizer's exclusive lock therefore waits for all admitted writes.
    perform pg_advisory_xact_lock_shared(hashtextextended('PREOPEN_GUILD_POWER_2026',0));
  end if;
  return null;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.guild_jst_date(p_at timestamp with time zone DEFAULT now())
 RETURNS date
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
 select (p_at at time zone 'Asia/Tokyo')::date
$function$
;
CREATE OR REPLACE FUNCTION public.initialize_current_player(p_username text, p_invite_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_result jsonb; v_invitation jsonb;
begin
 v_result:=public.initialize_current_player(p_username);
 if v_result->>'status'='success' and nullif(btrim(coalesce(p_invite_code,'')),'') is not null then
  v_invitation:=public.apply_current_player_invitation(p_invite_code);
  v_result:=v_result||jsonb_build_object('invitation',v_invitation);
 end if;
 return v_result;
end $function$
;
CREATE OR REPLACE FUNCTION public.initialize_new_user(p_user_id uuid, p_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.initialize_new_user(p_user_id uuid, p_username text, p_character_id text, p_area_id text, p_gift_code text DEFAULT NULL::text, p_gender text DEFAULT NULL::text, p_hair_id text DEFAULT NULL::text, p_face_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF char_length(trim(p_username)) NOT BETWEEN 1 AND 8 THEN
    RAISE EXCEPTION 'Username must contain 1 to 8 characters';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE username = trim(p_username) AND id <> p_user_id) THEN
    RAISE EXCEPTION 'Username is already in use';
  END IF;

  INSERT INTO public.users (
    id, username, current_base_id, favorite_character_id, gift_code
  ) VALUES (
    p_user_id, trim(p_username), COALESCE(NULLIF(p_area_id, ''), 'neon_tower'),
    COALESCE(NULLIF(p_character_id, ''), '11111111-1111-1111-1111-111111111111'),
    NULLIF(trim(COALESCE(p_gift_code, '')), '')
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_characters (user_id, character_id, level, awakening_level)
  VALUES (
    p_user_id,
    COALESCE(NULLIF(p_character_id, ''), '11111111-1111-1111-1111-111111111111'),
    1,
    0
  ) ON CONFLICT (user_id, character_id) DO NOTHING;

  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.is_current_guild_master(p_guild_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_id = p_guild_id AND user_id = auth.uid() AND role = 'MASTER'
  );
$function$
;
CREATE OR REPLACE FUNCTION public.is_current_guild_member(p_guild_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_id = p_guild_id AND user_id = auth.uid()
  );
$function$
;
CREATE OR REPLACE FUNCTION public.join_guild(p_guild_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_mode text;
  v_cap integer;
  v_count integer;
  v_user public.users%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select * into v_user from public.users where id = auth.uid() for update;
  if not found then raise exception 'Guild joining requirements are not met'; end if;
  if v_user.last_guild_left_at is not null and v_user.last_guild_left_at > now() - interval '24 hours' then
    raise exception 'Guild rejoin cooldown is active'
      using errcode = 'P0001', detail = 'GUILD_JOIN_COOLDOWN_ACTIVE';
  end if;
  if exists(select 1 from public.guild_members where user_id = auth.uid()) then raise exception 'Already in a guild'; end if;
  select recruitment_mode, public.canonical_guild_member_cap(id)
    into v_mode, v_cap
  from public.guilds
  where id = p_guild_id and not is_disbanded
  for update;
  if not found then raise exception 'Guild not found'; end if;
  if v_mode <> 'OPEN_JOIN' then raise exception 'Guild does not accept direct joins'; end if;
  select count(*) into v_count from public.guild_members where guild_id = p_guild_id;
  if v_count >= v_cap then raise exception 'Guild member cap reached'; end if;
  insert into public.guild_members(guild_id, user_id, role, weekly_contribution, total_contribution)
  values(p_guild_id, auth.uid(), 'MEMBER', 0, 0);
  update public.guild_join_requests
  set status = 'CANCELLED', reviewed_at = now(), reviewed_by = auth.uid()
  where user_id = auth.uid() and status = 'PENDING';
  perform public.evaluate_mission_progress(auth.uid(), 'GUILD_JOIN', 1);
  return jsonb_build_object('status', 'success');
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kick_guild_member(p_guild_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_actor_role text; v_target_role text;
BEGIN
  IF auth.uid() IS NULL OR p_user_id = auth.uid() THEN RAISE EXCEPTION 'Invalid guild member removal'; END IF;
  SELECT role INTO v_actor_role FROM public.guild_members WHERE guild_id = p_guild_id AND user_id = auth.uid();
  SELECT role INTO v_target_role FROM public.guild_members WHERE guild_id = p_guild_id AND user_id = p_user_id;
  IF NOT COALESCE(
    (v_actor_role = 'MASTER' AND v_target_role IN ('SUB_MASTER', 'MEMBER'))
    OR (v_actor_role = 'SUB_MASTER' AND v_target_role = 'MEMBER'), false
  ) THEN RAISE EXCEPTION 'Insufficient guild member removal permission'; END IF;
  DELETE FROM public.guild_members WHERE guild_id = p_guild_id AND user_id = p_user_id;
  UPDATE public.users SET last_guild_left_at = now() WHERE id = p_user_id;
  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.leave_guild(p_user_id uuid, p_guild_id uuid, p_is_master boolean, p_has_others boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_role text;v_other integer;
begin if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'Only current user can leave Guild'; end if;
 perform 1 from public.guilds where id=p_guild_id for update; select role into v_role from public.guild_members where guild_id=p_guild_id and user_id=auth.uid() for update;
 if v_role is null then raise exception 'Guild membership required'; end if; select count(*) into v_other from public.guild_members where guild_id=p_guild_id and user_id<>auth.uid();
 if v_role='MASTER' and v_other>0 then raise exception 'Transfer MASTER before leaving Guild'; end if;
 delete from public.guild_members where guild_id=p_guild_id and user_id=auth.uid(); update public.users set last_guild_left_at=now() where id=auth.uid();
 if v_role='MASTER' then update public.guilds set is_disbanded=true,disbanded_at=now(),recruitment_mode='CLOSED',approval_required=false where id=p_guild_id; end if;
 return jsonb_build_object('status','success','disbanded',v_role='MASTER'); end $function$
;
CREATE OR REPLACE FUNCTION public.level_up_character(p_character_id uuid, p_exp_item_id text, p_count integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select public.level_up_character_exp(p_character_id,jsonb_build_object(p_exp_item_id,p_count),gen_random_uuid())
$function$
;
CREATE OR REPLACE FUNCTION public.level_up_equipment(p_equipment_id uuid, p_exp_item_id text, p_count integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select public.level_up_equipment_exp(p_equipment_id,jsonb_build_object(p_exp_item_id,p_count),gen_random_uuid())
$function$
;
CREATE OR REPLACE FUNCTION public.limit_break_equipment(p_equipment_id uuid, p_use_wildcard boolean, p_dupe_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_master_id text; v_plus integer; v_next integer; v_required integer; v_dupe_master_id text; begin
 if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
 select coalesce(nullif(equipment_id,''),equipment_master_id),coalesce(plus_val,0) into v_master_id,v_plus from public.user_equipments where id=p_equipment_id and user_id=v_user_id for update;
 if not found then raise exception 'owned equipment not found' using errcode='P0002'; end if;
 if v_plus>=10 then raise exception 'equipment limit break cap reached' using errcode='23514'; end if;
 v_next:=v_plus+1; select equivalent_cost into v_required from public.canonical_equipment_lb_steps where version='2026-08-21' and plus_val=v_next;
 if p_use_wildcard then update public.user_items set quantity=quantity-v_required where user_id=v_user_id and item_id='EQUIP_LB_PART' and quantity>=v_required; if not found then raise exception 'insufficient equipment limit break material' using errcode='23514'; end if;
 else if p_dupe_id is null or p_dupe_id=p_equipment_id then raise exception 'valid duplicate equipment is required' using errcode='22023'; end if; select coalesce(nullif(equipment_id,''),equipment_master_id) into v_dupe_master_id from public.user_equipments where id=p_dupe_id and user_id=v_user_id and equipped_character_id is null for update; if not found or v_dupe_master_id is distinct from v_master_id then raise exception 'matching unequipped duplicate is required' using errcode='23514'; end if; delete from public.user_equipments where id=p_dupe_id and user_id=v_user_id; end if;
 update public.user_equipments set plus_val=v_next where id=p_equipment_id and user_id=v_user_id;
 perform public.evaluate_mission_progress(v_user_id,'GEAR_LIMIT_BREAK',1);
 return jsonb_build_object('status','success','plus_val',v_next,'equivalent_cost',v_required); end $function$
;
CREATE OR REPLACE FUNCTION public.limit_break_gear(p_user_id uuid, p_equipment_id uuid, p_cash_cost integer, p_hammer_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_equip_plus INTEGER;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = 'EQUIP_LB_HAMMER';
    IF v_item_qty IS NULL OR v_item_qty < p_hammer_cost THEN
        RETURN jsonb_build_object('error', '限界突破ハンマーが不足しています。');
    END IF;

    SELECT plus_val INTO v_equip_plus FROM public.user_equipments WHERE id = p_equipment_id AND user_id = p_user_id;
    IF v_equip_plus IS NULL THEN
        RETURN jsonb_build_object('error', '装備が存在しません。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    UPDATE public.user_items SET quantity = quantity - p_hammer_cost WHERE user_id = p_user_id AND item_id = 'EQUIP_LB_HAMMER';
    UPDATE public.user_equipments SET plus_val = plus_val + 1 WHERE id = p_equipment_id AND user_id = p_user_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'GEAR_LIMIT_BREAK', 1);
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.mark_bbs_thread_read(p_thread_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR p_thread_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.bbs_threads WHERE id = p_thread_id
  ) THEN
    RAISE EXCEPTION 'Invalid BBS thread';
  END IF;

  INSERT INTO public.bbs_read_states (user_id, thread_id, last_read_at)
  VALUES (auth.uid(), p_thread_id, clock_timestamp())
  ON CONFLICT (user_id, thread_id)
  DO UPDATE SET last_read_at = EXCLUDED.last_read_at;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.on_m9x_join_approved_metric()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status='APPROVED' and old.status is distinct from 'APPROVED' then
    insert into public.guild_human_response_metrics(join_request_id,guild_id,joined_user_id,joined_at)
    values(new.id,new.guild_id,new.user_id,coalesce(new.reviewed_at,now())) on conflict(join_request_id) do nothing;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.sync_user_guild_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET guild_id = NEW.guild_id WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  UPDATE public.users SET guild_id = NULL WHERE id = OLD.user_id AND guild_id = OLD.guild_id;
  RETURN OLD;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.limit_break_gear_v2(p_user_id uuid, p_equipment_id uuid, p_cash_cost integer, p_use_wildcard boolean, p_dupe_id uuid, p_new_options jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_equip_plus INTEGER;
    v_dupe_exists BOOLEAN;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    IF p_use_wildcard THEN
        SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = 'EQUIP_LB_HAMMER';
        IF v_item_qty IS NULL OR v_item_qty < 1 THEN
            RETURN jsonb_build_object('error', '代用素材「万能カスタムツール [装備]」が不足しています。');
        END IF;
    ELSE
        SELECT EXISTS(SELECT 1 FROM public.user_equipments WHERE id = p_dupe_id AND user_id = p_user_id AND equipped_character_id IS NULL) INTO v_dupe_exists;
        IF NOT v_dupe_exists THEN
            RETURN jsonb_build_object('error', '同名の予備装備品が見つかりません。');
        END IF;
    END IF;

    SELECT plus_val INTO v_equip_plus FROM public.user_equipments WHERE id = p_equipment_id AND user_id = p_user_id;
    IF v_equip_plus IS NULL THEN
        RETURN jsonb_build_object('error', '対象装備が存在しません。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    
    IF p_use_wildcard THEN
        UPDATE public.user_items SET quantity = quantity - 1 WHERE user_id = p_user_id AND item_id = 'EQUIP_LB_HAMMER';
    ELSE
        DELETE FROM public.user_equipments WHERE id = p_dupe_id;
    END IF;

    UPDATE public.user_equipments 
    SET plus_val = plus_val + 1, random_options = p_new_options 
    WHERE id = p_equipment_id AND user_id = p_user_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'GEAR_LIMIT_BREAK', 1);
    RETURN jsonb_build_object('status', 'success', 'next_plus', v_equip_plus + 1);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.limit_break_skill(p_skill_id uuid, p_use_wildcard boolean, p_dupe_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid(); v_skill_card_id text; v_plus integer; v_next integer;
  v_cost bigint; v_required integer; v_cash bigint; v_quantity integer; v_dupe_skill_id text; v_material_id text;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select skill_card_id, coalesce(plus_val, 0) into v_skill_card_id, v_plus from public.user_skills
  where id=p_skill_id and user_id=v_user_id for update;
  if not found then raise exception 'owned skill not found' using errcode = 'P0002'; end if;
  if v_plus >= 10 then raise exception 'skill limit break cap reached' using errcode = '23514'; end if;
  v_next := v_plus + 1;
  select cost_cash, required_book into v_cost, v_required from public.skill_limit_break_master where plus_val=v_next;
  if not found then raise exception 'skill limit break master is incomplete' using errcode = 'P0002'; end if;
  select cash into v_cash from public.users where id=v_user_id for update;
  if coalesce(v_cash,0) < v_cost then raise exception 'insufficient cash' using errcode = '23514'; end if;
  v_material_id := 'SKILL_MANUAL';
  if p_use_wildcard then
    select quantity into v_quantity from public.user_items where user_id=v_user_id and item_id=v_material_id for update;
    if coalesce(v_quantity,0) < v_required then raise exception 'insufficient skill limit break material' using errcode = '23514'; end if;
  else
    if p_dupe_id is null or p_dupe_id=p_skill_id then raise exception 'valid duplicate skill is required' using errcode = '22023'; end if;
    select skill_card_id into v_dupe_skill_id from public.user_skills where id=p_dupe_id and user_id=v_user_id and equipped_character_id is null for update;
    if not found or v_dupe_skill_id is distinct from v_skill_card_id then raise exception 'matching unequipped duplicate is required' using errcode = '23514'; end if;
  end if;
  update public.users set cash=cash-v_cost where id=v_user_id;
  if p_use_wildcard then update public.user_items set quantity=quantity-v_required where user_id=v_user_id and item_id=v_material_id;
  else delete from public.user_skills where id=p_dupe_id and user_id=v_user_id; end if;
  update public.user_skills set plus_val=v_next where id=p_skill_id and user_id=v_user_id;
  perform public.evaluate_mission_progress(v_user_id,'SKILL_LIMIT_BREAK',1);
  return jsonb_build_object('status','success','plus_val',v_next,'cash_spent',v_cost,'remaining_cash',v_cash-v_cost,'material_id',v_material_id);
end; $function$
;
CREATE OR REPLACE FUNCTION public.limit_break_skill(p_user_id uuid, p_skill_id uuid, p_cash_cost integer, p_book_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_skill_plus INTEGER;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = 'SKILL_LB_BOOK';
    IF v_item_qty IS NULL OR v_item_qty < p_book_cost THEN
        RETURN jsonb_build_object('error', '奥義書が不足しています。');
    END IF;

    SELECT plus_val INTO v_skill_plus FROM public.user_skills WHERE id = p_skill_id AND user_id = p_user_id;
    IF v_skill_plus IS NULL THEN
        RETURN jsonb_build_object('error', 'スキルが存在しません。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    UPDATE public.user_items SET quantity = quantity - p_book_cost WHERE user_id = p_user_id AND item_id = 'SKILL_LB_BOOK';
    UPDATE public.user_skills SET plus_val = plus_val + 1 WHERE id = p_skill_id AND user_id = p_user_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'SKILL_LIMIT_BREAK', 1);
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.limit_break_skill_v2(p_user_id uuid, p_skill_id uuid, p_cash_cost integer, p_use_wildcard boolean, p_dupe_id uuid, p_wildcard_item_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_skill_plus INTEGER;
    v_dupe_exists BOOLEAN;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    IF p_use_wildcard THEN
        SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = p_wildcard_item_id;
        IF v_item_qty IS NULL OR v_item_qty < 1 THEN
            RETURN jsonb_build_object('error', '限界突破の書が不足しています。');
        END IF;
    ELSE
        SELECT EXISTS(SELECT 1 FROM public.user_skills WHERE id = p_dupe_id AND user_id = p_user_id AND equipped_character_id IS NULL) INTO v_dupe_exists;
        IF NOT v_dupe_exists THEN
            RETURN jsonb_build_object('error', '同名の予備スキルカードが見つかりません。');
        END IF;
    END IF;

    SELECT plus_val INTO v_skill_plus FROM public.user_skills WHERE id = p_skill_id AND user_id = p_user_id;
    IF v_skill_plus IS NULL THEN
        RETURN jsonb_build_object('error', '対象スキルが存在しません。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    
    IF p_use_wildcard THEN
        UPDATE public.user_items SET quantity = quantity - 1 WHERE user_id = p_user_id AND item_id = p_wildcard_item_id;
    ELSE
        DELETE FROM public.user_skills WHERE id = p_dupe_id;
    END IF;

    UPDATE public.user_skills SET plus_val = plus_val + 1 WHERE id = p_skill_id AND user_id = p_user_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'SKILL_LIMIT_BREAK', 1);
    RETURN jsonb_build_object('status', 'success', 'next_plus', v_skill_plus + 1);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.mark_chat_channel_read(p_target_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_target_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  IF auth.uid() IS NULL OR p_target_type NOT IN ('GLOBAL', 'GUILD') THEN
    RAISE EXCEPTION 'Invalid chat channel';
  END IF;

  IF p_target_type = 'GUILD' THEN
    SELECT guild_id INTO v_target_id
    FROM public.guild_members
    WHERE user_id = auth.uid();

    IF v_target_id IS NULL THEN
      RAISE EXCEPTION 'Guild membership required';
    END IF;
  END IF;

  INSERT INTO public.chat_read_states (user_id, target_type, target_id, last_read_at)
  VALUES (auth.uid(), p_target_type, v_target_id, clock_timestamp())
  ON CONFLICT (user_id, target_type, target_id)
  DO UPDATE SET last_read_at = EXCLUDED.last_read_at;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.mark_direct_message_read(p_message_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.direct_messages
  SET is_read = true
  WHERE id = p_message_id
    AND recipient_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only the recipient can mark this message as read';
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.mark_mission_event_dialog_viewed(p_event_id text, p_jst_date date)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_today date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_inserted boolean;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_jst_date is distinct from v_today or not exists(
    select 1 from public.mission_events event where event.id=p_event_id and event.is_enabled
      and clock_timestamp()>=event.start_at and clock_timestamp()<event.progress_end_at
  ) then raise exception 'event dialog is not currently presentable' using errcode='23514'; end if;
  insert into public.mission_event_dialog_views(user_id,event_id,jst_date)
  values(v_uid,p_event_id,p_jst_date) on conflict do nothing returning true into v_inserted;
  if coalesce(v_inserted,false) then
    insert into public.mission_event_telemetry(event_id,user_id,event_name,jst_date,source)
    values(p_event_id,v_uid,'dialog_presented',v_today,'login_dialog_queue');
  end if;
  return coalesce(v_inserted,false);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.move_current_user_base(p_base_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_previous_base_id text;
begin
  if v_uid is null then
    raise exception 'Player authentication required' using errcode = '42501';
  end if;
  if p_base_id is null or p_base_id not in (
    'shinjuku', 'shibuya', 'ikebukuro', 'roppongi',
    'akihabara', 'kawasaki', 'yokohama'
  ) then
    raise exception 'Invalid base id' using errcode = '22023';
  end if;

  select current_base_id into v_previous_base_id
  from public.users
  where id = v_uid
  for update;
  if not found then
    raise exception 'Player was not found' using errcode = 'P0002';
  end if;

  update public.users
  set current_base_id = p_base_id
  where id = v_uid;

  return jsonb_build_object(
    'status', 'success',
    'previous_base_id', v_previous_base_id,
    'current_base_id', p_base_id
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.normalize_user_mission_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_target integer;
BEGIN
  SELECT target_value INTO v_target
  FROM public.missions
  WHERE id = NEW.mission_id;

  IF v_target IS NULL THEN
    RAISE EXCEPTION 'Mission master not found';
  END IF;

  NEW.current_progress := LEAST(GREATEST(COALESCE(NEW.current_progress, 0), 0), v_target);
  NEW.progress_val := NEW.current_progress;
  IF NEW.status = 'PROGRESS' AND NEW.current_progress >= v_target THEN
    NEW.status := 'CLEAR';
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_daily_activity_finalized()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_day date:=(new.finalized_at at time zone 'Asia/Tokyo')::date; v_count integer; v_consumed integer; v_key text; v_cash integer; v_ticket integer; v_payload jsonb;
begin
 if old.finalization_status='FINALIZED' or new.finalization_status<>'FINALIZED' then return new; end if;
 if new.battle_mode='PVP' then
  if new.resolution_authority<>'PVP_SERVER' then return new; end if;
  select cash_reward,raid_ticket_reward into strict v_cash,v_ticket
  from public.pvp_match_rewards_master where result=case when new.finalization_result->>'winner'='PLAYER' then 'VICTORY' else 'DEFEAT' end;
  v_key:='PVP_BATTLE:'||new.id::text;
  v_payload:=jsonb_build_array(jsonb_build_object('itemId','CASH','quantity',v_cash,'delivery','INVENTORY'));
  if v_ticket>0 then v_payload:=jsonb_build_array(jsonb_build_object('itemId','RAID_POINT_TICKET','quantity',v_ticket,'delivery','INVENTORY'))||v_payload; end if;
  insert into public.canonical_daily_activity_claims values(v_day,new.requester_user_id,v_key,new.id,v_payload,now()) on conflict do nothing;
  if found then
   perform public.grant_present_payload(new.requester_user_id,'CASH',v_cash);
   if v_ticket>0 then perform public.grant_present_payload(new.requester_user_id,'RAID_POINT_TICKET',v_ticket); end if;
  end if;
 elsif new.battle_mode='RAID' then
  if exists(select 1 from public.raid_rooms where raid_boss_instance_id=new.source_reference_id) then return new; end if;
  v_key:='RAID_BATTLE:'||new.id::text;
  insert into public.canonical_daily_activity_claims values(v_day,new.requester_user_id,v_key,new.id,'[{"itemId":"EQUIP_EXP_S","quantity":1,"delivery":"INVENTORY"}]',now()) on conflict do nothing;
  if found then perform public.grant_present_payload(new.requester_user_id,'EQUIP_EXP_S',1); end if;
  select count(*) into v_count from public.battle_replay_sessions where requester_user_id=new.requester_user_id and battle_mode='RAID' and not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=battle_replay_sessions.source_reference_id) and finalization_status='FINALIZED' and (finalized_at at time zone 'Asia/Tokyo')::date=v_day;
  if v_count>=3 then
   insert into public.canonical_daily_activity_claims values(v_day,new.requester_user_id,'RAID_DAILY_3',new.id,'[{"itemId":"CHAR_EXP_M","quantity":1,"delivery":"INVENTORY"},{"itemId":"CASH","quantity":40,"delivery":"INVENTORY"}]',now()) on conflict do nothing;
   if found then perform public.grant_present_payload(new.requester_user_id,'CHAR_EXP_M',1); perform public.grant_present_payload(new.requester_user_id,'CASH',40); end if;
  end if;
  select coalesce(sum(progress.raid_points_consumed),0) into v_consumed from public.raid_instance_user_progress progress join public.raid_bosses boss on boss.id=progress.raid_boss_instance_id where progress.user_id=new.requester_user_id and boss.raid_day_key=v_day::text and not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=boss.id);
  if v_consumed>=5 then
   insert into public.canonical_daily_activity_claims values(v_day,new.requester_user_id,'RAID_POINTS_5',new.id,'[{"itemId":"EQUIP_LB_PART","quantity":1,"delivery":"INVENTORY"}]',now()) on conflict do nothing;
   if found then perform public.grant_present_payload(new.requester_user_id,'EQUIP_LB_PART',1); end if;
  end if;
 end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_guild_chat_exp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin if new.target_type='GUILD' and not coalesce(new.is_system,false) and new.user_id is not null then
 perform public.grant_canonical_guild_daily_exp(new.user_id,'FIRST_GUILD_CHAT',new.id); end if; return new; end $function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_guild_official_battle_exp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin if new.finalization_status='FINALIZED' and old.finalization_status is distinct from 'FINALIZED' then
 if new.battle_mode='PVP' and new.resolution_authority='PVP_SERVER' then perform public.grant_canonical_guild_daily_exp(new.requester_user_id,'PVP_FINALIZED',new.id);
 elsif new.battle_mode='RAID' and new.resolution_authority='RAID_SERVER' and not exists(select 1 from public.raid_rooms where raid_boss_instance_id=new.source_reference_id) then perform public.grant_canonical_guild_daily_exp(new.requester_user_id,'RAID_FINALIZED',new.id); end if; end if; return new; end $function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_guild_quest_exp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_guild uuid;v_day date:=public.guild_jst_date();v_count integer;
begin
 if new.status not in('COMPLETED','CLAIMABLE','CLAIMED') or old.status in('COMPLETED','CLAIMABLE','CLAIMED') then return new; end if;
 select guild_id into v_guild from public.guild_members where user_id=new.user_id; if v_guild is null then return new; end if;
 insert into public.guild_exp_daily_progress(guild_id,user_id,source,jst_date,event_count) values(v_guild,new.user_id,'QUEST_3_CLEAR',v_day,1)
 on conflict(guild_id,user_id,source,jst_date) do update set event_count=public.guild_exp_daily_progress.event_count+1,updated_at=now() returning event_count into v_count;
 if v_count=3 then perform public.grant_canonical_guild_daily_exp(new.user_id,'QUEST_3_CLEAR',new.id); end if; return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_hard_quest_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_patrol_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_snapshot jsonb;
begin
 v_snapshot:=public.generate_canonical_quest_encounter_snapshot(new.user_id,coalesce(new.course_id,new.quest_id));
 new.encounter_snapshot:=v_snapshot; new.encounter_party_signature:=v_snapshot->>'partySignature'; return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_daily_mission_authority_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_mission public.missions%rowtype;
begin
  -- Rollover resets CLEAR/CLAIMED rows to PROGRESS in one statement. Ignore
  -- those reverse transitions so this row trigger never updates another row
  -- that the same statement is still scheduled to update.
  if old.status is not distinct from new.status
    or new.status not in ('CLEAR', 'CLAIMED') then
    return new;
  end if;
  select * into v_mission from public.missions where id = new.mission_id;
  if not found
    or not v_mission.is_enabled
    or v_mission.category <> 'DAILY'
    or v_mission.trigger_type = 'DAILY_MISSION_COMPLETED_COUNT'
    or new.cycle_date is null then
    return new;
  end if;
  perform public.refresh_daily_mission_completion_aggregates(new.user_id, new.cycle_date);
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_first_official_battle_funnel()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status='RESOLVED' and old.status is distinct from new.status
    and new.resolution_authority in ('PATROL_SERVER','PVP_SERVER','RAID_SERVER','SERVER') then
    perform public.record_funnel_milestone(new.requester_user_id,'first_battle',jsonb_build_object(
      'replayId',new.id,'mode',new.battle_mode,'authority',new.resolution_authority));
  end if;
  return new;
end; $function$
;
CREATE OR REPLACE FUNCTION public.on_funnel_mission_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_trigger text:=public.funnel_mission_trigger_type(new.milestone);
begin
  if v_trigger is null then return new; end if;
  insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status)
  select new.user_id,m.id,m.target_value,m.target_value,'CLEAR'
  from public.missions m
  where m.is_enabled and m.trigger_type=v_trigger
    and (m.prerequisite_mission_id is null or exists(
      select 1 from public.user_missions prerequisite
      where prerequisite.user_id=new.user_id and prerequisite.mission_id=m.prerequisite_mission_id
        and prerequisite.status='CLAIMED'))
  on conflict(user_id,mission_id) do update set
    current_progress=excluded.current_progress,progress_val=excluded.progress_val,
    status=case when public.user_missions.status='CLAIMED' then 'CLAIMED' else 'CLEAR' end,
    updated_at=clock_timestamp();
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_login_bonus_mission_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.evaluate_mission_progress(new.user_id,'LOGIN_DAY_COUNT',1); return new; end $function$
;
CREATE OR REPLACE FUNCTION public.power_projection_owned_row_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.refresh_user_power_projection(coalesce(new.user_id,old.user_id));
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$function$
;
