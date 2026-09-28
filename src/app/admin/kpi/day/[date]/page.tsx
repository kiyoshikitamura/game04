import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { validDate } from '@/domain/redesign/kpi/dashboard';
import Game04KpiDashboard from '../../game04/Game04KpiDashboard';
import '../../game04/game04-kpi.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '日次KPI | 戦国姫艶武', robots: { index: false, follow: false } };
export default async function KpiDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!validDate(date)) notFound();
  return <Game04KpiDashboard fixedDate={date} />;
}
