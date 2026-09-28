import { notFound } from 'next/navigation';
import { AudioProvider } from '@/audio/AudioProvider';
import TutorialTrailerPreview from './TutorialTrailerPreview';

export const dynamic = 'force-dynamic';

export default async function TutorialTrailerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production') notFound();
  const params = await searchParams;
  if (params.viewport === '360' || params.viewport === '390') {
    return <main style={{ minHeight: '100dvh', background: '#130e09', padding: 12, color: '#f4e4c9' }}>
      <p>トレイラー確認：{params.viewport}px</p>
      <iframe title="チュートリアルトレイラー" src="/qa/tutorial-trailer" style={{ display: 'block', width: Number(params.viewport), height: 700, border: '1px solid #b28d51', margin: '0 auto' }} />
    </main>;
  }
  return <AudioProvider><TutorialTrailerPreview /></AudioProvider>;
}
