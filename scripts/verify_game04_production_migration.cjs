const fs=require('fs');
const {PGlite}=require(process.env.GAME04_PGLITE||'@electric-sql/pglite');
(async()=>{
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema extensions;
 create table auth.users(id uuid primary key,email text,is_anonymous boolean,email_confirmed_at timestamptz,encrypted_password text,raw_user_meta_data jsonb,raw_app_meta_data jsonb,created_at timestamptz default now());
 create table auth.identities(id uuid, user_id uuid, provider text, identity_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select '{}'::jsonb$$;
 create function auth.role() returns text language sql stable as $$select 'service_role'::text$$;
 create function extensions.gen_random_uuid() returns uuid language sql volatile as $$select pg_catalog.gen_random_uuid()$$;`);
 const folder='supabase/production/20260927';
 const manifest=JSON.parse(fs.readFileSync(folder+'/manifest.json','utf8'));
 for(const entry of manifest){
  let sql=fs.readFileSync(folder+'/'+entry.file,'utf8').replace(/create extension if not exists pgcrypto with schema extensions;/ig,'');
  try{await db.exec(sql);console.log('PASS '+entry.file);}catch(e){console.error(JSON.stringify({file:entry.file,message:e.message,detail:e.detail,position:e.position,context:e.where}));process.exitCode=1;await db.close();return;}
 }
 console.log(JSON.stringify((await db.query("select count(*) as tables from pg_tables where schemaname='public'")).rows));
 console.log(JSON.stringify((await db.query("select key,md5(data::text) data_md5 from public.game04_redesign_master order by key")).rows));
 const unprotected=(await db.query("select tablename from pg_tables where schemaname='public' and not rowsecurity")).rows;
 if(unprotected.length)throw new Error('Tables missing RLS: '+JSON.stringify(unprotected));
 const funcs=(await db.query("select proname,pg_get_function_identity_arguments(p.oid) args from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by proname")).rows;
 fs.writeFileSync(folder+'/verified-functions.json',JSON.stringify(funcs,null,2)+'\n');
 if(funcs.some(f=>/prepare_isolated|finalize_isolated/.test(f.proname)))throw new Error('QA fixture function imported');
 if((await db.query('select count(*)::int n from public.users')).rows[0].n!==0)throw new Error('User data imported');
 await db.close();
})();
