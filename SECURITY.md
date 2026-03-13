# Security Policy

## Threat Model

Stillpoint is a local desktop application. The server binds to localhost only (port 3456). The UI communicates with the server over local HTTP. sonic-runtime communicates over stdio.

**Attack surface:**
- Local HTTP API (localhost:3456) — accessible to local processes only
- File paths for audio assets — operator-configured via AMBIENT_WAVS_PATH
- sonic-runtime binary path — operator-configured via SONIC_RUNTIME_PATH

**Out of scope:**
- Network attacks from remote hosts (server binds to localhost)
- Authentication (local single-user application)
- Data storage (no persistent user data)

## No Telemetry

Stillpoint collects no telemetry, analytics, or usage data. No external network requests are made. All communication is local: browser ↔ Express server ↔ sonic-runtime.

## Reporting a Vulnerability

If you discover a security issue, please email [64996768+mcp-tool-shop@users.noreply.github.com](mailto:64996768+mcp-tool-shop@users.noreply.github.com) with details. We will respond within 7 days.

Please do not open public issues for security vulnerabilities.
