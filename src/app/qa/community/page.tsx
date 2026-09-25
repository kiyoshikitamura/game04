import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import CommunityFixture from './CommunityFixture';
export const dynamic = 'force-dynamic';
export default function CommunityQaPage() {
 if(process.env.VERCEL_ENV === 'production' || !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV)) notFound();
 return <CommunityFixture />;
}
