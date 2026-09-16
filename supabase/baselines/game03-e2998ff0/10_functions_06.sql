SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.save_gvg_defense_deck(p_character_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_guild_id uuid;
  v_requested text[] := coalesce(array_remove(p_character_ids, null), array[]::text[]);
  v_character_ids text[];
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select member.guild_id into v_guild_id from public.guild_members member where member.user_id = v_user_id;
  if v_guild_id is null then raise exception 'guild membership required' using errcode = '42501'; end if;
  if cardinality(v_requested) > 5 then raise exception 'defense supports at most five characters' using errcode = '22023'; end if;

  if cardinality(v_requested) = 0 then
    delete from public.gvg_defense_decks where user_id = v_user_id;
    return jsonb_build_object('status', 'success', 'removed', true);
  end if;

  select coalesce(array_agg(character_row.id::text order by requested.ordinality), array[]::text[])
  into v_character_ids
  from unnest(v_requested) with ordinality as requested(character_id, ordinality)
  join lateral (
    select owned.id
    from public.user_characters owned
    where owned.user_id = v_user_id
      and (owned.id::text = requested.character_id or owned.character_id = requested.character_id)
    order by (owned.id::text = requested.character_id) desc, owned.id
    limit 1
  ) character_row on true;

  if cardinality(v_character_ids) <> cardinality(v_requested) then
    raise exception 'defense contains a character that is not owned' using errcode = '23503';
  end if;
  if cardinality(v_character_ids) <> (select count(distinct character_id) from unnest(v_character_ids) as ids(character_id)) then
    raise exception 'defense contains duplicate characters' using errcode = '23505';
  end if;

  insert into public.gvg_defense_decks (
    user_id, guild_id, character_1_id, character_2_id, character_3_id, character_4_id, character_5_id, updated_at
  ) values (
    v_user_id, v_guild_id,
    v_character_ids[1], v_character_ids[2], v_character_ids[3], v_character_ids[4], v_character_ids[5], now()
  )
  on conflict (user_id) do update set
    guild_id = excluded.guild_id,
    character_1_id = excluded.character_1_id,
    character_2_id = excluded.character_2_id,
    character_3_id = excluded.character_3_id,
    character_4_id = excluded.character_4_id,
    character_5_id = excluded.character_5_id,
    updated_at = excluded.updated_at;

  return jsonb_build_object('status', 'success', 'removed', false, 'character_ids', to_jsonb(v_character_ids));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.save_main_formation(p_character_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_requested text[] := coalesce(array_remove(p_character_ids,null),array[]::text[]);
  v_owned_ids uuid[];
  v_master_ids text[];
  v_power bigint;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  if cardinality(v_requested) > 5 then raise exception 'main formation supports at most five characters' using errcode='22023'; end if;
  if cardinality(v_requested) <> (select count(distinct value) from unnest(v_requested) value) then
    raise exception 'main formation contains duplicate characters' using errcode='23505';
  end if;

  select coalesce(array_agg(resolved.id order by requested.ordinality),array[]::uuid[]),
         coalesce(array_agg(resolved.character_id order by requested.ordinality),array[]::text[])
  into v_owned_ids,v_master_ids
  from unnest(v_requested) with ordinality requested(character_ref,ordinality)
  join lateral (
    select owned.id,owned.character_id
    from public.user_characters owned
    where owned.user_id=v_user_id
      and (owned.id::text=requested.character_ref or owned.character_id=requested.character_ref)
    order by (owned.id::text=requested.character_ref) desc
    limit 1
  ) resolved on true;
  if cardinality(v_owned_ids) <> cardinality(v_requested) then
    raise exception 'main formation contains a character that is not owned' using errcode='42501';
  end if;
  if cardinality(v_owned_ids) <> (select count(distinct value) from unnest(v_owned_ids) value) then
    raise exception 'main formation resolves to duplicate characters' using errcode='23505';
  end if;

  delete from public.user_main_formations where user_id=v_user_id;
  insert into public.user_main_formations(user_id,slot,user_character_id)
  select v_user_id,ordinality::smallint,value from unnest(v_owned_ids) with ordinality picked(value,ordinality);
  v_power := public.refresh_user_power_projection(v_user_id);
  return jsonb_build_object('status','success','character_ids',to_jsonb(v_master_ids),'total_power',v_power);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.save_pvp_defense_deck(p_character_ids text[], p_tactic text DEFAULT 'ATTACK_PRIORITY'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_requested text[] := coalesce(array_remove(p_character_ids, null), array[]::text[]);
  v_character_ids text[];
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if cardinality(v_requested) > 5 then raise exception 'party supports at most five characters' using errcode = '22023'; end if;
  if p_tactic not in ('ATTACK_PRIORITY', 'HEAL_PRIORITY', 'SKILL_PRIORITY', 'BALANCED', 'WEAKNESS_FOCUS') then
    raise exception 'invalid tactic' using errcode = '22023';
  end if;

  select coalesce(array_agg(character_row.id::text order by requested.ordinality), array[]::text[])
  into v_character_ids
  from unnest(v_requested) with ordinality as requested(character_id, ordinality)
  join lateral (
    select owned.id
    from public.user_characters owned
    where owned.user_id = v_user_id
      and (owned.id::text = requested.character_id or owned.character_id = requested.character_id)
    order by (owned.id::text = requested.character_id) desc, owned.id
    limit 1
  ) character_row on true;

  if cardinality(v_character_ids) <> cardinality(v_requested) then
    raise exception 'party contains a character that is not owned' using errcode = '23503';
  end if;
  if cardinality(v_character_ids) <> (select count(distinct character_id) from unnest(v_character_ids) as ids(character_id)) then
    raise exception 'party contains duplicate characters' using errcode = '23505';
  end if;

  insert into public.pvp_defense_decks (
    user_id, character_1_id, character_2_id, character_3_id, character_4_id, character_5_id, tactic, updated_at
  ) values (
    v_user_id,
    v_character_ids[1], v_character_ids[2], v_character_ids[3], v_character_ids[4], v_character_ids[5],
    p_tactic, now()
  )
  on conflict (user_id) do update set
    character_1_id = excluded.character_1_id,
    character_2_id = excluded.character_2_id,
    character_3_id = excluded.character_3_id,
    character_4_id = excluded.character_4_id,
    character_5_id = excluded.character_5_id,
    tactic = excluded.tactic,
    updated_at = excluded.updated_at;

  return jsonb_build_object('status', 'success', 'character_ids', to_jsonb(v_character_ids), 'tactic', p_tactic);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.save_recommended_main_formation()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_party text[];
  v_saved jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select coalesce(array_agg(ranked.character_id order by ranked.power desc, ranked.character_id, ranked.id), '{}'::text[])
  into v_party
  from (
    select owned.id, owned.character_id, public.calculate_user_character_power(v_user_id, owned.id) power
    from public.user_characters owned
    where owned.user_id = v_user_id
    order by power desc, owned.character_id, owned.id
    limit 5
  ) ranked;
  if cardinality(v_party) = 0 then raise exception 'owned character required' using errcode = 'P0002'; end if;
  v_saved := public.save_main_formation(v_party);
  return v_saved || jsonb_build_object('character_ids', to_jsonb(v_party));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.search_guilds(p_query text DEFAULT ''::text)
 RETURNS TABLE(id uuid, name text, level integer, description text, approval_required boolean, member_count bigint, member_limit integer, recruitment_mode text, active_members_7d bigint, main_alignment text, sub_alignment text, emblem_url text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if char_length(coalesce(p_query,'')) > 30 then raise exception 'Guild search query is too long'; end if;
  return query
  select g.id, g.name, g.level, g.description, g.approval_required,
    count(m.id), public.canonical_guild_member_cap(g.id), g.recruitment_mode,
    count(m.id) filter(where u.last_active_at >= now() - interval '7 days'),
    g.main_alignment, g.sub_alignment, g.logo_icon
  from public.guilds g
  left join public.guild_members m on m.guild_id = g.id
  left join public.users u on u.id = m.user_id
  where not g.is_disbanded
    and (trim(coalesce(p_query,'')) = '' or g.name ilike '%' || trim(p_query) || '%')
  group by g.id
  order by g.level desc, g.name asc
  limit 50;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.search_user_by_name(p_username text)
 RETURNS TABLE(id uuid, username text, avatar_url text, level integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin
 perform public.assert_feature_mutation_allowed('FRIEND');
 return query select * from public.search_user_by_name_core_20260823(p_username);
end $function$
;
CREATE OR REPLACE FUNCTION public.search_user_by_name_core_20260823(p_username text)
 RETURNS TABLE(id uuid, username text, avatar_url text, level integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select u.id,u.username,u.avatar_url,u.level from public.users u
 where auth.uid() is not null and lower(btrim(u.username))=lower(btrim(p_username))
   and u.id<>auth.uid() limit 10
$function$
;
CREATE OR REPLACE FUNCTION public.sell_gear_bulk(p_user_id uuid, p_gear_ids jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_equipped_count INTEGER;
    v_total_cash BIGINT := 0;
BEGIN
    -- 装備中アセットが含まれているか検証 (KI Rule B-7)
    SELECT count(*) INTO v_equipped_count 
    FROM public.user_equipments 
    WHERE user_id = p_user_id 
      AND id::text IN (SELECT jsonb_array_elements_text(p_gear_ids))
      AND equipped_character_id IS NOT NULL;

    IF v_equipped_count > 0 THEN
        RAISE EXCEPTION 'Cannot sell equipped items';
    END IF;

    -- 売却計算 & 削除
    v_total_cash := jsonb_array_length(p_gear_ids) * 500;
    
    DELETE FROM public.user_equipments 
    WHERE user_id = p_user_id 
      AND id::text IN (SELECT jsonb_array_elements_text(p_gear_ids));

    UPDATE public.users SET cash = cash + v_total_cash WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'earned_cash', v_total_cash);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.sell_owned_equipment(p_equipment_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_requested integer;
  v_sellable integer;
  v_sold integer;
  v_earned_cash bigint;
  v_cash bigint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING errcode = '42501';
  END IF;
  v_requested := coalesce(cardinality(p_equipment_ids), 0);
  IF v_requested < 1 OR v_requested > 100 THEN
    RAISE EXCEPTION 'invalid equipment count' USING errcode = '22023';
  END IF;
  IF (SELECT count(DISTINCT equipment_id) FROM unnest(p_equipment_ids) equipment_id) <> v_requested THEN
    RAISE EXCEPTION 'duplicate equipment id' USING errcode = '22023';
  END IF;

  SELECT count(*) INTO v_sellable
  FROM public.user_equipments
  WHERE user_id = v_user_id
    AND id = ANY(p_equipment_ids)
    AND equipped_character_id IS NULL;
  IF v_sellable <> v_requested THEN
    RAISE EXCEPTION 'equipment is not owned or is currently equipped' USING errcode = '42501';
  END IF;

  DELETE FROM public.user_equipments
  WHERE user_id = v_user_id
    AND id = ANY(p_equipment_ids)
    AND equipped_character_id IS NULL;
  GET DIAGNOSTICS v_sold = ROW_COUNT;

  v_earned_cash := v_sold * 500;
  UPDATE public.users
  SET cash = cash + v_earned_cash
  WHERE id = v_user_id
  RETURNING cash INTO v_cash;

  RETURN jsonb_build_object(
    'status', 'success',
    'sold_count', v_sold,
    'earned_cash', v_earned_cash,
    'cash', v_cash
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.send_chat_message(p_target_type text, p_content text)
 RETURNS board_posts
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select public.send_chat_message(p_target_type,p_content,null::uuid) $function$
;
CREATE OR REPLACE FUNCTION public.send_chat_message(p_target_type text, p_content text, p_reply_to_message_id uuid)
 RETURNS board_posts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user uuid:=auth.uid(); v_guild uuid; v_name text; v_avatar text; v_reply public.board_posts; v_message public.board_posts;
  v_cooldown interval; v_last timestamptz;
begin
  if v_user is null or p_target_type not in('GLOBAL','GUILD') or char_length(trim(coalesce(p_content,''))) not between 1 and 140 then
    raise exception 'invalid chat message';
  end if;
  if p_target_type='GUILD' then
    select guild_id into v_guild from public.guild_members where user_id=v_user;
    if v_guild is null then raise exception 'guild membership required'; end if;
    v_cooldown:=interval '3 seconds';
  else v_cooldown:=interval '10 seconds'; end if;
  if p_reply_to_message_id is not null then
    select * into v_reply from public.board_posts where id=p_reply_to_message_id;
    if not found or v_reply.target_type<>p_target_type or v_reply.target_id is distinct from v_guild then
      raise exception 'reply target is unavailable';
    end if;
  end if;
  perform pg_advisory_xact_lock(hashtext(v_user::text));
  select max(created_at) into v_last from public.board_posts where coalesce(user_id,author_id)=v_user and target_type=p_target_type and (p_target_type='GLOBAL' or target_id=v_guild);
  if v_last is not null and clock_timestamp()<v_last+v_cooldown then raise exception 'chat cooldown is active'; end if;
  select username,avatar_url into v_name,v_avatar from public.users where id=v_user;
  insert into public.board_posts(title,content,author_id,user_id,author_name,author_avatar_url,target_type,target_id,is_system,reply_to_message_id)
  values('',trim(p_content),v_user,v_user,v_name,v_avatar,p_target_type,v_guild,false,p_reply_to_message_id) returning * into v_message;
  return v_message;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.send_direct_message(p_recipient_id uuid, p_message text)
 RETURNS direct_messages
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_message public.direct_messages;
BEGIN
  IF auth.uid() IS NULL
    OR p_recipient_id IS NULL
    OR p_recipient_id = auth.uid()
    OR p_message IS NULL
    OR char_length(trim(p_message)) NOT BETWEEN 1 AND 140 THEN
    RAISE EXCEPTION 'Invalid direct message';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Player profile required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_recipient_id) THEN
    RAISE EXCEPTION 'The direct-message recipient does not exist';
  END IF;

  INSERT INTO public.direct_messages (sender_id, recipient_id, message)
  VALUES (auth.uid(), p_recipient_id, trim(p_message))
  RETURNING * INTO v_message;
  RETURN v_message;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.send_friend_request(p_receiver_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('FRIEND'); return public.send_friend_request_core_20260823(p_receiver_id); end $function$
;
CREATE OR REPLACE FUNCTION public.send_friend_request(p_user_id uuid, p_friend_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF p_user_id = p_friend_id THEN
        RAISE EXCEPTION '自分自身には申請できません。';
    END IF;

    -- 自分から相手
    INSERT INTO public.user_friends (user_id, friend_id, status)
    VALUES (p_user_id, p_friend_id, 'PENDING')
    ON CONFLICT (user_id, friend_id) DO NOTHING;

    -- 相手から自分（双方向で保持する設計）
    INSERT INTO public.user_friends (user_id, friend_id, status)
    VALUES (p_friend_id, p_user_id, 'RECEIVED')
    ON CONFLICT (user_id, friend_id) DO NOTHING;

    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.send_friend_request_core_20260823(p_receiver_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_sender uuid:=auth.uid(); v_request uuid;
begin
 if v_sender is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_receiver_id is null or p_receiver_id=v_sender then raise exception 'invalid friend target' using errcode='22023'; end if;
 if not exists(select 1 from public.users where id=p_receiver_id) then raise exception 'player not found' using errcode='P0002'; end if;
 if exists(select 1 from public.user_friends where user_id=v_sender and friend_id=p_receiver_id and status='ACCEPTED') then
  raise exception 'already friends' using errcode='23505';
 end if;
 if (select count(*) from public.user_friends where user_id=v_sender and status='ACCEPTED')>=30
    or (select count(*) from public.user_friends where user_id=p_receiver_id and status='ACCEPTED')>=30 then
  raise exception 'friend limit reached' using errcode='23514';
 end if;
 insert into public.friend_requests(sender_id,receiver_id) values(v_sender,p_receiver_id)
 returning id into v_request;
 return jsonb_build_object('request_id',v_request,'status','PENDING');
exception when unique_violation then raise exception 'friend request already pending' using errcode='23505';
end $function$
;
CREATE OR REPLACE FUNCTION public.set_character_equipment(p_character_id uuid, p_equipment_id uuid, p_slot_index integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_character_master_id text;
  v_equipment_master public.canonical_equipment_master%rowtype;
  v_expected_slot_type text;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select character_id into v_character_master_id
  from public.user_characters
  where id = p_character_id and user_id = v_user_id
  for update;
  if not found then
    raise exception 'owned character not found' using errcode = 'P0002';
  end if;

  v_expected_slot_type := case p_slot_index
    when 0 then 'WEAPON' when 1 then 'WEAPON'
    when 2 then 'HEAD' when 3 then 'BODY' when 4 then 'LEGS'
    when 5 then 'ACCESSORY' when 6 then 'ACCESSORY'
    else null
  end;
  if v_expected_slot_type is null then
    raise exception 'invalid equipment slot' using errcode = '22023';
  end if;

  select master.* into v_equipment_master
  from public.user_equipments owned
  join public.canonical_equipment_master master
    on master.version = '2026-08-21' and master.equipment_id = coalesce(nullif(owned.equipment_id, ''), owned.equipment_master_id)
  where owned.id = p_equipment_id and owned.user_id = v_user_id
  for update of owned;
  if not found then
    raise exception 'owned equipment not found' using errcode = 'P0002';
  end if;
  if v_equipment_master.category <> v_expected_slot_type then
    raise exception 'equipment type does not match slot' using errcode = '23514';
  end if;
  if v_equipment_master.exclusive_character_id is not null
     and v_equipment_master.exclusive_character_id is distinct from v_character_master_id then
    raise exception 'exclusive equipment cannot be equipped by this character' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.user_equipments
    where id = p_equipment_id and equipped_character_id is not null
      and equipped_character_id <> p_character_id::text
  ) then
    raise exception 'equipment is already equipped by another character' using errcode = '23505';
  end if;

  update public.user_equipments
  set equipped_character_id = null, slot_index = null
  where user_id = v_user_id
    and equipped_character_id = p_character_id::text
    and slot_index = p_slot_index
    and id <> p_equipment_id;

  update public.user_equipments
  set equipped_character_id = p_character_id::text, slot_index = p_slot_index
  where id = p_equipment_id and user_id = v_user_id;

  return jsonb_build_object('status', 'success', 'equipment_id', p_equipment_id, 'slot_index', p_slot_index);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_character_equipment_bulk(p_character_id uuid, p_equipment_ids uuid[], p_slot_indexes integer[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_character_master_id text;
  v_requested_count integer := coalesce(array_length(p_equipment_ids, 1), 0);
  v_index integer;
  v_equipment_id uuid;
  v_slot_index integer;
  v_expected_slot_type text;
  v_equipment_master public.canonical_equipment_master%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if v_requested_count <> coalesce(array_length(p_slot_indexes, 1), 0) or v_requested_count > 7 then
    raise exception 'equipment and slot arrays must have the same length up to 7' using errcode = '22023';
  end if;
  if v_requested_count <> (select count(distinct value) from unnest(coalesce(p_equipment_ids, '{}'::uuid[])) value)
     or v_requested_count <> (select count(distinct value) from unnest(coalesce(p_slot_indexes, '{}'::integer[])) value) then
    raise exception 'duplicate equipment or slot' using errcode = '23505';
  end if;

  select character_id into v_character_master_id
  from public.user_characters
  where id = p_character_id and user_id = v_user_id
  for update;
  if not found then
    raise exception 'owned character not found' using errcode = 'P0002';
  end if;

  for v_index in 1..v_requested_count loop
    v_equipment_id := p_equipment_ids[v_index];
    v_slot_index := p_slot_indexes[v_index];
    v_expected_slot_type := case v_slot_index
      when 0 then 'WEAPON' when 1 then 'WEAPON'
      when 2 then 'HEAD' when 3 then 'BODY' when 4 then 'LEGS'
      when 5 then 'ACCESSORY' when 6 then 'ACCESSORY'
      else null
    end;
    if v_expected_slot_type is null then
      raise exception 'invalid equipment slot' using errcode = '22023';
    end if;
    select master.* into v_equipment_master
    from public.user_equipments owned
    join public.canonical_equipment_master master
      on master.version = '2026-08-21' and master.equipment_id = coalesce(nullif(owned.equipment_id, ''), owned.equipment_master_id)
    where owned.id = v_equipment_id and owned.user_id = v_user_id
    for update of owned;
    if not found then
      raise exception 'owned equipment not found' using errcode = 'P0002';
    end if;
    if v_equipment_master.category <> v_expected_slot_type then
      raise exception 'equipment type does not match slot' using errcode = '23514';
    end if;
    if v_equipment_master.exclusive_character_id is not null
       and v_equipment_master.exclusive_character_id is distinct from v_character_master_id then
      raise exception 'exclusive equipment cannot be equipped by this character' using errcode = '42501';
    end if;
    if exists (
      select 1 from public.user_equipments
      where id = v_equipment_id and equipped_character_id is not null
        and equipped_character_id <> p_character_id::text
    ) then
      raise exception 'equipment is already equipped by another character' using errcode = '23505';
    end if;
  end loop;

  update public.user_equipments
  set equipped_character_id = null, slot_index = null
  where user_id = v_user_id and equipped_character_id = p_character_id::text;

  for v_index in 1..v_requested_count loop
    update public.user_equipments
    set equipped_character_id = p_character_id::text, slot_index = p_slot_indexes[v_index]
    where id = p_equipment_ids[v_index] and user_id = v_user_id;
  end loop;

  return jsonb_build_object('status', 'success', 'equipped_count', v_requested_count);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_current_guild_welcome_message(p_message text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_guild uuid;v_clean text:=trim(coalesce(p_message,''));
begin select guild_id into v_guild from public.guild_members where user_id=auth.uid() and role in('MASTER','SUB_MASTER');
 if v_guild is null then raise exception 'Guild setting permission required'; end if; if char_length(v_clean)>120 then raise exception 'welcome message is too long'; end if;
 update public.guilds set welcome_message=nullif(v_clean,'') where id=v_guild and not is_disbanded; return jsonb_build_object('status','success','welcome_message',v_clean); end $function$
;
CREATE OR REPLACE FUNCTION public.set_guild_member_role(p_guild_id uuid, p_target_user_id uuid, p_new_role text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_current_guild_master(p_guild_id) THEN RAISE EXCEPTION 'Only the guild master can change member roles'; END IF;
  IF p_target_user_id = auth.uid() OR p_new_role NOT IN ('MEMBER', 'SUB_MASTER') OR NOT EXISTS (
    SELECT 1 FROM public.guild_members WHERE guild_id = p_guild_id AND user_id = p_target_user_id AND role <> 'MASTER'
  ) THEN RAISE EXCEPTION 'Invalid guild role change'; END IF;
  UPDATE public.guild_members SET role = p_new_role WHERE guild_id = p_guild_id AND user_id = p_target_user_id;
  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.start_raid_battle(p_instance_id uuid, p_character_ids text[], p_tactic text DEFAULT 'ATTACK_PRIORITY'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_legacy_enabled boolean; v_uid uuid:=auth.uid(); v_user public.users%rowtype; v_instance record; v_cost integer; v_cost_type text; v_guild uuid; v_players jsonb; v_enemy jsonb:='[]'; v_member text; v_entry record; v_skill_refs jsonb; v_skills jsonb; v_replay uuid; v_seed bigint; v_slot integer:=0;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 -- 設定行を先に共有lockし、管理者の停止UPDATEと開始/生成を直列化する。
 select enabled into v_legacy_enabled from public.raid_legacy_settings where singleton for share;
 if v_legacy_enabled is distinct from true then raise exception 'legacy Raid entry disabled' using errcode='55000'; end if;

 if p_tactic not in('ATTACK_PRIORITY','HEAL_PRIORITY','SKILL_PRIORITY','BALANCED','WEAKNESS_FOCUS') then raise exception 'invalid tactic' using errcode='22023'; end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_uid); select * into v_user from public.users where id=v_uid for update;
 if v_user.level<5 then raise exception 'player level 5 is required' using errcode='23514'; end if;
 select boss.*,variant.raid_name,variant.atk,variant.def,variant.spd,variant.member_character_ids into v_instance from public.raid_bosses boss join public.canonical_raid_variants variant on variant.raid_variant_id=boss.raid_variant_id where boss.id=p_instance_id and boss.status='ACTIVE' and boss.expires_at>now() for update of boss;
 if not found then raise exception 'Raid instance is not active' using errcode='P0002'; end if;

 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_instance_id) then raise exception 'Room battles require the Room entry point' using errcode='55000'; end if;
 if not v_user.raid_free_entry_consumed then v_cost:=0;v_cost_type:='FREE_FIRST';update public.users set raid_free_entry_consumed=true where id=v_uid;
 elsif v_user.raid_points>=1 then v_cost:=1;v_cost_type:='RAID_POINT';update public.users set raid_points=raid_points-1,raid_points_last_recovered_at=case when raid_points=5 then now() else raid_points_last_recovered_at end where id=v_uid;v_user.raid_points:=v_user.raid_points-1;
 else raise exception 'insufficient Raid points' using errcode='23514'; end if;
 select guild_id into v_guild from public.guild_members where user_id=v_uid; v_players:=public.build_server_battle_snapshot(v_uid,p_character_ids,'PLAYER');
 for v_member in select value from jsonb_array_elements_text(v_instance.member_character_ids) loop
  v_slot:=v_slot+1; select * into v_entry from public.canonical_quest_enemy_pool_entries where version='2026-08-30' and character_id=v_member and difficulty='HARD' order by(local_affinity)desc,weight desc limit 1;
  v_skill_refs:=coalesce(v_entry.skill_loadout,(select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id=v_member order by skill_id limit 2)s),(select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id is null order by skill_id limit 2)s),'[]'::jsonb);
  select coalesce(jsonb_agg(jsonb_build_object('id',s.skill_id,'name',s.display_name,'activationType',s.activation_type,'cooldown',s.cooldown,'availableFromRound',s.available_from_round,'target',s.target,'effects',s.effects,'exclusiveCharacterId',s.exclusive_character_id) order by x.ordinality),'[]') into v_skills from jsonb_array_elements_text(v_skill_refs) with ordinality x(skill_id,ordinality) join public.canonical_skill_master s on s.version='2026-08-21' and s.skill_id=x.skill_id;
  v_enemy:=v_enemy||jsonb_build_array(jsonb_build_object('id','raid_'||v_instance.id||'_'||v_slot,'characterId',v_member,'name',coalesce((select display_name from public.canonical_character_master where version='2026-08-21' and character_id=v_member),v_member),'team','ENEMY','alignment',coalesce((select attribute from public.canonical_character_master where version='2026-08-21' and character_id=v_member),'NEUTRAL'),'level',30,'stats',jsonb_build_object('hp',ceil(v_instance.max_hp::numeric/5),'atk',v_instance.atk,'def',v_instance.def,'spd',v_instance.spd,'luk',0),'equippedSkillRefs',v_skill_refs,'skills',v_skills,'equipment','[]'::jsonb));
 end loop;
 v_seed:=floor(random()*2147483646)::bigint+1;
 insert into public.battle_replay_sessions(requester_user_id,battle_mode,source_reference_id,tactic_id,random_seed,player_snapshot,enemy_snapshot,resolution_authority,finalization_status,official_context) values(v_uid,'RAID',p_instance_id,p_tactic,v_seed,v_players,v_enemy,'RAID_SERVER','PENDING',jsonb_build_object('guildIdSnapshot',v_guild,'costType',v_cost_type,'cost',v_cost,'remainingRaidPoints',v_user.raid_points,'bossHpAtStart',v_instance.current_hp,'bossMaxHp',v_instance.max_hp,'baseId',v_instance.base_id,'raidDayKey',v_instance.raid_day_key,'raidVariantId',v_instance.raid_variant_id)) returning id into v_replay;
 return jsonb_build_object('replay_session_id',v_replay,'player_snapshot',v_players,'enemy_snapshot',v_enemy,'cost_type',v_cost_type,'cost',v_cost,'remaining_raid_points',v_user.raid_points,'guild_id_snapshot',v_guild);
end $function$
;
CREATE OR REPLACE FUNCTION public.snapshot_gvg_match_members(p_match_session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_match public.gvg_match_sessions%ROWTYPE;
  v_member RECORD;
  v_side TEXT;
  v_character_ids JSONB;
  v_defense JSONB;
  v_power BIGINT;
BEGIN
  SELECT * INTO v_match FROM public.gvg_match_sessions WHERE id = p_match_session_id FOR UPDATE;
  IF NOT FOUND OR v_match.status NOT IN ('MATCHING', 'CONFIRMED') THEN RAISE EXCEPTION 'GvG match cannot be snapshotted'; END IF;
  DELETE FROM public.gvg_match_member_snapshots WHERE match_session_id = p_match_session_id;
  FOR v_member IN SELECT member.guild_id, member.user_id FROM public.guild_members member WHERE member.guild_id IN (v_match.guild_a_id, v_match.guild_b_id) LOOP
    v_side := CASE WHEN v_member.guild_id = v_match.guild_a_id THEN 'A' ELSE 'B' END;
    SELECT to_jsonb(array_remove(ARRAY[deck.character_1_id, deck.character_2_id, deck.character_3_id, deck.character_4_id, deck.character_5_id], NULL))
      INTO v_character_ids FROM public.gvg_defense_decks deck WHERE deck.user_id = v_member.user_id AND deck.guild_id = v_member.guild_id;
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', character.id, 'character_id', character.character_id, 'level', character.level, 'awakening_level', character.awakening_level,
      'equipments', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', equipment.id, 'equipment_id', equipment.equipment_id, 'level', equipment.level, 'plus_val', equipment.plus_val, 'slot_index', equipment.slot_index) ORDER BY equipment.slot_index)
        FROM public.user_equipments equipment WHERE equipment.user_id = v_member.user_id AND equipment.equipped_character_id = character.id::TEXT), '[]'::jsonb),
      'skills', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', skill.id, 'skill_card_id', skill.skill_card_id, 'plus_val', skill.plus_val, 'slot_index', skill.slot_index) ORDER BY skill.slot_index)
        FROM public.user_skills skill WHERE skill.user_id = v_member.user_id AND skill.equipped_character_id = character.id::TEXT), '[]'::jsonb)
    )), '[]'::jsonb) INTO v_defense
    FROM public.user_characters character
    WHERE character.user_id = v_member.user_id AND character.id::TEXT IN (SELECT jsonb_array_elements_text(COALESCE(v_character_ids, '[]'::jsonb)));
    SELECT COALESCE(ranking.total_power, 0) INTO v_power FROM public.user_power_rankings ranking WHERE ranking.user_id = v_member.user_id;
    INSERT INTO public.gvg_match_member_snapshots (match_session_id, side, guild_id, user_id, defense_deck, defense_is_npc, npc_power)
    VALUES (p_match_session_id, v_side, v_member.guild_id, v_member.user_id, v_defense, jsonb_array_length(v_defense) = 0, CASE WHEN jsonb_array_length(v_defense) = 0 THEN GREATEST(1, COALESCE(v_power, 0)) ELSE NULL END);
  END LOOP;
  IF v_match.is_npc_match THEN INSERT INTO public.gvg_match_member_snapshots (match_session_id, side, defense_deck, defense_is_npc, npc_power) VALUES (p_match_session_id, 'B', '[]'::jsonb, true, 1); END IF;
  UPDATE public.gvg_match_sessions SET status = 'CONFIRMED', matched_at = now() WHERE id = p_match_session_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.soft_reset_pvp_ratings()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare affected integer; begin update public.pvp_ranks set rank_points=public.canonical_pvp_soft_reset(rank_points),daily_wins=0,season_wins=0,updated_at=now();get diagnostics affected=row_count;return affected;end $function$
;
CREATE OR REPLACE FUNCTION public.start_patrol(p_course_id text, p_character_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_character text; v_q record; v_id uuid; v_active integer; v_vitality integer;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 select * into v_q from public.canonical_quest_master where version='2026-08-30' and quest_id=p_course_id and is_production_enabled;
 if not found then raise exception 'quest not found' using errcode='23503'; end if;
 if not public.canonical_quest_is_unlocked(v_uid,p_course_id) then raise exception 'quest is locked' using errcode='23514'; end if;
 select owned.character_id into v_character from public.user_characters owned where owned.user_id=v_uid and(owned.id::text=p_character_id or owned.character_id=p_character_id) order by(owned.id::text=p_character_id)desc limit 1;
 if v_character is null then raise exception 'character is not owned' using errcode='23503'; end if;
 perform 1 from public.users where id=v_uid for update;
 select count(*) into v_active from public.user_patrols where user_id=v_uid and status<>'COMPLETED'; if v_active>=5 then raise exception 'all dispatch slots are occupied' using errcode='23514'; end if;
 if exists(select 1 from public.user_patrols where user_id=v_uid and character_id=v_character and status<>'COMPLETED') then raise exception 'character is already dispatched' using errcode='23505'; end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_uid); select vitality into v_vitality from public.users where id=v_uid for update;
 if coalesce(v_vitality,0)<v_q.vitality_cost then raise exception 'insufficient vitality' using errcode='23514'; end if;
 insert into public.user_patrols(user_id,course_id,character_id,started_at,expires_at,status,has_battle_event,battle_resolved) values(v_uid,p_course_id,v_character,now(),now()+v_q.duration_sec*interval '1 second','ONGOING',true,false) returning id into v_id;
 update public.users set vitality=vitality-v_q.vitality_cost,vitality_last_recovered_at=case when vitality>=50 then now() else vitality_last_recovered_at end where id=v_uid;
 return jsonb_build_object('status','success','base_cash_snapshot',(select base_cash_snapshot from public.user_patrols where id=v_id),'hometown_bonus_snapshot',(select hometown_bonus_snapshot from public.user_patrols where id=v_id),'patrol_id',v_id,'has_battle',true,'duration_seconds',v_q.duration_sec,'cost_vitality',v_q.vitality_cost,'remaining_vitality',v_vitality-v_q.vitality_cost);
end $function$
;
CREATE OR REPLACE FUNCTION public.start_patrol_v2(p_user_id uuid, p_course_id text, p_character_id text, p_duration_seconds integer, p_cost_vitality integer, p_battle_chance numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_vitality INTEGER;
  v_new_id UUID;
  v_has_battle BOOLEAN;
  v_is_tutorial_dispatch BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT vitality INTO v_vitality FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_vitality < p_cost_vitality THEN
    RETURN jsonb_build_object('error', 'Insufficient vitality');
  END IF;
  SELECT step_id = 'DISPATCH' INTO v_is_tutorial_dispatch
  FROM public.tutorial_progress WHERE user_id = p_user_id;
  v_has_battle := CASE WHEN COALESCE(v_is_tutorial_dispatch, false) THEN true
    ELSE random() <= COALESCE(p_battle_chance, 0.2) END;
  INSERT INTO public.user_patrols (
    user_id, course_id, character_id, started_at, expires_at,
    status, has_battle_event, battle_resolved
  ) VALUES (
    p_user_id, p_course_id, p_character_id, now(),
    now() + (p_duration_seconds * interval '1 second'),
    'ONGOING', v_has_battle, false
  ) RETURNING id INTO v_new_id;
  UPDATE public.users SET vitality = vitality - p_cost_vitality WHERE id = p_user_id;
  RETURN jsonb_build_object('status', 'success', 'patrol_id', v_new_id, 'has_battle', v_has_battle);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.start_pvp_battle(p_opponent_user_id uuid, p_character_ids text[], p_tactic text DEFAULT 'ATTACK_PRIORITY'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_user public.users%rowtype;
  v_now timestamptz := now();
  v_recovered integer;
  v_remaining integer;
  v_my_rank integer;
  v_opponent_rank integer;
  v_opponent_name text;
  v_opponent_guild_id uuid;
  v_opponent_guild_name text;
  v_opponent_character_ids text[];
  v_player_snapshot jsonb;
  v_enemy_snapshot jsonb;
  v_replay_id uuid;
  v_seed bigint;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_opponent_user_id is null or p_opponent_user_id = v_user_id then
    raise exception 'invalid PvP opponent' using errcode = '22023';
  end if;
  if p_tactic not in ('ATTACK_PRIORITY', 'HEAL_PRIORITY', 'SKILL_PRIORITY', 'BALANCED', 'WEAKNESS_FOCUS') then
    raise exception 'invalid tactic' using errcode = '22023';
  end if;

  perform public.advance_ranking_season('PVP',clock_timestamp());
  select * into v_user from public.users where id = v_user_id for update;
  if not found then raise exception 'player not found' using errcode = 'P0002'; end if;
  v_recovered := floor(extract(epoch from (v_now - coalesce(v_user.pvp_points_last_recovered_at, v_now))) / 7200);
  v_remaining := least(5, coalesce(v_user.pvp_points, 0) + greatest(v_recovered, 0));
  if v_remaining < 1 then raise exception 'insufficient PvP points' using errcode = '23514'; end if;
  v_remaining := v_remaining - 1;
  update public.users
  set pvp_points = v_remaining,
      pvp_points_last_recovered_at = case
        when v_recovered > 0 or coalesce(v_user.pvp_points, 0) = 5 then v_now
        else v_user.pvp_points_last_recovered_at
      end
  where id = v_user_id;

  -- Match get_pvp_opponents_page: the saved Main Formation is the opponent authority.
  select array_agg(formation.user_character_id::text order by formation.slot)
  into v_opponent_character_ids
  from public.user_main_formations formation
  where formation.user_id = p_opponent_user_id;
  if coalesce(cardinality(v_opponent_character_ids), 0) = 0 then
    raise exception 'opponent main formation not found' using errcode = 'P0002';
  end if;

  select player.username, coalesce(rank.rank_points, 1000), member.guild_id, guild.name
  into v_opponent_name, v_opponent_rank, v_opponent_guild_id, v_opponent_guild_name
  from public.users player
  left join public.pvp_ranks rank on rank.user_id = player.id
  left join public.guild_members member on member.user_id = player.id
  left join public.guilds guild on guild.id = member.guild_id
  where player.id = p_opponent_user_id;
  if not found then raise exception 'opponent not found' using errcode = 'P0002'; end if;

  select coalesce(rank.rank_points, 1000) into v_my_rank
  from public.users player left join public.pvp_ranks rank on rank.user_id = player.id
  where player.id = v_user_id;

  v_player_snapshot := public.build_server_battle_snapshot(v_user_id, p_character_ids, 'PLAYER');
  v_enemy_snapshot := public.build_server_battle_snapshot(p_opponent_user_id, v_opponent_character_ids, 'ENEMY');
  v_seed := floor(random() * 2147483646)::bigint + 1;

  insert into public.battle_replay_sessions(
    requester_user_id, battle_mode, source_reference_id, tactic_id,
    random_seed, player_snapshot, enemy_snapshot, resolution_authority,
    finalization_status, official_context
  ) values (
    v_user_id, 'PVP', p_opponent_user_id, p_tactic,
    v_seed, v_player_snapshot, v_enemy_snapshot, 'PVP_SERVER',
    'PENDING', jsonb_build_object(
      'opponentUserId', p_opponent_user_id,
      'opponentName', v_opponent_name,
      'opponentGuildId', v_opponent_guild_id,
      'opponentGuildName', v_opponent_guild_name,
      'playerRankPointsAtStart', v_my_rank,
      'opponentRankPointsAtStart', v_opponent_rank,
      'remainingPvpPoints', v_remaining,
      'rewardRevision', 'OPEN_BETA_P0_V1'
    )
  ) returning id into v_replay_id;

  return jsonb_build_object(
    'replay_session_id', v_replay_id,
    'player_snapshot', v_player_snapshot,
    'enemy_snapshot', v_enemy_snapshot,
    'opponent_name', v_opponent_name,
    'opponent_guild_id', v_opponent_guild_id,
    'opponent_guild_name', v_opponent_guild_name,
    'opponent_rank_points', v_opponent_rank,
    'remaining_pvp_points', v_remaining
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.start_tutorial_progress()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid();
begin
  if v_user_id is null then raise exception 'Authentication is required'; end if;
  if not exists(select 1 from public.users where id=v_user_id) then raise exception 'Player profile is required'; end if;
  insert into public.tutorial_progress(user_id,step_id) values(v_user_id,'WORLD_INTRO') on conflict(user_id) do nothing;
  return coalesce((select step_id from public.tutorial_progress where user_id=v_user_id),'WORLD_INTRO');
end;
$function$
;
CREATE OR REPLACE FUNCTION public.sync_and_evaluate_raid_timeout(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_boss_record RECORD;
BEGIN
    SELECT * INTO v_boss_record FROM public.raid_bosses WHERE status = 'ACTIVE' LIMIT 1;
    IF FOUND THEN
        IF v_boss_record.expires_at <= now() THEN
            UPDATE public.raid_bosses SET status = 'EXPIRED' WHERE id = v_boss_record.id;
            RETURN jsonb_build_object('is_active', false, 'reason', 'EXPIRED');
        END IF;
        RETURN jsonb_build_object('is_active', true, 'boss', row_to_json(v_boss_record));
    END IF;
    RETURN jsonb_build_object('is_active', false);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.sync_and_recover_vitality_and_pvp_points(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user public.users%rowtype; v_now timestamptz:=now(); v_vit_steps integer; v_pvp_steps integer; v_raid_steps integer;
 v_vit integer; v_pvp integer; v_raid integer; v_vit_at timestamptz; v_pvp_at timestamptz; v_raid_at timestamptz;
begin
 if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not authorized' using errcode='42501'; end if;
 select * into v_user from public.users where id=p_user_id for update;
 if not found then raise exception 'user not found' using errcode='P0002'; end if;
 v_vit:=least(500,greatest(0,v_user.vitality)); v_pvp:=least(5,greatest(0,v_user.pvp_points)); v_raid:=least(5,greatest(0,v_user.raid_points));
 v_vit_at:=v_user.vitality_last_recovered_at; v_pvp_at:=v_user.pvp_points_last_recovered_at; v_raid_at:=v_user.raid_points_last_recovered_at;
 if v_vit<50 then
  v_vit_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_vit_at,v_now)))/360));
  v_vit:=least(50,v_vit+v_vit_steps);
  if v_vit_steps>0 then v_vit_at:=case when v_vit=50 then v_now else v_vit_at+(v_vit_steps*interval '360 seconds') end; end if;
 end if;
 if v_pvp<5 then
  v_pvp_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_pvp_at,v_now)))/7200));
  v_pvp:=least(5,v_pvp+v_pvp_steps);
  if v_pvp_steps>0 then v_pvp_at:=case when v_pvp=5 then v_now else v_pvp_at+(v_pvp_steps*interval '7200 seconds') end; end if;
 end if;
 if v_raid<5 then
  v_raid_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_raid_at,v_now)))/7200));
  v_raid:=least(5,v_raid+v_raid_steps);
  if v_raid_steps>0 then v_raid_at:=case when v_raid=5 then v_now else v_raid_at+(v_raid_steps*interval '7200 seconds') end; end if;
 end if;
 update public.users set vitality=v_vit,vitality_last_recovered_at=v_vit_at,pvp_points=v_pvp,pvp_points_last_recovered_at=v_pvp_at,
  raid_points=v_raid,raid_points_last_recovered_at=v_raid_at where id=p_user_id;
 return jsonb_build_object('out_vitality',v_vit,'out_pvp_points',v_pvp,'out_raid_points',v_raid,
  'out_cash',v_user.cash,'out_diamonds',v_user.neon_diamonds,'raid_first_entry_free',not v_user.raid_free_entry_consumed,
  'vitality_next_recovery_at',case when v_vit<50 then v_vit_at+interval '360 seconds' else null end,
  'pvp_next_recovery_at',case when v_pvp<5 then v_pvp_at+interval '7200 seconds' else null end,
  'raid_next_recovery_at',case when v_raid<5 then v_raid_at+interval '7200 seconds' else null end);
