-- Reject null/missing version on explicit formal sources. Legacy unversioned sources retained.
create or replace function public.claim_present(p_present_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.presents%rowtype;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform 1 from public.users where id=uid for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select * into p from public.presents where id=p_present_id and user_id=uid for update;
 if not found or p.status<>'UNCLAIMED' or (p.expire_at is not null and p.expire_at<=clock_timestamp()) then raise exception 'Present is not claimable'; end if;
 if p.quantity<=0 then raise exception 'INVALID_PRESENT_QUANTITY'; end if;
 if p.source_kind in ('GAME04_FORMAL_REWARD','GAME04_QA') or p.source_metadata ? 'game04RewardVersion' then
  if p.source_metadata->>'game04RewardVersion' is distinct from 'APPROVED_GROWTH_V1_20260921'
   or p.source_kind is null or p.source_kind not in ('GAME04_FORMAL_REWARD','GAME04_QA')
   or p.source_metadata->>'funding' is distinct from 'free'
   or p.source_metadata ?| array['orderId','order_id','lotId','lot_id','expiresAt','expires_at'] then
    raise exception 'UNSUPPORTED_FORMAL_PRESENT_SOURCE';
  end if;
  perform public.game04_apply_formal_present(uid,p.item_id,p.quantity);
 elsif p.item_id='PLAYER_XP' then
  if p.source_kind is distinct from 'QUEST_PROGRESSION_LEGACY' then raise exception 'Unsupported XP source'; end if;
  perform public.apply_user_xp(uid,p.quantity);
 else
  perform public.grant_present_payload(uid,p.item_id,p.quantity);
 end if;
 update public.presents set status='CLAIMED',claimed_at=clock_timestamp() where id=p.id;
 return jsonb_build_object('status','success','present_id',p.id);
end $$;

