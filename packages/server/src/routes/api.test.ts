import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { RegulatorState } from "../state.ts";
import { createServer } from "../server.ts";

// ---------------------------------------------------------------------------
// Mock SonicEngine — satisfies the interface createServer/apiRouter expects
// ---------------------------------------------------------------------------
let mockPbCounter = 0;

function makeMockEngine() {
  return {
    play: async (_source: unknown, _opts: unknown) => `mock-pb-${mockPbCounter++}`,
    stop: async (_pbId: string) => {},
    set_volume: async (_pbId: string, _vol: number) => {},
    get_devices: async () => [],
    dispose: () => {},
    handlePlaybackEnded: (_pbId: string, _reason: unknown) => {},
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function startServer(engine: ReturnType<typeof makeMockEngine>, state: RegulatorState): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const app = createServer(engine as never, state);
    const http = createHttpServer(app);
    http.listen(0, "127.0.0.1", () => {
      const port = (http.address() as AddressInfo).port;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((res, rej) => http.close((err) => (err ? rej(err) : res()))),
      });
    });
    http.on("error", reject);
  });
}

async function get(url: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url);
  const body = await res.json();
  return { status: res.status, body };
}

async function post(url: string, data: unknown): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  return { status: res.status, body };
}

// ---------------------------------------------------------------------------
// Smoke test (F-T-004): createServer returns an express app
// ---------------------------------------------------------------------------
describe("createServer smoke test", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;
  let engine: ReturnType<typeof makeMockEngine>;

  before(async () => {
    state = new RegulatorState();
    engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => {
    await close();
  });

  it("GET /api/state returns 200 with mixer state shape", async () => {
    const { status, body } = await get(`${url}/api/state`);
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.ok("layers" in b, "response should have layers");
    assert.ok("deviceId" in b, "response should have deviceId");
    assert.ok("error" in b, "response should have error");
  });
});

// ---------------------------------------------------------------------------
// Full API route tests (F-T-001)
// ---------------------------------------------------------------------------
describe("GET /api/sounds", () => {
  let url: string;
  let close: () => Promise<void>;

  before(async () => {
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("returns catalog with categories and sounds", async () => {
    const { status, body } = await get(`${url}/api/sounds`);
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.ok(Array.isArray(b.categories), "should have categories array");
    assert.ok(Array.isArray(b.sounds), "should have sounds array");
    assert.ok((b.sounds as unknown[]).length >= 50, "should have 50+ sounds");
  });
});

describe("GET /api/state", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("returns current state", async () => {
    const { status, body } = await get(`${url}/api/state`);
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.deepStrictEqual(b.layers, []);
    assert.strictEqual(b.deviceId, null);
    assert.strictEqual(b.error, null);
  });
});

describe("POST /api/layers/add", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;
  let engine: ReturnType<typeof makeMockEngine>;

  before(async () => {
    state = new RegulatorState();
    engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("missing soundId → 400", async () => {
    const { status, body } = await post(`${url}/api/layers/add`, {});
    assert.strictEqual(status, 400);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("unknown soundId → 404", async () => {
    const { status, body } = await post(`${url}/api/layers/add`, { soundId: "not-a-real-sound-xyz" });
    assert.strictEqual(status, 404);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("valid soundId → 200 with playbackId", async () => {
    const { status, body } = await post(`${url}/api/layers/add`, { soundId: "heavy-rain", volume: 0.5 });
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.ok(typeof b.playbackId === "string", "should return a playbackId string");
    assert.ok((b.playbackId as string).startsWith("mock-pb-"));
  });

  it("duplicate soundId → 409", async () => {
    // heavy-rain was added in the previous test; the shared state/engine means it's already playing
    const { status, body } = await post(`${url}/api/layers/add`, { soundId: "heavy-rain" });
    assert.strictEqual(status, 409);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("path traversal soundId → 404", async () => {
    // soundAssetRef is called only after findSound succeeds; findSound won't match traversal strings
    const { status, body } = await post(`${url}/api/layers/add`, { soundId: "../etc/passwd" });
    assert.strictEqual(status, 404);
    assert.ok((body as Record<string, unknown>).error);
  });
});

describe("POST /api/layers/remove", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("missing playbackId → 400", async () => {
    const { status } = await post(`${url}/api/layers/remove`, {});
    assert.strictEqual(status, 400);
  });

  it("unknown playbackId → 404 (F-A-006)", async () => {
    const { status, body } = await post(`${url}/api/layers/remove`, { playbackId: "mock-pb-999" });
    assert.strictEqual(status, 404);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("tracked playbackId → 200", async () => {
    state.addLayer("rain", "mock-pb-tracked", 0.5);
    const { status, body } = await post(`${url}/api/layers/remove`, { playbackId: "mock-pb-tracked" });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
  });
});

describe("POST /api/layers/volume", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;
  let engine: ReturnType<typeof makeMockEngine>;

  before(async () => {
    state = new RegulatorState();
    engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("missing level → 400", async () => {
    const { status } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-0" });
    assert.strictEqual(status, 400);
  });

  it("NaN level → 400", async () => {
    // JSON does not support NaN — sending null instead tests the typeof guard
    const res = await fetch(`${url}/api/layers/volume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbackId: "mock-pb-vol-0", level: null }),
    });
    assert.strictEqual(res.status, 400);
  });

  it("level > 1 → 400", async () => {
    const { status } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-0", level: 1.5 });
    assert.strictEqual(status, 400);
  });

  it("level < 0 → 400", async () => {
    const { status } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-0", level: -0.1 });
    assert.strictEqual(status, 400);
  });

  it("unknown playbackId → 404 (F-A-007)", async () => {
    // engine.set_volume succeeds but the layer is not tracked in state → 404
    const { status, body } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-not-tracked", level: 0.5 });
    assert.strictEqual(status, 404);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("engine.set_volume throws → 500", async () => {
    // Override set_volume to throw for this test
    const originalSetVolume = engine.set_volume;
    engine.set_volume = async (_pbId: string, _vol: number) => { throw new Error("audio device lost"); };
    state.addLayer("vol-err-sound", "mock-pb-vol-err", 0.5);
    try {
      const { status, body } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-err", level: 0.5 });
      assert.strictEqual(status, 500);
      assert.ok((body as Record<string, unknown>).error);
    } finally {
      engine.set_volume = originalSetVolume;
      state.removeLayer("mock-pb-vol-err");
    }
  });

  it("valid tracked playbackId + level → 200", async () => {
    // Pre-populate state so the layer is tracked
    state.addLayer("vol-test-sound", "mock-pb-vol-tracked", 0.5);
    const { status, body } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-tracked", level: 0.75 });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
  });
});

describe("POST /api/stop-all", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;
  let engine: ReturnType<typeof makeMockEngine>;

  before(async () => {
    state = new RegulatorState();
    engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("clears all layers and returns ok", async () => {
    // Add layers first
    await post(`${url}/api/layers/add`, { soundId: "heavy-rain", volume: 0.5 });
    await post(`${url}/api/layers/add`, { soundId: "white-noise", volume: 0.3 });

    const stateBeforeStop = await get(`${url}/api/state`);
    assert.ok(((stateBeforeStop.body as Record<string, unknown>).layers as unknown[]).length >= 2);

    const { status, body } = await post(`${url}/api/stop-all`, {});
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);

    const { body: stateAfter } = await get(`${url}/api/state`);
    assert.deepStrictEqual((stateAfter as Record<string, unknown>).layers, []);
  });
});
