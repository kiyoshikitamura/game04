import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import { simulateBattle } from '@/domain/redesign/battle';
import { additionsBattleFixture } from '../battle-additions/fixture';
import RecoveryLive from './RecoveryLive';

export const dynamic = 'force-dynamic';
export default function Page() {
  if (process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS !== 'true' || process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.VERCEL_ENV === 'production' || (process.env.VERCEL_ENV !== 'preview' && !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV))) notFound();
  return <RecoveryLive result={simulateBattle(additionsBattleFixture('SKD008', 0, 'mixed'))} />;
}
