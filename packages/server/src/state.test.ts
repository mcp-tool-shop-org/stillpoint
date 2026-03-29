import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RegulatorState } from "./state.ts";

describe("RegulatorState", () => {
  it("starts with empty layers", () => {
    const state = new RegulatorState();
    assert.deepStrictEqual(state.current.layers, []);
    assert.strictEqual(state.current.deviceId, null);
    assert.strictEqual(state.current.error, null);
  });

  it("addLayer adds a layer and emits change", () => {
    const state = new RegulatorState();
    let emitted = false;
    state.on("change", () => { emitted = true; });
    state.addLayer("rain", "pb-1", 0.5);
    assert.strictEqual(state.current.layers.length, 1);
    assert.strictEqual(state.current.layers[0].soundId, "rain");
    assert.strictEqual(state.current.layers[0].volume, 0.5);
    assert.ok(emitted);
  });

  it("addLayer clears error", () => {
    const state = new RegulatorState();
    state.setError("E_TEST", "test error");
    assert.ok(state.current.error);
    state.addLayer("rain", "pb-1", 0.5);
    assert.strictEqual(state.current.error, null);
  });

  it("removeLayer removes by playbackId", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    state.addLayer("wind", "pb-2", 0.8);
    state.removeLayer("pb-1");
    assert.strictEqual(state.current.layers.length, 1);
    assert.strictEqual(state.current.layers[0].soundId, "wind");
  });

  it("removeLayer emits change event", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    let emitted = false;
    state.on("change", () => { emitted = true; });
    state.removeLayer("pb-1");
    assert.ok(emitted);
  });

  it("removeLayerBySound removes first matching sound", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    const removed = state.removeLayerBySound("rain");
    assert.ok(removed);
    assert.strictEqual(removed!.playbackId, "pb-1");
    assert.strictEqual(state.current.layers.length, 0);
  });

  it("removeLayerBySound returns undefined for missing sound", () => {
    const state = new RegulatorState();
    const removed = state.removeLayerBySound("nonexistent");
    assert.strictEqual(removed, undefined);
  });

  it("setLayerVolume clamps to [0, 1]", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    state.setLayerVolume("pb-1", 2.0);
    assert.strictEqual(state.current.layers[0].volume, 1);
    state.setLayerVolume("pb-1", -0.5);
    assert.strictEqual(state.current.layers[0].volume, 0);
  });

  it("setLayerVolume on non-existent playbackId is a no-op (F-T-010)", () => {
    const state = new RegulatorState();
    let emitCount = 0;
    state.on("change", () => { emitCount++; });
    state.setLayerVolume("nonexistent", 0.5);
    assert.strictEqual(emitCount, 0);
    assert.deepStrictEqual(state.current.layers, []);
  });

  it("hasSound returns true for existing sound", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    assert.ok(state.hasSound("rain"));
    assert.ok(!state.hasSound("wind"));
  });

  it("clearAllLayers empties all layers", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    state.addLayer("wind", "pb-2", 0.8);
    state.clearAllLayers();
    assert.strictEqual(state.current.layers.length, 0);
  });

  it("clearAllLayers emits change event", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    let emitted = false;
    state.on("change", () => { emitted = true; });
    state.clearAllLayers();
    assert.ok(emitted);
  });

  it("removeLayerBySound with duplicate sounds removes only the first match", () => {
    // State allows addLayer to be called multiple times with same soundId (engine-level
    // dedup is the router's job). Test that removeLayerBySound removes only the first.
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    // Directly invoke addLayer a second time with same soundId (bypass router 409 guard)
    state.addLayer("rain", "pb-2", 0.7);
    assert.strictEqual(state.current.layers.length, 2);

    const removed = state.removeLayerBySound("rain");
    assert.ok(removed);
    assert.strictEqual(removed.playbackId, "pb-1"); // first match
    assert.strictEqual(state.current.layers.length, 1);
    assert.strictEqual(state.current.layers[0].playbackId, "pb-2"); // second remains
  });

  it("setDevice updates deviceId", () => {
    const state = new RegulatorState();
    state.setDevice("speakers");
    assert.strictEqual(state.current.deviceId, "speakers");
    state.setDevice(null);
    assert.strictEqual(state.current.deviceId, null);
  });

  it("setError and clearError work correctly", () => {
    const state = new RegulatorState();
    state.setError("E_NO_DEVICE", "No audio device");
    assert.deepStrictEqual(state.current.error, {
      code: "E_NO_DEVICE",
      message: "No audio device",
    });
    state.clearError();
    assert.strictEqual(state.current.error, null);
  });

  it("clearError is idempotent when no error", () => {
    const state = new RegulatorState();
    let emitCount = 0;
    state.on("change", () => { emitCount++; });
    state.clearError(); // no error set — should NOT emit
    assert.strictEqual(emitCount, 0);
  });

  it("current returns a copy, not a reference", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    const snap = state.current;
    state.addLayer("wind", "pb-2", 0.8);
    assert.strictEqual(snap.layers.length, 1); // snapshot unchanged
    assert.strictEqual(state.current.layers.length, 2);
  });

  it("current snapshot layers are deep-copied — mutating snapshot does not affect live state (F-T-013)", () => {
    const state = new RegulatorState();
    state.addLayer("rain", "pb-1", 0.5);
    const snap = state.current;
    snap.layers[0].volume = 999;
    assert.strictEqual(state.current.layers[0].volume, 0.5);
  });

  it("setError emits a change event (F-T-019)", () => {
    const state = new RegulatorState();
    let emitCount = 0;
    state.on("change", () => { emitCount++; });
    state.setError("E_TEST", "something went wrong");
    assert.strictEqual(emitCount, 1);
    assert.deepStrictEqual(state.current.error, {
      code: "E_TEST",
      message: "something went wrong",
    });
  });
});
