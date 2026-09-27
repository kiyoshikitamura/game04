-- Development scheduler only; production owner must schedule separately after acceptance.
begin;
do $$ begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT';end if;
 if not exists(select 1 from pg_extension where extname='pg_cron') then raise exception 'PG_CRON_REQUIRED';end if;
 if exists(select 1 from cron.job where command ilike '%game04_deliver_due_vip%' and jobname<>'game04-vip-due-preview-qa') then raise exception 'EXISTING_VIP_SCHEDULER_REVIEW_REQUIRED';end if;
end $$;
select cron.schedule('game04-vip-due-preview-qa','* * * * *','select public.game04_deliver_due_vip();');
commit;
-- Revert execution: select cron.unschedule('game04-vip-due-preview-qa');
-- Do not remove granted schedules, wallet increments or ledger records on rollback.
