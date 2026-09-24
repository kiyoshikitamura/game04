import type { NextRequest } from 'next/server';
import { respond } from '../_shared';
import { GAME04_DEV_SUPABASE_ORIGIN } from '@/utils/supabaseUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Existing /api/admin/kpi proxy enforces operator authentication before service-role access.
export async function GET(request: NextRequest) {
  return respond(request, async (service, range) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') !== GAME04_DEV_SUPABASE_ORIGIN) {
      throw new Error('GAME04 development KPI target mismatch');
    }
    const { data, error } = await service.rpc('game04_kpi_gameplay_daily', {
      p_from: range.fromAt, p_to: range.toAt,
    });
    if (error) throw error;
    return {
      definition_version: 'game04-gameplay-v1', environment: 'development', timezone: 'Asia/Tokyo',
      coverage: {
        battles: 'durable battle rows; started and settled counted separately',
        actions: 'versioned committed receipts only; historical empty receipts are unmeasured',
        purchases: 'unavailable; P02 verified purchase integration pending',
        unmapped: 'separate from included; QA classifications evaluated at event time',
      },
      series: data ?? [],
    };
  });
}
