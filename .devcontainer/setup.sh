#!/usr/bin/env bash
set -e

sudo chown -R $(id -u):$(id -g) node_modules
npm install
