import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const migrationDirectory = path.join(root, "supabase", "migrations");
const taskDirectory = path.join(root, "docs", "development", "tasks");

const migrationPattern = /^(\d{14})_[a-z0-9_]+\.sql$/;
const requiredTaskFields = [
  "TASK ID",
  "OWNER",
  "PRIORITY",
  "STATUS",
  "SLOT",
  "BASE COMMIT",
  "BRANCH",
  "MIGRATION VERSION",
];
const requiredTaskHeadings = [
  "Scope",
  "Do not touch",
  "Dependencies",
  "Planned files",
  "Acceptance criteria",
  "Validation",
  "Expected output",
  "Blockers",
];

function fail(messages) {
  for (const message of messages) console.error(`repository contract: ${message}`);
  process.exitCode = 1;
}

async function verifyMigrations() {
  const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql"));
  const errors = [];
  const versions = new Map();

  for (const file of files) {
    const match = migrationPattern.exec(file);
    if (!match) {
      errors.push(`invalid migration filename: ${file}`);
      continue;
    }

    const [, version] = match;
    if (versions.has(version)) {
      errors.push(`duplicate migration version ${version}: ${versions.get(version)}, ${file}`);
    } else {
      versions.set(version, file);
    }
  }

  return errors;
}

function fieldValue(markdown, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown.match(new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "mi"))?.[1]?.trim();
}

async function verifyTasks() {
  const files = (await readdir(taskDirectory))
    .filter((file) => file.endsWith(".md") && file !== "TEMPLATE.md");
  const errors = [];
  const activeMigrationReservations = new Map();

  for (const file of files) {
    const markdown = await readFile(path.join(taskDirectory, file), "utf8");

    for (const field of requiredTaskFields) {
      if (!fieldValue(markdown, field)) errors.push(`${file} is missing field ${field}`);
    }
    for (const heading of requiredTaskHeadings) {
      if (!new RegExp(`^## ${heading}$`, "mi").test(markdown)) {
        errors.push(`${file} is missing heading ${heading}`);
      }
    }

    const status = fieldValue(markdown, "STATUS")?.replaceAll("`", "").toUpperCase();
    if (!new Set(["READY", "IN_PROGRESS"]).has(status)) continue;

    const branch = fieldValue(markdown, "BRANCH")?.replaceAll("`", "");
    if (!branch?.startsWith("codex/") || branch !== branch.toLowerCase()) {
      errors.push(`${file} has invalid active branch: ${branch ?? "missing"}`);
    }

    const migrationVersion = fieldValue(markdown, "MIGRATION VERSION")?.replaceAll("`", "");
    if (migrationVersion && migrationVersion !== "NONE") {
      if (!/^\d{14}$/.test(migrationVersion)) {
        errors.push(`${file} has invalid migration reservation: ${migrationVersion}`);
      } else if (activeMigrationReservations.has(migrationVersion)) {
        errors.push(
          `${file} duplicates migration reservation ${migrationVersion} from ${activeMigrationReservations.get(migrationVersion)}`,
        );
      } else {
        activeMigrationReservations.set(migrationVersion, file);
      }
    }
  }

  return errors;
}

const errors = [...await verifyMigrations(), ...await verifyTasks()];
if (errors.length > 0) {
  fail(errors);
} else {
  console.log("Repository migration and task contracts are valid.");
}
