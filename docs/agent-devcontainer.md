# Agent Devcontainer

A network-isolated devcontainer for running an AI coding agent (Claude Code, Copilot CLI) against this repo. It exists alongside the normal `human-devcontainer` — same base `Dockerfile`, different orchestration — so a human can keep using the regular one while an agent works in a sandboxed copy with no direct internet access.

This doc exists so a future agent (or human) doesn't have to re-derive any of this from scratch. Everything here was verified by actually building and running the containers, not just written from the config — where something surprised us during testing, it's called out explicitly.

## Goals (as given)

1. An isolated internal network, unique per checkout, so multiple checkouts of this template don't collide on one Docker host.
2. `devcontainer.json` in `agent-devcontainer/` as the entry point.
3. All traffic forced through an `iron-proxy` sidecar — no other way out.
4. Automated cert generation and trust, so the human doesn't have to hand-run `openssl`/`update-ca-certificates`.

## File map

```
.devcontainer/
  Dockerfile                          shared by both devcontainers
  agent-devcontainer/
    devcontainer.json                 entry point
    docker-compose.yml                iron-proxy + agent services, the isolated network
    init-host.js                      HOST-side bootstrap (initializeCommand)
    post-create.sh                    CONTAINER-side setup (postCreateCommand)
    config/proxy.yaml                 iron-proxy's allowlist config (committed)
    certs/                            generated CA — gitignored, host-only
    .env                              generated project slug — gitignored, host-only
    .sessions/                        agent.js's shell-attachment tracking — gitignored
agent.js                              root-level CLI: up / down / logs
docs/agent-devcontainer.md            this file
```

## Architecture

Two Compose networks:

- **`iron-internal`** — `internal: true`. No route to the outside world at all. `agent` is the only service here that isn't also somewhere else.
- **`iron-egress`** — a normal network with real internet access.

