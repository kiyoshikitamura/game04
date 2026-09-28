import { NextRequest, NextResponse } from 'next/server';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS !== 'true' || process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.VERCEL_ENV === 'production' || (process.env.VERCEL_ENV !== 'preview' && !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV))) return new NextResponse(null, { status: 404 });
  const mode = request.cookies.get('g2-recovery-image')?.value;
  if (mode === 'timeout' || mode === 'timeout-once') await new Promise(resolve => setTimeout(resolve, 15_000));
  if (mode === 'error' || mode === 'timeout' || mode === 'error-once' || mode === 'timeout-once') {
    const response = new NextResponse('QA image unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    if (mode.endsWith('-once')) response.cookies.set('g2-recovery-image', 'pass', { path: '/api/qa/recovery-image', sameSite: 'strict' });
    return response;
  }
  const response = NextResponse.redirect(new URL('/creative/backgrounds/char_reiji_01.png', request.url));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
