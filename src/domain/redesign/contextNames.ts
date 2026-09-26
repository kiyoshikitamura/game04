import data from './data/context-names.json';
const quests: Record<string, string> = data.quests;
const enemies: Record<string, { canonicalName: string; name: string; role: string; characterId: string }> = data.questEnemies;
const encounters: Record<string, { title: string; bossName: string; area: string }> = data.encounters;
const invasions: Record<string, { titles: string[]; lordName: string; lordCharacterId: string }> = data.invasions;
/** Display projection only. Never rewrite character identity, room or battle snapshots. */
export function questDisplayName(stage: { id: string; name: string }) { return quests[stage.id] ?? stage.name; }
export function enemyDisplayName(unit: { id: string; name: string }) {
  const entry = enemies[unit.id];
  return entry?.canonicalName === unit.name ? entry.name : unit.name;
}
export function enemyRoleLabel(unit: { id: string; name: string }) {
  const entry = enemies[unit.id];
  if (entry?.canonicalName === unit.name) return entry.role;
  const match = unit.id.match(/^(TI0[1-5])\/(\d+)\/\d+$/);
  if (!match) return '';
  const castle = invasions[match[1]], level = Number(match[2]);
  if (!castle || level < 1 || level > 12) return '';
  return level === 12 ? (unit.name === castle.lordName ? '城主' : '近侍') : level % 3 === 0 ? '関門守将' : '守備隊';
}
export function invasionSceneName(id: string, level: number) {
  return invasions[id]?.titles[level === 12 ? 2 : level % 3 === 0 ? 1 : 0] ?? '';
}
export function raidDisplayTitle(master: { id: string; name: string }) {
  const entry = encounters[master.id];
  return entry?.bossName === master.name ? entry.title : master.name;
}
export function raidDisplaySubtitle(master: { id: string; name: string }, level = 1) {
  const entry = encounters[master.id];
  return entry?.bossName === master.name ? `${entry.bossName} · ${entry.area}` : invasionSceneName(master.id, level);
}
export function raidDisplayLabel(master: { id: string; name: string }, level = 1) {
  const title = raidDisplayTitle(master), subtitle = raidDisplaySubtitle(master, level);
  return subtitle ? `${title} — ${subtitle}` : title;
}

/** Rescue events carry stable master ID and level; historical free-text posts stay untouched. */
export function raidRescueDisplayLabel(masterId: string, level: number) {
 const encounter=encounters[masterId],castle=invasions[masterId];
 const label=encounter?`${encounter.title} — ${encounter.bossName} · ${encounter.area}`:castle?`${invasionSceneName(masterId,level)} — ${castle.lordName}`:'';
 return label?`${label} · Lv.${level}`:null;
}
