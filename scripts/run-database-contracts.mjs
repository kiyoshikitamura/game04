import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const target = process.env.TARGET_ENVIRONMENT;
const databaseUrl = process.env.DATABASE_URL;

if (target !== "dev-clean") {
  console.error("Database contracts are restricted to TARGET_ENVIRONMENT=dev-clean.");
  process.exit(1);
}
if (!databaseUrl) {
  console.error("DATABASE_URL is required and will not be printed.");
  process.exit(1);
}

let hostname;
try {
  hostname = new URL(databaseUrl).hostname;
} catch {
  console.error("DATABASE_URL is not a valid connection URL.");
  process.exit(1);
}
if (/prod|production/i.test(hostname)) {
  console.error("A production-labelled database host is not accepted by this runner.");
  process.exit(1);
}

const version = spawnSync("psql", ["--version"], { encoding: "utf8" });
if (version.status !== 0) {
  console.error("psql is required to execute database contracts.");
  process.exit(1);
}

const directory = path.join(process.cwd(), "supabase", "tests");
const files = (await readdir(directory)).filter((file) => file.endsWith("_contract.sql")).sort();
const childEnvironment = { ...process.env, PGDATABASE: databaseUrl };
delete childEnvironment.DATABASE_URL;

for (const file of files) {
  console.log(`Running database contract: ${file}`);
  const result = spawnSync(
    "psql",
    ["--no-psqlrc", "--set", "ON_ERROR_STOP=1", "--file", path.join(directory, file)],
    { encoding: "utf8", env: childEnvironment, stdio: ["ignore", "inherit", "inherit"] },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`${files.length} database contracts passed on dev-clean.`);
