-- Read-only P06 status; no user rows or secrets are returned.
begin read only;
select project_ref, environment, schema_version, maintenance,
       public_enabled, payments_enabled, jobs_enabled, g5_candidate_sha
from game04_ops.deployment_state;
select pg_database_size(current_database()) as database_bytes,
       (select count(*) from pg_stat_activity where datname=current_database()) as connections;
select id, public, file_size_limit from storage.buckets order by id;
select exists(select 1 from pg_extension where extname='pg_cron') as cron_installed;
rollback;
