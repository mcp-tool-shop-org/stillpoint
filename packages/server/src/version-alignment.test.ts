import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const rootPkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "..", "package.json"), "utf-8"));

describe("version alignment", () => {
  it("server package version is semver", () => {
    const parts = serverPkg.version.split(".");
    assert.equal(parts.length, 3, `expected semver, got ${serverPkg.version}`);
    for (const part of parts) {
      assert.ok(/^\d+$/.test(part), `non-numeric version part: ${part}`);
    }
  });

  it("server version matches root version", () => {
    assert.equal(serverPkg.version, rootPkg.version, `server (${serverPkg.version}) != root (${rootPkg.version})`);
  });

  it("CHANGELOG mentions current version", () => {
    const changelog = readFileSync(join(__dirname, "..", "..", "..", "CHANGELOG.md"), "utf-8");
    assert.ok(changelog.includes(serverPkg.version), `CHANGELOG missing version ${serverPkg.version}`);
  });
});
