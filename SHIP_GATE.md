# Ship Gate

> No repo is "done" until every applicable line is checked.
> Copy this into your repo root. Check items off per-release.

**Tags:** `[all]` every repo · `[npm]` `[pypi]` `[vsix]` `[desktop]` `[container]` published artifacts · `[mcp]` MCP servers · `[cli]` CLI tools

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report email, supported versions, response timeline) (2026-03-29)
- [x] `[all]` README includes threat model paragraph (data touched, data NOT touched, permissions required) (2026-03-29)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (2026-03-29)
- [x] `[all]` No telemetry by default — state it explicitly even if obvious (2026-03-29)

### Default safety posture

- [ ] `[cli|mcp|desktop]` SKIP: not a CLI/MCP/desktop app — Electron/web app with no dangerous system actions
- [x] `[cli|mcp|desktop]` File operations constrained to known directories — custom sound path traversal guard in place (2026-03-29)
- [ ] `[mcp]` SKIP: not an MCP server
- [ ] `[mcp]` SKIP: not an MCP server

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` — API layer enforces this pattern (2026-03-29)
- [ ] `[cli]` SKIP: not a CLI tool
- [ ] `[cli]` SKIP: not a CLI tool
- [ ] `[mcp]` SKIP: not an MCP server
- [ ] `[mcp]` SKIP: not an MCP server
- [x] `[desktop]` Errors shown as user-friendly messages — no raw exceptions in UI — ErrorBanner component handles this (2026-03-29)
- [ ] `[vscode]` SKIP: not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (2026-03-29)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format) (2026-03-29)
- [x] `[all]` LICENSE file present and repo states support status (2026-03-29)
- [ ] `[cli]` SKIP: not a CLI tool
- [ ] `[cli|mcp|desktop]` SKIP: no interactive logging levels — desktop app uses browser console only
- [ ] `[mcp]` SKIP: not an MCP server
- [x] `[complex]` HANDBOOK.md: 6 handbook pages in site/src/content/docs/handbook/ covering architecture, beginner guide, getting started, reference, and usage (2026-03-29)

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (test + build + smoke in one command) — `npm run verify` added (2026-03-29)
- [x] `[all]` Version in manifest matches git tag — v1.0.1 in package.json; tag created during release process (2026-03-29)
- [x] `[all]` Dependency scanning runs in CI (ecosystem-appropriate) — `npm audit` in CI workflow (2026-03-29)
- [x] `[all]` Automated dependency update mechanism exists — Dependabot configured (2026-03-29)
- [ ] `[npm]` SKIP: private monorepo workspace, not published to npm — `npm pack --dry-run` not applicable
- [x] `[npm]` `engines.node` set — `>=20` in root package.json (2026-03-29)
- [x] `[npm]` Lockfile committed (2026-03-29)
- [ ] `[vsix]` SKIP: not a VS Code extension
- [ ] `[desktop]` SKIP: web/Electron app — no native installer package required for this deployment model

## E. Identity (soft gate — does not block ship)

- [x] `[all]` Logo in README header (2026-03-29)
- [ ] `[all]` Translations (polyglot-mcp, 8 languages)
- [ ] `[org]` Landing page (@mcptoolshop/site-theme)
- [ ] `[all]` GitHub repo metadata: description, homepage, topics

---

## Gate Rules

**Hard gate (A–D):** Must pass before any version is tagged or published.
If a section doesn't apply, mark `SKIP:` with justification — don't leave it unchecked.

**Soft gate (E):** Should be done. Product ships without it, but isn't "whole."

**Checking off:**
```
- [x] `[all]` SECURITY.md exists (2026-02-27)
```

**Skipping:**
```
- [ ] `[pypi]` SKIP: not a Python project
```
