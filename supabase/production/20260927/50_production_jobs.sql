-- Only GAME04 production delivery/expiry jobs; no legacy or Preview jobs.
do $$ begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='production_environment') is distinct from 'soiksqgtmcnspfedmanr' then raise exception 'WRONG_PROJECT'; end if;
end $$;
create extension if not exists pg_cron;
create or replace function public.game04_run_paid_expiry_job()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare uid uuid; processed integer:=0;
begin
 for uid in select distinct user_id from public.billing_asset_lots
 where remaining_quantity>0 and expires_at<=statement_timestamp() order by user_id limit 1000 loop
  perform public.game04_expire_paid_assets_for_user(uid); processed:=processed+1;
 end loop;
 return jsonb_build_object('processed_users',processed,'at',statement_timestamp(),'scope','production');
end $$;
revoke all on function public.game04_run_paid_expiry_job() from public,anon,authenticated;
grant execute on function public.game04_run_paid_expiry_job() to service_role;
select cron.schedule('game04-vip-due-production','* * * * *','select public.game04_deliver_due_vip();');
select cron.schedule('game04-paid-expiry-production','*/5 * * * *','select public.game04_run_paid_expiry_job();');
