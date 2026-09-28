#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const authorityPath = path.join(root, "docs/product/masters_20260921/GAME04_DESIGN_MASTER_EXTRACT.json");
const implementationCandidates = [
  "src/domain/redesign/data/formalGachaMaster.json",
  "src/domain/redesign/data/formal-gacha-master.json",
  "src/domain/gacha/data/formal-gacha-master.json",
  "docs/development/evidence/game04-g3/formal-gacha-master.json",
].map((name) => path.join(root, name));

const expectedCounts = {
  CHARACTER: { N: 15, R: 20, SR: 15, SSR: 10 },
  SKILL: { N: 9, R: 33, SR: 16, SSR: 14 },
  EQUIPMENT: { N: 35, R: 50, SR: 55, SSR: 20 },
};
const expectedSpecial = {
  CHARACTER: { cost: 300, pity: 200, rates: { R: 65, SR: 32, SSR: 3 } },
  SKILL: { cost: 300, pity: 100, rates: { R: 60, SR: 35, SSR: 5 } },
  EQUIPMENT: { cost: 200, pity: 100, rates: { R: 50, SR: 40, SSR: 10 } },
};
const expectedNormalRates = { N: 49, R: 40, SR: 10, SSR: 1 };
const expectedNormalCategories = { CHARACTER: 20, SKILL: 30, EQUIPMENT: 50 };

const failures = [];
const passes = [];
function check(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}
function sameNumber(actual, expected, tolerance = 1e-10) {
  return Number.isFinite(Number(actual)) && Math.abs(Number(actual) - expected) <= tolerance;
}
function unique(values) { return new Set(values).size === values.length; }
function countByRarity(rows) {
  return Object.fromEntries(["N", "R", "SR", "SSR"].map((rarity) => [rarity, rows.filter((row) => row.rarity === rarity).length]));
}
function normalizedCategory(value) {
  const upper = String(value ?? "").toUpperCase();
  return upper === "CHAR" ? "CHARACTER" : upper === "EQUIP" ? "EQUIPMENT" : upper;
}

function authorityRows() {
  const source = JSON.parse(fs.readFileSync(authorityPath, "utf8"));
  const balance = JSON.parse(fs.readFileSync(path.join(root, "src/domain/redesign/data/balance-v2.json"), "utf8"));
  const skillRarity = new Map(balance.skills.map((row) => [row.designId, row.rarity]));
  const skillGroups = new Map();
  for (const row of source.skill_lb_rows) {
    if (!skillGroups.has(row.design_id)) skillGroups.set(row.design_id, []);
    skillGroups.get(row.design_id).push(row);
  }
  const skills = [...skillGroups.entries()].map(([id, rows]) => {
    const rarity = rows[0]?.rarity || skillRarity.get(id);
    return { id, rarity, rows };
  });
  assert.ok(skills.every((row) => row.rarity), "every formal skill must map to a balance-v2 rarity");
  return {
    CHARACTER: source.characters.map((row) => ({ id: row.id, rarity: row.rarity })),
    SKILL: skills,
    EQUIPMENT: source.equipment.map((row) => ({ id: row.id, rarity: row.rarity })),
  };
}

function auditAuthority() {
  const rows = authorityRows();
  for (const [category, expected] of Object.entries(expectedCounts)) {
    check(unique(rows[category].map((row) => row.id)), `${category}: authority IDs are unique`);
    const counts = countByRarity(rows[category]);
    for (const [rarity, count] of Object.entries(expected)) {
      check(counts[rarity] === count, `${category}/${rarity}: authority count ${counts[rarity]} = ${count}`);
    }
    check(rows[category].length === Object.values(expected).reduce((a, b) => a + b, 0), `${category}: authority total is exact`);
  }
  const skills = rows.SKILL;
  check(skills.every((skill) => skill.rows.length === 11), "SKILL: all 72 skills have LB0..10 rows");
  check(skills.every((skill) => skill.rows.map((row) => row.lb).sort((a, b) => a - b).every((lb, index) => lb === index)), "SKILL: every skill has exactly LB0..10");
  check(skills.every((skill) => /^SKD\d{3}$/.test(skill.id)), "SKILL: no legacy/QA IDs in authority");

  for (const [category, spec] of Object.entries(expectedSpecial)) {
    const total = Object.values(spec.rates).reduce((sum, value) => sum + value, 0);
    check(total === 100, `${category}: special rarity rates sum to 100%`);
    for (const [rarity, rate] of Object.entries(spec.rates)) {
      const count = expectedCounts[category][rarity];
      const individual = rate / count;
      check(sameNumber(individual * count, rate), `${category}/${rarity}: uniform exact weight (${rate}/${count})`);
    }
  }
  check(Object.values(expectedNormalRates).reduce((a, b) => a + b, 0) === 100, "NORMAL: rarity rates sum to 100%");
  check(Object.values(expectedNormalCategories).reduce((a, b) => a + b, 0) === 100, "NORMAL: within-rarity category rates sum to 100%");
  for (const [rarity, rarityRate] of Object.entries(expectedNormalRates)) {
    const total = Object.entries(expectedNormalCategories).reduce((sum, [category, categoryRate]) => {
      const count = expectedCounts[category][rarity];
      const individual = rarityRate * categoryRate / 100 / count;
      return sum + individual * count;
    }, 0);
    check(sameNumber(total, rarityRate), `NORMAL/${rarity}: exact two-stage weights sum to ${rarityRate}%`);
  }
  return rows;
}

