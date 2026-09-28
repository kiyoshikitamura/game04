-- GAME04 dev only (lrgyllgzcdcphlbmkknc). New territory hosting rules only.
-- All balanceV2 numeric caps/thresholds are explicit PREVIEW_PROVISIONAL fixtures.
-- Existing rooms keep territorySnapshot; started/settled inputs, player state, rewards,
-- acquisition pools and every enemy/master numeric value remain untouched.
do $$
declare cfg jsonb;
begin
 select data into cfg from public.game04_redesign_master where key='territory' for update;
 if cfg is null then raise exception 'Territory master is missing'; end if;
 if cfg->>'status' is distinct from 'PREVIEW_PROVISIONAL' then
  raise exception 'Refusing to replace an approved territory master';
 end if;
 if coalesce(cfg->>'version','') not in ('PREVIEW_PROVISIONAL_20260920_common_v2','PREVIEW_PROVISIONAL_20260920_balance_v2') then
  raise exception 'Unexpected territory master version; review concurrent changes';
 end if;
 cfg := cfg || jsonb_build_object(
  'version','PREVIEW_PROVISIONAL_20260920_balance_v2',
  'battleRules',(cfg->'battleRules') || jsonb_build_object(
   'version','balance-v2-20260920',
   'balanceV2', $config${"status":"PREVIEW_PROVISIONAL","version":"PREVIEW_PROVISIONAL_BALANCE_V2_20260920","damageBonusCap":50,"healingBonusCap":80,"shieldBonusCap":50,"shieldHpCap":0.5,"periodicCapMultiplier":2,"lowHpThreshold":0.4,"highHpThreshold":0.7,"diversityFactors":[0,0.25,0.5,0.75,1]}$config$::jsonb));
 perform public.game04_validate_territory_master(cfg);
 update public.game04_redesign_master set data=cfg where key='territory';
end $$;
