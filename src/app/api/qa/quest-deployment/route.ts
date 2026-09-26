import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export function GET() {
  if (process.env.VERCEL_ENV !== 'preview') return new NextResponse(null, { status: 404 });
  return NextResponse.json({
    environment: 'preview',
    deploymentUrl: process.env.VERCEL_URL ?? null,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    supabaseProject: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unknown.invalid').hostname.split('.')[0],
  });
}
