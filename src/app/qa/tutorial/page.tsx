import { notFound } from 'next/navigation';
import { AudioProvider } from '@/audio/AudioProvider';
import TutorialPreview from './TutorialPreview';

export const dynamic = 'force-dynamic';
export default function TutorialPage() {
  if (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production') notFound();
  return <AudioProvider><TutorialPreview /></AudioProvider>;
}
