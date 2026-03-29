import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { RegulatorState } from "./state.ts";

// Dynamic import so the module is re-evaluated each time we mutate env vars
async function loadCreateEngineManager() {
  // Force re-import by appending a cache-bust query (tsx/esm respects this)
  const { createEngineManager } = await import("./engine-manager.ts");
  return createEngineManager;
}

describe("createEngineManager — NullBackend fallback", () => {
  let origPath: string | undefined;

  afterEach(() => {
    if (origPath === undefined) {
      delete process.env.SONIC_RUNTIME_PATH;
    } else {
      process.env.SONIC_RUNTIME_PATH = origPath;
    }
  });

  it("uses NullBackend and sets runtime_missing error when SONIC_RUNTIME_PATH is unset", async () => {
    origPath = process.env.SONIC_RUNTIME_PATH;
    delete process.env.SONIC_RUNTIME_PATH;

    const createEngineManager = await loadCreateEngineManager();
    const state = new RegulatorState();
    const manager = await createEngineManager(state);

    try {
      assert.ok(manager.engine, "engine should be set");
      assert.strictEqual(manager.sidecar, null, "sidecar should be null on NullBackend path");
      const err = state.current.error;
      assert.ok(err !== null, "error should be set");
      assert.strictEqual(err!.code, "runtime_missing");
      assert.ok(err!.message.length > 0);
    } finally {
      manager.dispose();
    }
  });

  it("uses NullBackend when SONIC_RUNTIME_PATH points to non-existent file", async () => {
    origPath = process.env.SONIC_RUNTIME_PATH;
    process.env.SONIC_RUNTIME_PATH = "/nonexistent/path/to/sonic-runtime-binary";

    const createEngineManager = await loadCreateEngineManager();
    const state = new RegulatorState();
    const manager = await createEngineManager(state);

    try {
      assert.ok(manager.engine, "engine should be set");
      assert.strictEqual(manager.sidecar, null, "sidecar should be null");
      const err = state.current.error;
      assert.ok(err !== null, "error should be set for missing runtime");
    } finally {
      manager.dispose();
    }
  });

  it("dispose() is idempotent — calling twice does not throw", async () => {
    origPath = process.env.SONIC_RUNTIME_PATH;
    delete process.env.SONIC_RUNTIME_PATH;

    const createEngineManager = await loadCreateEngineManager();
    const state = new RegulatorState();
    const manager = await createEngineManager(state);

    // First dispose
    assert.doesNotThrow(() => manager.dispose());
    // Second dispose — should be a no-op
    assert.doesNotThrow(() => manager.dispose());
  });
});
