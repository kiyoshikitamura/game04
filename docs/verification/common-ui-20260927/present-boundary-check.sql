begin;
select set_config('request.jwt.claim.sub','c2c1d890-2d72-4afd-86b3-d638c1c222e2',true);
do $test$
declare uid uuid:='c2c1d890-2d72-4afd-86b3-d638c1c222e2'; pid uuid; failed boolean; item text; st jsonb;
begin
 update users set cash=9007199254740991 where id=uid;
 insert into presents(user_id,item_id,quantity,message,source_kind) values(uid,'CASH',1,'共通UI上限検証','QA') returning id into pid;
 failed:=false;begin perform claim_present(pid);exception when others then if SQLERRM<>'INVENTORY_LIMIT' then raise;end if;failed:=true;end;
 if not failed or (select status from presents where id=pid)<>'UNCLAIMED' then raise exception 'CAP_TEST_FAILED';end if;
 update users set cash=1000000 where id=uid;
 update game04_player_state set state=state-'growthInventory',version=version+1 where user_id=uid;
 foreach item in array array['CHAR_EXP_XL','EQUIP_EXP_XL','SOUL_SELECTOR_SSR','SKILL_LB_PART','EQUIP_LB_PART','RAID_UNLOCK_TICKET','ENERGY_DRINK'] loop
  select state into st from game04_player_state where user_id=uid;
  insert into presents(user_id,item_id,quantity,message,source_kind) values(uid,item,2,'共通UI付与先検証','QA') returning id into pid;
  perform claim_present(pid);
  if (select (state#>>game04_paid_item_path(item))::bigint from game04_player_state where user_id=uid)<>coalesce((st#>>game04_paid_item_path(item))::bigint,0)+2 then raise exception 'DESTINATION_TEST_FAILED %',item;end if;
 end loop;
 insert into user_items(user_id,item_id,quantity) values(uid,'SPECIAL_TICKET_SKILL',2147483647) on conflict(user_id,item_id) do update set quantity=excluded.quantity;
 insert into presents(user_id,item_id,quantity,message,source_kind) values(uid,'SPECIAL_TICKET_SKILL',1,'共通UI上限検証','QA') returning id into pid;
 failed:=false;begin perform claim_present(pid);exception when others then if SQLERRM<>'INVENTORY_LIMIT' then raise;end if;failed:=true;end;
 if not failed then raise exception 'TICKET_CAP_TEST_FAILED';end if;
end $test$;
rollback;
