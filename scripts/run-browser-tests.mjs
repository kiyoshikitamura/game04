import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const port = 3104;
const server = spawn(
  process.execPath,
  [path.join(root, "node_modules", "next", "dist", "bin", "next"), "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    detached: process.platform !== "win32",
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    },
  },
);

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("Browser test server exited before becoming ready.");
    try {
      const response = await fetch(`http://127.0.0.1:${port}`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Browser test server did not become ready within 60 seconds.");
}

function stopServer() {
  if (!server.pid || server.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      // The process group already stopped.
    }
  }
}

let exitCode = 1;
try {
  await waitForServer();
  const result = spawnSync(
    process.execPath,
    [path.join(root, "node_modules", "@playwright", "test", "cli.js"), "test"],
    { cwd: root, env: process.env, stdio: "inherit" },
  );
  exitCode = result.status ?? 1;
} finally {
  stopServer();
}

process.exit(exitCode);
