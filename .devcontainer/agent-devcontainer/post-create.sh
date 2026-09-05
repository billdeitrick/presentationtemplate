#!/usr/bin/env bash
# Runs INSIDE the agent container (via devcontainer.json's postCreateCommand).
set -euo pipefail

echo "[iron-proxy] trusting proxy CA..."
sudo update-ca-certificates

# The bind-mounted workspace shows up owned by a different user (often root)
# than the container's developer user, which trips git's dubious-ownership
# check on every git command. This is the intended trust boundary here (the
# whole point of this container is to work in this one repo), so trust it.
git config --global --add safe.directory "$(pwd)"

# Standard project setup (npm install, etc.)
bash .devcontainer/setup.sh

echo "[iron-proxy] checking egress through the proxy..."
if curl -fsS --max-time 10 https://github.com >/dev/null; then
  echo "[iron-proxy] OK — traffic is flowing through iron-proxy."
else
  echo "[iron-proxy] WARNING — could not reach github.com through iron-proxy."
  echo "[iron-proxy] Check .devcontainer/agent-devcontainer/config/proxy.yaml (allowlist)"
  echo "[iron-proxy] and that the iron-proxy container is healthy: docker logs iron-proxy"
fi
