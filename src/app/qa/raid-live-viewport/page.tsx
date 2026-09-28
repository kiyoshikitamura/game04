import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';

export const dynamic = 'force-dynamic';

/** Real application viewport only: no fixtures, callbacks, styles or state injected into the app. */
export default async function Page({ searchParams }: { searchParams: Promise<{ width?: string }> }) {
  if (process.env.VERCEL_ENV === 'production' || (process.env.VERCEL_ENV !== 'preview' && !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV))) notFound();
  const { width: requested } = await searchParams;
  const width = requested === '1536' ? 1536 : 390;
  const height = width === 390 ? 844 : 936;
  return <>
    <style>{`html,body{margin:0!important;padding:0!important;width:${width}px!important;min-width:${width}px!important;height:${height}px!important;min-height:${height}px!important;overflow:visible!important}body::before{display:none!important}`}</style>
    <iframe title={`実API本体 ${width}px`} src="/" width={width} height={height} style={{ display: 'block', border: 0, width, height, maxWidth: 'none' }} />
  </>;
}
