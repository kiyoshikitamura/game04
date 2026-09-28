-- MCP/SQL executable preparation/finalization. No psql meta commands.
-- Install first; invoke only after the corresponding Auth users exist.

create table if not exists public.user_account_auth_methods (
 user_id uuid primary key references public.users(id) on delete cascade,
 auth_method text not null check(auth_method in ('EMAIL','GOOGLE')),authenticated_at timestamptz not null default now()
);
alter table public.user_account_auth_methods enable row level security;
revoke all on public.user_account_auth_methods from public,anon,authenticated;
grant all on public.user_account_auth_methods to service_role;

create or replace function public.game04_auth_binding(p_finalize boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid();v_anonymous boolean;v_email_confirmed timestamptz;v_password boolean;
 v_count integer;v_provider text;v_method text;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED';end if;perform pg_advisory_xact_lock(hashtextextended(v_uid::text,0));
 select u.is_anonymous,u.email_confirmed_at,coalesce(length(u.encrypted_password),0)>0 into v_anonymous,v_email_confirmed,v_password from auth.users u where u.id=v_uid;
 if not found then raise exception 'AUTH_REQUIRED';end if;
 if not exists(select 1 from public.users where id=v_uid) or not exists(select 1 from public.game04_player_state where user_id=v_uid) then raise exception 'PLAYER_NOT_FOUND';end if;
 select count(*),min(provider) into v_count,v_provider from auth.identities where user_id=v_uid;
 select auth_method into v_method from public.user_account_auth_methods where user_id=v_uid for update;
 if v_anonymous then if p_finalize then raise exception 'VERIFIED_IDENTITY_REQUIRED';end if;return jsonb_build_object('userId',v_uid,'linked',false,'method',null,'needsPassword',false);end if;
 if v_count<>1 or v_provider not in ('email','google') then raise exception 'SINGLE_IDENTITY_REQUIRED';end if;
 if v_method is not null and v_method<>upper(v_provider) then raise exception 'IDENTITY_CONFLICT';end if;
 if v_provider='email' and (v_email_confirmed is null or not v_password) then
  if p_finalize then raise exception 'EMAIL_CONFIRMATION_AND_PASSWORD_REQUIRED';end if;
  return jsonb_build_object('userId',v_uid,'linked',false,'method','EMAIL','needsPassword',v_email_confirmed is not null);
 end if;
 if p_finalize then
  insert into public.user_account_auth_methods(user_id,auth_method) values(v_uid,upper(v_provider)) on conflict(user_id) do nothing;
  select auth_method into v_method from public.user_account_auth_methods where user_id=v_uid for update;
  if v_method<>upper(v_provider) then raise exception 'IDENTITY_CONFLICT';end if;
 end if;
 return jsonb_build_object('userId',v_uid,'linked',v_method is not null,'method',upper(v_provider),'needsPassword',false);
end $$;
revoke all on function public.game04_auth_binding(boolean) from public,anon;
grant execute on function public.game04_auth_binding(boolean) to authenticated;

create or replace function public.game04_prepare_isolated_g3_qa(p_qa_a uuid,p_qa_b uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare auth_count integer;
begin
 if p_qa_a is null or p_qa_b is null or p_qa_a=p_qa_b then raise exception 'TWO_DISTINCT_QA_IDS_REQUIRED';end if;
 if (select data#>>'{projectRef}' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_ISOLATED_PROJECT';end if;
 select count(*) into auth_count from auth.users;if auth_count<>2 then raise exception 'EXACTLY_TWO_AUTH_USERS_REQUIRED';end if;
 if (select count(*) from auth.users where id in(p_qa_a,p_qa_b))<>2 then raise exception 'QA_AUTH_USERS_MISSING';end if;
 if exists(select 1 from public.users where id not in(p_qa_a,p_qa_b)) then raise exception 'NON_QA_APPLICATION_USER_PRESENT';end if;
 insert into public.users(id,username,cash,neon_diamonds,diamonds) values
  (p_qa_a,'G3QA-A',1000,300,300),(p_qa_b,'G3QA-B',1000,300,300) on conflict(id) do nothing;
 insert into public.kpi_subjects(source_user_id,registered_at,registration_type,first_authenticated_at) values
  (p_qa_a,clock_timestamp(),'anonymous',null),(p_qa_b,clock_timestamp(),'authenticated',clock_timestamp()) on conflict(source_user_id) do nothing;
 insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason)
 select s.subject_id,'qa',s.registered_at,'GAME04 G3 isolated acceptance fixture' from public.kpi_subjects s
 where s.source_user_id in(p_qa_a,p_qa_b) and not exists(select 1 from public.kpi_account_classification_periods p where p.subject_id=s.subject_id and p.valid_to is null);
 return jsonb_build_object('prepared',true,'qaA',p_qa_a,'qaB',p_qa_b,'next','initialize both game04_player_state rows through authenticated Edge GET');
end $$;

create or replace function public.game04_finalize_isolated_g3_qa(p_qa_b uuid,p_fixture_tag text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare order_id uuid:=extensions.gen_random_uuid();request_id uuid:=extensions.gen_random_uuid();skill_present uuid:=extensions.gen_random_uuid();equipment_present uuid:=extensions.gen_random_uuid();
begin
 if p_qa_b is null or coalesce(length(p_fixture_tag),0)<8 then raise exception 'INVALID_FIXTURE_ARGUMENT';end if;
 if (select data#>>'{projectRef}' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_ISOLATED_PROJECT';end if;
 if not exists(select 1 from auth.users where id=p_qa_b) or not exists(select 1 from public.game04_player_state where user_id=p_qa_b) then raise exception 'QA_B_STATE_MISSING';end if;
 if exists(select 1 from public.billing_orders where product_snapshot->>'fixtureTag'=p_fixture_tag) then raise exception 'FIXTURE_TAG_REUSED';end if;
 insert into public.billing_products(id,title,amount_jpy,price_dia,items,purchase_limit,validity_days)
 values('GAME04_G3_ISOLATED_LOT','G3 isolated QA lot fixture',1,null,jsonb_build_array(jsonb_build_object('itemId','SPECIAL_TICKET_SKILL','quantity',1),jsonb_build_object('itemId','SPECIAL_TICKET_EQUIPMENT','quantity',1)),0,1)
 on conflict(id) do update set title=excluded.title,amount_jpy=1,price_dia=null,items=excluded.items,purchase_limit=0,validity_days=1;
 insert into public.billing_orders(id,user_id,request_id,product_id,amount_jpy,product_snapshot,status,granted_at,billing_mode)
 values(order_id,p_qa_b,request_id,'GAME04_G3_ISOLATED_LOT',1,jsonb_build_object('fixtureTag',p_fixture_tag,'scope','GAME04_G3_ISOLATED_ACCEPTANCE','revenue',false),'GRANTED',clock_timestamp(),'sandbox');
 insert into public.presents(id,user_id,item_id,quantity,message,status,sent_at,claimed_at,source_kind,source_key,source_metadata) values
  (skill_present,p_qa_b,'SPECIAL_TICKET_SKILL',1,'G3 isolated QA','CLAIMED',clock_timestamp(),clock_timestamp(),'GAME04_QA',p_fixture_tag,jsonb_build_object('fixtureTag',p_fixture_tag,'funding','qa','revenue',false)),
  (equipment_present,p_qa_b,'SPECIAL_TICKET_EQUIPMENT',1,'G3 isolated QA','CLAIMED',clock_timestamp(),clock_timestamp(),'GAME04_QA',p_fixture_tag,jsonb_build_object('fixtureTag',p_fixture_tag,'funding','qa','revenue',false));
 insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at,claimed_at,expired_quantity) values
  (order_id,p_qa_b,skill_present,'SPECIAL_TICKET_SKILL',1,1,clock_timestamp()-interval '1 hour',clock_timestamp()+interval '24 hours',clock_timestamp(),0),
  (order_id,p_qa_b,equipment_present,'SPECIAL_TICKET_EQUIPMENT',1,1,clock_timestamp()-interval '48 hours',clock_timestamp()-interval '24 hours',clock_timestamp()-interval '47 hours',0);
 insert into public.user_items(user_id,item_id,quantity) values(p_qa_b,'SPECIAL_TICKET_SKILL',1),(p_qa_b,'SPECIAL_TICKET_EQUIPMENT',1)
 on conflict(user_id,item_id) do update set quantity=excluded.quantity,updated_at=clock_timestamp();
 update public.users set cash=greatest(cash,1000),neon_diamonds=greatest(neon_diamonds,300),diamonds=greatest(diamonds,300) where id=p_qa_b;
 update public.game04_player_state set state=jsonb_set(jsonb_set(state||jsonb_build_object('g3AcceptanceFixture',jsonb_build_object('scope','GAME04_G3_ISOLATED_ACCEPTANCE','projectRef','znakrkaazliexzwihxge','fixtureTag',p_fixture_tag)),
  '{specialGachaPoints}',coalesce(state->'specialGachaPoints','{}'),true),'{specialGachaPoints,character}',to_jsonb(greatest(coalesce((state#>>'{specialGachaPoints,character}')::integer,0),200)),true),
  version=version+1,updated_at=clock_timestamp() where user_id=p_qa_b;
 return jsonb_build_object('finalized',true,'fixtureTag',p_fixture_tag,'ticketFixture',jsonb_build_object('mode','isolated-paid-lot','nonExpiredCategory','skill','expiredCategory','equipment'),
  'exchangeItemId','char_koharu_01','exchangeMismatchItemId','char_leo_01','expectedHomeBackgroundId','ssr:char_koharu_01');
end $$;
revoke all on function public.game04_prepare_isolated_g3_qa(uuid,uuid),public.game04_finalize_isolated_g3_qa(uuid,text) from public,anon,authenticated;
grant execute on function public.game04_prepare_isolated_g3_qa(uuid,uuid),public.game04_finalize_isolated_g3_qa(uuid,text) to service_role;
