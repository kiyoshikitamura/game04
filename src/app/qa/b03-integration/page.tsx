import {notFound} from 'next/navigation';
import {simulateBattle} from '@/domain/redesign/battle';
import {commonBattleFixture} from '../battle-common/fixture';
import IntegrationBattle from './IntegrationBattle';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
  if(process.env.NODE_ENV!=='development')notFound();
  const p=await searchParams, count=Math.max(1,Math.min(3,Number(p.enemies)||1));
  const input=commonBattleFixture('burst');
  input.party.forEach(unit=>{unit.skills=[...input.party[0].skills];});
  const enemy=input.waves[0][0];
  input.waves=[Array.from({length:count},(_,i)=>({...enemy,id:`qa-enemy-${i}`,order:i}))];
  if(p.play==='1')input.waves=Array.from({length:p.multi==='1'?2:1},(_,i)=>[{...enemy,id:`qa-wave-${i}`,stats:{...enemy.stats,hp:10}}]);
  return <IntegrationBattle result={simulateBattle(input)} play={p.play==='1'}/>;
}
