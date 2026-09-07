#!/usr/bin/env bash
# Shared setup for both devcontainers (human and agent), via postCreateCommand.
set -e

# The bind-mounted workspace shows up owned by a different user (often root,
# depending on the Docker Desktop backend's file-sharing layer) than the
# container's developer user, which trips git's dubious-ownership check
# (CVE-2022-24765) on every git command otherwise. This is the intended trust
# boundary for both devcontainers, so trust it.
git config --global --add safe.directory "$(pwd)"

sudo chown -R $(id -u):$(id -g) node_modules
npm install
