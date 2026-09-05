#!/usr/bin/env node
// Brings up the agent devcontainer via the real devcontainer CLI — so
// initializeCommand/postCreateCommand run exactly as they would in VS
// Code/Claude Code, not a hand-rolled reimplementation of that lifecycle —
// then drops you into a shell in it. `devcontainer up` is idempotent: if
// the container's already running, this is a fast no-op and you just get
// a shell in the existing one.
//
// While at least one shell opened this way is still attached, the
// environment stays up. When the last one exits, this tears it down
// automatically — agent-down.js is still there for a manual/forced
// teardown, but you shouldn't need it in the common case.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const repoRoot = __dirname;
const configPath = ".devcontainer/agent-devcontainer/devcontainer.json";
const composeDir = path.join(repoRoot, ".devcontainer", "agent-devcontainer");
const sessionsDir = path.join(composeDir, ".sessions");
// Pinned to what this setup was actually tested against — npx resolves this
// exact version regardless of what (if anything) is installed globally, so
// behavior doesn't silently shift with a `latest` tag over time.
const DEVCONTAINERS_CLI = "@devcontainers/cli@0.88.0";

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// Removes markers left behind by sessions that crashed instead of exiting
// normally (the only case the exit-triggered cleanup below can't catch).
function pruneStaleSessions() {
  let entries = [];
  try {
    entries = fs.readdirSync(sessionsDir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const pid = Number(entry.split("-")[0]);
    if (!Number.isInteger(pid) || pid <= 0 || !isAlive(pid)) {
      fs.rmSync(path.join(sessionsDir, entry), { force: true });
    }
  }
}

// Everything init-host.js generates: the CA (private key included) and the
// per-checkout .env, plus the session-tracking dir. Regenerating these on
// the next cold start is cheap, so there's no reason to leave them behind
// once nothing's using them.
function cleanupGeneratedState() {
  for (const rel of [".env", "certs", ".sessions"]) {
    fs.rmSync(path.join(composeDir, rel), { recursive: true, force: true });
  }
}

function devcontainer(args) {
  return spawnSync("npx", ["--yes", DEVCONTAINERS_CLI, ...args], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: true,
  });
}

console.log("[agent] up (idempotent — reuses the container if it's already running)...");
const up = devcontainer(["up", "--workspace-folder", ".", "--config", configPath]);
if (up.status !== 0) process.exit(up.status ?? 1);

fs.mkdirSync(sessionsDir, { recursive: true });
pruneStaleSessions();
const marker = path.join(sessionsDir, `${process.pid}-${crypto.randomBytes(4).toString("hex")}`);
fs.writeFileSync(marker, "");

console.log("[agent] opening a shell (exiting the last one attached tears the environment down)...");
const shell = devcontainer(["exec", "--workspace-folder", ".", "--config", configPath, "bash"]);

fs.rmSync(marker, { force: true });
pruneStaleSessions();
let remaining = [];
try {
  remaining = fs.readdirSync(sessionsDir);
} catch {}

if (remaining.length === 0) {
  console.log("[agent] last shell exited — tearing down...");
  spawnSync("docker", ["compose", "down"], { cwd: composeDir, stdio: "inherit" });
  cleanupGeneratedState();
} else {
  console.log(`[agent] shell exited — ${remaining.length} other session(s) still attached, leaving it up.`);
}

process.exit(shell.status ?? 0);