end $function$
;
CREATE OR REPLACE FUNCTION public.sync_current_missions()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_cycle_date date := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_rescue record;
  v_rescued integer := 0;
begin
  if v_user_id is null or not exists (select 1 from public.users where id = v_user_id) then
    raise exception 'Player authentication required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':missions', 0));

  for v_rescue in
    select um.mission_id, m.title, m.reward_item_id, m.reward_quantity
    from public.user_missions um join public.missions m on m.id = um.mission_id
    where um.user_id = v_user_id and m.category = 'DAILY'
      and um.cycle_date is distinct from v_cycle_date and um.status = 'CLEAR'
    for update of um
  loop
    insert into public.presents(user_id,item_id,quantity,message,status,sent_at,expire_at)
    values(v_user_id,v_rescue.reward_item_id,v_rescue.reward_quantity,
      'デイリーミッション未受取補填: ' || v_rescue.title,
      'UNCLAIMED',clock_timestamp(),clock_timestamp()+interval '24 hours');
    v_rescued := v_rescued + 1;
  end loop;

  update public.user_missions um
  set current_progress=0,progress_val=0,status='PROGRESS',claimed_at=null,
      cycle_date=v_cycle_date,updated_at=clock_timestamp()
  from public.missions m
  where um.user_id=v_user_id and um.mission_id=m.id and m.category='DAILY'
    and um.cycle_date is distinct from v_cycle_date;

  insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status,cycle_date)
  select v_user_id,m.id,0,0,'PROGRESS',case when m.category='DAILY' then v_cycle_date else null end
  from public.missions m
  where m.is_enabled and (
    m.category='DAILY' or (
      m.category='NORMAL' and (
        m.prerequisite_mission_id is null or exists(
          select 1 from public.user_missions prerequisite
          where prerequisite.user_id=v_user_id
            and prerequisite.mission_id=m.prerequisite_mission_id
            and prerequisite.status='CLAIMED'
        )
      )
    )
  )
  on conflict(user_id,mission_id) do nothing;

  update public.user_missions um
  set current_progress=m.target_value,progress_val=m.target_value,status='CLEAR',updated_at=clock_timestamp()
  from public.missions m
  where um.user_id=v_user_id and um.mission_id=m.id and m.category='DAILY'
    and m.trigger_type='DAILY_LOGIN' and um.cycle_date=v_cycle_date and um.status='PROGRESS';

  perform public.refresh_normal_mission_owned_state(v_user_id);
  perform public.ensure_active_special_missions(v_user_id);
  return jsonb_build_object('cycle_date',v_cycle_date,'rescued_count',v_rescued);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.sync_legacy_guild_cosmetics(p_guild_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user_id uuid := auth.uid(); v_guild public.guilds%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guild_members WHERE guild_id = p_guild_id AND user_id = v_user_id) THEN RAISE EXCEPTION 'guild membership required'; END IF;
  SELECT * INTO v_guild FROM public.guilds WHERE id = p_guild_id;
  INSERT INTO public.guild_cosmetics (guild_id, cosmetic_id, source_type, source_reference)
  SELECT p_guild_id, cosmetic_id, 'LEGACY', 'GUILD_MIGRATION'
  FROM jsonb_array_elements_text(COALESCE(v_guild.unlocked_decorations, '[]'::jsonb) || COALESCE(v_guild.unlocked_banners, '[]'::jsonb)) AS legacy_item(cosmetic_id)
  JOIN public.cosmetic_master cm ON cm.id = legacy_item.cosmetic_id
  ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('status', 'success');
