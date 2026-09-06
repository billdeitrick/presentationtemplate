#!/usr/bin/env bash
# Runs INSIDE the agent container (via devcontainer.json's postCreateCommand).
set -euo pipefail

# Commits made in here can come from either Claude Code or Copilot CLI in the
# same shell, with no reliable way to tell which one is "active" at config
# time — so use one shared identity for the container rather than guessing.
# This makes agent-authored commits instantly distinguishable from your own
# in `git log`/`git blame`; which specific tool/model drove a given commit is
# left to that tool's own commit-trailer convention (e.g. Claude Code appends
# a `Co-Authored-By:` trailer automatically).
git config --global user.name "Sandboxed Agent"
git config --global user.email "agent@presentationtemplate.local"

# Standard project setup — safe.directory, npm install, etc. — shared with
# the human devcontainer.
bash .devcontainer/setup.sh

echo "[iron-proxy] checking egress through the proxy..."
if curl -fsS --max-time 10 https://github.com >/dev/null; then
  echo "[iron-proxy] OK — traffic is flowing through iron-proxy."
else
  echo "[iron-proxy] WARNING — could not reach github.com through iron-proxy."
  echo "[iron-proxy] Check .devcontainer/agent-devcontainer/config/proxy.yaml (allowlist)"
  echo "[iron-proxy] and that the iron-proxy container is healthy: docker logs iron-proxy"
fi
