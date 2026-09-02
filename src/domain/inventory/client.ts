import type { SupabaseClient } from "@supabase/supabase-js";

export type InventoryEntry = {
  asset_kind: string;
  asset_key: string;
  quantity: number;
  updated_at: string;
};

export async function loadCurrentPlayerInventory(
  supabase: SupabaseClient,
): Promise<InventoryEntry[]> {
  const { data, error } = await supabase.rpc("get_current_player_inventory");

  if (error) {
    throw error;
  }

  return (data ?? []) as InventoryEntry[];
}
