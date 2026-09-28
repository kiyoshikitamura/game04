import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import EffectHarness from './EffectHarness';
import { AudioProvider } from '@/audio/AudioProvider';
import { simulateBattle } from '@/domain/redesign/battle';
import { commonBattleFixture } from '../battle-common/fixture';
import BattleReplayFixture from '../battle-common/BattleReplayFixture';
export const dynamic = 'force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
  if(process.env.VERCEL_ENV==='production'||!isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV,process.env.NODE_ENV))notFound();
  if((await searchParams).mode==='recorded')return <main style={{height:'100dvh',overflow:'auto'}}><AudioProvider><BattleReplayFixture result={simulateBattle(commonBattleFixture('presentation'))}/></AudioProvider></main>;
  return <EffectHarness/>;
}
