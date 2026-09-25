-- Parent only: execute after candidate installation, then ROLLBACK mandatory.
begin;
do $$
declare uid uuid:='d6dabf02-3eb2-430e-8352-561f8d735469'; pid uuid; bad uuid; other uuid:=gen_random_uuid(); before_s jsonb; after_s jsonb; before_v bigint; n integer; item text; cnt integer:=0; denied boolean; path text[]; expected bigint; old_items jsonb;
begin
 if not exists(select 1 from public.users where id=uid) then raise exception 'DEDICATED_QA_USER_MISSING'; end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 select state,version into before_s,before_v from public.game04_player_state where user_id=uid;
 select coalesce(jsonb_agg(to_jsonb(t) order by item_id),'[]'::jsonb) into old_items from public.user_items t where user_id=uid;
 -- No existing inbox may be part of this fixture's bulk claim.
 if exists(select 1 from public.presents where user_id=uid and status='UNCLAIMED') then raise exception 'QA_INBOX_NOT_EMPTY'; end if;
 foreach item in array array['ENERGY_DRINK','SKILL_LB_PART','EQUIP_LB_PART','CHAR_EXP_S','CHAR_EXP_M','CHAR_EXP_L','CHAR_EXP_XL','EQUIP_EXP_S','EQUIP_EXP_M','EQUIP_EXP_L','EQUIP_EXP_XL','SOUL_SELECTOR_N','SOUL_SELECTOR_R','SOUL_SELECTOR_SR','SOUL_SELECTOR_SSR','GENERIC_SOUL_N','GENERIC_SOUL_R','GENERIC_SOUL_SR','GENERIC_SOUL_SSR'] loop
  pid:=gen_random_uuid();
  insert into public.presents(id,user_id,item_id,quantity,status,source_kind,source_metadata) values(pid,uid,item,2,'UNCLAIMED','GAME04_QA','{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free"}');
  if item='ENERGY_DRINK' then path:=array['energyDrinks'];
  elsif item='SKILL_LB_PART' then path:=array['materials','skill'];
  elsif item='EQUIP_LB_PART' then path:=array['materials','equipmentLb'];
  elsif item like '%_EXP_%' then path:=array['growthInventory','expItems',case when item like 'CHAR_%' then 'character' else 'equipment' end,case split_part(item,'_',3) when 'S' then 'small' when 'M' then 'medium' when 'L' then 'large' else 'xlarge' end];
  else path:=array['growthInventory',case when item like 'SOUL_SELECTOR_%' then 'soulSelectors' else 'genericSouls' end,substring(item from '(N|R|SR|SSR)$')]; end if;
  expected:=coalesce((before_s#>>path)::bigint,0)+2;
  perform public.claim_present(pid); cnt:=cnt+1;
  if (select (state#>>path)::bigint from public.game04_player_state where user_id=uid) is distinct from expected then raise exception 'ID_MAPPING_MISMATCH %',item; end if;
  denied:=false;
  begin perform public.claim_present(pid); exception when others then denied:=true; end;
  if not denied then raise exception 'DUPLICATE_ACCEPTED'; end if;
 end loop;
 if (select coalesce(jsonb_agg(to_jsonb(t) order by item_id),'[]'::jsonb) from public.user_items t where user_id=uid)<>old_items then raise exception 'LEGACY_ITEM_CHANGED'; end if;
 select state into after_s from public.game04_player_state where user_id=uid;
 if (select version from public.game04_player_state where user_id=uid)<>before_v+19 then raise exception 'VERSION_MISMATCH'; end if;
 if (after_s->>'energyDrinks')::integer<>coalesce((before_s->>'energyDrinks')::integer,0)+2 then raise exception 'DRINK_MISMATCH'; end if;
 if (after_s#>>'{growthInventory,expItems,character,medium}')::integer<>coalesce((before_s#>>'{growthInventory,expItems,character,medium}')::integer,0)+2 then raise exception 'FORMAL_EXP_MISMATCH'; end if;
 if (after_s#>>'{growthInventory,soulSelectors,SSR}')::integer<>coalesce((before_s#>>'{growthInventory,soulSelectors,SSR}')::integer,0)+2 then raise exception 'SELECTOR_MISMATCH'; end if;
 if (after_s#>>'{growthInventory,genericSouls,SR}')::integer<>coalesce((before_s#>>'{growthInventory,genericSouls,SR}')::integer,0)+2 then raise exception 'GENERIC_SOUL_MISMATCH'; end if;
 -- A stale action cannot overwrite BOX receipt inventory.
 denied:=false;
 begin perform public.game04_commit_state(uid,before_v,before_s,0,0,gen_random_uuid()); exception when serialization_failure then denied:=true; end;
 if not denied then raise exception 'STALE_CAS_ACCEPTED'; end if;
 -- Bulk atomic rollback: valid + unsupported formal paid present.
 pid:=gen_random_uuid();bad:=gen_random_uuid();
 insert into public.presents(id,user_id,item_id,quantity,status,source_kind,source_metadata) values
 (pid,uid,'ENERGY_DRINK',1,'UNCLAIMED','GAME04_QA','{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free"}'),
 (bad,uid,'ENERGY_DRINK',1,'UNCLAIMED','GAME04_QA','{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"paid"}');
 denied:=false;
 begin perform public.claim_all_presents(); exception when others then denied:=true; end;
 if not denied or exists(select 1 from public.presents where id in(pid,bad) and status<>'UNCLAIMED') or (select state from public.game04_player_state where user_id=uid)<>after_s then raise exception 'BULK_FAILED_NONCONSUMPTION'; end if;
 delete from public.presents where id=bad;
 if (public.claim_all_presents()->>'claimed_count')::integer<>1 then raise exception 'BULK_COUNT'; end if;
 if (public.claim_all_presents()->>'claimed_count')::integer<>0 then raise exception 'BULK_DUPLICATE'; end if;
 -- Identity and deprecated signatures keep caller constraint.
 denied:=false;
 begin perform public.claim_present(other,pid); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'OTHER_USER_ACCEPTED'; end if;
 -- Expired receipt remains untouched.
 bad:=gen_random_uuid();
 insert into public.presents(id,user_id,item_id,quantity,status,expire_at,source_kind,source_metadata) values(bad,uid,'ENERGY_DRINK',1,'UNCLAIMED',now()-interval '1 second','GAME04_QA','{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free"}');
 denied:=false;
 begin perform public.claim_present(bad); exception when others then denied:=true; end;
 if not denied then raise exception 'EXPIRED_ACCEPTED'; end if;
 raise notice 'PASS: 19 mappings, single/bulk dedup, stale CAS, bulk failed nonconsumption, identity, expiry';
end $$;
rollback;
