import { notFound } from 'next/navigation';
import { AudioProvider } from '@/audio/AudioProvider';
import TutorialOpeningPreview from './TutorialOpeningPreview';
export const dynamic = 'force-dynamic';
export default async function TutorialOpeningPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if(process.env.VERCEL_ENV==='production'||process.env.NEXT_PUBLIC_APP_ENV==='production') notFound();
  const params=await searchParams;
  const width=typeof params.viewport==='string'&&['360','375','390'].includes(params.viewport)?Number(params.viewport):null;
  if(width) return <main><iframe title="新チュートリアル確認" src="/qa/tutorial-opening" style={{display:'block',width,height:700,border:0,margin:'0 auto'}}/></main>;
  return <AudioProvider><TutorialOpeningPreview/></AudioProvider>;
}
