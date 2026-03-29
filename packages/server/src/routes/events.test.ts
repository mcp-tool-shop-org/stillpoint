import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { RegulatorState } from "../state.ts";
import { createServer } from "../server.ts";

// ---------------------------------------------------------------------------
// Mock engine (same pattern as api.test.ts)
// ---------------------------------------------------------------------------
function makeMockEngine() {
  return {
    play: async (_source: unknown, _opts: unknown) => `mock-pb-sse-${Date.now()}`,
    stop: async (_pbId: string) => {},
    set_volume: async (_pbId: string, _vol: number) => {},
    get_devices: async () => [],
    dispose: () => {},
    handlePlaybackEnded: (_pbId: string, _reason: unknown) => {},
  };
}

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

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

/**
 * Opens an SSE connection and collects up to `count` data frames, then aborts.
 * Returns the parsed JSON objects from each `data: ...` line.
 */
function collectSseFrames(url: string, count: number, timeoutMs = 3000): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`SSE timed out after ${timeoutMs}ms waiting for ${count} frames`));
    }, timeoutMs);

    const frames: unknown[] = [];
    let buf = "";

    fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/event-stream" },
    })
      .then((res) => {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        function pump(): void {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                clearTimeout(timer);
                resolve(frames);
                return;
              }

              buf += decoder.decode(value, { stream: true });
              const lines = buf.split("\n");
              buf = lines.pop()!; // keep incomplete last line

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    frames.push(JSON.parse(line.slice("data: ".length)));
                  } catch {
                    // ignore non-JSON (heartbeat comments)
                  }
                }
              }

              if (frames.length >= count) {
                clearTimeout(timer);
                controller.abort();
                resolve(frames);
                return;
              }

              pump();
            })
            .catch((err: unknown) => {
              clearTimeout(timer);
              // AbortError is expected when we abort after collecting enough frames
              if (err instanceof Error && err.name === "AbortError") {
                resolve(frames);
              } else {
                reject(err);
              }
            });
        }

        pump();
      })
      .catch((err: unknown) => {
        clearTimeout(timer);
        if (err instanceof Error && err.name === "AbortError") {
          resolve(frames);
        } else {
          reject(err);
        }
      });
  });
}

// ---------------------------------------------------------------------------
// Tests (F-T-002)
// ---------------------------------------------------------------------------
describe("GET /api/events — SSE", () => {
  let url: string;
  let close: () => Promise<void>;
  let state: RegulatorState;

  before(async () => {
    state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));
  });

  after(async () => {
    await close();
  });

  it("returns initial state as first SSE data frame", async () => {
    const frames = await collectSseFrames(`${url}/api/events`, 1);
    assert.strictEqual(frames.length, 1);
    const first = frames[0] as Record<string, unknown>;
    assert.ok("layers" in first, "initial frame should contain layers");
    assert.ok("deviceId" in first, "initial frame should contain deviceId");
    assert.ok("error" in first, "initial frame should contain error");
    assert.deepStrictEqual(first.layers, []);
    assert.strictEqual(first.deviceId, null);
    assert.strictEqual(first.error, null);
  });

  it("state change emits SSE data frame", async () => {
    // Start collecting 2 frames (initial + one change)
    const framesPromise = collectSseFrames(`${url}/api/events`, 2);

    // Give the SSE connection a moment to establish before triggering the change
    await new Promise((r) => setTimeout(r, 50));

    // Trigger a state change
    state.addLayer("brook", "pb-sse-test", 0.4);

    const frames = await framesPromise;
    assert.ok(frames.length >= 2, `Expected at least 2 frames, got ${frames.length}`);

    // Find the change frame — it should have the new layer
    const changeFrame = frames[frames.length - 1] as Record<string, unknown>;
    const layers = changeFrame.layers as Array<Record<string, unknown>>;
    assert.ok(Array.isArray(layers), "change frame should have layers array");
    const added = layers.find((l) => l.soundId === "brook");
    assert.ok(added, "change frame should include the newly added brook layer");
    assert.strictEqual(added.playbackId, "pb-sse-test");
    assert.strictEqual(added.volume, 0.4);
  });
});
