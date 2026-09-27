-- All inserted rows are rolled back inside an exception subtransaction.
do $test$
declare u uuid:=gen_random_uuid(); u2 uuid:=gen_random_uuid(); qa uuid:=gen_random_uuid();
 r1 uuid:=gen_random_uuid(); r2 uuid:=gen_random_uuid(); rq uuid:=gen_random_uuid();
 sid uuid; s jsonb:=$stages$[{"id":"mikawa-1","design_id":"1-1","name":"初陣の野"},{"id":"mikawa-2","design_id":"1-2","name":"街道の関所"},{"id":"mikawa-3","design_id":"1-3","name":"夕映えの陣"},{"id":"mikawa-4","design_id":"1-4","name":"影走る古道"},{"id":"mikawa-5","design_id":"1-5","name":"三河の勝鬨"},{"id":"owari-1","design_id":"2-1","name":"朝霧の街道"},{"id":"owari-2","design_id":"2-2","name":"里境の狼煙"},{"id":"owari-3","design_id":"2-3","name":"月下の砦"},{"id":"owari-4","design_id":"2-4","name":"尾張の旗風"},{"id":"owari-5","design_id":"2-5","name":"桶狭間への道"},{"id":"mino-1","design_id":"3-1","name":"川霧の渡し"},{"id":"mino-2","design_id":"3-2","name":"稲穂の小径"},{"id":"mino-3","design_id":"3-3","name":"山あいの影"},{"id":"mino-4","design_id":"3-4","name":"峠に立つ旗"},{"id":"mino-5","design_id":"3-5","name":"美濃の夕嵐"},{"id":"omi-1","design_id":"4-1","name":"湖畔の番所"},{"id":"omi-2","design_id":"4-2","name":"湖風の往来"},{"id":"omi-3","design_id":"4-3","name":"宵の水辺"},{"id":"omi-4","design_id":"4-4","name":"山門のかがり火"},{"id":"omi-5","design_id":"4-5","name":"近江の夜明け"},{"id":"kai-1","design_id":"5-1","name":"赤き旗の道"},{"id":"kai-2","design_id":"5-2","name":"山裾の陣屋"},{"id":"kai-3","design_id":"5-3","name":"谷間の渡り"},{"id":"kai-4","design_id":"5-4","name":"峰をゆく風"},{"id":"kai-5","design_id":"5-5","name":"夕立の山路"},{"id":"kai-6","design_id":"5-6","name":"甲斐の遠雷"},{"id":"echigo-1","design_id":"6-1","name":"霧深き境"},{"id":"echigo-2","design_id":"6-2","name":"雪解けの道"},{"id":"echigo-3","design_id":"6-3","name":"杉林の分かれ道"},{"id":"echigo-4","design_id":"6-4","name":"峠の残雪"},{"id":"echigo-5","design_id":"6-5","name":"暮色の峡谷"},{"id":"echigo-6","design_id":"6-6","name":"越後の白嵐"},{"id":"kyoto-1","design_id":"7-1","name":"洛外の騒ぎ"},{"id":"kyoto-2","design_id":"7-2","name":"御門のかがり火"},{"id":"kyoto-3","design_id":"7-3","name":"石垣に落ちる影"},{"id":"kyoto-4","design_id":"7-4","name":"花散る辻"},{"id":"kyoto-5","design_id":"7-5","name":"夜半の鐘"},{"id":"kyoto-6","design_id":"7-6","name":"灯の消えた通り"},{"id":"kyoto-7","design_id":"7-7","name":"暁を待つ都"},{"id":"kyoto-8","design_id":"7-8","name":"京を渡る風"},{"id":"izumo-1","design_id":"8-1","name":"海風の街道"},{"id":"izumo-2","design_id":"8-2","name":"松林の狼煙"},{"id":"izumo-3","design_id":"8-3","name":"入江に立つ旗"},{"id":"izumo-4","design_id":"8-4","name":"暮れゆく古道"},{"id":"izumo-5","design_id":"8-5","name":"社のかがり火"},{"id":"izumo-6","design_id":"8-6","name":"雨上がりの坂"},{"id":"izumo-7","design_id":"8-7","name":"雲間の月"},{"id":"izumo-8","design_id":"8-8","name":"出雲の朝凪"},{"id":"satsuma-1","design_id":"9-1","name":"南道の関"},{"id":"satsuma-2","design_id":"9-2","name":"入り江の砲声"},{"id":"satsuma-3","design_id":"9-3","name":"宵闇の陣屋"},{"id":"satsuma-4","design_id":"9-4","name":"鉄火の街道"},{"id":"satsuma-5","design_id":"9-5","name":"山路の密書"},{"id":"satsuma-6","design_id":"9-6","name":"野に立つ傾奇旗"},{"id":"satsuma-7","design_id":"9-7","name":"浜辺の旗影"},{"id":"satsuma-8","design_id":"9-8","name":"紅に染まる野"},{"id":"satsuma-9","design_id":"9-9","name":"霧の軍議"},{"id":"satsuma-10","design_id":"9-10","name":"薩摩の大かがり"},{"id":"sekigahara-1","design_id":"10-1","name":"霧中の布陣"},{"id":"sekigahara-2","design_id":"10-2","name":"野を裂く狼煙"},{"id":"sekigahara-3","design_id":"10-3","name":"幾重の旗影"},{"id":"sekigahara-4","design_id":"10-4","name":"夜襲の足音"},{"id":"sekigahara-5","design_id":"10-5","name":"暁の先陣"},{"id":"sekigahara-6","design_id":"10-6","name":"決戦前夜"},{"id":"sekigahara-7","design_id":"10-7","name":"紅の誓い"},{"id":"sekigahara-8","design_id":"10-8","name":"葵の本陣"},{"id":"sekigahara-9","design_id":"10-9","name":"黄金の本陣"},{"id":"sekigahara-10","design_id":"10-10","name":"天下の行方"}]$stages$::jsonb; before_data jsonb; d jsonb; m jsonb; v jsonb; baseline bigint;
