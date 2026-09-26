begin;
CREATE OR REPLACE FUNCTION public.get_chat_unread_counts()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_guild_id uuid;
  v_global_target uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  v_global_read_at timestamptz;
  v_guild_read_at timestamptz;
  v_global_count integer := 0;
  v_guild_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.chat_read_states (user_id, target_type, target_id, last_read_at)
  VALUES (v_user_id, 'GLOBAL', v_global_target, clock_timestamp())
  ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

  SELECT last_read_at INTO v_global_read_at
  FROM public.chat_read_states
  WHERE user_id = v_user_id
    AND target_type = 'GLOBAL'
    AND target_id = v_global_target;

  SELECT count(*)::integer INTO v_global_count
  FROM public.board_posts
  WHERE target_type = 'GLOBAL'
    AND created_at > v_global_read_at
    AND COALESCE(user_id, author_id) IS DISTINCT FROM v_user_id;

  SELECT guild_id INTO v_guild_id
  FROM public.guild_members
  WHERE user_id = v_user_id;

  IF v_guild_id IS NOT NULL THEN
    INSERT INTO public.chat_read_states (user_id, target_type, target_id, last_read_at)
    VALUES (v_user_id, 'GUILD', v_guild_id, clock_timestamp())
    ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

    SELECT last_read_at INTO v_guild_read_at
    FROM public.chat_read_states
    WHERE user_id = v_user_id
      AND target_type = 'GUILD'
      AND target_id = v_guild_id;

    SELECT count(*)::integer INTO v_guild_count
    FROM public.board_posts
    WHERE target_type = 'GUILD'
      AND target_id = v_guild_id
      AND created_at > v_guild_read_at
      AND COALESCE(user_id, author_id) IS DISTINCT FROM v_user_id;
  END IF;

  RETURN jsonb_build_object('GLOBAL', v_global_count, 'GUILD', v_guild_count);
END;
$function$;

revoke all on function public.get_chat_unread_counts() from public,anon;
grant execute on function public.get_chat_unread_counts() to authenticated;
CREATE OR REPLACE FUNCTION public.get_direct_message_unread_counts()
 RETURNS TABLE(sender_id uuid, sender_name text, unread_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT dm.sender_id, u.username AS sender_name, count(*)::bigint AS unread_count
  FROM public.direct_messages dm
  JOIN public.users u ON u.id = dm.sender_id
  WHERE dm.recipient_id = auth.uid()
    AND dm.is_read = false
  GROUP BY dm.sender_id, u.username
  ORDER BY max(dm.created_at) DESC;
$function$;

revoke all on function public.get_direct_message_unread_counts() from public,anon;
grant execute on function public.get_direct_message_unread_counts() to authenticated;
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
$function$;

revoke all on function public.mark_chat_channel_read(p_target_type text) from public,anon;
grant execute on function public.mark_chat_channel_read(p_target_type text) to authenticated;
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
$function$;

revoke all on function public.mark_direct_message_read(p_message_id uuid) from public,anon;
grant execute on function public.mark_direct_message_read(p_message_id uuid) to authenticated;
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
$function$;

revoke all on function public.send_chat_message(p_target_type text, p_content text, p_reply_to_message_id uuid) from public,anon;
grant execute on function public.send_chat_message(p_target_type text, p_content text, p_reply_to_message_id uuid) to authenticated;
CREATE OR REPLACE FUNCTION public.send_chat_message(p_target_type text, p_content text)
 RETURNS board_posts
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select public.send_chat_message(p_target_type,p_content,null::uuid) $function$;

revoke all on function public.send_chat_message(p_target_type text, p_content text) from public,anon;
grant execute on function public.send_chat_message(p_target_type text, p_content text) to authenticated;
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
$function$;

revoke all on function public.send_direct_message(p_recipient_id uuid, p_message text) from public,anon;
grant execute on function public.send_direct_message(p_recipient_id uuid, p_message text) to authenticated;
commit;

