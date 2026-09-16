import characterTheme from "./sengoku-characters.json" with { type: "json" };

// GAME03のID・数値・レアリティを保持し、表示名だけをテーマから解決する。
const names = new Map(characterTheme.map((entry) => [entry.characterId, entry.name]));
export function getThemedCharacterName(characterId: string, fallback: string): string {
  return names.get(characterId) ?? fallback;
}
