import fs from 'node:fs';
import path from 'node:path';
import {notFound} from 'next/navigation';
import {isQaHarnessAvailable} from '@/domain/presentation/qaHarness';
import {QUEST_STAGES} from '@/domain/redesign/quests';
import {createQuestBattleInput} from '@/domain/redesign/questMaster';
import {simulateBattle} from '@/domain/redesign/battle';
import roster from '@/theme/sengoku-characters.json';
import type {BattleRules,BattleUnit} from '@/domain/redesign/types';
import Replay from './replay';
export const dynamic='force-dynamic';
export default async function Quest65Qa({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if(process.env.VERCEL_ENV==='production'||!isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV,process.env.NODE_ENV))notFound();
  const params=await searchParams;
  const evidence=JSON.parse(fs.readFileSync(path.join(process.cwd(),'docs/product/balance_audits_20260922/round17_evidence/final17-results.json'),'utf8'));
  const stage=QUEST_STAGES.find(s=>s.designId===(params.stage??'7-7'));
  const entry=evidence.results.find((r:{id:string})=>r.id===stage?.designId);
  if(!stage||!entry)notFound();
  const party:BattleUnit[]=entry.parties.main.map((unit:BattleUnit)=>({...unit,image:roster.find(c=>c.characterId===unit.id)?.imagePath??unit.image}));
  const seed=entry.runs.main.find((run:{seed:number})=>String(run.seed)===params.seed)?.seed??entry.runs.main[0].seed;
  const result=simulateBattle(createQuestBattleInput(seed,party,stage,evidence.rules as BattleRules));
  const event=typeof params.event==='string'?params.event:undefined;
  const frame=event?result.frames.findIndex(f=>f.event===event):0;
  if(event&&frame<0)notFound();
  return <Replay result={result} stage={stage.designId} seed={seed} frame={Math.max(0,frame)} paused={!!event}/>;
}
