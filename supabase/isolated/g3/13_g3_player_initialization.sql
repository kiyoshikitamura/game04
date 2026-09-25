-- G3 isolated acceptance initializer.
-- Preserves current frontend RPC names/response shape without GAME03 assets,
-- tutorial rows, starter distribution, invitation rewards or forced gacha.

create unique index if not exists users_username_normalized_uidx on public.users(lower(btrim(username)));

create or replace function public.initialize_current_player(p_username text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_user_id uuid:=auth.uid();v_username text:=btrim(p_username);v_is_anonymous boolean:=coalesce((auth.jwt()->>'is_anonymous')::boolean,false);v_subject uuid;
begin
 if v_user_id is null then raise exception 'Authentication is required';end if;
 if not v_is_anonymous then raise exception 'Anonymous onboarding session is required';end if;
 if v_username is null or char_length(v_username) not between 1 and 8 then raise exception 'Username must contain 1 to 8 characters';end if;
 if (select data#>>'{projectRef}' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_ISOLATED_PROJECT';end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
 if exists(select 1 from public.users where id=v_user_id) then
  return jsonb_build_object('status','already_initialized','tutorial_step','COMPLETE','g4Pending',true);
 end if;
 if exists(select 1 from public.users where lower(btrim(username))=lower(v_username)) then raise exception 'Username is already in use' using errcode='23505';end if;
 insert into public.users(id,username,current_base_id,favorite_character_id) values(v_user_id,v_username,'shinjuku',null);
 insert into public.kpi_subjects(source_user_id,registered_at,registration_type) values(v_user_id,clock_timestamp(),'anonymous')
 on conflict(source_user_id) do update set updated_at=clock_timestamp() returning subject_id into v_subject;
 if v_subject is null then select subject_id into v_subject from public.kpi_subjects where source_user_id=v_user_id;end if;
 insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason)
 select v_subject,'qa',clock_timestamp(),'GAME04 G3 isolated browser acceptance'
 where not exists(select 1 from public.kpi_account_classification_periods p where p.subject_id=v_subject and p.valid_to is null);
 return jsonb_build_object('status','success','tutorial_step','COMPLETE','g4Pending',true,'invitation',null);
end $$;

create or replace function public.initialize_current_player(p_username text,p_invite_code text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_result jsonb;
begin
 v_result:=public.initialize_current_player(p_username);
 return v_result||jsonb_build_object('invitation',null,'inviteDeferredToG4',nullif(btrim(coalesce(p_invite_code,'')),'') is not null);
end $$;

create or replace function public.get_current_onboarding_state() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_user_id uuid:=auth.uid();v_is_anonymous boolean;v_has_profile boolean;v_auth_method text;v_provider text;v_count integer;v_integrity boolean;
begin
 if v_user_id is null then raise exception 'Authentication is required';end if;
 v_is_anonymous:=coalesce((auth.jwt()->>'is_anonymous')::boolean,false);
 select exists(select 1 from public.users where id=v_user_id) into v_has_profile;
 select auth_method into v_auth_method from public.user_account_auth_methods where user_id=v_user_id;
 select count(distinct provider),min(provider) into v_count,v_provider from auth.identities where user_id=v_user_id and provider in('google','email');
 v_integrity:=(v_is_anonymous and v_count=0 and v_auth_method is null) or (not v_is_anonymous and v_count=1 and (v_auth_method is null or lower(v_auth_method)=v_provider));
 return jsonb_build_object('user_id',v_user_id,'is_anonymous',v_is_anonymous,'has_profile',v_has_profile,
  'tutorial_step',case when v_has_profile then 'COMPLETE' else null end,'authentication_pending',false,
  'auth_method',coalesce(v_auth_method,case v_provider when 'google' then 'GOOGLE' when 'email' then 'EMAIL' else null end),
  'is_legacy_authenticated',not v_is_anonymous and v_integrity and v_has_profile and v_auth_method is null,
  'identity_integrity_valid',v_integrity,'gameplay_authorized',v_has_profile and v_integrity);
end $$;

create or replace function public.can_initialize_maintenance_google_player() returns boolean
language sql stable security definer set search_path='' as $$select false$$;

revoke all on function public.initialize_current_player(text),public.initialize_current_player(text,text),
 public.get_current_onboarding_state(),public.can_initialize_maintenance_google_player() from public,anon;
grant execute on function public.initialize_current_player(text),public.initialize_current_player(text,text),
 public.get_current_onboarding_state(),public.can_initialize_maintenance_google_player() to authenticated;
comment on function public.initialize_current_player(text,text) is 'G3 isolated: profile only; invitation, tutorial and starter supply remain G4.';
