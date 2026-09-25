import { notFound } from 'next/navigation';
import { AudioProvider } from '@/audio/AudioProvider';
import TutorialPreview from './TutorialPreview';

export const dynamic = 'force-dynamic';
export default async function TutorialPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production') notFound();
  const params = await searchParams;
  if (params.viewport === '360' || params.viewport === '390') {
    return <main style={{ minHeight: '100dvh', background: '#130e09', padding: 12, color: '#f4e4c9' }}>
      <p>スマートフォン幅の確認：{params.viewport}px</p>
      <iframe title="チュートリアルのスマートフォン表示" src="/qa/tutorial" style={{ display: 'block', width: Number(params.viewport), height: 568, border: '1px solid #b28d51', margin: '0 auto' }} />
    </main>;
  }
  return <AudioProvider><TutorialPreview /></AudioProvider>;
}

