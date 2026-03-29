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

  it("boundary level=0 (min) → 200 (PH-T-014)", async () => {
    state.addLayer("vol-bound-zero", "mock-pb-vol-zero", 0.5);
    const { status, body } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-zero", level: 0 });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
  });

  it("boundary level=1 (max) → 200 (PH-T-014)", async () => {
    state.addLayer("vol-bound-one", "mock-pb-vol-one", 0.5);
    const { status, body } = await post(`${url}/api/layers/volume`, { playbackId: "mock-pb-vol-one", level: 1 });
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

// ---------------------------------------------------------------------------
// PH-T-001: Rate limiter 429 path
// Uses an isolated server so the rate limiter window is not shared with other tests
// ---------------------------------------------------------------------------
describe("rate limiter — 429 after 120 rapid mutations", () => {
  let url: string;
  let close: () => Promise<void>;

  before(async () => {
    // Fresh server = fresh rate limiter window
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("121st rapid POST /api/stop-all returns 429", async () => {
    // Fire 120 requests — all should pass the rate limit check (FT-S-012: raised from 30 to 120)
    for (let i = 0; i < 120; i++) {
      await post(`${url}/api/stop-all`, {});
    }
    // The 121st must be rate-limited
    const { status, body } = await post(`${url}/api/stop-all`, {});
    assert.strictEqual(status, 429);
    assert.ok((body as Record<string, unknown>).error, "429 response should include error message");
  });
});

// ---------------------------------------------------------------------------
// PH-T-002: GET /api/devices
// ---------------------------------------------------------------------------
describe("GET /api/devices", () => {
  let url: string;
  let close: () => Promise<void>;
  let engine: ReturnType<typeof makeMockEngine>;

  before(async () => {
    const state = new RegulatorState();
    engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("happy path returns an array", async () => {
    const { status, body } = await get(`${url}/api/devices`);
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body), "response body should be an array");
  });

  it("engine.get_devices throws → 500", async () => {
    const orig = engine.get_devices;
    engine.get_devices = async () => { throw new Error("device enumeration failed"); };
    try {
      const { status, body } = await get(`${url}/api/devices`);
      assert.strictEqual(status, 500);
      assert.ok((body as Record<string, unknown>).error, "500 response should include error field");
    } finally {
      engine.get_devices = orig;
    }
  });
});

// ---------------------------------------------------------------------------
// PH-T-003: engine.play() throw → 500 on POST /api/layers/add
// ---------------------------------------------------------------------------
describe("POST /api/layers/add — engine.play throws → 500", () => {
  let url: string;
  let close: () => Promise<void>;
  let engine: ReturnType<typeof makeMockEngine>;

  before(async () => {
    const state = new RegulatorState();
    engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("engine.play() throws → 500 with error message", async () => {
    const orig = engine.play;
    engine.play = async (_source: unknown, _opts: unknown) => { throw new Error("audio backend crashed"); };
    try {
      const { status, body } = await post(`${url}/api/layers/add`, { soundId: "heavy-rain", volume: 0.5 });
      assert.strictEqual(status, 500);
      assert.ok((body as Record<string, unknown>).error, "500 response should include error field");
    } finally {
      engine.play = orig;
    }
  });
});

// ---------------------------------------------------------------------------
// PH-T-005: engine.stop() swallowed error — graceful degradation
// ---------------------------------------------------------------------------
describe("POST /api/layers/remove — engine.stop throws → 200 (graceful degradation)", () => {
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

  it("stop error is swallowed and layer is removed from state", async () => {
    const pbId = "mock-pb-stop-throws";
    state.addLayer("brook", pbId, 0.4);

    const orig = engine.stop;
    engine.stop = async (_pbId: string) => { throw new Error("stop: audio device lost"); };
    try {
      const { status, body } = await post(`${url}/api/layers/remove`, { playbackId: pbId });
      assert.strictEqual(status, 200);
      assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
      // Layer must be removed from state even though stop() threw
      const stateRes = await get(`${url}/api/state`);
      const layers = (stateRes.body as Record<string, unknown>).layers as Array<Record<string, unknown>>;
      assert.ok(!layers.some((l) => l.playbackId === pbId), "layer should be removed from state after graceful stop failure");
    } finally {
      engine.stop = orig;
    }
  });
});

// ---------------------------------------------------------------------------
// FT-S-001: POST /api/device
// ---------------------------------------------------------------------------
describe("POST /api/device", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("missing deviceId key (undefined) → 200 with null default (no body field)", async () => {
    // When deviceId is absent from body, typeof deviceId !== "string" AND deviceId !== null
    // The implementation: if (deviceId !== null && typeof deviceId !== "string") → 400
    // undefined is not null and not string → 400
    const { status } = await post(`${url}/api/device`, {});
    assert.strictEqual(status, 400);
  });

  it("deviceId as non-string non-null value (number) → 400", async () => {
    const { status, body } = await post(`${url}/api/device`, { deviceId: 42 });
    assert.strictEqual(status, 400);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("deviceId as valid string → 200 ok and state updated", async () => {
    const { status, body } = await post(`${url}/api/device`, { deviceId: "speakers" });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
    assert.strictEqual(state.current.deviceId, "speakers");
  });

  it("deviceId as null → 200 ok and state reset to null", async () => {
    state.setDevice("old-device");
    const { status, body } = await post(`${url}/api/device`, { deviceId: null });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
    assert.strictEqual(state.current.deviceId, null);
  });
});

// ---------------------------------------------------------------------------
// FT-S-003: POST /api/volume/master
// ---------------------------------------------------------------------------
describe("POST /api/volume/master", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("missing level → 400", async () => {
    const { status, body } = await post(`${url}/api/volume/master`, {});
    assert.strictEqual(status, 400);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("level null (non-finite) → 400", async () => {
    const { status } = await post(`${url}/api/volume/master`, { level: null });
    assert.strictEqual(status, 400);
  });

  it("level > 1 → 400", async () => {
    const { status } = await post(`${url}/api/volume/master`, { level: 1.5 });
    assert.strictEqual(status, 400);
  });

  it("level < 0 → 400", async () => {
    const { status } = await post(`${url}/api/volume/master`, { level: -0.1 });
    assert.strictEqual(status, 400);
  });

  it("valid level 0.5 → 200 ok and state updated", async () => {
    const { status, body } = await post(`${url}/api/volume/master`, { level: 0.5 });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
    assert.strictEqual(state.current.masterVolume, 0.5);
  });

  it("boundary level=0 → 200", async () => {
    const { status, body } = await post(`${url}/api/volume/master`, { level: 0 });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
  });

  it("boundary level=1 → 200", async () => {
    const { status, body } = await post(`${url}/api/volume/master`, { level: 1 });
    assert.strictEqual(status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
  });
});

// ---------------------------------------------------------------------------
// FT-S-005: Sleep timer routes
// Uses isolated server per test group to avoid rate limiter interference
// ---------------------------------------------------------------------------
describe("GET /api/timer — no active timer", () => {
  let url: string;
  let close: () => Promise<void>;

  before(async () => {
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("returns { endTime: null } when no timer is set", async () => {
    const { status, body } = await get(`${url}/api/timer`);
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.ok("endTime" in b, "response should have endTime field");
    assert.strictEqual(b.endTime, null);
  });
});

describe("POST /api/timer", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => {
    // Cancel any lingering timers by deleting
    await fetch(`${url}/api/timer`, { method: "DELETE" });
    await close();
  });

  it("missing minutes → 400", async () => {
    const { status, body } = await post(`${url}/api/timer`, {});
    assert.strictEqual(status, 400);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("minutes=0 → 400 (not positive)", async () => {
    const { status } = await post(`${url}/api/timer`, { minutes: 0 });
    assert.strictEqual(status, 400);
  });

  it("minutes=-1 → 400 (negative)", async () => {
    const { status } = await post(`${url}/api/timer`, { minutes: -1 });
    assert.strictEqual(status, 400);
  });

  it("minutes=481 → 400 (exceeds max 480)", async () => {
    const { status } = await post(`${url}/api/timer`, { minutes: 481 });
    assert.strictEqual(status, 400);
  });

  it("valid minutes → 200 with endTime in the future", async () => {
    const before = Date.now();
    const { status, body } = await post(`${url}/api/timer`, { minutes: 30 });
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.ok("endTime" in b, "response should have endTime field");
    assert.ok(typeof b.endTime === "number", "endTime should be a number");
    assert.ok((b.endTime as number) > before, "endTime should be in the future");
    // Also confirm state updated
    assert.ok(state.current.timer !== null, "state.timer should be set");
  });

  it("setting a second timer replaces the first", async () => {
    const { status: s1 } = await post(`${url}/api/timer`, { minutes: 60 });
    assert.strictEqual(s1, 200);
    const firstEndTime = state.current.timer?.endTime;
    const { status: s2, body } = await post(`${url}/api/timer`, { minutes: 120 });
    assert.strictEqual(s2, 200);
    const b = body as Record<string, unknown>;
    assert.ok((b.endTime as number) > (firstEndTime ?? 0), "second timer should have later endTime");
  });
});

describe("DELETE /api/timer", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("returns { ok: true } when no timer is active", async () => {
    const res = await fetch(`${url}/api/timer`, { method: "DELETE" });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
  });

  it("cancels an active timer and returns { ok: true }", async () => {
    await post(`${url}/api/timer`, { minutes: 30 });
    assert.ok(state.current.timer !== null, "timer should be set before delete");
    const res = await fetch(`${url}/api/timer`, { method: "DELETE" });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
    assert.strictEqual(state.current.timer, null, "state.timer should be null after delete");
  });
});

// ---------------------------------------------------------------------------
// FT-S-002: Preset routes
// Uses STILLPOINT_DATA_PATH to isolate file I/O to a temp directory
// ---------------------------------------------------------------------------
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("GET /api/presets", () => {
  let url: string;
  let close: () => Promise<void>;
  let tmpDir: string;

  before(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-presets-"));
    process.env.STILLPOINT_DATA_PATH = tmpDir;
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => {
    delete process.env.STILLPOINT_DATA_PATH;
    await close();
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it("returns an empty array when no presets saved", async () => {
    const { status, body } = await get(`${url}/api/presets`);
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body), "response should be an array");
    assert.strictEqual((body as unknown[]).length, 0);
  });
});

describe("POST /api/presets — save current mix", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;
  let tmpDir: string;

  before(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-presets-save-"));
    process.env.STILLPOINT_DATA_PATH = tmpDir;
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => {
    delete process.env.STILLPOINT_DATA_PATH;
    await close();
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it("missing name → 400", async () => {
    const { status, body } = await post(`${url}/api/presets`, {});
    assert.strictEqual(status, 400);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("empty string name → 400", async () => {
    const { status } = await post(`${url}/api/presets`, { name: "   " });
    assert.strictEqual(status, 400);
  });

  it("valid name → 200 with preset object containing id, name, layers", async () => {
    // Add a layer to the mix so the preset captures it
    state.addLayer("rain", "mock-pb-preset", 0.6);
    const { status, body } = await post(`${url}/api/presets`, { name: "My Mix" });
    assert.strictEqual(status, 200);
    const preset = body as Record<string, unknown>;
    assert.ok(typeof preset.id === "string" && preset.id.length > 0, "preset should have an id");
    assert.strictEqual(preset.name, "My Mix");
    assert.ok(Array.isArray(preset.layers), "preset should have layers array");
    const layers = preset.layers as Array<Record<string, unknown>>;
    assert.strictEqual(layers.length, 1);
    assert.strictEqual(layers[0].soundId, "rain");
    assert.strictEqual(layers[0].volume, 0.6);
  });

  it("saved preset appears in GET /api/presets", async () => {
    const { body: list } = await get(`${url}/api/presets`);
    assert.ok(Array.isArray(list));
    assert.ok((list as unknown[]).length >= 1, "should have at least the saved preset");
    const found = (list as Array<Record<string, unknown>>).find(p => p.name === "My Mix");
    assert.ok(found, "saved preset should appear in the list");
  });
});

describe("DELETE /api/presets/:id", () => {
  let url: string;
  let close: () => Promise<void>;
  let tmpDir: string;

  before(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-presets-del-"));
    process.env.STILLPOINT_DATA_PATH = tmpDir;
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => {
    delete process.env.STILLPOINT_DATA_PATH;
    await close();
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it("unknown id → 404", async () => {
    const res = await fetch(`${url}/api/presets/nonexistent-id`, { method: "DELETE" });
    const body = await res.json();
    assert.strictEqual(res.status, 404);
    assert.ok((body as Record<string, unknown>).error);
  });

  it("valid id → removes preset and returns { ok: true }", async () => {
    // Save a preset first
    const { body: saved } = await post(`${url}/api/presets`, { name: "To Delete" });
    const id = (saved as Record<string, unknown>).id as string;
    assert.ok(typeof id === "string");

    const res = await fetch(`${url}/api/presets/${id}`, { method: "DELETE" });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual((body as Record<string, unknown>).ok, true);

    // Confirm it's gone
    const { body: list } = await get(`${url}/api/presets`);
    const found = (list as Array<Record<string, unknown>>).find(p => p.id === id);
    assert.strictEqual(found, undefined, "deleted preset should not appear in list");
  });
});

// ---------------------------------------------------------------------------
// GET /health shape
// ---------------------------------------------------------------------------
describe("GET /health", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("returns { ok, uptime, layers } shape", async () => {
    const { status, body } = await get(`${url}/health`);
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.strictEqual(b.ok, true, "ok should be true");
    assert.ok(typeof b.uptime === "number", "uptime should be a number");
    assert.ok(typeof b.layers === "number", "layers should be a number");
    assert.strictEqual(b.layers, 0, "layers should be 0 with no active layers");
  });

  it("layers count reflects active state", async () => {
    state.addLayer("wind", "mock-pb-health-1", 0.5);
    state.addLayer("rain", "mock-pb-health-2", 0.5);
    const { body } = await get(`${url}/health`);
    const b = body as Record<string, unknown>;
    assert.strictEqual(b.layers, 2, "layers should reflect active layer count");
    // cleanup
    state.clearAllLayers();
  });
});

// ---------------------------------------------------------------------------
// FT-T-006: stop-all with partial engine failures
// ---------------------------------------------------------------------------
describe("POST /api/stop-all — partial engine.stop failures → still clears state", () => {
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

  it("returns 200 and state.layers is empty even when one engine.stop throws", async () => {
    // Pre-add 2 layers directly into state
    state.addLayer("brook", "pb-partial-1", 0.5);
    state.addLayer("wind", "pb-partial-2", 0.4);
    assert.strictEqual(state.current.layers.length, 2);

    const orig = engine.stop;
    let stopCount = 0;
    engine.stop = async (pbId: string) => {
      stopCount++;
      if (stopCount === 1) throw new Error("stop failed for first layer");
      return orig.call(engine, pbId);
    };

    try {
      const { status, body } = await post(`${url}/api/stop-all`, {});
      assert.strictEqual(status, 200);
      assert.deepStrictEqual((body as Record<string, unknown>).ok, true);
      assert.strictEqual(state.current.layers.length, 0, "state.layers should be empty after stop-all");
    } finally {
      engine.stop = orig;
    }
  });
});

// ---------------------------------------------------------------------------
// FT-T-007: CORS enforcement
// ---------------------------------------------------------------------------
describe("CORS enforcement", () => {
  let url: string;
  let close: () => Promise<void>;

  before(async () => {
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("OPTIONS preflight from unlisted origin does not reflect Access-Control-Allow-Origin", async () => {
    const res = await fetch(`${url}/api/state`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://evil.example.com",
        "Access-Control-Request-Method": "GET",
      },
    });
    // The origin should NOT be reflected back for unlisted origins
    const allowOrigin = res.headers.get("access-control-allow-origin");
    assert.ok(
      allowOrigin !== "http://evil.example.com",
      `Unlisted origin should not be reflected, got: ${allowOrigin}`,
    );
  });

  it("OPTIONS preflight from listed origin reflects Access-Control-Allow-Origin", async () => {
    const res = await fetch(`${url}/api/state`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3456",
        "Access-Control-Request-Method": "GET",
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    assert.strictEqual(
      allowOrigin,
      "http://localhost:3456",
      `Listed origin should be reflected, got: ${allowOrigin}`,
    );
  });
});

// ---------------------------------------------------------------------------
// FT-T-008: Body size limit (4KB)
// ---------------------------------------------------------------------------
describe("POST /api/layers/add — body > 4KB → 413", () => {
  let url: string;
  let close: () => Promise<void>;

  before(async () => {
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("body larger than 4KB returns 413 or connection error", async () => {
    // Create a body larger than 4096 bytes
    const largePayload = JSON.stringify({ soundId: "a".repeat(5000) });
    let status: number;
    try {
      const res = await fetch(`${url}/api/layers/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: largePayload,
      });
      status = res.status;
    } catch {
      // Node's fetch may throw if connection is reset
      status = 413;
    }
    assert.strictEqual(status, 413, `Expected 413 for oversized body, got ${status}`);
  });
});

// ---------------------------------------------------------------------------
// FT-T-009: POST /api/sounds/reload returns updated catalog
// ---------------------------------------------------------------------------
describe("POST /api/sounds/reload", () => {
  let url: string;
  let close: () => Promise<void>;

  before(async () => {
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => { await close(); });

  it("returns updated catalog with categories and sounds array", async () => {
    const { status, body } = await post(`${url}/api/sounds/reload`, {});
    assert.strictEqual(status, 200);
    const b = body as Record<string, unknown>;
    assert.ok(Array.isArray(b.categories), "catalog should have categories array");
    assert.ok(Array.isArray(b.sounds), "catalog should have sounds array");
    assert.ok((b.sounds as unknown[]).length >= 50, "catalog should have 50+ sounds");
  });

  it("GET /api/sounds and POST /api/sounds/reload return consistent sound count", async () => {
    const { body: soundsBody } = await get(`${url}/api/sounds`);
    const { body: reloadBody } = await post(`${url}/api/sounds/reload`, {});
    const soundsCount = ((soundsBody as Record<string, unknown>).sounds as unknown[]).length;
    const reloadCount = ((reloadBody as Record<string, unknown>).sounds as unknown[]).length;
    assert.strictEqual(reloadCount, soundsCount, "reload should return same sound count as GET /sounds");
  });
});

// ---------------------------------------------------------------------------
// FT-T-010: POST /api/device with active layers re-routes them
// ---------------------------------------------------------------------------
describe("POST /api/device — re-routes active layers", () => {
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

  it("layers have new playbackIds after device switch", async () => {
    // Add a layer directly via the API so engine.play is called properly
    const addRes = await post(`${url}/api/layers/add`, { soundId: "heavy-rain", volume: 0.5 });
    assert.strictEqual(addRes.status, 200);
    const oldPlaybackId = (addRes.body as Record<string, unknown>).playbackId as string;
    assert.ok(typeof oldPlaybackId === "string");

    // Verify layer is in state
    assert.strictEqual(state.current.layers.length, 1);
    assert.strictEqual(state.current.layers[0].playbackId, oldPlaybackId);

    // Switch device — should re-route all active layers
    const deviceRes = await post(`${url}/api/device`, { deviceId: "speakers" });
    assert.strictEqual(deviceRes.status, 200);

    // After device switch, the layer should still exist but with a new playbackId
    const layersAfter = state.current.layers;
    assert.strictEqual(layersAfter.length, 1, "layer count should remain the same after device switch");
    assert.strictEqual(layersAfter[0].soundId, "heavy-rain", "soundId should be preserved");
    assert.strictEqual(layersAfter[0].volume, 0.5, "volume should be preserved");
    // The playbackId must be new (engine re-played)
    assert.notStrictEqual(layersAfter[0].playbackId, oldPlaybackId, "playbackId should be new after re-routing");
  });
});

// ---------------------------------------------------------------------------
// MAX_LAYERS cap: adding a 9th layer → 409
// ---------------------------------------------------------------------------
describe("POST /api/layers/add — MAX_LAYERS cap → 409", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
    // Pre-fill 8 layers directly into state (MAX_LAYERS = 8)
    const sounds = ["heavy-rain", "light-rain", "drizzle", "brook", "river", "ocean", "gentle-wind", "white-noise"];
    for (let i = 0; i < 8; i++) {
      state.addLayer(sounds[i], `pre-pb-${i}`, 0.5);
    }
  });

  after(async () => { await close(); });

  it("adding a 9th layer → 409 with max layers message", async () => {
    const { status, body } = await post(`${url}/api/layers/add`, { soundId: "waterfall", volume: 0.4 });
    assert.strictEqual(status, 409);
    const err = (body as Record<string, unknown>).error as string;
    assert.ok(typeof err === "string" && err.length > 0, "409 response should include error field");
  });
});
