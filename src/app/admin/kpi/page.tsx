import type { Metadata } from 'next';
import Game04KpiDashboard from './game04/Game04KpiDashboard';
import './game04/game04-kpi.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'KPI | 戦国姫艶武', robots: { index: false, follow: false } };
export default function KpiDashboardPage() { return <Game04KpiDashboard />; }
