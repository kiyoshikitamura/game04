-- Candidate: parent applies to GAME04 dev only after review.
-- No legacy inventory conversion; no billing function/catalog modification.
-- New formal presents require explicit server-written version/source metadata.
create or replace function public.game04_apply_formal_present(p_uid uuid,p_item text,p_qty integer)
returns void language plpgsql security definer set search_path='' as $$
declare s public.game04_player_state%rowtype; path text[]; target text; size text; r text; v jsonb; current_qty bigint; i integer;
begin
 if p_qty<=0 then raise exception 'INVALID_PRESENT_QUANTITY'; end if;
 -- Caller already holds users row lock; keep same order as commit_state.
 select * into s from public.game04_player_state where user_id=p_uid for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED'; end if;
 v:=s.state;
 if jsonb_typeof(v) is distinct from 'object' then raise exception 'INVALID_INVENTORY_STRUCTURE'; end if;
 if p_item='ENERGY_DRINK' then path:=array['energyDrinks'];
 elsif p_item='SKILL_LB_PART' then path:=array['materials','skill'];
 elsif p_item='EQUIP_LB_PART' then path:=array['materials','equipmentLb'];
 elsif p_item ~ '^(CHAR|EQUIP)_EXP_(S|M|L|XL)$' then
  target:=case when p_item like 'CHAR_%' then 'character' else 'equipment' end;
  size:=case split_part(p_item,'_',3) when 'S' then 'small' when 'M' then 'medium' when 'L' then 'large' when 'XL' then 'xlarge' end;
  path:=array['growthInventory','expItems',target,size];
 elsif p_item ~ '^(SOUL_SELECTOR|GENERIC_SOUL)_(N|R|SR|SSR)$' then
  r:=substring(p_item from '(N|R|SR|SSR)$');
  path:=array['growthInventory',case when p_item like 'SOUL_SELECTOR_%' then 'soulSelectors' else 'genericSouls' end,r];
 else raise exception 'UNSUPPORTED_FORMAL_PRESENT'; end if;
 -- Preserve all existing keys; initialize only absent structure.
 if not(v ? 'growthInventory') then v:=v||jsonb_build_object('growthInventory','{"expItems":{"character":{"small":0,"medium":0,"large":0,"xlarge":0},"equipment":{"small":0,"medium":0,"large":0,"xlarge":0}},"carryExp":{"character":0,"equipment":0},"genericSouls":{"N":0,"R":0,"SR":0,"SSR":0},"soulSelectors":{"N":0,"R":0,"SR":0,"SSR":0}}'::jsonb); end if;
 -- Never overwrite a malformed nonempty inventory or silently grant nothing.
 if array_length(path,1)>1 then
  for i in 1..array_length(path,1)-1 loop
   if jsonb_typeof(v#>path[1:i]) is distinct from 'object' then raise exception 'INVALID_INVENTORY_STRUCTURE'; end if;
  end loop;
 end if;
 if (v#>path) is not null and jsonb_typeof(v#>path) is distinct from 'number' then raise exception 'INVALID_INVENTORY_QUANTITY'; end if;
 current_qty:=coalesce((v#>>path)::bigint,0);
 if current_qty<0 or current_qty+p_qty>9007199254740991 then raise exception 'INVALID_INVENTORY_QUANTITY'; end if;
 v:=jsonb_set(v,path,to_jsonb(current_qty+p_qty),true);
 if (v#>path) is distinct from to_jsonb(current_qty+p_qty) then raise exception 'INVENTORY_GRANT_NOT_APPLIED'; end if;
 update public.game04_player_state set state=v,version=version+1,updated_at=clock_timestamp() where user_id=p_uid;
end $$;
revoke all on function public.game04_apply_formal_present(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.game04_apply_formal_present(uuid,text,integer) to service_role;

