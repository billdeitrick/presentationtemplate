#!/usr/bin/env node
// Tails iron-proxy's logs — e.g. to see what the allowlist is
// blocking/warning about. Extra args pass straight through to
// `docker compose logs`, e.g.: node agent-logs.js --tail=200
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.join(__dirname, ".devcontainer", "agent-devcontainer");
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", cwd: dir });

const extraArgs = process.argv.slice(2);

run("node", ["init-host.js"]);
run("docker", ["compose", "logs", ...(extraArgs.length ? extraArgs : ["-f"]), "iron-proxy"]);
