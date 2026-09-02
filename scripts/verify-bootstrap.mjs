import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { hasFailures, inspectDeveloperEnvironment } from "./lib/developer-environment.mjs";

const sourceRoot = process.cwd();
const fixtureRoot = await mkdtemp(path.join(tmpdir(), "game04-bootstrap-"));

function run(script) {
  return spawnSync(process.execPath, [script], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env },
  });
}

try {
  await cp(path.join(sourceRoot, "package.json"), path.join(fixtureRoot, "package.json"));
  await cp(path.join(sourceRoot, "package-lock.json"), path.join(fixtureRoot, "package-lock.json"));
  await cp(path.join(sourceRoot, ".env.example"), path.join(fixtureRoot, ".env.example"));
  await cp(path.join(sourceRoot, "scripts"), path.join(fixtureRoot, "scripts"), { recursive: true });
  await symlink(path.join(sourceRoot, "node_modules"), path.join(fixtureRoot, "node_modules"), "junction");

  const firstBootstrap = run("scripts/bootstrap.mjs");
  assert.equal(firstBootstrap.status, 0, firstBootstrap.stderr);
  assert.match(await readFile(path.join(fixtureRoot, ".env.local"), "utf8"), /NEXT_PUBLIC_APP_ENV=development/);

  const sentinel = "NEXT_PUBLIC_APP_ENV=development\n# existing local file\n";
  await writeFile(path.join(fixtureRoot, ".env.local"), sentinel);
  const secondBootstrap = run("scripts/bootstrap.mjs");
  assert.equal(secondBootstrap.status, 0, secondBootstrap.stderr);
  assert.equal(await readFile(path.join(fixtureRoot, ".env.local"), "utf8"), sentinel);

  let findings = await inspectDeveloperEnvironment({ root: fixtureRoot });
  assert.equal(hasFailures(findings), false, "disconnected shell should be ready");

  await writeFile(
    path.join(fixtureRoot, ".env.local"),
    "NEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_SUPABASE_URL=https://fixture.supabase.co\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=fake-public-key\n",
  );
  findings = await inspectDeveloperEnvironment({ root: fixtureRoot, requireServices: true });
  assert.equal(hasFailures(findings), false, "connected configuration shape should be ready");

  await writeFile(
    path.join(fixtureRoot, ".env.local"),
    "NEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_SUPABASE_URL=https://fixture.supabase.co\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n",
  );
  findings = await inspectDeveloperEnvironment({ root: fixtureRoot });
  assert.equal(hasFailures(findings), true, "partial configuration should fail");

  console.log("Fresh-copy bootstrap and environment diagnostic scenarios passed.");
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}
