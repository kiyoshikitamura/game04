import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const text = p => fs.readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n');
const json = p => JSON.parse(text(p));
const prefix = 'docs/product/';
const audit = prefix + 'balance_audits_20260922/';
const source = prefix + 'master_sources_20260921/';
const counts = [3,4,5,5,6,6,8,8,10,10];
const areas = ['mikawa','owari','mino','omi','kai','echigo','kyoto','izumo','satsuma','sekigahara'];
const fixed = json(audit + 'round17_effective62.json');
const refs = json(audit + 'round17_enemy_skill_check.json').rows;
const formal = json(prefix + 'masters_20260921/GAME04_DESIGN_MASTER_EXTRACT.json');
const ending = JSON.parse(text(audit + 'endgame_approved_handoff.md').match(/```json\n([\s\S]*?)\n```/)[1]);
const concepts = new Map(json(audit + 'round17_ledger.json').ledger.map(x => [x.stage, x.concept]));
const files = ['area01_03.md','area04_05.md','area06.md','area07_08.md','area09_10.md'];
for (const file of files) for (const line of text(source + file).split('\n')) {
  const row = line.split('|').slice(1,-1).map(s => s.trim());
  if (/^10-(8|9|10)$/.test(row[0]) && /^\d$/.test(row[2]) && !concepts.has(row[0])) concepts.set(row[0], row[1]);
}
const character = name => {
  const matches = formal.characters.filter(c => c.display_name_provisional === name);
  assert.equal(matches.length, 1, name);
  return matches[0].id;
};
const rewardRows = text(source + 'quest_rewards.md').split('\n').map(l => l.split('|').slice(1,-1).map(s=>s.trim()))
  .filter(r => /^\d+-\d+$/.test(r[0]) && r.length === 7);
assert.equal(rewardRows.length, 65);
const recurring = text(source + 'quest_rewards.md').split('\n').map(l => l.split('|').slice(1,-1).map(s=>s.trim()))
  .filter(r => /^\d+$/.test(r[0]) && r.length === 6 && /^\d+$/.test(r[5]));
