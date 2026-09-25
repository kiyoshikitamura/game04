'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { isVipActive } from '@/domain/redesign/vip';
import type { CommunityProfile } from '@/domain/redesign/community';

/** Public display projection only. Purchase authorization stays in P02's API. */
export function useCommunityProfiles(owner: string | undefined, ids: string[], enabled = true, revision: unknown = '') {
  const key = [...new Set(ids.filter(Boolean))].sort().join('|');
  const [result, setResult] = useState<{ owner?: string; key?: string; revision?: unknown; profiles: Record<string, CommunityProfile> }>({ profiles: {} });
  useEffect(() => {
    if (!enabled || !owner || !key) return;
    let cancelled = false;
    const controller = new AbortController();
    let generation = 0;
    async function refresh() {
      const request = ++generation;
      try {
        const userIds = key.split('|');
        const profiles: Record<string, CommunityProfile> = {};
        for (let start = 0; start < userIds.length; start += 100) {
          const args = { p_user_ids: userIds.slice(start, start + 100) };
          const response = await supabase.rpc('game04_get_community_profiles', args).abortSignal(controller.signal);
          if (response.error) {
            // Staged DB rollout: names remain usable; no guessed auth/VIP badge.
            const fallback = await supabase.rpc('get_public_profiles', args).abortSignal(controller.signal);
            if (fallback.error) throw fallback.error;
            for (const profile of fallback.data ?? []) profiles[profile.user_id || profile.id] = { ...profile, authenticated: false, vip_expires_at: null };
          } else {
            for (const profile of response.data ?? []) profiles[profile.user_id] = profile;
          }
        }
        if (!cancelled && request === generation) setResult({ owner, key, revision, profiles });
      } catch { if (!cancelled && request === generation) setResult({ owner, key, revision, profiles: {} }); }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    void refresh();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; controller.abort(); window.removeEventListener('focus', onVisible); document.removeEventListener('visibilitychange', onVisible); };
  }, [owner, key, enabled, revision]);
  return enabled && result.owner === owner && result.key === key && Object.is(result.revision, revision) ? result.profiles : {};
}

export function CommunityBadges({ authenticated, vipExpiresAt, now }: { authenticated?: boolean; vipExpiresAt?: string | null; now?: number }) {
  return <>{authenticated === true && <span className="rd-auth-badge" aria-label="認証済み">✓</span>}{isVipActive(vipExpiresAt, now) && <span className="rd-vip-badge" aria-label="VIP有効">VIP</span>}</>;
}
