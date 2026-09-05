FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install global tools as root
RUN npm install -g @playwright/cli
RUN playwright-cli install-browser --with-deps chromium --only-shell

# Create our developer user and set up the home directory. Sudo is scoped to
# exactly what postCreateCommand needs as root — trusting the proxy CA, and
# fixing ownership of the node_modules volume (Docker creates it root-owned)
# — not a blanket grant, since "developer" is meant to genuinely not be root.
RUN useradd --create-home --shell /bin/bash developer && \
    mkdir -p /home/developer && \
    chown -R developer:developer /home/developer && \
    { echo "developer ALL=(root) NOPASSWD: /usr/sbin/update-ca-certificates"; \
      echo "developer ALL=(root) NOPASSWD: /usr/bin/chown -R * node_modules"; \
    } > /etc/sudoers.d/developer && \
    chmod 0440 /etc/sudoers.d/developer

# Switch to the developer user to install user-specific tools
USER developer

# Install AI tools
RUN curl -fsSL https://claude.ai/install.sh | bash
RUN curl -fsSL https://gh.io/copilot-install | bash
