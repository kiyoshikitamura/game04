import { supabase } from './supabase';
import type { RedesignState, RaidRoom } from '@/domain/redesign/types';
import type { BattleResult } from '@/domain/redesign/battle';

export interface RedesignResponse {
  state: RedesignState;
  rooms: RaidRoom[];
  battle?: BattleResult;
  rewards?: import('@/domain/redesign/types').Reward[];
  encounterId?: string;
  encounterRaidId?: string | null;
  firstClear?: boolean;
  socialEvents?: import('@/app/components/redesign/HomeView').HomeSocialEvent[];
  pendingBattle?: { id: string; kind: 'quest' | 'raid'; target_id: string } | null;
}

export async function redesignRequest(action: string, payload: Record<string, unknown> = {}, requestId = crypto.randomUUID()): Promise<RedesignResponse> {
  const { data, error } = await supabase.functions.invoke('game04-redesign-api', {
    body: { action, payload, requestId },
  });
  if (error) {
    let detail = '';
    try { detail = (await error.context?.json())?.error || ''; } catch { /* network error */ }
    throw new Error(detail || '接続を確認できませんでした。もう一度お試しください。');
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.state || !Array.isArray(data.rooms)) throw new Error('ゲームデータを確認できませんでした。');
  return data as RedesignResponse;
}
