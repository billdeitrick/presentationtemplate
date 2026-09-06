---
name: sandbox-awareness
description: Detects whether the current shell is running inside this project's network-hardened agent devcontainer (checks the HARDENED_CONTAINER env var) and, if so, explains the egress restrictions and where to find the domain allowlist. Use before assuming general internet access is available, whenever a network/DNS/TLS/connection request unexpectedly fails or times out, or at the start of work in an unfamiliar shell.
---

# Sandbox awareness

## Check first

```bash
echo "$HARDENED_CONTAINER"
```

- **Empty/unset** — you're not in the sandboxed agent container (human devcontainer, bare host, CI, etc.). Network access follows whatever that environment normally allows. Nothing else in this file applies.
- **Set (`1`)** — you're inside `agent-devcontainer`. Read on before assuming you can reach any domain.

## What's restricted, and why

This container's network (`iron-internal`) is Docker-`internal: true` — it has **no route to the outside world at all**. The only way anything leaves is through the `iron-proxy` sidecar, which:

1. Answers every DNS query with its own address (so nothing can resolve a real IP and bypass it).
2. Runs in TLS **SNI-only** mode: it reads the hostname from the TLS ClientHello and either passes the connection straight through to that real upstream, or drops it — based on a domain allowlist.

Practically: a request to an allowlisted domain works exactly like normal internet access (real certs, no MITM). A request to anything else fails outright — connection refused/reset, not a slow timeout.

## Where the allowlist lives

[`.devcontainer/agent-devcontainer/config/proxy.yaml`](../../../.devcontainer/agent-devcontainer/config/proxy.yaml) — read this file directly to see exactly which domains are currently allowed (as of whenever you're reading it; it changes as the project's needs change). It ships with npm, GitHub, Anthropic/Claude, and Playwright's CDN allowlisted already — don't assume anything beyond what's actually listed there.

## If something you need isn't allowlisted

You can't make a config change here take effect yourself — `iron-proxy` reads `proxy.yaml` once at its own container start, and restarting that container is a host-side action outside this sandbox. If a request fails and the domain genuinely looks missing from the allowlist:

- Tell the user which domain failed and that it needs adding to `config/proxy.yaml`, followed by restarting the sandbox (`node agent.js down` + `node agent.js up`, or `docker compose restart iron-proxy` from the host).
- You're welcome to add the domain to `proxy.yaml` yourself as a courtesy edit, but it won't take effect until the user (or a future session) restarts the proxy — don't assume it started working just because you edited the file.

## Full architecture

For the complete picture (why `internal: true` actually blocks egress at the iptables level, the DNS-interception mechanism, project-uniqueness, etc.), see [`docs/agent-devcontainer.md`](../../../docs/agent-devcontainer.md).
