import { inspectDeveloperEnvironment, hasFailures } from "./lib/developer-environment.mjs";

const args = process.argv.slice(2);
const requireServices = args.includes("--require-services");
const envFileIndex = args.indexOf("--env-file");
const envFile = envFileIndex === -1 ? ".env.local" : args[envFileIndex + 1];

if (!envFile) {
  console.error("Usage: node scripts/doctor.mjs [--require-services] [--env-file <path>]");
  process.exit(1);
}

const findings = await inspectDeveloperEnvironment({ envFile, requireServices });
const labels = { pass: "PASS", info: "INFO", fail: "FAIL" };

console.log("GAME04 developer diagnostics");
for (const item of findings) {
  console.log(`[${labels[item.level]}] ${item.message}`);
}

if (hasFailures(findings)) {
  console.error("Developer diagnostics failed. No environment values were printed.");
  process.exitCode = 1;
} else {
  console.log(requireServices ? "Connected-service readiness: READY" : "Local shell readiness: READY");
}
