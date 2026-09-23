import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Public build identity only. Never exposes configuration or credentials. */
export function GET() {
  if (process.env.VERCEL_ENV !== 'preview') return new NextResponse(null, { status: 404 });
  return NextResponse.json({
    url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    environment: 'preview',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
