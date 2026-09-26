-- Isolated QA only. Run with psql after Auth binding and initial game04_player_state exist.
-- Variables: qa_b_id, fixture_tag. Never run on dev/Production.
begin;
select gen_random_uuid() order_id,gen_random_uuid() request_id,gen_random_uuid() skill_present_id,
 gen_random_uuid() equipment_present_id,gen_random_uuid() skill_lot_id,gen_random_uuid() equipment_lot_id \gset
create temporary table g3_fixture_args(qa_b_id uuid primary key,fixture_tag text not null check(length(fixture_tag)>0)) on commit drop;
insert into g3_fixture_args values(:'qa_b_id'::uuid,:'fixture_tag');

do $$ begin
 if (select data#>>'{projectRef}' from public.game04_redesign_master where key='isolated_environment')
  is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_ISOLATED_PROJECT';end if;
 if not exists(select 1 from public.users where id=(select qa_b_id from g3_fixture_args)) then raise exception 'QA_B_PUBLIC_USER_MISSING';end if;
 if not exists(select 1 from public.game04_player_state where user_id=(select qa_b_id from g3_fixture_args)) then raise exception 'QA_B_STATE_MISSING';end if;
end $$;

insert into public.billing_products(id,title,amount_jpy,price_dia,items,purchase_limit,validity_days)
values('GAME04_G3_ISOLATED_LOT','G3 isolated QA lot fixture',1,null,
 jsonb_build_array(jsonb_build_object('itemId','SPECIAL_TICKET_SKILL','quantity',1),jsonb_build_object('itemId','SPECIAL_TICKET_EQUIPMENT','quantity',1)),0,1)
on conflict(id) do update set title=excluded.title,amount_jpy=excluded.amount_jpy,price_dia=null,items=excluded.items,purchase_limit=0,validity_days=1;

insert into public.billing_orders(id,user_id,request_id,product_id,amount_jpy,product_snapshot,status,granted_at,billing_mode)
values(:'order_id'::uuid,:'qa_b_id'::uuid,:'request_id'::uuid,'GAME04_G3_ISOLATED_LOT',1,
 jsonb_build_object('fixtureTag',:'fixture_tag','scope','GAME04_G3_ISOLATED_ACCEPTANCE','revenue',false),
 'GRANTED',clock_timestamp(),'sandbox');

insert into public.presents(id,user_id,item_id,quantity,message,status,sent_at,claimed_at,source_kind,source_key,source_metadata)
values
 (:'skill_present_id'::uuid,:'qa_b_id'::uuid,'SPECIAL_TICKET_SKILL',1,'G3 isolated QA','CLAIMED',clock_timestamp(),clock_timestamp(),'GAME04_QA',:'fixture_tag',jsonb_build_object('fixtureTag',:'fixture_tag','funding','qa','revenue',false)),
 (:'equipment_present_id'::uuid,:'qa_b_id'::uuid,'SPECIAL_TICKET_EQUIPMENT',1,'G3 isolated QA','CLAIMED',clock_timestamp(),clock_timestamp(),'GAME04_QA',:'fixture_tag',jsonb_build_object('fixtureTag',:'fixture_tag','funding','qa','revenue',false));

insert into public.billing_asset_lots(id,order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at,claimed_at,expired_quantity)
values
 (:'skill_lot_id'::uuid,:'order_id'::uuid,:'qa_b_id'::uuid,:'skill_present_id'::uuid,'SPECIAL_TICKET_SKILL',1,1,clock_timestamp()-interval '1 hour',clock_timestamp()+interval '24 hours',clock_timestamp(),0),
 (:'equipment_lot_id'::uuid,:'order_id'::uuid,:'qa_b_id'::uuid,:'equipment_present_id'::uuid,'SPECIAL_TICKET_EQUIPMENT',1,1,clock_timestamp()-interval '48 hours',clock_timestamp()-interval '24 hours',clock_timestamp()-interval '47 hours',0);

insert into public.user_items(user_id,item_id,quantity) values
 (:'qa_b_id'::uuid,'SPECIAL_TICKET_SKILL',1),(:'qa_b_id'::uuid,'SPECIAL_TICKET_EQUIPMENT',1)
on conflict(user_id,item_id) do update set quantity=excluded.quantity,updated_at=clock_timestamp();

update public.users set cash=greatest(cash,1000),neon_diamonds=greatest(neon_diamonds,300),diamonds=greatest(diamonds,300)
where id=:'qa_b_id'::uuid;
update public.game04_player_state set state=jsonb_set(jsonb_set(
 state||jsonb_build_object('g3AcceptanceFixture',jsonb_build_object('scope','GAME04_G3_ISOLATED_ACCEPTANCE','projectRef','znakrkaazliexzwihxge','fixtureTag',:'fixture_tag')),
 '{specialGachaPoints}',coalesce(state->'specialGachaPoints','{}'),true),
 '{specialGachaPoints,character}',to_jsonb(greatest(coalesce((state#>>'{specialGachaPoints,character}')::integer,0),200)),true),
 version=version+1,updated_at=clock_timestamp() where user_id=:'qa_b_id'::uuid;
commit;

select jsonb_build_object(
 'ticketFixture',jsonb_build_object('mode','isolated-paid-lot','nonExpiredCategory','skill','expiredCategory','equipment'),
 'exchangeItemId','char_koharu_01','exchangeMismatchItemId','char_leo_01','expectedHomeBackgroundId','ssr:char_koharu_01',
 'minimumTickets',jsonb_build_object('SPECIAL_TICKET_SKILL',1,'SPECIAL_TICKET_EQUIPMENT',1),
 'minimumCash',1000,'minimumDiamonds',300,'minimumCharacterPoints',200) fixture_contract;