`iron-proxy` is dual-homed on both (static IP `10.77.20.1` on `iron-internal`). `agent` is *only* on `iron-internal` (static IP `10.77.20.2`), with its DNS pointed at `10.77.20.1`. iron-proxy is a DNS-intercepting MITM proxy ([paradigmxyz/iron-proxy](https://github.com/paradigmxyz/iron-proxy), mirrored as `ironsh/iron-proxy`): it answers every DNS query with its own IP, then terminates TLS on `agent`'s behalf using a locally-generated CA and enforces a domain allowlist (`config/proxy.yaml`) before dialing the real upstream.

### Why this actually blocks egress (not just discourages it)

Verified directly (see conversation history / re-derivable via `iptables -L` inside a privileged container on the Docker host):

- A container attached only to an `internal: true` network gets **no default route** at all — `ip route show` shows only the local `/24`, nothing else. A raw-IP connection attempt (bypassing DNS entirely) fails instantly with "network unreachable," not a timeout.
- Independently of that, dockerd installs an explicit rule in its `DOCKER-INTERNAL` iptables chain: `DROP` any packet whose *incoming* interface is that bridge and whose destination isn't in the bridge's subnet. This is enforced on the host, so it holds even if something inside the container adds its own route (e.g. via `NET_ADMIN`).
- There's also no `MASQUERADE` rule for the internal subnet in `nat POSTROUTING` — every other (non-internal) bridge on the host has one for its subnet; this one doesn't. So even setting the above aside, return traffic to a private `10.77.20.x` address has no way back from the real internet anyway.
- iron-proxy itself escapes all of this simply because its *other* NIC is on `iron-egress`, a normal network — traffic out that interface never touches the internal bridge at all.

**Consequence:** Docker also refuses to *publish* ports for a container whose only network is internal (confirmed by testing — `ports:` mappings are silently accepted in the config but `docker port` shows `null`, nothing actually listens on the host). Publishing a port is an inbound path from outside, which is exactly what `internal: true` prevents. So `agent` cannot expose `8080`/`3456` to the host. If you want to view the rendered slides in a browser, use the human devcontainer, or curl/screenshot from inside the agent's own shell.

### Project-uniqueness mechanism (goal #1)

`docker-compose.yml`'s *only* naming mechanism is the top-level `name: ${COMPOSE_PROJECT_NAME}` — no explicit `name:` on the networks/volumes, no `container_name:` on the services. Compose auto-prefixes everything unnamed with the project name, so that one variable is the entire mechanism.

`init-host.js` (see below) derives that slug from a SHA-256 hash of the repo's absolute path, so it's stable for a given checkout and distinct across different checkouts/worktrees even if they share a folder name.

### Host bootstrap: `init-host.js` (why Node, not bash)

Runs via `initializeCommand`, on the **host**, before any container exists. Two jobs: write `.env` (`COMPOSE_PROJECT_NAME`, `WORKSPACE_NAME`), and generate the CA (`certs/ca.key` + `ca.crt`) if it doesn't already exist.

This was originally a bash script. It was rewritten in Node deliberately: on Windows, `initializeCommand` string values run through the host's default shell (`cmd.exe /c ...`), which does a bare PATH lookup for `bash` — and **both** Git Bash and a WSL launcher stub can be on PATH simultaneously, resolving to different filesystem semantics depending on install order. Node has no such ambiguity (one `node.exe`). Using Node here also means `execFileSync` passes argv arrays directly to `openssl` with no intermediate shell — no MSYS path-mangling of the `-subj "/CN=..."` argument, which is exactly the kind of thing that broke when this was bash (Git Bash's MSYS layer rewrites leading-`/` arguments into Windows paths unless `MSYS_NO_PATHCONV=1` is set).

No npm packages are used for this — it's host bootstrapping, not part of the project's own dependencies.

### Container setup: `Dockerfile` + `post-create.sh`

- Base image already has git and a `node` user (uid 1000). `useradd` creates `developer` on top, landing at uid **1001** — confirmed non-root.
- `developer`'s sudo is scoped to exactly two `NOPASSWD` entries: `update-ca-certificates` and a `chown -R * node_modules`. **Not** a blanket `ALL:ALL` grant — that would make "non-root" nominal only, since anything running as `developer` could trivially become root. The `chown` is needed because Docker creates named volumes (like `node_modules` here) root-owned by default, and `developer` needs to take ownership before `npm install` can write into it.
- `post-create.sh` (runs as `developer`, inside the container, via `postCreateCommand`):
  1. `sudo update-ca-certificates` — trusts the CA at the OS level.
  2. `git config --global --add safe.directory "$(pwd)"` — **necessary**: the bind-mounted workspace shows up owned by a different user (often root, depending on the Docker Desktop backend's file-sharing layer) than `developer`, which trips git's dubious-ownership check (CVE-2022-24765) on every git command otherwise.
  3. `bash .devcontainer/setup.sh` — the shared `npm install` step.
  4. A `curl https://github.com` sanity check that egress is actually flowing through the proxy.
- **Gotcha found by actually running this:** trusting the CA via `update-ca-certificates` was *not* enough to make `npm install` work — it still failed with `SELF_SIGNED_CERT_IN_CHAIN`. Node/npm ship their own CA bundle and ignore the OS trust store entirely. Fix: `NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/iron-ca.crt` set as an environment variable on the `agent` service in `docker-compose.yml`. If you add other non-Node tooling that makes HTTPS requests, check whether it has the same "own bundle, ignores OS store" behavior (Python's `certifi`-based stacks are a common example).

### `config/proxy.yaml`

Ships with `warn: true` — nothing is actually blocked yet, just logged with `"action":"warn"` in `docker logs iron-proxy` (or `node agent.js logs`). The allowlist is a starting point (Anthropic, GitHub, npm registry, Playwright's CDN), not exhaustive. Watch the warn-mode logs for what your actual workflow touches, add domains as needed, then flip to `warn: false` to actually enforce.

iron-proxy's config is passed via a `-config` CLI flag on the container's command (`command: ["-config", "/etc/iron-proxy/proxy.yaml"]`), **not** an environment variable — an earlier draft used `IRON_PROXY_CONFIG=...` and iron-proxy silently ignored it, refusing to start with `error: dns.proxy_ip is required` until the flag was used instead.

Also non-obvious: the network's IPAM config explicitly pins the gateway to `10.77.20.254`. Without that, Docker auto-assigns the gateway to `.1` — which collides with iron-proxy's own static address and the network fails to come up with "Address already in use."

### Masked paths inside the agent container

The agent gets the whole repo bind-mounted (`../..:/workspaces/${WORKSPACE_NAME}`), which would otherwise hand it:

- `certs/` — the CA **private key**. Shadowed with a `tmpfs` mount (always empty, nothing to leak, no cleanup needed).
- `.env` — not secret, but host/orchestration plumbing the agent has no business reading. Shadowed by bind-mounting `/dev/null` directly over that one file path (confirmed this resolves correctly through Docker Desktop/Rancher Desktop's Windows→Linux-VM path translation — an earlier design used a committed placeholder file instead, which works too but is unnecessary complexity once `/dev/null` was confirmed to work).
- `.sessions/` — same reasoning as `.env`, but it's a directory, so it uses `tmpfs` like `certs/`.

None of this affects the real files on the host — bind mounts only change what's visible *inside* the container's own mount namespace.

## `agent.js` — the CLI

Root-level, single file, hand-rolled arg parsing (no CLI-parsing package — this repo takes "no added dependencies" seriously, including for tooling like this).

```
node agent.js up      stand up the sandbox (idempotent) and open a shell in it
node agent.js down    force a teardown regardless of tracked sessions
node agent.js logs    tail iron-proxy's logs (extra args pass through to `docker compose logs`)
node agent.js help
```

`up` drives the **real** `@devcontainers/cli` (pinned to `0.88.0` via `npx --yes @devcontainers/cli@0.88.0 ...`, not left floating on `latest`) rather than reimplementing the devcontainer lifecycle by hand — confirmed that the CLI's own compose invocation (`docker compose --project-name <slug> ...`) picks up the exact same project slug our `.env` produces, so the uniqueness mechanism isn't bypassed by going through the CLI instead of raw `docker compose`.

`devcontainer up` is idempotent — reuses the same container if one's already running — so "stand it up" and "just get me a shell in the one that's already running" are the same code path; no special-casing needed.

### Auto-teardown on last shell exit

Each `agent.js up` invocation drops a marker file (`<pid>-<random>`) in `.sessions/` before opening the shell, via `spawnSync(..., {stdio: 'inherit'})` — which blocks the Node process (not proxying I/O itself; the terminal's file descriptors are inherited directly by the child, so Node isn't in the data path) until the shell exits. On exit, it removes its own marker and tears the environment down only if no other markers remain, pruning any marker whose PID is no longer alive first (so a crashed session doesn't permanently block teardown for everyone else).

**Bug found and fixed during testing:** `Number("")` is `0` in JS, not `NaN`. The staleness check originally only rejected non-integers, so a malformed/empty marker filename would parse to PID `0`, and `process.kill(0, 0)` doesn't throw — meaning a corrupted marker would be treated as "alive" forever, permanently blocking auto-teardown. Fixed by requiring `pid > 0`.

**If you're re-testing this by hand from Git Bash:** `$$` and `$!` inside Git Bash are MSYS-emulated PIDs, *not* real Win32 PIDs — `tasklist`/`taskkill` and Node's `process.kill()` (which use the real Windows process table) won't recognize them. To fake a session for testing, capture the real PID via `process.pid` printed from *inside* a genuinely-running Node process, not bash's job-control variables.

On full teardown (auto, or via `agent.js down`), `.env`, `certs/`, and `.sessions/` are all deleted — regenerating them on the next cold start is cheap (sub-second), so there's no reason to leave a stale CA/private key or slug lying around.

## Known limitations

- No way to view a served app (`npm run serve`) from the host browser while using the agent container — that's a direct consequence of `internal: true`, not a bug. Use the human devcontainer, or check output from inside the agent's shell.
- The allowlist in `config/proxy.yaml` is a reasonable starting point, not a complete list — expect to extend it as the agent's actual workflow surfaces new domains it needs (watch `node agent.js logs` in `warn: true` mode).
- Host prerequisites for `init-host.js`/`agent.js` to run at all: `node` and `openssl` on PATH (the latter is bundled with Git for Windows; a bare Windows install without Git wouldn't have it).
