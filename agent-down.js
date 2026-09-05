#!/usr/bin/env node
// Manual/forced teardown of the agent devcontainer. You shouldn't need
// this in the common case — agent-up.js tears down automatically when the
// last attached shell exits — but it's here for when something's stuck,
// or you just want it down regardless of tracked sessions.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const composeDir = path.join(__dirname, ".devcontainer", "agent-devcontainer");

// Re-derive .env if it's missing (fresh checkout, or it was deleted) so
// compose targets the same project/containers agent-up.js created.
execFileSync("node", ["init-host.js"], { cwd: composeDir, stdio: "inherit" });
execFileSync("docker", ["compose", "down"], { cwd: composeDir, stdio: "inherit" });

// Everything init-host.js generates: the CA (private key included) and the
// per-checkout .env, plus the session-tracking dir. Regenerating these on
// the next cold start is cheap, so there's no reason to leave them behind.
for (const rel of [".env", "certs", ".sessions"]) {
  fs.rmSync(path.join(composeDir, rel), { recursive: true, force: true });
}
