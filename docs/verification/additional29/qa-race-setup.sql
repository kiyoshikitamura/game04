-- Test-only clone of the exact grant implementation, with a private QA campaign and recipient guard.
insert into public.game04_release_campaigns(id,enabled,starts_at,ends_at,claim_policy_approved,claim_days,amount) values('game04-qa-race-20260927',true,statement_timestamp()-interval '1 minute','2026-12-31 15:00+00',true,90,300);
create function public.game04_qa_release_race(p_user_id uuid) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare c public.game04_release_campaigns; gift uuid; current_time_ timestamptz:=statement_timestamp();
begin
 if p_user_id<>'99d27360-1f5a-4ef2-869e-1ee697757953'::uuid then raise exception 'Dedicated QA only';end if;
 -- Same user-before-gift lock order as claim_present; concurrent delivery is idempotent.
 perform 1 from public.users where id=p_user_id for update;
 if not found then return null; end if;
 select * into c from public.game04_release_campaigns where id='game04-qa-race-20260927';
 if not c.enabled or not c.claim_policy_approved or c.starts_at is null or current_time_<c.starts_at or current_time_>=c.ends_at then return null; end if;
 select present_id into gift from public.game04_release_campaign_grants where campaign_id=c.id and user_id=p_user_id;
 if gift is not null then return gift; end if;
 gift:=gen_random_uuid();
 insert into public.presents(id,user_id,item_id,quantity,message,status,expire_at,source_kind,source_key,source_metadata)
 values(gift,p_user_id,'DIAMOND',c.amount,'リリース記念！輝石300個プレゼント','UNCLAIMED',
 case when c.claim_days is null then null else current_time_+make_interval(days=>c.claim_days) end,
 'GAME04_FORMAL_REWARD',c.id,jsonb_build_object('campaignId',c.id,'funding','FREE'));
 insert into public.game04_release_campaign_grants(campaign_id,user_id,present_id) values(c.id,p_user_id,gift);
 return gift;
end $$;
revoke all on function public.game04_qa_release_race(uuid) from public,anon,authenticated;
grant execute on function public.game04_qa_release_race(uuid) to service_role;
