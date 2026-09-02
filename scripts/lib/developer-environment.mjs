import { access, readFile } from "node:fs/promises";
import path from "node:path";

const supportedAppEnvironments = new Set(["development", "preview", "production"]);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function parseEnvironmentFile(source) {
  const values = new Map();

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(name, value);
  }

  return values;
}

function validSupabaseUrl(value) {
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return (url.protocol === "https:" && url.hostname.endsWith(".supabase.co"))
      || (local && (url.protocol === "http:" || url.protocol === "https:"));
  } catch {
    return false;
  }
}

function finding(level, code, message) {
  return { level, code, message };
}

export async function inspectDeveloperEnvironment({
  root = process.cwd(),
  envFile = ".env.local",
  requireServices = false,
  nodeVersion = process.versions.node,
} = {}) {
  const findings = [];
  const major = Number.parseInt(nodeVersion.split(".")[0] ?? "0", 10);
  findings.push(major >= 22
    ? finding("pass", "node-version", `Node.js ${major} satisfies the supported major version.`)
    : finding("fail", "node-version", "Node.js 22 or newer is required."));

  const requiredFiles = ["package.json", "package-lock.json", ".env.example"];
  for (const file of requiredFiles) {
    findings.push(await exists(path.join(root, file))
      ? finding("pass", `file:${file}`, `${file} is present.`)
      : finding("fail", `file:${file}`, `${file} is missing.`));
  }

  findings.push(await exists(path.join(root, "node_modules", "next", "package.json"))
    ? finding("pass", "dependencies", "Locked dependencies are installed.")
    : finding("fail", "dependencies", "Dependencies are not installed; run npm ci."));

  const envPath = path.resolve(root, envFile);
  if (!await exists(envPath)) {
    findings.push(finding("fail", "env-file", `${envFile} is missing; run npm run bootstrap.`));
    return findings;
  }

  findings.push(finding("pass", "env-file", `${envFile} is present and remains local.`));
  const values = parseEnvironmentFile(await readFile(envPath, "utf8"));
  const appEnvironment = values.get("NEXT_PUBLIC_APP_ENV") ?? "";
  findings.push(supportedAppEnvironments.has(appEnvironment)
    ? finding("pass", "app-environment", "The application environment identifier is valid.")
    : finding("fail", "app-environment", "NEXT_PUBLIC_APP_ENV must be development, preview, or production."));

  const exposedSecrets = [...values.keys()].filter((name) =>
    name.startsWith("NEXT_PUBLIC_") && (name.includes("SERVICE_ROLE") || name.includes("SECRET")),
  );
  findings.push(exposedSecrets.length === 0
    ? finding("pass", "public-secret-boundary", "No server-secret variable is exposed through NEXT_PUBLIC_.")
    : finding("fail", "public-secret-boundary", "A server-secret variable uses the NEXT_PUBLIC_ prefix."));

  const url = values.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
  const publishableKey = values.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ?? "";
  const configuredCount = Number(Boolean(url)) + Number(Boolean(publishableKey));

  if (configuredCount === 0) {
    findings.push(requireServices
      ? finding("fail", "supabase-required", "Connected-service validation requires both Supabase public values.")
      : finding("info", "supabase", "Supabase is intentionally unconfigured; the disconnected shell can run."));
  } else if (configuredCount !== 2) {
    findings.push(finding("fail", "supabase", "Supabase public configuration is partial; set both public values or neither."));
  } else if (!validSupabaseUrl(url)) {
    findings.push(finding("fail", "supabase", "The Supabase URL is not an accepted hosted or local URL."));
  } else {
    findings.push(finding("pass", "supabase", "Supabase public configuration has a valid shape."));
  }

  return findings;
}

export function hasFailures(findings) {
  return findings.some(({ level }) => level === "fail");
}