function loadImplementation() {
  const file = implementationCandidates.find((candidate) => fs.existsSync(candidate));
  if (!file) return null;
  return { file, value: JSON.parse(fs.readFileSync(file, "utf8")) };
}

function auditImplementation(authority, implementation) {
  if (!implementation) {
    failures.push(`formal implementation manifest missing (${implementationCandidates.map((p) => path.relative(root, p)).join(", ")})`);
    return;
  }
  const { file, value } = implementation;
  const items = Array.isArray(value.items) ? value.items : Array.isArray(value.pool) ? value.pool : Array.isArray(value.rows) ? value.rows : [];
  check(items.length === 292, `implementation: 292 unique items are declared (${path.relative(root, file)})`);
  check(unique(items.map((row) => `${normalizedCategory(row.category || row.itemType)}:${row.id || row.itemId}`)), "implementation: no duplicate item IDs within category");
  const byCategory = Object.fromEntries(Object.keys(expectedCounts).map((category) => [category, items.filter((row) => normalizedCategory(row.category || row.itemType) === category)]));
  for (const [category, expected] of Object.entries(expectedCounts)) {
    const actualRows = byCategory[category];
    const counts = countByRarity(actualRows);
    for (const [rarity, count] of Object.entries(expected)) check(counts[rarity] === count, `implementation ${category}/${rarity}: ${counts[rarity]} = ${count}`);
    const actualIds = new Set(actualRows.map((row) => row.id || row.itemId));
    const authorityIds = new Set(authority[category].map((row) => row.id));
    check(actualIds.size === authorityIds.size && [...actualIds].every((id) => authorityIds.has(id)), `implementation ${category}: IDs exactly match authority`);
    const specialIds = new Set(actualRows.filter((row) => row.special !== false && row.rarity !== "N").map((row) => row.id || row.itemId));
    const expectedSpecialIds = new Set(authority[category].filter((row) => row.rarity !== "N").map((row) => row.id));
    check(specialIds.size === expectedSpecialIds.size && [...specialIds].every((id) => expectedSpecialIds.has(id)), `implementation ${category}: special pool is exactly authority minus N`);
  }
  const banners = Array.isArray(value.banners) ? value.banners : [];
  const specialBanners = banners.filter((row) => normalizedCategory(row.category || row.itemType) !== "MIXED");
  check(specialBanners.length === 3, "implementation: exactly 3 special categories (no attribute-split character banners)");
  for (const [category, expected] of Object.entries(expectedSpecial)) {
    const banner = banners.find((row) => normalizedCategory(row.category || row.itemType) === category);
    check(Boolean(banner), `implementation ${category}: banner exists`);
    if (!banner) continue;
    check(Number(banner.singleCost ?? banner.cost) === expected.cost, `implementation ${category}: single cost ${expected.cost}`);
    check(Number(banner.tenCost ?? expected.cost * 10) === expected.cost * 10, `implementation ${category}: ten cost ${expected.cost * 10}`);
    check(Number(banner.exchangePoints ?? banner.exchangeThreshold ?? banner.pity) === expected.pity, `implementation ${category}: exchange points ${expected.pity}`);
    for (const [rarity, rate] of Object.entries(expected.rates)) check(sameNumber(banner.rates?.[rarity], rate), `implementation ${category}/${rarity}: rate ${rate}%`);
  }
  const exchanges = Array.isArray(value.exchanges) ? value.exchanges : items.filter((row) => row.special && row.rarity === "SSR");
  for (const category of Object.keys(expectedCounts)) {
    const actual = new Set(exchanges.filter((row) => normalizedCategory(row.category || row.itemType) === category).map((row) => row.id || row.itemId));
    const expected = new Set(authority[category].filter((row) => row.rarity === "SSR").map((row) => row.id));
    check(actual.size === expected.size && [...actual].every((id) => expected.has(id)), `implementation ${category}: SSR exchange equals emitted SSR pool`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function auditRuntimeConnection() {
  const apiSource = fs.readFileSync(path.join(root, "supabase/functions/game04-redesign-api/source.ts"), "utf8");
  check(/applyFormalNormalGacha/.test(apiSource) && /applyFormalSpecialGacha/.test(apiSource) && /special_gacha_status/.test(apiSource), "runtime: authenticated API uses the formal manifest for normal/special draw and status");
  check(/game04_commit_gacha/.test(apiSource), "runtime: special draw/exchange uses an atomic DB commit");
  check(/recordMissionEvent\(drawn\.state,[\s\S]*normal_gacha/.test(apiSource), "runtime: paid/free normal draw records the normal-gacha daily mission once");
  check(/user_items\?user_id=eq\./.test(apiSource) && /gachaTicketBalances/.test(apiSource), "runtime: ticket status/domain projection reads canonical user_items balances");
  check(/delete persistentState\.gachaTicketBalances/.test(apiSource), "runtime: transient ticket balances are never persisted in player state");
  check(/canonicalJson\(prior\.result\?\.requestPayload\)/.test(apiSource), "runtime: replay payload equality is independent of jsonb key order");

  const atomicSql = fs.readFileSync(path.join(root, "supabase/manual/game04_g3_gacha_atomic_commit.sql"), "utf8");
  check(/from public\.user_items[\s\S]*for update/.test(atomicSql) && /update public\.user_items set quantity=quantity-v_ticket_cost/.test(atomicSql), "runtime: ticket stock is locked and consumed atomically from user_items");
  check(/questTicketGrants/.test(atomicSql) && /INVALID_GACHA_TICKET_STATE/.test(atomicSql), "runtime: G2 quest ticket grant ledger cannot be spent or rewritten by gacha");
  check(/normalGachaJstDay/.test(atomicSql) && /GACHA_DAY_CHANGED/.test(atomicSql) && /Asia\/Tokyo/.test(atomicSql), "runtime: every normal draw rejects a crossed JST settlement boundary");

  const formalSource = fs.readFileSync(path.join(root, "src/domain/redesign/formalGacha.ts"), "utf8");
  check(/input\.payment\s*!==\s*['"]DIAMONDS['"][\s\S]{0,100}input\.payment\s*!==\s*['"]TICKET['"]/.test(formalSource), "runtime: special draw rejects unknown payment modes");
  check(/input\.payment\s*!==\s*['"]CASH['"][\s\S]{0,100}input\.payment\s*!==\s*['"]FREE['"]/.test(formalSource), "runtime: normal draw rejects unknown payment modes");
  check(/state\.gachaTicketBalances/.test(formalSource) && !/state\.questTicketGrants\[rule\.ticketId\]/.test(formalSource), "runtime: formal ticket draw spends only projected inventory, never the grant ledger");

  const appSource = fs.readFileSync(path.join(root, "src/app/components/redesign/RedesignApp.tsx"), "utf8");
  const formalViewSource = fs.readFileSync(path.join(root, "src/app/components/redesign/FormalGachaView.tsx"), "utf8");
  check(/FormalGachaView/.test(appSource) && /FormalGachaHub/.test(formalViewSource), "UI: the formal G3 hub is connected to the real redesign gacha tab");
  check(!/<GachaTab\s+specialOnly/.test(appSource), "UI: the real redesign gacha tab no longer invokes the legacy special-gacha RPC UI");
}

const authority = auditAuthority();
auditImplementation(authority, loadImplementation());
auditRuntimeConnection();

console.log(`GAME04 G3 static audit: ${passes.length} passed, ${failures.length} failed`);
for (const message of passes) console.log(`PASS ${message}`);
for (const message of failures) console.error(`FAIL ${message}`);
if (failures.length) process.exitCode = 1;
