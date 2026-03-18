import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Dynamic import to avoid static resolution issues with tsx/esm
const mod = await import("./presets.ts");
const SOUNDS = mod.SOUNDS;
const CATEGORIES = mod.CATEGORIES;
const findSound = mod.findSound;
const soundAssetRef = mod.soundAssetRef;

describe("SOUNDS catalog", () => {
  it("has 50+ built-in sounds", () => {
    assert.ok(SOUNDS.length >= 50);
  });

  it("every sound has id, name, and category", () => {
    for (const s of SOUNDS) {
      assert.ok(s.id, `Missing id for ${s.name}`);
      assert.ok(s.name, `Missing name for ${s.id}`);
      assert.ok(s.category, `Missing category for ${s.id}`);
    }
  });

  it("all IDs are unique", () => {
    const ids = new Set(SOUNDS.map((s) => s.id));
    assert.strictEqual(ids.size, SOUNDS.length);
  });

  it("all categories are from CATEGORIES enum", () => {
    const validCats = new Set<string>(CATEGORIES);
    for (const s of SOUNDS) {
      assert.ok(validCats.has(s.category), `Invalid category: ${s.category}`);
    }
  });
});

describe("CATEGORIES", () => {
  it("has 10 categories", () => {
    assert.strictEqual(CATEGORIES.length, 10);
  });

  it("includes expected categories", () => {
    const cats = [...CATEGORIES];
    assert.ok(cats.includes("Rain"));
    assert.ok(cats.includes("Wind"));
    assert.ok(cats.includes("Fire"));
    assert.ok(cats.includes("Noise"));
  });
});

describe("findSound", () => {
  it("finds built-in sound by ID", () => {
    const sound = findSound("heavy-rain");
    assert.ok(sound);
    assert.strictEqual(sound!.name, "Heavy Rain");
    assert.strictEqual(sound!.category, "Rain");
  });

  it("returns undefined for nonexistent ID", () => {
    assert.strictEqual(findSound("nonexistent-xyz"), undefined);
  });
});

describe("soundAssetRef", () => {
  it("returns file:// URL for built-in sound", () => {
    const ref = soundAssetRef({ id: "heavy-rain", name: "Heavy Rain", category: "Rain" });
    assert.ok(ref.startsWith("file:///"));
    assert.ok(ref.endsWith("heavy-rain.wav"));
  });

  it("returns custom path for custom sounds", () => {
    const ref = soundAssetRef({ id: "custom:my-sound", name: "My Sound", category: "Custom" });
    assert.ok(ref.startsWith("file:///"));
    assert.ok(ref.endsWith("my-sound.wav"));
  });
});
