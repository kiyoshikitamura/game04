#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'supabase/functions/game04-redesign-api/source.ts'),'utf8');
const sql=fs.readFileSync(path.join(root,'supabase/manual/game04_g3_gacha_kpi_connection.sql'),'utf8');
const test=fs.readFileSync(path.join(root,'supabase/tests/game04_g3_kpi_gacha_rollback.sql'),'utf8');
const admin=fs.readFileSync(path.join(root,'src/app/api/admin/kpi/v2/gameplay/route.ts'),'utf8');
const g2Gameplay=fs.readFileSync(path.join(root,'supabase/manual/game04_g2_kpi_gameplay.sql'),'utf8');
const g2Detail=fs.readFileSync(path.join(root,'supabase/manual/game04_g2_kpi_observations.sql'),'utf8');
const normalizeSql=value=>value.replace(/--[^\n]*/g,'').replace(/\s+/g,' ').trim();
for(const action of ['normal_gacha','special_gacha','special_gacha_exchange']){
 assert.match(source,new RegExp(action));assert.match(sql,new RegExp(`'${action}'`));assert.match(test,new RegExp(`'${action}'`));
}
for(const key of ['category','count','payment','diamondCost','cashCost','ticketCost','pointsAdded','pointsSpent','pointsAfter','resultSummary']) assert.match(source,new RegExp(key));
assert.match(source,/contractVersion:'game04-gameplay-v1'/);
assert.match(source,/replayed:true/);assert.match(source,/replayed:Boolean\(saved\.replayed\)/);
assert.match(source,/\} else \{\s*return new Response\(JSON\.stringify\(await responseFor\(user\.id, prior\.result\?\.receipt \?\? \{\}\)\)/s);
assert.match(sql,/return prior\|\|jsonb_build_object\('replayed',true\)/);
assert.match(sql,/return v_result\|\|jsonb_build_object\('replayed',false\)/);
for(const preserved of [
 "r.result#>>'{receipt,gameplayMeasurement,action}'='raid_claim'",
 "'raid_rewards',coalesce",
 "'restore_acknowledgements',coalesce",
 "'acquisition_subject_activity',coalesce",
 "public.kpi_is_subject_excluded(s.subject_id,q.created_at)",
 "revoke all on function public.game04_kpi_gameplay_daily",
 "grant execute on function public.game04_kpi_receipt_detail",
]) assert.ok(sql.includes(preserved),`missing preserved G2 contract: ${preserved}`);
assert.ok(!/revenue|\bjpy\b|\byen\b/i.test(sql.replace(/--[^\n]*/g,'')),'SQL must not project in-game spend as revenue');
assert.match(admin,/gacha_spend:/);assert.match(admin,/never purchase or cash-revenue/);assert.match(admin,/gacha:/);
assert.match(test,/rollback;/);assert.match(test,/classification='excluded'/);assert.match(test,/one-row replay/);
const oldGameplay=g2Gameplay.slice(g2Gameplay.indexOf('create or replace function'),g2Gameplay.indexOf('revoke all on function'));
let nextGameplay=sql.slice(sql.indexOf('create or replace function public.game04_kpi_gameplay_daily'),sql.indexOf('revoke all on function public.game04_kpi_gameplay_daily'));
nextGameplay=nextGameplay.replace(/,\s*'normal_gacha','special_gacha','special_gacha_exchange'/,'');
assert.equal(normalizeSql(nextGameplay),normalizeSql(oldGameplay),'G2 gameplay function changed outside the three-action allowlist');
const oldDetailBody=g2Detail.slice(g2Detail.indexOf('create or replace function public.game04_kpi_receipt_detail'),g2Detail.indexOf('revoke all on function public.game04_kpi_receipt_detail'));
const nextDetailBody=sql.slice(sql.indexOf('create or replace function public.game04_kpi_receipt_detail'),sql.indexOf('revoke all on function public.game04_kpi_receipt_detail'));
assert.equal(normalizeSql(nextDetailBody.slice(0,nextDetailBody.indexOf(' ), gacha_base as (')+2)),normalizeSql(oldDetailBody.slice(0,oldDetailBody.indexOf(' select jsonb_build_object'))),'G2 receipt CTEs changed before the G3 append');
console.log('PASS G3 measurement: common receipt, 3 actions, replay marker, G2 CTE/QA/roles retained, quantities/results, no revenue projection.');
