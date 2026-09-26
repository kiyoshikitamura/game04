import { notFound } from 'next/navigation';
import { GAME04_DEV_SUPABASE_ORIGIN } from '@/utils/supabaseUrl';
import Game04GameplayKpi from './Game04GameplayKpi';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'GAME04 開発KPI', robots: { index: false, follow: false } };
export default function Page() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') !== GAME04_DEV_SUPABASE_ORIGIN) notFound();
  return <Game04GameplayKpi />;
}
