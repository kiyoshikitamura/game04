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
    const params = { p_from: range.fromAt, p_to: range.toAt };
    const [gameplay, supply, detail] = await Promise.all([
      service.rpc('game04_kpi_gameplay_daily', params),
      service.rpc('game04_kpi_supply_daily', params),
      service.rpc('game04_kpi_receipt_detail', params),
    ]);
    for (const result of [gameplay, supply, detail]) if (result.error) throw result.error;
    return {
      definition_version: 'game04-gameplay-v1', environment: 'development', timezone: 'Asia/Tokyo',
      coverage: {
        battles: 'durable battle rows; started and settled counted separately',
        actions: 'versioned committed receipts only; historical empty receipts are unmeasured',
        purchases: 'unavailable; P02 verified purchase integration pending',
        gacha_spend: 'in-game resources only; diamond_spent and game_cash_spent are never purchase or cash-revenue amounts',
        unmapped: 'separate from included; QA classifications evaluated at event time',
      },
      series: gameplay.data ?? [], supply: supply.data ?? [], detail: detail.data,
      detail_coverage: {
        raid_rewards: 'Newly claimed grant receipts only; pre-instrumentation claims unmeasured. Grant counts across reward kinds are not additive.',
        restore: 'Client state acknowledgement at matching server version; not identity-provider login acceptance.',
        acquisition: 'Earliest bound journey source per subject, event-time QA exclusion; unbound explicit. Activity counts are not conversion rates.',
        gacha: 'Committed formal draws/exchanges only; replay returns the saved receipt without another success fact. QA is classified at event time.',
      },
    };
  });
}
