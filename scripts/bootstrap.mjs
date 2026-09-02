import { constants } from "node:fs";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { hasFailures, inspectDeveloperEnvironment } from "./lib/developer-environment.mjs";

const root = process.cwd();
const source = path.join(root, ".env.example");
const target = path.join(root, ".env.local");

try {
  await copyFile(source, target, constants.COPYFILE_EXCL);
  console.log("Created .env.local from the public, secret-free template.");
} catch (error) {
  if (error?.code !== "EEXIST") throw error;
  console.log("Preserved existing .env.local without changing its values.");
}

const findings = await inspectDeveloperEnvironment({ root });
if (hasFailures(findings)) {
  console.error("Bootstrap could not validate the local shell. Run npm run doctor for details.");
  process.exitCode = 1;
} else {
  console.log("GAME04 local shell bootstrap is ready. Run npm run doctor for details.");
}
