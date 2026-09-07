#!/usr/bin/env node
// Manages the agent devcontainer (iron-proxy + agent) from the terminal.
// Hand-rolled arg parsing on purpose — no CLI-parsing package, to keep this
// script free of project dependencies.
//
// Usage:
//   node agent.js up           Stand up the agent devcontainer via the real
//                              devcontainer CLI (so initializeCommand/
//                              postCreateCommand run exactly as they would
//                              in VS Code/Claude Code) and open a shell in
//                              it. Idempotent — if it's already running,
//                              this is a fast no-op and you just get a
//                              shell in the existing one. While at least
//                              one shell opened this way is still attached,
//                              the environment stays up; when the last one
//                              exits, it tears down automatically.
//   node agent.js down         Force a teardown regardless of tracked
//                              sessions. Shouldn't be needed in the common
//                              case — `up` tears down on its own — but it's
//                              here for when something's stuck. Keeps the
//                              persistent volumes (node_modules, and the
//                              developer home directory — claude/copilot
//                              auth, shell history, etc.).
//   node agent.js destroy      Like `down`, but also deletes the persistent
//                              volumes. Prompts for confirmation unless
//                              --yes/-y is passed. Use this when you
//                              actually want a clean slate (e.g. to reset
//                              claude/copilot auth), not for routine
//                              teardown.
//   node agent.js logs [args]  Tail iron-proxy's logs, e.g. to see what the
//                              allowlist is blocking/warning about. Extra
//                              args pass through to `docker compose logs`
//                              (default: -f).
//   node agent.js help         Show this message.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const { spawnSync, execFileSync } = require("child_process");

const repoRoot = __dirname;
const configPath = ".devcontainer/agent-devcontainer/devcontainer.json";
const composeDir = path.join(repoRoot, ".devcontainer", "agent-devcontainer");
const sessionsDir = path.join(composeDir, ".sessions");
// Pinned to what this setup was actually tested against — npx resolves this
// exact version regardless of what (if anything) is installed globally, so
// behavior doesn't silently shift with a `latest` tag over time.
const DEVCONTAINERS_CLI = "@devcontainers/cli@0.88.0";

const HELP = `Usage: node agent.js <command> [args]

Commands:
  up           Stand up the agent devcontainer (idempotent) and open a
               shell in it. Auto-tears down when the last attached shell
               exits.
  down         Force a teardown, regardless of tracked sessions. Shouldn't
               be needed in the common case. Keeps the persistent volumes.
  destroy      Like down, but also deletes the persistent volumes
               (node_modules, and the developer home directory — this is
               where claude/copilot auth lives). Prompts for confirmation
               unless --yes/-y is passed.
  logs [args]  Tail iron-proxy's logs. Extra args pass through to
               \`docker compose logs\` (default: -f).
  help         Show this message.
`;

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// Removes markers left behind by sessions that crashed instead of exiting
// normally (the only case the exit-triggered cleanup in cmdUp can't catch).
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

// Everything init-host.js generates: the per-checkout .env, plus the
// session-tracking dir. Regenerating these on the next cold start is cheap,
// so there's no reason to leave them behind once nothing's using them.
function cleanupGeneratedState() {
  for (const rel of [".env", ".sessions"]) {
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

function initHost() {
  execFileSync("node", ["init-host.js"], { cwd: composeDir, stdio: "inherit" });
}

function cmdUp() {
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
}

function cmdDown() {
  // Re-derive .env if it's missing (fresh checkout, or it was deleted) so
  // compose targets the same project/containers `up` created.
  initHost();
  execFileSync("docker", ["compose", "down"], { cwd: composeDir, stdio: "inherit" });
  cleanupGeneratedState();
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "yes");
    });
  });
}

async function cmdDestroy(extraArgs) {
  const skipConfirm = extraArgs.includes("--yes") || extraArgs.includes("-y");

  console.log("[agent] destroy — this removes the containers AND the persistent volumes:");
  console.log("  - node-modules      (harmless — npm install regenerates it)");
  console.log("  - developer-home    (claude/copilot auth, shell history, etc. — NOT recoverable)");

  if (!skipConfirm) {
    const ok = await confirm('Type "yes" to continue: ');
    if (!ok) {
      console.log("[agent] aborted — nothing was destroyed.");
      return;
    }
  }

  initHost();
  execFileSync("docker", ["compose", "down", "--volumes"], { cwd: composeDir, stdio: "inherit" });
  cleanupGeneratedState();
  console.log("[agent] destroyed.");
}

function cmdLogs(extraArgs) {
  initHost();
  execFileSync("docker", ["compose", "logs", ...(extraArgs.length ? extraArgs : ["-f"]), "iron-proxy"], {
    cwd: composeDir,
    stdio: "inherit",
  });
}

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case "up":
    cmdUp();
    break;
  case "down":
    cmdDown();
    break;
  case "destroy":
    cmdDestroy(rest);
    break;
  case "logs":
    cmdLogs(rest);
    break;
  case "help":
  case "--help":
  case "-h":
    console.log(HELP);
    break;
  case undefined:
    console.log(HELP);
    process.exit(1);
    break;
  default:
    console.error(`Unknown command: ${cmd}\n`);
    console.log(HELP);
    process.exit(1);
}
