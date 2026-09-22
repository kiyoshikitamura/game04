import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import VisualParts from './VisualParts';
export const dynamic='force-dynamic';
export default function Page(){
  if(process.env.VERCEL_ENV==='production'||!isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV,process.env.NODE_ENV))notFound();
  return <VisualParts/>;
}
