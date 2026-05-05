#!/usr/bin/env bash
set -e

curl -fsSL https://claude.ai/install.sh | bash
curl -fsSL https://opencode.ai/install | bash
curl -fsSL https://gh.io/copilot-install | bash

sudo chown -R $(id -u):$(id -g) node_modules
npm install
npm install -g @playwright/cli
npx playwright install --with-deps chromium
