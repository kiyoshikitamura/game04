-- READ ONLY. Execute on the explicitly identified production project.
-- Match Management API project ref with deployment manifest first.
-- SQL cannot prove the Supabase project ref; database name postgres is not identity.
BEGIN READ ONLY;
SELECT current_database() AS database_name, current_setting('TimeZone') AS timezone,
       current_setting('cron.timezone', true) AS cron_timezone,
       pg_database_size(current_database()) AS database_bytes;
SELECT extname, extversion FROM pg_extension ORDER BY extname;
SELECT schemaname, tablename FROM pg_tables
 WHERE schemaname IN ('public','auth','storage','supabase_migrations')
 ORDER BY schemaname, tablename;
SELECT n.nspname AS schema_name, c.relname AS table_name, c.relrowsecurity AS rls,
       has_table_privilege('anon',c.oid,'SELECT') AS anon_select,
       has_table_privilege('anon',c.oid,'INSERT') AS anon_insert,
       has_table_privilege('anon',c.oid,'UPDATE') AS anon_update,
       has_table_privilege('authenticated',c.oid,'INSERT') AS authenticated_insert,
       has_table_privilege('authenticated',c.oid,'UPDATE') AS authenticated_update
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname;
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets ORDER BY id;
SELECT bucket_id,count(*) AS object_count FROM storage.objects GROUP BY bucket_id ORDER BY bucket_id;
SELECT count(*) AS auth_user_count FROM auth.users;
COMMIT;

-- Run separately only after corresponding relation is confirmed above.
-- SELECT version,name FROM supabase_migrations.schema_migrations ORDER BY version;
-- SELECT jobid,jobname,schedule,active FROM cron.job ORDER BY jobid;
-- SELECT count(*) AS game_user_count FROM public.users;
-- No cron command bodies, secrets, identities, or user records are selected.
