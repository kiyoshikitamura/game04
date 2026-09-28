import type { NextRequest } from 'next/server';
import { respond } from '../_shared';
import { GAME04_DEV_SUPABASE_ORIGIN } from '@/utils/supabaseUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Existing KPI middleware authenticates operators before this service-role query.
export async function GET(request: NextRequest) {
  return respond(request, async (service, range) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') !== GAME04_DEV_SUPABASE_ORIGIN) {
      throw new Error('GAME04 development KPI target mismatch');
    }
    const { data, error } = await service.rpc('game04_kpi_supply_daily', {
      p_from: range.fromAt, p_to: range.toAt,
    });
    if (error) throw error;
    return {
      definition_version: 'game04-supply-v1', environment: 'development', timezone: 'Asia/Tokyo',
      coverage: {
        login_bonus: 'future formal delivery ledger only; no historical reconstruction; quantity counts bundles',
        present_claim: 'formal free versioned claimed rows only; excludes expired-at-claim and legacy rows',
        vip_delivery: 'delivered rows only; quantity counts free diamonds; not purchase revenue',
        missions: 'committed request counts are available from gameplay; reward detail is not measured here',
        classification: 'QA evaluated at event time; GAME04_QA presents always excluded; unmapped kept separate',
      },
      series: data ?? [],
    };
  });
}
