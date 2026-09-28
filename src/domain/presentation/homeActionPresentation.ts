export type HomeActionPresentationId = "guild" | "fight" | "conquest" | "raid";

export type HomeActionPresentationSlot = Readonly<{
  id: HomeActionPresentationId;
  label: string;
  destination: "guild" | "pvp" | "patrol" | "raid";
  assetPath: string;
  deliveryStatus: "EXISTING_FALLBACK" | "PRODUCTION_DELIVERED";
  exposure: "ACTIVE" | "UPCOMING";
}>;

// GAME04 approved Sengoku artwork; gameplay destinations remain unchanged.
// Labels and status remain frontend text, independent of the final artwork.
export const HOME_ACTION_PRESENTATION_SLOTS: readonly HomeActionPresentationSlot[] = [
  { id: "conquest", label: "物語", destination: "patrol", assetPath: "/ui/sengoku/04-fan-sakura.png", deliveryStatus: "PRODUCTION_DELIVERED", exposure: "ACTIVE" },
  { id: "fight", label: "合戦", destination: "pvp", assetPath: "/ui/sengoku/05-crossed-swords.png", deliveryStatus: "PRODUCTION_DELIVERED", exposure: "ACTIVE" },
  { id: "raid", label: "討伐", destination: "raid", assetPath: "/ui/sengoku/06-oni-mask.png", deliveryStatus: "PRODUCTION_DELIVERED", exposure: "ACTIVE" },
  { id: "guild", label: "同盟", destination: "guild", assetPath: "/ui/sengoku/07-flower-crest.png", deliveryStatus: "PRODUCTION_DELIVERED", exposure: "ACTIVE" },
] as const;
