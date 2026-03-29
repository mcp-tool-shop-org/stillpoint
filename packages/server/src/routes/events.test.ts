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
// FT-T-004: SSE MAX_SSE 503 — 11th connection rejected
// Uses a fresh server so the connection count starts at 0
// ---------------------------------------------------------------------------
describe("GET /api/events — MAX_SSE limit → 503 on 11th connection", () => {
  let url: string;
  let close: () => Promise<void>;
  const controllers: AbortController[] = [];

  before(async () => {
    const state = new RegulatorState();
    const engine = makeMockEngine();
    ({ url, close } = await startServer(engine, state));

    // Open 10 SSE connections and hold them open
    for (let i = 0; i < 10; i++) {
      const controller = new AbortController();
      controllers.push(controller);
      // Fire-and-forget: start the fetch but don't await it
      // We just need the connection to be established on the server side.
      fetch(`${url}/api/events`, {
        signal: controller.signal,
        headers: { Accept: "text/event-stream" },
      }).catch(() => {/* AbortError expected on cleanup */});
    }
    // Give the server a moment to register all 10 connections
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  after(async () => {
    // Abort all held connections
    for (const controller of controllers) {
      controller.abort();
    }
    // Give the server time to process the close events before shutting down
    await new Promise((resolve) => setTimeout(resolve, 50));
    await close();
  });

  it("11th SSE connection returns 503 with error body", async () => {
    const res = await fetch(`${url}/api/events`, {
      headers: { Accept: "text/event-stream" },
    });
    assert.strictEqual(res.status, 503);
    const body = await res.json() as Record<string, unknown>;
    assert.ok(body.error, "503 response should include error field");
  });
});

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
    // Open an SSE connection and collect frames. After the first (initial) frame
    // is received, trigger the state change. This removes the 50ms fixed sleep
    // and replaces it with a connection-confirmed trigger.
    const frames = await new Promise<unknown[]>((resolve, reject) => {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
        reject(new Error("SSE change test timed out after 3000ms"));
      }, 3000);

      const collected: unknown[] = [];
      let triggered = false;
      let buf = "";

      fetch(`${url}/api/events`, {
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
                if (done) { clearTimeout(timer); resolve(collected); return; }

                buf += decoder.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop()!;

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try { collected.push(JSON.parse(line.slice("data: ".length))); } catch { /* ignore */ }
                  }
                }

                // After the first frame (initial state), trigger the state change
                if (!triggered && collected.length >= 1) {
                  triggered = true;
                  state.addLayer("brook", "pb-sse-test", 0.4);
                }

                if (collected.length >= 2) {
                  clearTimeout(timer);
                  controller.abort();
                  resolve(collected);
                  return;
                }

                pump();
              })
              .catch((err: unknown) => {
                clearTimeout(timer);
                if (err instanceof Error && err.name === "AbortError") resolve(collected);
                else reject(err);
              });
          }

          pump();
        })
        .catch((err: unknown) => {
          clearTimeout(timer);
          if (err instanceof Error && err.name === "AbortError") resolve(collected);
          else reject(err);
        });
    });

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
