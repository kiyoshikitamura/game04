import { notFound } from 'next/navigation';
import Harness from './Harness';
export default async function Page({searchParams}: {searchParams: Promise<{viewport?: string}>}) {
  if (process.env.NODE_ENV !== 'development' && process.env.VERCEL_ENV !== 'preview') notFound();
  const {viewport}=await searchParams;
  if (viewport) return <Harness />;
  return <main style={{display:'flex',gap:16,padding:12}}>{[375,390].map(width=><iframe key={width} title={`${width}px告知確認`} src={`/qa/event-promotion?viewport=${width}`} width={width} height={667} style={{border:0}} />)}</main>;
}
