import type { SupabaseClient } from "@supabase/supabase-js";

export type RewardEntry = {
  asset_kind: string;
  asset_key: string;
  quantity: number;
};

export type RewardInboxEntry = {
  inbox_id: string;
  state: "pending" | "claimed";
  created_at: string;
  claimed_at: string | null;
  entries: RewardEntry[];
};

export type RewardReceipt = {
  receipt_id: string;
  inbox_id: string;
  request_id: string;
  created_at: string;
  entries: RewardEntry[];
};

export async function loadCurrentPlayerRewardInbox(
  supabase: SupabaseClient,
): Promise<RewardInboxEntry[]> {
  const { data, error } = await supabase.rpc(
    "get_current_player_reward_inbox",
  );

  if (error) {
    throw error;
  }

  return (data ?? []) as RewardInboxEntry[];
}

export async function loadCurrentPlayerRewardReceipts(
  supabase: SupabaseClient,
): Promise<RewardReceipt[]> {
  const { data, error } = await supabase.rpc(
    "get_current_player_reward_receipts",
  );

  if (error) {
    throw error;
  }

  return (data ?? []) as RewardReceipt[];
}

export async function claimCurrentPlayerReward(
  supabase: SupabaseClient,
  inboxId: string,
  requestId: string,
): Promise<RewardReceipt> {
  const { data, error } = await supabase.rpc("claim_current_player_reward", {
    p_inbox_id: inboxId,
    p_request_id: requestId,
  });

  if (error) {
    throw error;
  }

  return data as RewardReceipt;
}
