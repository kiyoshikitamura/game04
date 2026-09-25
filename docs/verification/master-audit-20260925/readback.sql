-- Run each SELECT against the explicitly recorded target project. No runtime RPC calls:
-- get_state/session/territory_context can initialize, recover energy or grant rewards.
select now() captured_at,current_database() database_name;
select key,status,data,updated_at from public.game04_redesign_master order by key;
select to_jsonb(p) row from public.billing_products p order by id;
select to_jsonb(m) row from public.canonical_item_master m order by item_id;
select p.proname,pg_get_functiondef(p.oid) definition
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname like 'game04_%' order by p.proname;
select t.tgname,c.relname table_name,p.proname,pg_get_triggerdef(t.oid) definition
from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_proc p on p.oid=t.tgfoid
where not t.tgisinternal and p.proname like 'game04_%' order by c.relname,t.tgname;
