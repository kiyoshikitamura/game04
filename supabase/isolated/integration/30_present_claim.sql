-- GAME04 isolated Preview only; retain original lot expiry and existing grant paths.
do $$ begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT'; end if;
end $$;
create or replace function public.claim_present(p_present_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); gift public.presents%rowtype; st public.game04_player_state%rowtype; path text[]; old_qty bigint; next_qty bigint; wallet bigint;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 -- Same user -> state -> receipt lock order as the GAME04 commit RPCs.
 perform 1 from public.users where id=uid for update;
 if not found then raise exception 'Player profile required';end if;
 select * into st from public.game04_player_state where user_id=uid for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED';end if;
 select * into gift from public.presents where id=p_present_id and user_id=uid for update;
 if not found or gift.status<>'UNCLAIMED' or (gift.expire_at is not null and gift.expire_at<=statement_timestamp()) then raise exception 'Present is not claimable';end if;
 if gift.quantity is null or gift.quantity<1 then raise exception 'INVALID_REWARD_QUANTITY';end if;
 if exists(select 1 from public.billing_asset_lots where present_id=gift.id and (user_id<>uid or expires_at<=statement_timestamp() or claimed_at is not null)) then raise exception 'Present is not claimable';end if;
 path:=public.game04_paid_item_path(gift.item_id);
 if gift.item_id='CASH' then
  select cash into wallet from public.users where id=uid;
  if wallet<0 or wallet>9007199254740991-gift.quantity then raise exception 'INVENTORY_LIMIT';end if;
  update public.users set cash=cash+gift.quantity where id=uid;
 elsif gift.item_id in('DIA','DIAMOND') then
  select neon_diamonds into wallet from public.users where id=uid;
  if wallet<0 or wallet>2147483647-gift.quantity then raise exception 'INVENTORY_LIMIT';end if;
  update public.users set neon_diamonds=neon_diamonds+gift.quantity where id=uid;
 elsif path is not null then
  -- New players can receive the approved growth inventory before first growth.
  -- Initialize only an absent container; never replace or convert existing balances.
  if path[1]='growthInventory' and not (st.state ? 'growthInventory') then
   st.state:=jsonb_set(st.state,'{growthInventory}','{"expItems":{"character":{"small":0,"medium":0,"large":0,"xlarge":0},"equipment":{"small":0,"medium":0,"large":0,"xlarge":0}},"carryExp":{"character":0,"equipment":0},"genericSouls":{"N":0,"R":0,"SR":0,"SSR":0},"soulSelectors":{"N":0,"R":0,"SR":0,"SSR":0}}'::jsonb);
  end if;
  if jsonb_typeof(st.state#>path) is distinct from 'number' then raise exception 'INVALID_FORMAL_INVENTORY';end if;
  old_qty:=(st.state#>>path)::bigint;next_qty:=old_qty+gift.quantity;
  if old_qty<0 or next_qty>9007199254740991 then raise exception 'INVENTORY_LIMIT';end if;
  update public.game04_player_state set state=jsonb_set(st.state,path,to_jsonb(next_qty)),version=version+1,updated_at=clock_timestamp() where user_id=uid;
 elsif gift.item_id in('SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT') then
  select quantity into old_qty from public.user_items where user_id=uid and item_id=gift.item_id for update;
  if coalesce(old_qty,0)<0 or coalesce(old_qty,0)>2147483647-gift.quantity then raise exception 'INVENTORY_LIMIT';end if;
  insert into public.user_items(user_id,item_id,quantity) values(uid,gift.item_id,gift.quantity)
  on conflict(user_id,item_id) do update set quantity=public.user_items.quantity+excluded.quantity;
 else
  -- Legacy or unsupported rewards remain unclaimed: no unapproved asset conversion.
  raise exception 'UNSUPPORTED_PRESENT_ITEM';
 end if;
 -- Mark lots only after the inventory grant so it cannot consume its own new lot.
 update public.billing_asset_lots set claimed_at=clock_timestamp() where present_id=gift.id and user_id=uid and claimed_at is null;
 update public.presents set status='CLAIMED',claimed_at=clock_timestamp() where id=gift.id;
 return jsonb_build_object('status','success','present_id',gift.id);
end $$;
create or replace function public.claim_all_presents() returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); gift record; count integer:=0;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 perform 1 from public.users where id=uid for update;
 perform 1 from public.game04_player_state where user_id=uid for update;
 for gift in select id from public.presents where user_id=uid and status='UNCLAIMED' and (expire_at is null or expire_at>statement_timestamp()) order by id for update loop
  perform public.claim_present(gift.id);count:=count+1;
 end loop;
 return jsonb_build_object('status','success','claimed_count',count);
end $$;
revoke all on function public.claim_present(uuid),public.claim_all_presents() from public,anon;
grant execute on function public.claim_present(uuid),public.claim_all_presents() to authenticated;
notify pgrst,'reload schema';
