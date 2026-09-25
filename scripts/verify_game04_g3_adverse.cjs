#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const assert = require("node:assert/strict");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, resolveJsonModule: true },
}).outputText, filename);

const master = require("../src/domain/redesign/formalGachaMaster.ts");
const gacha = require("../src/domain/redesign/formalGacha.ts");
const masters = require("../src/domain/redesign/masters.ts");

function state(id) {
  const value = masters.createInitialState(id);
  value.cash = 100000;
  value.diamonds = 10000;
  value.questTicketGrants = { SPECIAL_TICKET_CHARACTER: 10, SPECIAL_TICKET_SKILL: 10, SPECIAL_TICKET_EQUIPMENT: 10 };
  return value;
}
const always = (value) => () => value;

// Ten copies in one response: first character/skill is new, the remaining nine
// use the approved duplicate conversion. Equipment remains ten distinct units.
const character = gacha.applyFormalSpecialGacha(state("same-char"), { requestId: "same-char", category: "character", count: 10, payment: "DIAMONDS" }, always(0));
const characterId = character.receipt.results[0].id;
assert.deepEqual(character.receipt.results.map((row) => row.acquisition), ["new", ...Array(9).fill("duplicate")]);
assert.equal(character.state.souls[characterId], 180);

const skill = gacha.applyFormalSpecialGacha(state("same-skill"), { requestId: "same-skill", category: "skill", count: 10, payment: "DIAMONDS" }, always(0.999999));
assert.deepEqual(skill.receipt.results.map((row) => row.acquisition), ["new", ...Array(9).fill("duplicate")]);
assert.equal(skill.state.materials.skill - state("comparison").materials.skill, 9 * 20);

const equipment = gacha.applyFormalSpecialGacha(state("same-equipment"), { requestId: "same-equipment", category: "equipment", count: 10, payment: "DIAMONDS" }, always(0.999999));
assert.ok(equipment.receipt.results.every((row) => row.acquisition === "instance"));
const gainedInstances = equipment.state.equipment.filter((row) => row.instanceId.startsWith("formal_gacha:same-equipment:"));
assert.equal(gainedInstances.length, 10);
assert.equal(new Set(gainedInstances.map((row) => row.instanceId)).size, 10);

// Natural SSR adds a point and never resets an existing category balance.
const pointState = state("point-state");
pointState.specialGachaPoints = { skill: 99 };
const naturalSsr = gacha.applyFormalSpecialGacha(pointState, { requestId: "natural-ssr", category: "skill", count: 1, payment: "DIAMONDS" }, always(0.999999));
assert.equal(naturalSsr.receipt.results[0].rarity, "SSR");
assert.equal(naturalSsr.state.specialGachaPoints.skill, 100);

// Replay is DB-authoritative so the player state does not grow an unbounded
// receipt ledger. The atomic RPC binds both operation and normalized payload.
const atomicSql = fs.readFileSync(new URL("../supabase/manual/game04_g3_gacha_atomic_commit.sql", `file://${__dirname}/`).pathname, "utf8");
assert.match(atomicSql, /prior->>'operation' is distinct from p_operation/);
assert.match(atomicSql, /prior->'requestPayload' is distinct from p_request_payload/);
assert.match(atomicSql, /return prior/);
assert.ok(!("formalGachaReceipts" in naturalSsr.state));

// Exact JST boundary and failed operations leave their input untouched.
const boundary = state("boundary");
const before = structuredClone(boundary);
assert.throws(() => gacha.applyFormalNormalGacha(boundary, { requestId: "bad-payment", count: 1, payment: "DIAMONDS", now: 0 }, Math.random), /支払方法/);
assert.deepEqual(boundary, before);
assert.equal(gacha.formalGachaJstDay(Date.parse("2026-09-25T14:59:59.999Z")), "2026-09-25");
assert.equal(gacha.formalGachaJstDay(Date.parse("2026-09-25T15:00:00.000Z")), "2026-09-26");

// Exchange consumes only the threshold and keeps the remainder.
const exchangeState = state("exchange");
exchangeState.specialGachaPoints = { equipment: 105 };
const exchangeTarget = master.specialGachaExchangePool("equipment")[0];
const exchanged = gacha.applyFormalSsrExchange(exchangeState, { requestId: "exchange", category: "equipment", itemId: exchangeTarget.id });
assert.equal(exchanged.state.specialGachaPoints.equipment, 5);
assert.equal(exchanged.receipt.pointsAdded, 0);

console.log("PASS G3 adverse: in-ten duplicates; rarity conversion; unique equipment; SSR no reset; DB replay binding; JST edge; failed non-mutation; exchange remainder.");