END; $function$
;
CREATE OR REPLACE FUNCTION public.sync_legacy_user_cosmetics()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_user public.users%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT * INTO v_user FROM public.users WHERE id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'player profile not found'; END IF;

  PERFORM public.unlock_eligible_user_cosmetics();

  INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source_type, source_reference)
  SELECT v_user_id, id, 'LEGACY', 'PROFILE_MIGRATION'
  FROM public.cosmetic_master
  WHERE id IN (
    COALESCE(v_user.selected_bg_mode, 'bg_default'),
    COALESCE(v_user.equipped_front_effect, 'effect_none'),
    CASE WHEN v_user.interior_item = 'none' THEN 'interior_none' ELSE v_user.interior_item END
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO public.equipped_cosmetics (user_id, slot, cosmetic_id)
  SELECT v_user_id, 'HOME_BACKGROUND', 'bg_default'
  WHERE NOT EXISTS (SELECT 1 FROM public.equipped_cosmetics WHERE user_id = v_user_id AND slot = 'HOME_BACKGROUND')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.equipped_cosmetics (user_id, slot, cosmetic_id)
  SELECT v_user_id, 'HOME_FOREGROUND', 'effect_none'
  WHERE NOT EXISTS (SELECT 1 FROM public.equipped_cosmetics WHERE user_id = v_user_id AND slot = 'HOME_FOREGROUND')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.equipped_cosmetics (user_id, slot, cosmetic_id)
  SELECT v_user_id, 'HOME_INTERIOR', 'interior_none'
  WHERE NOT EXISTS (SELECT 1 FROM public.equipped_cosmetics WHERE user_id = v_user_id AND slot = 'HOME_INTERIOR')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.transfer_guild_leader(p_guild_id uuid, p_old_id uuid, p_new_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_locked uuid;
begin if auth.uid() is null or auth.uid()<>p_old_id or p_old_id=p_new_id then raise exception 'Invalid guild leadership transfer'; end if;
 select id into v_locked from public.guilds where id=p_guild_id and leader_id=p_old_id and not is_disbanded for update;
 if not found then raise exception 'Only current Guild MASTER can transfer leadership'; end if;
 perform 1 from public.guild_members where guild_id=p_guild_id and user_id in(p_old_id,p_new_id) order by user_id for update;
 if not exists(select 1 from public.guild_members where guild_id=p_guild_id and user_id=p_new_id) then raise exception 'New MASTER must be a Guild member'; end if;
 update public.guild_members set role=case when user_id=p_old_id then 'SUB_MASTER' else 'MASTER' end where guild_id=p_guild_id and user_id in(p_old_id,p_new_id);
 update public.guilds set leader_id=p_new_id where id=p_guild_id; return jsonb_build_object('status','success'); end $function$
;
CREATE OR REPLACE FUNCTION public.unequip_character_equipment(p_equipment_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  update public.user_equipments
  set equipped_character_id = null, slot_index = null
  where id = p_equipment_id and user_id = v_user_id;
  if not found then
    raise exception 'owned equipment not found' using errcode = 'P0002';
  end if;
  return jsonb_build_object('status', 'success', 'equipment_id', p_equipment_id);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.unequip_character_equipment_bulk(p_character_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.user_characters where id = p_character_id and user_id = v_user_id) then
    raise exception 'owned character not found' using errcode = 'P0002';
  end if;
  update public.user_equipments
  set equipped_character_id = null, slot_index = null
  where user_id = v_user_id and equipped_character_id = p_character_id::text;
  get diagnostics v_count = row_count;
  return jsonb_build_object('status', 'success', 'unequipped_count', v_count);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.unequip_character_skill(p_skill_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  update public.user_skills set equipped_character_id = null, slot_index = null
  where id = p_skill_id and user_id = v_user_id;
  if not found then raise exception 'owned skill not found' using errcode = 'P0002'; end if;
  return jsonb_build_object('status','success');
end; $function$
;
CREATE OR REPLACE FUNCTION public.unequip_gear_bulk(p_character_id text, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.user_equipments 
    SET equipped_character_id = NULL, slot_index = NULL 
    WHERE user_id = p_user_id AND equipped_character_id = p_character_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.unequip_skill_bulk(p_character_id text, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.user_skills 
    SET equipped_character_id = NULL, slot_index = NULL 
    WHERE user_id = p_user_id AND equipped_character_id = p_character_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.unlock_eligible_user_cosmetics()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile jsonb;
  v_level integer := 1;
  v_cash bigint := 0;
  v_pvp_points integer := 0;
  v_has_guild boolean;
  v_character_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;

  SELECT to_jsonb(user_row) INTO v_profile
  FROM public.users AS user_row
  WHERE user_row.id = v_user_id;
  IF v_profile IS NULL THEN RAISE EXCEPTION 'player profile not found'; END IF;

  v_level := COALESCE(NULLIF(v_profile ->> 'level', '')::integer, NULLIF(v_profile ->> 'user_level', '')::integer, 1);
  v_cash := COALESCE(NULLIF(v_profile ->> 'cash', '')::bigint, NULLIF(v_profile ->> 'money', '')::bigint, 0);
  v_pvp_points := COALESCE(NULLIF(v_profile ->> 'pvp_points', '')::integer, NULLIF(v_profile ->> 'pvp_score', '')::integer, 0);

  SELECT EXISTS (SELECT 1 FROM public.guild_members WHERE user_id = v_user_id)
    INTO v_has_guild;
  SELECT count(*) INTO v_character_count
    FROM public.user_characters WHERE user_id = v_user_id;

  INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source_type, source_reference)
  SELECT v_user_id, id, 'PROGRESSION', source_reference
  FROM public.cosmetic_master
  WHERE owner_scope = 'USER'
    AND (
      id IN ('bg_default', 'effect_none', 'interior_none')
      OR (id = 'bg_kabukicho' AND v_level >= 5)
      OR (id = 'bg_wharf' AND v_has_guild)
      OR (id = 'bg_bazar' AND v_cash >= 20000)
      OR (id = 'effect_lightning' AND v_pvp_points >= 1050)
      OR (id = 'effect_sparks' AND v_level >= 10)
      OR (id = 'effect_smoke' AND v_character_count >= 3)
    )
  ON CONFLICT (user_id, cosmetic_id) DO NOTHING;

  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_favorite_character(p_user_id uuid, p_character_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.users SET favorite_character_id = p_character_id WHERE id = p_user_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_guild_alignment(p_guild_id uuid, p_main text, p_sub text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.guild_members
    where guild_id = p_guild_id
      and user_id = auth.uid()
      and role in ('MASTER', 'SUB_MASTER', 'SUBMASTER')
  ) then
    raise exception 'Guild settings authority required';
  end if;

  if p_main not in ('JUSTICE', 'EVIL', 'ORDER', 'CHAOS')
     or p_sub not in ('JUSTICE', 'EVIL', 'ORDER', 'CHAOS') then
    raise exception 'Invalid guild alignment';
  end if;

  update public.guilds
  set main_alignment = p_main,
      sub_alignment = p_sub
  where id = p_guild_id;

  if not found then
    raise exception 'Guild not found';
  end if;

  return jsonb_build_object('status', 'success');
end;
$function$
;
CREATE OR REPLACE FUNCTION public.update_guild_recruitment(p_guild_id uuid, p_mode text, p_description text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_role text;v_desc text:=trim(coalesce(p_description,''));
begin select role into v_role from public.guild_members where guild_id=p_guild_id and user_id=auth.uid();
 if coalesce(v_role,'') not in('MASTER','SUB_MASTER') then raise exception 'Guild setting permission required'; end if;
 if p_mode not in('OPEN_JOIN','APPLICATION_REQUIRED','CLOSED') or char_length(v_desc)>200 then raise exception 'Invalid guild recruitment settings'; end if;
 update public.guilds set recruitment_mode=p_mode,approval_required=(p_mode='APPLICATION_REQUIRED'),description=v_desc where id=p_guild_id and not is_disbanded;
 return jsonb_build_object('status','success','mode',p_mode); end $function$
;
CREATE OR REPLACE FUNCTION public.update_guild_settings(p_guild_id uuid, p_desc text, p_approval boolean, p_kick_days integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if p_approval is null or p_kick_days is null or p_kick_days<0 or p_kick_days>30 then raise exception 'Invalid guild settings'; end if;
 return public.update_guild_recruitment(p_guild_id,case when p_approval then 'APPLICATION_REQUIRED' else 'OPEN_JOIN' end,p_desc);
end $function$
;
CREATE OR REPLACE FUNCTION public.upgrade_gear(p_user_id uuid, p_equipment_id uuid, p_exp_item_id text, p_count integer, p_cash_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_equip_level INTEGER;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = p_exp_item_id;
    IF v_item_qty IS NULL OR v_item_qty < p_count THEN
        RETURN jsonb_build_object('error', '強化素材が不足しています。');
    END IF;

    SELECT level INTO v_equip_level FROM public.user_equipments WHERE id = p_equipment_id AND user_id = p_user_id;
    IF v_equip_level IS NULL THEN
        RETURN jsonb_build_object('error', '装備が存在しません。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    UPDATE public.user_items SET quantity = quantity - p_count WHERE user_id = p_user_id AND item_id = p_exp_item_id;
    UPDATE public.user_equipments SET level = LEAST(100, level + p_count) WHERE id = p_equipment_id AND user_id = p_user_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'GEAR_UPGRADE', p_count);
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.use_action_resource_ticket(p_item_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_points integer; v_quantity integer; v_resource text;
begin
 if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_item_id not in ('PVP_POINT_TICKET','RAID_POINT_TICKET') then raise exception 'unsupported action resource ticket' using errcode='22023'; end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_user_id);
 if p_item_id='PVP_POINT_TICKET' then
  select pvp_points into v_points from public.users where id=v_user_id for update; v_resource:='PVP_POINT';
 else
  select raid_points into v_points from public.users where id=v_user_id for update; v_resource:='RAID_POINT';
 end if;
 if not found then raise exception 'player profile is not initialized' using errcode='P0002'; end if;
 if v_points>=5 then raise exception 'action resource is already at maximum' using errcode='23514'; end if;
 update public.user_items set quantity=quantity-1 where user_id=v_user_id and item_id=p_item_id and quantity>=1 returning quantity into v_quantity;
 if not found then raise exception 'action resource ticket is not available' using errcode='23514'; end if;
 if p_item_id='PVP_POINT_TICKET' then update public.users set pvp_points=pvp_points+1 where id=v_user_id returning pvp_points into v_points;
 else update public.users set raid_points=raid_points+1 where id=v_user_id returning raid_points into v_points; end if;
 return jsonb_build_object('status','success','item_id',p_item_id,'quantity',v_quantity,'resource',v_resource,'points',v_points);
end $function$
;
CREATE OR REPLACE FUNCTION public.use_energy_drink()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_vitality integer; v_quantity integer;
begin
 if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_user_id);
 select vitality into v_vitality from public.users where id=v_user_id for update;
 if not found then raise exception 'player profile is not initialized' using errcode='P0002'; end if;
 if v_vitality+50>500 then raise exception 'energy drink would exceed vitality hard cap' using errcode='23514'; end if;
 update public.user_items set quantity=quantity-1 where user_id=v_user_id and item_id='ENERGY_DRINK' and quantity>=1 returning quantity into v_quantity;
 if not found then raise exception 'energy drink is not available' using errcode='23514'; end if;
 update public.users set vitality=vitality+50 where id=v_user_id returning vitality into v_vitality;
 return jsonb_build_object('status','success','quantity',v_quantity,'vitality',v_vitality);
end $function$
;
CREATE OR REPLACE FUNCTION public.use_energy_drink(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_qty INTEGER;
BEGIN
    SELECT quantity INTO v_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = 'ENERGY_DRINK';
    IF v_qty IS NULL OR v_qty < 1 THEN
        RETURN jsonb_build_object('error', 'エナジードリンクを所持していません。');
    END IF;

    UPDATE public.user_items SET quantity = quantity - 1 WHERE user_id = p_user_id AND item_id = 'ENERGY_DRINK';
    UPDATE public.users SET vitality = LEAST(vitality + 50, 100) WHERE id = p_user_id;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.use_inventory_item(p_user_id uuid, p_item_id text, p_quantity integer, p_vitality_gain integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_item_qty INTEGER;
BEGIN
    SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = p_item_id;
    IF v_item_qty IS NULL OR v_item_qty < p_quantity THEN
        RETURN jsonb_build_object('error', 'アイテムが不足しています。');
    END IF;

    UPDATE public.user_items SET quantity = quantity - p_quantity WHERE user_id = p_user_id AND item_id = p_item_id;

    IF p_vitality_gain > 0 THEN
        UPDATE public.users SET vitality = LEAST(100, COALESCE(vitality, 0) + p_vitality_gain) WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.validate_official_battle_result(p_result jsonb)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
begin
  if jsonb_typeof(p_result) <> 'object'
     or p_result ->> 'winner' not in ('PLAYER', 'ENEMY')
     or coalesce((p_result ->> 'rounds')::integer, 0) < 1
     or jsonb_typeof(p_result -> 'events') <> 'array'
     or coalesce((p_result ->> 'playerRawDamage')::numeric, -1) < 0
     or coalesce((p_result ->> 'enemyRawDamage')::numeric, -1) < 0 then
    raise exception 'invalid official battle result' using errcode = '22023';
  end if;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_ensure_subject(p_user_id uuid, p_registered_at timestamp with time zone DEFAULT now(), p_registration_type text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
declare
  v_subject_id uuid;
  v_registration_type text := p_registration_type;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required' using errcode = '22004';
  end if;


  select subject_id into v_subject_id
  from public.kpi_subjects
  where source_user_id = p_user_id;
  if v_subject_id is not null then
    return v_subject_id;
  end if;


  if v_registration_type is null then
    select case when au.is_anonymous then 'anonymous' else 'authenticated' end
    into v_registration_type
    from auth.users au
    where au.id = p_user_id;
  end if;
  v_registration_type := coalesce(v_registration_type, 'unknown');


  begin
    insert into public.kpi_subjects(source_user_id, registered_at, registration_type)
    values(p_user_id, coalesce(p_registered_at, now()), v_registration_type)
    returning subject_id into v_subject_id;
  exception when unique_violation then
    select subject_id into v_subject_id
    from public.kpi_subjects
    where source_user_id = p_user_id;
  end;


  return v_subject_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_user_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
begin
  perform public.kpi_ensure_subject(new.id, new.created_at, null);
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_user_detaching()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  update public.kpi_subjects
  set source_user_id = null,
      detached_at = coalesce(detached_at, clock_timestamp()),
      deletion_reason = coalesce(deletion_reason, 'gameplay_user_deleted'),
      updated_at = clock_timestamp()
  where source_user_id = old.id;
  return old;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_auth_method_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_subject_id uuid;
begin
  v_subject_id := public.kpi_ensure_subject(new.user_id, new.authenticated_at, 'authenticated');
  update public.kpi_subjects
  set first_authenticated_at = least(
        coalesce(first_authenticated_at, new.authenticated_at),
        new.authenticated_at
      ),
      updated_at = clock_timestamp()
  where subject_id = v_subject_id;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_record_daily_activity(p_user_id uuid, p_occurred_at timestamp with time zone DEFAULT clock_timestamp())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_subject_id uuid;
  v_activity_date date;
begin
  v_subject_id := public.kpi_ensure_subject(p_user_id, p_occurred_at, null);
  v_activity_date := (p_occurred_at at time zone 'Asia/Tokyo')::date;


  insert into public.kpi_daily_user_activity(
    activity_date, subject_id, first_active_at, last_active_at, source
  ) values (
    v_activity_date, v_subject_id, p_occurred_at, p_occurred_at, 'sync_active_users'
  )
  on conflict (activity_date, subject_id) do update
  set first_active_at = least(public.kpi_daily_user_activity.first_active_at, excluded.first_active_at),
      last_active_at = greatest(public.kpi_daily_user_activity.last_active_at, excluded.last_active_at);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_tutorial_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_subject_id uuid;
begin
  if new.step_id = 'COMPLETE'
     and (tg_op = 'INSERT' or old.step_id is distinct from 'COMPLETE') then
    v_subject_id := public.kpi_ensure_subject(new.user_id, coalesce(new.completed_at, now()), null);
    insert into public.kpi_tutorial_completion_facts(subject_id, completed_at, source)
    values(v_subject_id, coalesce(new.completed_at, now()), 'tutorial_progress')
    on conflict (subject_id) do update
    set completed_at = least(public.kpi_tutorial_completion_facts.completed_at, excluded.completed_at);
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_kpi_gacha_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_subject_id uuid;
  v_gacha_type text;
begin
  if new.status <> 'COMPLETED' or new.completed_at is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'COMPLETED' then
    return new;
  end if;


  select upper(master.gacha_type) into v_gacha_type
  from public.gacha_masters master
  where master.id = new.gacha_id;
  if v_gacha_type not in ('CHARACTER', 'SKILL', 'EQUIPMENT') then
    raise exception 'unsupported KPI gacha type: %', coalesce(v_gacha_type, '<null>');
  end if;


  v_subject_id := public.kpi_ensure_subject(new.user_id, new.created_at, null);
  insert into public.kpi_gacha_execution_facts(
    subject_id, request_id, gacha_id, gacha_type, payment_source, pull_count, completed_at
  ) values (
    v_subject_id, new.request_id, new.gacha_id, v_gacha_type,
    new.payment_source, new.pull_count, new.completed_at
  )
  on conflict (subject_id, request_id) do nothing;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.kpi_v249_metadata_valid(p_metadata jsonb)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select case when p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then false
    when octet_length(p_metadata::text) > 512 then false
    else not exists (
      select 1 from jsonb_each(p_metadata) e
      where e.key <> 'qa' or jsonb_typeof(e.value) <> 'boolean'
    ) end;
$function$
;
CREATE OR REPLACE FUNCTION public.issue_kpi_mypage_ready_context_v1(p_tutorial_version text, p_idempotency_key text, p_source text DEFAULT 'mypage_handshake_v1'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_subject uuid := public.kpi_v249_current_subject(); v_user uuid := auth.uid();
  v_context public.kpi_tutorial_mypage_ready_contexts%rowtype; v_leader text;
  v_step text; v_completed timestamptz; v_guild uuid; v_profile_guild uuid; v_member_count int;
begin
  if p_tutorial_version is null or p_tutorial_version !~ '^[A-Za-z0-9_.-]{1,64}$'
     or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_.:-]{1,128}$'
     or p_source not in ('mypage_handshake_v1','qa_v1') then
    raise exception 'Invalid My Page context request' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('kpi249:mypage:'||v_subject||':'||p_idempotency_key,0));
  select * into v_context from public.kpi_tutorial_mypage_ready_contexts
    where subject_id=v_subject and idempotency_key=p_idempotency_key;
  if found then
    if v_context.tutorial_version is distinct from p_tutorial_version or v_context.source is distinct from p_source then
      raise exception 'Conflicting My Page context retry' using errcode='23505'; end if;
    return jsonb_build_object('context_id',v_context.context_id,'expires_at',v_context.expires_at,
      'profile_ready',v_context.profile_ready,'onboarding_ready',v_context.onboarding_ready,
      'identity_leader_ready',v_context.identity_leader_ready,
      'guild_membership_resolved',v_context.guild_membership_resolved,
      'guild_membership_status',v_context.guild_membership_status);
  end if;
  select favorite_character_id,guild_id into v_leader,v_profile_guild from public.users
    where id=v_user and nullif(btrim(username),'') is not null;
  if not found then raise exception 'Profile is not ready' using errcode='23514'; end if;
  select step_id,completed_at into v_step,v_completed from public.tutorial_progress where user_id=v_user;
  if v_step not in ('COMPLETE','AUTHENTICATION') or v_completed is null then
    raise exception 'Onboarding is not ready' using errcode='23514'; end if;
  if v_leader is null or not exists(select 1 from public.user_characters where user_id=v_user and character_id=v_leader) then
    raise exception 'Identity leader is not ready' using errcode='23514'; end if;
  select count(*),(array_agg(guild_id))[1] into v_member_count,v_guild from public.guild_members where user_id=v_user;
  if v_member_count > 1 or (v_member_count=1 and (v_profile_guild is distinct from v_guild
       or not exists(select 1 from public.guilds where id=v_guild and not is_disbanded)))
     or (v_member_count=0 and v_profile_guild is not null) then
    raise exception 'Guild membership is inconsistent' using errcode='23514'; end if;
  insert into public.kpi_tutorial_mypage_ready_contexts(subject_id,expires_at,profile_ready,onboarding_ready,
    identity_leader_ready,guild_membership_resolved,guild_membership_status,tutorial_version,source,idempotency_key)
  values(v_subject,clock_timestamp()+interval '10 minutes',true,true,true,true,
    case when v_member_count=1 then 'MEMBER' else 'NOT_MEMBER' end,p_tutorial_version,p_source,p_idempotency_key)
  returning * into v_context;
  return jsonb_build_object('context_id',v_context.context_id,'expires_at',v_context.expires_at,
    'profile_ready',true,'onboarding_ready',true,'identity_leader_ready',true,
    'guild_membership_resolved',true,'guild_membership_status',v_context.guild_membership_status);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.acknowledge_kpi_first_mypage_access_v1(p_context_id uuid, p_idempotency_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_subject uuid := public.kpi_v249_current_subject(); v_context public.kpi_tutorial_mypage_ready_contexts%rowtype;
  v_fact public.kpi_tutorial_journey_facts%rowtype; v_ready jsonb;
begin
  if p_context_id is null or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_.:-]{1,128}$' then
    raise exception 'Invalid My Page acknowledgement' using errcode='22023'; end if;
  select * into v_context from public.kpi_tutorial_mypage_ready_contexts where context_id=p_context_id for update;
  if not found or v_context.subject_id<>v_subject or v_context.expires_at<=clock_timestamp()
    or not (v_context.profile_ready and v_context.onboarding_ready and v_context.identity_leader_ready
      and v_context.guild_membership_resolved) then
    raise exception 'Invalid or expired My Page context' using errcode='42501'; end if;
  -- Re-run all four server checks; a stale context cannot become canonical.
  v_ready := public.issue_kpi_mypage_ready_context_v1(v_context.tutorial_version,'recheck:'||p_idempotency_key,v_context.source);
  select * into v_fact from public.kpi_tutorial_journey_facts
    where subject_id=v_subject and fact_type='FIRST_MYPAGE_ACCESS_CONFIRMED';
  if found then
    if v_fact.idempotency_key is distinct from p_idempotency_key or v_fact.context_id is distinct from p_context_id then
      -- Subject-level canonical first fact wins; a new client attempt returns it
      -- only when this context was already acknowledged to that fact.
      if v_context.acknowledged_at is null then raise exception 'Canonical first My Page fact already exists' using errcode='23505'; end if;
    end if;
    return v_fact.id;
  end if;
  insert into public.kpi_tutorial_journey_facts(subject_id,fact_type,source,idempotency_key,
    tutorial_version,context_id,metadata)
  values(v_subject,'FIRST_MYPAGE_ACCESS_CONFIRMED',v_context.source,p_idempotency_key,
    v_context.tutorial_version,p_context_id,'{}') returning * into v_fact;
  update public.kpi_tutorial_mypage_ready_contexts set acknowledged_at=clock_timestamp()
    where context_id=p_context_id and acknowledged_at is null;
  return v_fact.id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.raid_room_projection_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select jsonb_build_object(
    'roomId',r.id,'difficultyId',r.difficulty_id,
    'owner',jsonb_build_object('status','available','value',jsonb_build_object(
      'userId',u.id,'name',u.username,'leaderIconUrl',jsonb_build_object('status','unknown'))),
    'state',case when b.status='ACTIVE' and b.current_hp=0 then jsonb_build_object('status','unknown')
      when b.status='ACTIVE' and b.expires_at<=now() then jsonb_build_object('status','available','value','expired')
      when b.status in ('ACTIVE','CLEARED','EXPIRED')
      then jsonb_build_object('status','available','value',lower(b.status))
      else jsonb_build_object('status','unknown') end,
    'createdAt',jsonb_build_object('status','available','value',r.created_at),
    'expiresAt',jsonb_build_object('status','available','value',b.expires_at),
    'endedAt',jsonb_build_object('status','available','value',b.outcome_finalized_at),
    'hp',case when b.current_hp is not null and b.max_hp is not null
      then jsonb_build_object('status','available','value',jsonb_build_object('current',b.current_hp,'max',b.max_hp))
      else jsonb_build_object('status','unknown') end,
    'participantCount',jsonb_build_object('status','available','value',(
      select count(*) from (
        select r.owner_user_id as user_id
        union select m.user_id from public.raid_room_members m where m.room_id=r.id
        union select p.user_id from public.raid_instance_user_progress p
          where p.raid_boss_instance_id=r.raid_boss_instance_id and p.finalized_battles>0
      ) participants)),
    'serverEligibility',jsonb_build_object('status','unknown')
  ) from public.raid_rooms r join public.raid_bosses b on b.id = r.raid_boss_instance_id
    join public.users u on u.id = r.owner_user_id
  where r.id = p_room_id
$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not public.raid_room_can_read_v1(p_room_id) then
    raise exception 'room unavailable' using errcode='P0002';
  end if;
  return public.raid_room_projection_v1(p_room_id);
end $function$
;
