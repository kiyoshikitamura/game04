-- Candidate only; G2/P review and coordinated application after G3's window.
-- Additive display projection. No auth identity, profile, VIP or wallet writes.
create or replace function public.game04_get_community_profiles(p_user_ids uuid[])
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or p_user_ids is null or cardinality(p_user_ids) not between 1 and 100 then
    raise exception 'invalid public profile request' using errcode = '42501';
  end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'user_id', player.id, 'username', player.username, 'bio', player.bio,
    'favorite_character_id', coalesce(state.state->>'homeCharacterId', player.favorite_character_id),
    'authenticated', coalesce(
      not account.is_anonymous and identity_count.total = 1
      and identity_count.provider in ('email', 'google')
      and method.auth_method = upper(identity_count.provider)
      and (identity_count.provider <> 'email' or (account.email_confirmed_at is not null and length(account.encrypted_password) > 0)), false),
    'vip_expires_at', vip.expires_at
  )) from public.users player
    join public.game04_player_state state on state.user_id = player.id
    join auth.users account on account.id = player.id
    left join public.user_account_auth_methods method on method.user_id = player.id
    left join public.game04_vip_entitlements vip on vip.user_id = player.id
    left join lateral (select count(*) total, min(identity.provider) provider from auth.identities identity where identity.user_id = player.id) identity_count on true
    where player.id = any(p_user_ids)), '[]'::jsonb);
end; $$;
revoke all on function public.game04_get_community_profiles(uuid[]) from public, anon;
grant execute on function public.game04_get_community_profiles(uuid[]) to authenticated;
comment on function public.game04_get_community_profiles(uuid[]) is 'GAME04 public identity display; P03 binding rules and P02 VIP authority. No credentials or private identity data returned.';