assert.equal(recurring.length, 10);
const expItems = (kind, amount) => {
  const rewards = [];
  for (const [id, value] of [['xlarge',20000],['large',5000],['medium',1000],['small',100]]) {
    const count = Math.floor(amount/value); if (count) rewards.push({kind,id,amount:count}); amount %= value;
  }
  assert.equal(amount, 0); return rewards;
};
const tickets = ['SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'];
const bindings = [];
const stages = rewardRows.map(r => {
  const [area,index] = r[0].split('-').map(Number);
  const waves = structuredClone(fixed.stages.find(s=>s.stage===r[0])?.waves ?? ending.waves[r[0]]);
  assert.ok(waves, r[0]); assert.equal(waves.length, Number(r[1]));
  waves.forEach((wave,wi)=>wave.forEach((enemy,pi)=>{
    const reference = refs.find(ref=>ref.stage===r[0] && ref.enemyId===enemy.id);
    const characterId = reference?.characterId ?? character(enemy.name);
    assert.equal(character(enemy.name), characterId);
    assert.equal(enemy.order, pi);
    const parts=enemy.id.split('/'); assert.equal(parts[0],r[0]);assert.equal(Number(parts[1].replace('W','')),wi+1);assert.equal(Number(parts[2]),pi+1);
    const skills = enemy.skills.map((skill, i)=>({id:skill.id,lb:reference?.skills[i].lbCandidates[0] ?? 8}));
    for(const skill of skills) assert.ok(formal.skill_lb_rows.some(row=>row.design_id===skill.id && row.lb===skill.lb));
    bindings.push({stage:r[0],wave:wi+1,position:pi+1,enemyId:enemy.id,characterId,skills});
  }));
  const row = recurring[area-1].map(v=>Number(v.replaceAll(',','')));
  const firstRewards = [];
  const soulDrops = [];
  const band = area<=3?0:area<=6?1:area<=8?2:3;
  for (const [name,amount,rarity,chance,period] of [[r[2],+r[3],'SR',[.10,.15,.20,.25][band],20],[r[4],+r[5],'SSR',[.03,.05,.08,.12][band],50]]) {
    if (name==='—') {assert.equal(amount,0);continue;}
    const id=character(name); if(amount)firstRewards.push({kind:'soul',id,amount});
    soulDrops.push({kind:'soul',id,amount:1,rarity,chance,period});
  }
  r[6].split('/').map(Number).forEach((amount,i)=>{if(amount)firstRewards.push({kind:'ticket',id:tickets[i],amount});});
  if(area>=4 && index===counts[area-1])firstRewards.push({kind:'unlock_item',amount:1});
  if(r[0]==='1-1')firstRewards.push({kind:'character',id:character('前田利家'),amount:1});
  if(r[0]==='1-2')firstRewards.push({kind:'character',id:character('竹中半兵衛'),amount:1});
  return {id:`${areas[area-1]}-${index}`,designId:r[0],areaId:areas[area-1],index,name:concepts.get(r[0])??r[0],description:concepts.get(r[0])??r[0],energyCost:row[1],
    waves,firstRewards,rewards:[{kind:'cash',amount:row[2]},...expItems('character_exp_item',row[3]),...expItems('equipment_exp_item',row[4])],
    rareRewards:[...soulDrops,...tickets.map((id,i)=>({kind:'ticket',id,amount:1,chance:[.01,.02,.03,.03][band]*[.25,.5,.25][i]}))],
    soulDrops,ticketChance:[.01,.02,.03,.03][band],playerExp:row[5],encounterChance:area===1&&index<3?0:[.01,.01,.02,.04,.05,.06,.07,.08,.09,.10][area-1]};
});
assert.deepEqual(counts,areas.map(id=>stages.filter(s=>s.areaId===id).length));
const mapping = areas.flatMap((area,a)=>Array.from({length:Math.max(7,counts[a])},(_,i)=>({legacyId:i<7?`${area}-${i+1}`:null,stageId:i<counts[a]?`${area}-${i+1}`:null,designId:`${a+1}-${i+1}`,disposition:i>=counts[a]?'retain_legacy_record_no_formal_target':i>=7?'new_stage':'same_area_and_index'})));
const sources = [audit+'round17_effective62.json',audit+'round17_enemy_skill_check.json',audit+'endgame_approved_handoff.md',source+'quest_rewards.md',source+'equipment_drops.md',...files.map(f=>source+f)];
const data = {version:'APPROVED_QUEST65_ROUND17_20260922',counts,stages,bindings,mapping,sourceHashes:Object.fromEntries(sources.map(p=>[p,createHash('sha256').update(text(p)).digest('hex')]))};
fs.writeFileSync(new URL('src/domain/redesign/data/quest65.json',root),JSON.stringify(data,null,2)+'\n');
const rows=mapping.map(r=>`|${r.legacyId??'—'}|${r.stageId??'—'}|${r.designId}|${r.disposition}|`);
fs.writeFileSync(new URL('docs/development/GAME04_QUEST65_ID_MAPPING_20260922.md',root),`# 仮70面 → 正式65面 対応\n\n同じエリア・面番号の57件はIDとクリア記録を維持。新規8件。正式対象のない13件は一覧から除外するが保存記録は削除・転用しない。順序はエリア番号→面番号。各面の前面クリアで解放し、既にクリア済みの正式面は再挑戦可能。後続面のクリア済み記録で不足する前面のクリアや報酬を捏造しない。旧開始済み戦闘は旧入力・旧報酬経路を維持。\n\n正式の初回判定は同じstageIdの既存clearedStagesを使用し、旧クリアに新初回報酬を遡及付与しない。未開始0／未クリア再挑戦1／クリア済みはエリア1〜3=5、4〜7=6、8〜10=8。報酬はquest_rewards＋equipment_drops＋統合索引の上書き。\n\n|旧ID|正式ID|設計面|処理|\n|---|---|---|---|\n${rows.join('\n')}\n`);
console.log({stages:stages.length,enemies:bindings.length,mapping:mapping.length});
