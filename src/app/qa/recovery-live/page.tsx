import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import { simulateBattle } from '@/domain/redesign/battle';
import { additionsBattleFixture } from '../battle-additions/fixture';
import RecoveryLive from './RecoveryLive';

export const dynamic = 'force-dynamic';
export default function Page() {
  if (process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS !== 'true' || process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.VERCEL_ENV === 'production' || (process.env.VERCEL_ENV !== 'preview' && !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV))) notFound();
  const input = additionsBattleFixture('SKD008', 0, 'mixed');
  // This legacy visual fixture predates the required enemy starting-SP field.
  input.waves = input.waves.map(wave => wave.map(enemy => ({ ...enemy, initialSp: 0 })));
  return <RecoveryLive result={simulateBattle(input)} />;
}
