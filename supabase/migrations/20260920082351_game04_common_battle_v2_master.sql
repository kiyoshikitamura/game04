-- GAME04 dev only. Advances NEW territory hosts; no player, room, battle or reward rows changed.
-- Enemy hit SP 5 and existing skill/enemy numbers are PREVIEW PROVISIONAL, not approved balance.
create or replace function pg_temp.game04_common_preview_skills(skills jsonb) returns jsonb
language sql immutable as $f$
 select coalesce(jsonb_agg(
   skill || jsonb_build_object('effects',coalesce((select jsonb_agg(
     effect || case when effect->>'type'='heal' then jsonb_build_object('healingFormula',coalesce(effect->>'healingFormula','caster_atk_percent'))
                    when effect->>'type'='revive' then jsonb_build_object('healingFormula',coalesce(effect->>'healingFormula','target_max_hp_percent')) else '{}'::jsonb end
       || case when effect ? 'duration' then '{"carryAcrossWaves":true}'::jsonb else '{}'::jsonb end
     order by en) from jsonb_array_elements(skill->'effects') with ordinality as e(effect,en)
     where effect->>'type' not in ('poison','sp')),'[]'::jsonb))
   || case when exists(select 1 from jsonb_array_elements(skill->'effects') e where e->>'type' in ('poison','sp'))
      then '{"unsupportedReason":"継続ダメージ・SP補充は共通ルール未FIXのため新戦闘では発動保留"}'::jsonb else '{}'::jsonb end
   order by sn),'[]'::jsonb)
 from jsonb_array_elements(coalesce(skills,'[]'::jsonb)) with ordinality as s(skill,sn);
$f$;
create or replace function pg_temp.game04_common_preview_enemy(enemy jsonb) returns jsonb
language sql immutable as $f$
 select enemy || jsonb_build_object(
   'hitSpGain',coalesce(enemy->'hitSpGain','5'::jsonb),
   'skills',pg_temp.game04_common_preview_skills(enemy->'skills'),
   'passives',coalesce((select jsonb_agg(p order by n) from jsonb_array_elements(coalesce(enemy->'passives','[]'::jsonb)) with ordinality x(p,n) where p->>'stat' in ('atk','def')),'[]'::jsonb))
   || case when enemy ? 'phases' then jsonb_build_object('phases',coalesce((select jsonb_agg(
     phase || case when phase ? 'skills' then jsonb_build_object('skills',pg_temp.game04_common_preview_skills(phase->'skills')) else '{}'::jsonb end order by n)
     from jsonb_array_elements(enemy->'phases') with ordinality x(phase,n)),'[]'::jsonb)) else '{}'::jsonb end;
$f$;
do $$
declare cfg jsonb; raids jsonb;
begin
 select data into cfg from public.game04_redesign_master where key='territory' for update;
 if cfg is null then raise exception 'Territory master is missing'; end if;
 if cfg->>'status'<>'PREVIEW_PROVISIONAL' then raise exception 'Refusing to replace an approved territory master'; end if;
 select jsonb_agg(jsonb_set(r,'{enemy}',pg_temp.game04_common_preview_enemy(r->'enemy')) order by n)
 into raids from jsonb_array_elements(cfg->'raidMasters') with ordinality as x(r,n);
 cfg := cfg || jsonb_build_object(
  'version','PREVIEW_PROVISIONAL_20260920_common_v2',
  'battleRules',(cfg->'battleRules') || '{"version":"common-v2-20260920","defenseFactor":1,"maxPlayerActions":300,"initialSpRatio":0}'::jsonb,
  'raidMasters',raids);
 perform public.game04_validate_territory_master(cfg);
 update public.game04_redesign_master set data=cfg where key='territory';
end $$;
