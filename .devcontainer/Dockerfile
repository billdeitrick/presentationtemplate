FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install system packages with Docker apt best practices: one update/install per layer,
# no recommended extras, and clean up package lists afterward.
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get install -y --no-install-recommends screen && \
    rm -rf /var/lib/apt/lists/*

# Shared, world-readable browser cache: install-browser needs --with-deps
# (root, for apt) but the container actually runs as `developer` — without a
# fixed path, the browser downloads to /root/.cache/ms-playwright and
# `developer` can't see it.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright

# Install global tools as root
RUN npm install -g @playwright/cli
# `open`'s default --browser is "chrome" (real Google Chrome, which we don't
# install), so every invocation needs `--browser chromium` explicitly — that
# resolves to this "chrome-for-testing" build, not the bundled headless
# shell (which also gets installed alongside it, but fatals with "No usable
# sandbox!" in this container if selected instead).
RUN playwright-cli install-browser --with-deps chrome-for-testing



# Create our developer user and set up the home directory. Sudo is scoped to
# exactly what postCreateCommand needs as root — fixing ownership of the
# node_modules volume (Docker creates it root-owned) — not a blanket grant,
# since "developer" is meant to genuinely not be root.
RUN useradd --create-home --shell /bin/bash developer && \
    mkdir -p /home/developer && \
    chown -R developer:developer /home/developer && \
    echo "developer ALL=(root) NOPASSWD: /usr/bin/chown -R * node_modules" > /etc/sudoers.d/developer && \
    chmod 0440 /etc/sudoers.d/developer

# Switch to the developer user to install user-specific tools
USER developer

# Install AI tools
RUN curl -fsSL https://claude.ai/install.sh | bash
RUN curl -fsSL https://gh.io/copilot-install | bash
