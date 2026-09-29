import { notFound } from 'next/navigation';
import { AudioProvider } from '@/audio/AudioProvider';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import QuestInvasionPreview from './preview';

export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ viewport?: string; area?: string }> }) {
  if (process.env.VERCEL_ENV === 'production' || !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV)) notFound();
  const { viewport, area } = await searchParams;
  if (viewport === '375' || viewport === '390') {
    return <main style={{ background: '#120d09', minHeight: '100dvh' }}><iframe title="侵攻中人数の表示確認" src={`/qa/quest-invasion${area ? `?area=${encodeURIComponent(area)}` : ''}`} width={Number(viewport)} height={664} style={{ display: 'block', border: 0, margin: '0 auto' }} /></main>;
  }
  return <AudioProvider><QuestInvasionPreview areaId={area} /></AudioProvider>;
}
