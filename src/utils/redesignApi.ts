import { getRoomRaidMaster } from '@/domain/redesign/raid';
import { FunctionRegion } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { beginRedesignRequestMetric } from './redesignPerformance';
import type { RedesignState, RaidRoom } from '@/domain/redesign/types';
import type { BattleResult } from '@/domain/redesign/battle';

export interface RedesignResponse {
  normalGacha?: {pool: import('@/domain/redesign/normalGacha').NormalPoolRow[]; day: string; available: boolean};
  normalGachaResults?: import('@/domain/redesign/normalGacha').NormalGachaResult[];
  playerGrowth?: {status: string; gainedExp: number; beforeLevel?: number; level?: number; energyRecovered?: number; energy?: number; energyMax?: number};
  state: RedesignState;
  missions?: import('@/domain/redesign/missions').MissionProjection[];
  rooms: RaidRoom[];
  territory?: import('@/domain/redesign/territory').TerritoryProjection;
  territoryRoomId?: string;
  battle?: BattleResult;
  rewards?: import('@/domain/redesign/types').Reward[];
  encounterId?: string;
  encounterRaidId?: string | null;
  firstClear?: boolean;
  socialEvents?: import('@/app/components/redesign/HomeView').HomeSocialEvent[];
  pendingBattle?: { id: string; kind: 'quest' | 'raid'; target_id: string } | null;
}

export async function redesignRequest(action: string, payload: Record<string, unknown> = {}, requestId = crypto.randomUUID()): Promise<RedesignResponse> {
  const finishMetric = beginRedesignRequestMetric(action);
  try {
    const result = await invokeRedesignRequest(action, payload, requestId);
    finishMetric('success');
    return result;
  } catch (error) {
    finishMetric('error');
    throw error;
  }
}

async function invokeRedesignRequest(action: string, payload: Record<string, unknown>, requestId: string): Promise<RedesignResponse> {
  const { data, error } = await supabase.functions.invoke('game04-redesign-api', {
    body: { action, payload, requestId },
    region: FunctionRegion.EuCentral1,
  });
  if (error) {
    let detail = '';
    try { detail = (await error.context?.json())?.error || ''; } catch { /* network error */ }
    throw new Error(detail || '接続を確認できませんでした。もう一度お試しください。');
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.state || !Array.isArray(data.rooms)) throw new Error('ゲームデータを確認できませんでした。');
  // Rescue rows carry a JSON payload, not ready-to-render text. Prefer the
  // hosted snapshot so custom or subsequently changed masters remain readable.
  if (Array.isArray(data.socialEvents)) data.socialEvents = data.socialEvents.map((event: any) => {
    if (typeof event.body === 'string') return event;
    const room = data.rooms.find((candidate: RaidRoom) => candidate.id === event.room_id);
    let label = 'レイド';
    if (room) {
      try {
        const master = getRoomRaidMaster(room);
        label = master.type === 'unlock' ? `領土侵攻・${room.territorySnapshot?.destination.castle || master.name}` : master.name;
      } catch { /* A retired master must not prevent viewing other activity. */ }
    }
    const level = Number(event.body?.level);
    return { ...event, body: `${label}${Number.isFinite(level) && level > 0 ? ` Lv.${level}` : ''}の援軍を求めています。` };
  });
  return data as RedesignResponse;
}
