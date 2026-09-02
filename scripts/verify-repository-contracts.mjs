import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const migrationDirectory = path.join(root, "supabase", "migrations");
const testDirectory = path.join(root, "supabase", "tests");
const taskDirectory = path.join(root, "docs", "development", "tasks");

const migrationPattern = /^(\d{14})_[a-z0-9_]+\.sql$/;
const contractTestPattern = /^(\d{14})_[a-z0-9_]+_contract\.sql$/;
const contractTestStartVersion = "20260902000003";
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
  const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
  const testFiles = (await readdir(testDirectory)).filter((file) => file.endsWith(".sql")).sort();
  const errors = [];
  const versions = new Map();
  const expectedTests = new Set();

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

    if (version >= contractTestStartVersion) {
      const expectedTest = file.replace(/\.sql$/, "_contract.sql");
      expectedTests.add(expectedTest);
      if (!testFiles.includes(expectedTest)) {
        errors.push(`migration ${file} is missing contract test supabase/tests/${expectedTest}`);
      }
    }
  }

  for (const testFile of testFiles) {
    const match = contractTestPattern.exec(testFile);
    if (!match) {
      errors.push(`invalid contract test filename: ${testFile}`);
      continue;
    }

    const [, version] = match;
    if (version >= contractTestStartVersion && !expectedTests.has(testFile)) {
      errors.push(`contract test ${testFile} has no matching migration`);
    }
  }

  return errors;
}

function fieldValue(markdown, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown.match(new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "mi"))?.[1]?.trim();
}

function sectionBody(markdown, heading) {
  const headingMatch = new RegExp(`^## ${heading}\\s*$`, "mi").exec(markdown);
  if (!headingMatch) return "";

  const remainder = markdown.slice(headingMatch.index + headingMatch[0].length).replace(/^\r?\n/, "");
  const nextHeadingIndex = remainder.search(/^## /m);
  return nextHeadingIndex === -1 ? remainder : remainder.slice(0, nextHeadingIndex);
}

async function verifyTasks() {
  const files = (await readdir(taskDirectory))
    .filter((file) => file.endsWith(".md") && file !== "TEMPLATE.md")
    .sort();
  const errors = [];
  const activeMigrationReservations = new Map();
  const activePlannedPaths = [];

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

    const taskId = fieldValue(markdown, "TASK ID")?.replaceAll("`", "") ?? file;

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

    const plannedSection = sectionBody(markdown, "Planned files");
    const plannedPaths = plannedSection
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*-\s+`([^`]+)`\s*$/)?.[1])
      .filter(Boolean);

    for (const plannedPath of plannedPaths) {
      const isDirectory = plannedPath.endsWith("/");
      const normalizedPath = plannedPath.replaceAll("\\", "/").replace(/\/$/, "");

      for (const existing of activePlannedPaths) {
        const overlaps = normalizedPath === existing.path
          || (isDirectory && existing.path.startsWith(`${normalizedPath}/`))
          || (existing.isDirectory && normalizedPath.startsWith(`${existing.path}/`));
        if (overlaps) {
          errors.push(`${taskId} planned path ${plannedPath} overlaps ${existing.taskId}: ${existing.original}`);
        }
      }

      activePlannedPaths.push({
        taskId,
        path: normalizedPath,
        original: plannedPath,
        isDirectory,
      });
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
