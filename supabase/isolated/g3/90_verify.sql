-- Fail-closed structural verification after all schema/function/master files, before QA draws.
do $$
declare marker jsonb; bad integer;
begin
 select data into marker from public.game04_redesign_master where key='isolated_environment';
 if marker#>>'{scope}' is distinct from 'GAME04_G3_ISOLATED_ACCEPTANCE'
  or marker#>>'{projectRef}' is distinct from 'znakrkaazliexzwihxge' then raise exception 'ISOLATED_PROJECT_MARKER_MISMATCH';end if;
 if exists(select 1 from public.users where id not in (select source_user_id from public.kpi_subjects where source_user_id is not null)) then
  raise exception 'UNCLASSIFIED_APPLICATION_USER_PRESENT';end if;
 select count(*) into bad from public.kpi_subjects s where s.source_user_id is not null and not exists(
  select 1 from public.kpi_account_classification_periods p where p.subject_id=s.subject_id and p.classification='qa'
  and p.valid_from<=now() and (p.valid_to is null or now()<p.valid_to));
 if bad<>0 then raise exception 'QA_CLASSIFICATION_MISSING';end if;
 if (select count(*) from public.game04_redesign_master where key='formal_gacha' and status='GAME04_G3_FORMAL_20260925')<>1 then
  raise exception 'FORMAL_GACHA_MASTER_MISSING';end if;
 if (select count(*) from public.gacha_items_master where gacha_id like '%_NORMAL')<>292 then raise exception 'NORMAL_POOL_COUNT_MISMATCH';end if;
 if (select count(*) from public.gacha_items_master where gacha_id like '%_SPECIAL')<>233 then raise exception 'SPECIAL_POOL_COUNT_MISMATCH';end if;
 if to_regprocedure('public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb)') is null
  or to_regprocedure('public.game04_get_session_state(uuid,jsonb)') is null
  or to_regprocedure('public.initialize_current_player(text,text)') is null
  or to_regprocedure('public.get_current_onboarding_state()') is null
  or to_regprocedure('public.game04_kpi_gameplay_daily(timestamptz,timestamptz)') is null
  or to_regprocedure('public.kpi_is_subject_excluded(uuid,timestamptz)') is null then raise exception 'REQUIRED_RPC_MISSING';end if;
 if to_regprocedure('public.game04_prepare_isolated_g3_qa(uuid,uuid)') is not null
  or to_regprocedure('public.game04_finalize_isolated_g3_qa(uuid,text)') is not null then raise exception 'FIXTURE_WRITER_STILL_INSTALLED';end if;
 if exists(select 1 from information_schema.routine_privileges where routine_schema='public'
  and routine_name in ('game04_commit_gacha','game04_get_session_state') and grantee in ('anon','authenticated')) then
  raise exception 'PRIVILEGED_RPC_EXPOSED';end if;
 if exists(select 1 from pg_extension where extname='pg_cron') then raise exception 'CRON_EXTENSION_MUST_REMAIN_DISABLED';end if;
end $$;

select key,status,md5(data::text) data_md5 from public.game04_redesign_master
where key in ('isolated_environment','runtime','acquisition_conversion','formal_gacha') order by key;
select p.proname,pg_get_function_identity_arguments(p.oid) args,p.prosecdef,
 md5(pg_get_functiondef(p.oid)) installed_definition_md5
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('game04_get_session_state','game04_commit_growth_state','game04_commit_gacha',
 'billing_apply_lot_delta','game04_kpi_gameplay_daily','game04_kpi_receipt_detail') order by p.proname;
