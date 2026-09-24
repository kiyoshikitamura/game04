import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';

export const dynamic = 'force-dynamic';

/** 本体を実寸表示するだけのPreview用枠。fixture・状態注入は行わない。 */
export default async function Page({ searchParams }: { searchParams: Promise<{ width?: string; height?: string }> }) {
  if (process.env.VERCEL_ENV === 'production' || (process.env.VERCEL_ENV !== 'preview' && !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV))) notFound();
  const requested = await searchParams;
  const width = requested.width === '375' ? 375 : requested.width === '300' ? 300 : 390;
  const height = requested.height === '640' ? 640 : 844;
  return <>
    <style>{`html,body{margin:0!important;padding:0!important;width:${width}px!important;min-width:${width}px!important;height:${height}px!important;min-height:${height}px!important;overflow:visible!important}body::before{display:none!important}`}</style>
    <iframe title={`出陣 実API本体 ${width}×${height}`} src="/" width={width} height={height} style={{ display: 'block', border: 0, width, height, maxWidth: 'none' }} />
    <details style={{ width, color: '#d8bd89', fontSize: 12, overflowWrap: 'anywhere' }}>
      <summary>Preview配信情報</summary>
      <p>SHA: {process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'}</p>
      <p>Deployment: {process.env.VERCEL_DEPLOYMENT_ID ?? 'local'}</p>
      {process.env.VERCEL_URL && <a href={`https://${process.env.VERCEL_URL}`}>https://{process.env.VERCEL_URL}</a>}
    </details>
  </>;
}
