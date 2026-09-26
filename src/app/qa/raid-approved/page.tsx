import { redirect, notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
export const dynamic='force-dynamic';
export default function Page(){
 if(process.env.VERCEL_ENV==='production'||(process.env.VERCEL_ENV!=='preview'&&!isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV,process.env.NODE_ENV)))notFound();
 redirect('/qa/raid-integrated');
}
