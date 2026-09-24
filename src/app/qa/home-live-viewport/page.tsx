import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';

export const dynamic = 'force-dynamic';

/** Exact-size viewport of the real app; no fixture state or app styling is injected. */
export default async function Page({ searchParams }: { searchParams: Promise<{ width?: string; height?: string }> }) {
  if (process.env.VERCEL_ENV === 'production' || (process.env.VERCEL_ENV !== 'preview' && !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV))) notFound();
  const query = await searchParams;
  const widths: Record<string, number> = { '360': 360, '375': 375, '390': 390, '512': 512 };
  const width = widths[query.width ?? ''] ?? 390;
  const height = query.height === '568' ? 568 : width === 512 ? 936 : 844;
  return <>
    <style>{`html,body{margin:0!important;padding:0!important;width:${width}px!important;min-width:${width}px!important;height:${height}px!important;min-height:${height}px!important;overflow:visible!important}body::before{display:none!important}`}</style>
    <iframe title={`実API本体 ${width}px`} src="/" width={width} height={height} style={{ display: 'block', border: 0, width, height, maxWidth: 'none' }} />
  </>;
}