begin
 begin
  before_data:=public.game04_kpi_dashboard_v1('2001-01-01','2001-02-28','monthly',s,17);
  select (x->>'executions')::bigint into baseline from jsonb_array_elements(before_data->'stages') x where x->>'id'=s->0->>'id';
  insert into auth.users(id) values(u),(u2),(qa);
  insert into public.users(id,username,created_at) values(u,'KPI検証A','2001-01-01 00:00+09'),(u2,'KPI検証B','2001-01-01 00:00+09'),(qa,'KPI検証Q','2001-01-01 00:00+09');
  insert into public.kpi_subjects(source_user_id,registered_at,registration_type) values(qa,'2001-01-01 00:00+09','unknown') on conflict(source_user_id) do nothing;
  select subject_id into sid from public.kpi_subjects where source_user_id=qa;
  insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason) values(sid,'qa','2000-01-01','KPI rollback fixture');
  insert into public.game04_battles(id,user_id,kind,target_id,seed,input,result,status,created_at,settled_at)
  select gen_random_uuid(),case when n=6 then qa else u end,'quest',s->0->>'id',1,'{}',
   case when n in(1,2,6) then '{"battle":{"outcome":"win"}}'::jsonb when n=3 then '{"battle":{"outcome":"lose"}}'::jsonb when n=5 then '{"retired":true}'::jsonb else null end,
   case when n=4 then 'started' else 'settled' end,'2001-01-02 00:00+09',case when n=4 then null else '2001-01-02 00:01+09'::timestamptz end
   from generate_series(1,6) n;
  insert into public.game04_raid_rooms(id,state,created_at,updated_at) values
   (r1,jsonb_build_object('id',r1,'ownerId',u,'status','defeated','raidSnapshot',jsonb_build_object('type','encounter')),'2001-01-31 14:59:00Z','2001-02-03 00:00+09'),
   (r2,jsonb_build_object('id',r2,'ownerId',u,'status','defeated','territorySnapshot',jsonb_build_object('raidMaster',jsonb_build_object('type','unlock'))),'2001-01-31 15:00:00Z','2001-02-03 00:00+09'),
   (rq,jsonb_build_object('id',rq,'ownerId',qa,'status','active','raidSnapshot',jsonb_build_object('type','encounter')),'2001-01-30 00:00+09','2001-01-30 00:00+09');
  insert into public.game04_requests(user_id,request_id,result,created_at) values
   (u,gen_random_uuid(),jsonb_build_object('room',jsonb_build_object('id',r1,'status','defeated')),'2001-01-31 14:59:30Z'),
   (u,gen_random_uuid(),jsonb_build_object('room',jsonb_build_object('id',r1,'status','defeated')),'2001-02-02 00:00+09'),
   (u,gen_random_uuid(),jsonb_build_object('room',jsonb_build_object('id',r2,'status','active')),'2001-02-01 01:00+09'),
   (u,gen_random_uuid(),jsonb_build_object('room',jsonb_build_object('id',r2,'status','defeated')),'2001-02-02 00:00+09'),
   (qa,gen_random_uuid(),jsonb_build_object('room',jsonb_build_object('id',rq,'status','defeated')),'2001-01-31 00:00+09');
  insert into public.game04_battles(id,user_id,kind,target_id,seed,input,status,created_at)
   select gen_random_uuid(),case when n=5 then u2 when n=6 then qa else u end,'raid',case when n=7 then r2 else r1 end::text,1,'{}','started',
    case when n in(1,2) then '2001-01-30 00:00+09'::timestamptz when n=3 then '2001-01-31 00:00+09'::timestamptz else '2001-02-01 00:00+09'::timestamptz end
   from generate_series(1,7) n;
  d:=public.game04_kpi_dashboard_v1('2001-01-01','2001-02-28','daily',s,17);
  m:=public.game04_kpi_dashboard_v1('2001-01-01','2001-02-28','monthly',s,17);
  if jsonb_array_length(d->'stages')<>68 then raise exception 'Stage count failed';end if;
  select x into v from jsonb_array_elements(d->'stages') x where x->>'id'=s->0->>'id';
  if (v->>'executions')::bigint-baseline<>5 then raise exception 'Retry/QA executions failed: %',v;end if;
  if (v->>'clears')::bigint-(select (x->>'clears')::bigint from jsonb_array_elements(before_data->'stages') x where x->>'id'=s->0->>'id')<>2 then raise exception 'Win/retire counts failed';end if;
  for v in select x from jsonb_array_elements(m->'raids') x loop
   if v->>'key'='2001-01' and v->>'kind'='encounter' and ((v->>'hosted')::int<>1 or (v->>'defeated')::int<>1 or (v->>'participants')::int<>1) then raise exception 'Monthly dedup/QA/January defeat failed: %',v;end if;
   if v->>'key'='2001-02' and v->>'kind'='encounter' and ((v->>'hosted')::int<>0 or (v->>'defeated')::int<>0 or (v->>'participants')::int<>2) then raise exception 'Claim double count / month dedup failed: %',v;end if;
   if v->>'key'='2001-02' and v->>'kind'='unlock' and ((v->>'hosted')::int<>1 or (v->>'defeated')::int<>1 or (v->>'participants')::int<>1) then raise exception 'Unlock snapshot/JST rollover failed: %',v;end if;
  end loop;
  select x into v from jsonb_array_elements(d->'raids') x where x->>'key'='2001-01-30' and x->>'kind'='encounter';
  if (v->>'participants')::int<>1 then raise exception 'Daily dedup failed';end if;
  select x into v from jsonb_array_elements(d->'raids') x where x->>'key'='2001-02-01' and x->>'kind'='unlock';
  if (v->>'hosted')::int<>1 or (v->>'defeated')::int<>0 then raise exception 'JST boundary/intermediate defeat failed';end if;
  select x into v from jsonb_array_elements(d->'stages') x where x->>'id'=s->67->>'id';
  if (v->>'executions')::int=0 and v->'clear_rate'<>'null'::jsonb then raise exception 'Empty rate failed';end if;
  raise exception using errcode='P9999',message='fixtures passed; rollback';
 exception when sqlstate 'P9999' then null;
 end;
 if exists(select 1 from public.users where id in(u,u2,qa)) then raise exception 'Fixture rollback failed';end if;
end $test$;
select 'PASS: 68 stages; retries/wins/retire/QA; daily/monthly distinct participants; JST boundary; immutable defeat receipt; separate raid kinds; zero denominator; fixture rollback' as result;
