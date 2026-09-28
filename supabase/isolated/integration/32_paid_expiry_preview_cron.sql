-- Preview QA allowlist only. No general-user expiry schedule is enabled.
do $$ begin if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT';end if;end $$;
create extension if not exists pg_cron;
select cron.schedule('game04-paid-expiry-preview-qa','* * * * *','select public.game04_run_paid_expiry_job();');
