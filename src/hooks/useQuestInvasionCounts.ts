'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export interface QuestInvasionCounts {
  stages: Record<string, number>;
  areas: Record<string, number>;
}

export function useQuestInvasionCounts(active: boolean, areaId: string | null, supplied?: QuestInvasionCounts) {
  const [counts, setCounts] = useState<QuestInvasionCounts>();
  useEffect(() => {
    if (!active || supplied) return;
    const controller = new AbortController();
    async function refresh() {
      try {
        const { data, error } = await supabase.rpc('game04_quest_invasion_counts').abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        setCounts(!error && data?.stages && data?.areas ? data as QuestInvasionCounts : undefined);
      } catch {
        if (!controller.signal.aborted) setCounts(undefined);
      }
    }
    void refresh();
    return () => controller.abort();
  }, [active, areaId, supplied]);
  return supplied ?? counts;
}
