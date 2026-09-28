-- Apply ONLY to game04-prod (soiksqgtmcnspfedmanr), after production UI rollout.
-- No external portal key is stored in SQL, Cron, Vault or its request queue.
create extension if not exists pg_net with schema extensions;
do $$ begin
  if not exists(select 1 from vault.secrets where name='game04_portal_job_token') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'game04_portal_job_token');
  end if;
end $$;
select cron.schedule('game04-pochi-online-production','*/5 * * * *', $job$
  select net.http_post(
    url := 'https://soiksqgtmcnspfedmanr.supabase.co/functions/v1/game04-portal-online',
    headers := jsonb_build_object('Content-Type','application/json','x-game04-job-token',
      (select decrypted_secret from vault.decrypted_secrets where name='game04_portal_job_token')),
    body := jsonb_build_object('scheduled_at',clock_timestamp()),
    timeout_milliseconds := 25000
  );
$job$);
