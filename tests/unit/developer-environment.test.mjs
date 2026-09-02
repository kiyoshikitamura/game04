import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  hasFailures,
  inspectDeveloperEnvironment,
  parseEnvironmentFile,
} from "../../scripts/lib/developer-environment.mjs";

const fixtures = [];

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => rm(fixture, { recursive: true, force: true })));
});

async function createFixture(envSource) {
  const root = await mkdtemp(path.join(tmpdir(), "game04-unit-"));
  fixtures.push(root);
  await mkdir(path.join(root, "node_modules", "next"), { recursive: true });
  await writeFile(path.join(root, "package.json"), "{}\n");
  await writeFile(path.join(root, "package-lock.json"), "{}\n");
  await writeFile(path.join(root, ".env.example"), "NEXT_PUBLIC_APP_ENV=development\n");
  await writeFile(path.join(root, "node_modules", "next", "package.json"), "{}\n");
  await writeFile(path.join(root, ".env.local"), envSource);
  return root;
}

test("environment parser ignores comments and removes matching quotes", () => {
  const values = parseEnvironmentFile("# comment\nA=plain\nB=\"quoted\"\nC='single'\n");
  assert.deepEqual(Object.fromEntries(values), { A: "plain", B: "quoted", C: "single" });
});

test("disconnected development shell is valid", async () => {
  const root = await createFixture(
    "NEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n",
  );
  assert.equal(hasFailures(await inspectDeveloperEnvironment({ root, nodeVersion: "22.0.0" })), false);
});

test("partial Supabase public configuration fails without exposing its value", async () => {
  const secretLikeValue = "https://private-value.supabase.co";
  const root = await createFixture(
    `NEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_SUPABASE_URL=${secretLikeValue}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n`,
  );
  const findings = await inspectDeveloperEnvironment({ root, nodeVersion: "22.0.0" });
  assert.equal(hasFailures(findings), true);
  assert.equal(JSON.stringify(findings).includes(secretLikeValue), false);
});

test("public server-secret names fail the boundary check", async () => {
  const root = await createFixture(
    "NEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\nNEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=not-printed\n",
  );
  const findings = await inspectDeveloperEnvironment({ root, nodeVersion: "22.0.0" });
  assert.equal(findings.some(({ code, level }) => code === "public-secret-boundary" && level === "fail"), true);
  assert.equal(JSON.stringify(findings).includes("not-printed"), false);
});
