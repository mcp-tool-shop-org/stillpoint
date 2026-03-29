import { describe, it, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Dynamic import to avoid static resolution issues with tsx/esm
const mod = await import("./presets.ts");
const SOUNDS = mod.SOUNDS;
const CATEGORIES = mod.CATEGORIES;
const findSound = mod.findSound;
const soundAssetRef = mod.soundAssetRef;
const scanCustomSounds = mod.scanCustomSounds;
const buildCatalog = mod.buildCatalog;
const invalidateCatalog = mod.invalidateCatalog;
const getWavsPath = mod.getWavsPath;
const getCustomPath = mod.getCustomPath;

describe("SOUNDS catalog", () => {
  it("has exactly 50 built-in sounds (F-T-015)", () => {
    assert.strictEqual(SOUNDS.length, 50);
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

  it("includes all 10 expected categories (F-T-020)", () => {
    const cats = [...CATEGORIES];
    const expected = ["Rain", "Water", "Ocean", "Wind", "Fire", "Night", "Noise", "Drone", "Tone", "Mechanical"];
    for (const name of expected) {
      assert.ok(cats.includes(name), `Missing category: ${name}`);
    }
    assert.strictEqual(cats.length, expected.length);
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
  let origWavs: string | undefined;
  let origCustom: string | undefined;

  afterEach(() => {
    if (origWavs === undefined) {
      delete process.env.AMBIENT_WAVS_PATH;
    } else {
      process.env.AMBIENT_WAVS_PATH = origWavs;
    }
    if (origCustom === undefined) {
      delete process.env.STILLPOINT_CUSTOM_PATH;
    } else {
      process.env.STILLPOINT_CUSTOM_PATH = origCustom;
    }
  });

  it("returns exact file:// URL for built-in sound when AMBIENT_WAVS_PATH is set (F-T-014)", () => {
    origWavs = process.env.AMBIENT_WAVS_PATH;
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    process.env.AMBIENT_WAVS_PATH = "/test/wavs";
    const ref = soundAssetRef({ id: "heavy-rain", name: "Heavy Rain", category: "Rain" });
    assert.strictEqual(ref, "file:////test/wavs/heavy-rain.wav");
  });

  it("returns custom path for custom sounds", () => {
    origWavs = process.env.AMBIENT_WAVS_PATH;
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    process.env.STILLPOINT_CUSTOM_PATH = "/test/custom";
    const ref = soundAssetRef({ id: "custom:my-sound", name: "My Sound", category: "Custom" });
    assert.strictEqual(ref, "file:////test/custom/my-sound.wav");
  });
});

describe("getWavsPath", () => {
  let originalEnv: string | undefined;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.AMBIENT_WAVS_PATH;
    } else {
      process.env.AMBIENT_WAVS_PATH = originalEnv;
    }
  });

  it("returns AMBIENT_WAVS_PATH env override when set", () => {
    originalEnv = process.env.AMBIENT_WAVS_PATH;
    process.env.AMBIENT_WAVS_PATH = "/custom/wavs/path";
    assert.strictEqual(getWavsPath(), "/custom/wavs/path");
  });

  it("returns fallback when AMBIENT_WAVS_PATH is not set", () => {
    originalEnv = process.env.AMBIENT_WAVS_PATH;
    delete process.env.AMBIENT_WAVS_PATH;
    const path = getWavsPath();
    assert.strictEqual(path, "./ambient-wavs");
  });
});

describe("getCustomPath", () => {
  let origCustom: string | undefined;
  let origWavs: string | undefined;

  afterEach(() => {
    if (origCustom === undefined) {
      delete process.env.STILLPOINT_CUSTOM_PATH;
    } else {
      process.env.STILLPOINT_CUSTOM_PATH = origCustom;
    }
    if (origWavs === undefined) {
      delete process.env.AMBIENT_WAVS_PATH;
    } else {
      process.env.AMBIENT_WAVS_PATH = origWavs;
    }
  });

  it("returns STILLPOINT_CUSTOM_PATH env override when set", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    origWavs = process.env.AMBIENT_WAVS_PATH;
    process.env.STILLPOINT_CUSTOM_PATH = "/my/custom/sounds";
    assert.strictEqual(getCustomPath(), "/my/custom/sounds");
  });

  it("derives custom path from wavs path when STILLPOINT_CUSTOM_PATH is not set", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    origWavs = process.env.AMBIENT_WAVS_PATH;
    delete process.env.STILLPOINT_CUSTOM_PATH;
    process.env.AMBIENT_WAVS_PATH = "/some/wavs";
    const path = getCustomPath();
    assert.ok(path.endsWith("custom"), `Expected path ending in 'custom', got: ${path}`);
  });
});

describe("scanCustomSounds", () => {
  let tmpDir: string;
  let origCustom: string | undefined;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    if (origCustom === undefined) {
      delete process.env.STILLPOINT_CUSTOM_PATH;
    } else {
      process.env.STILLPOINT_CUSTOM_PATH = origCustom;
    }
  });

  it("returns empty array when custom directory does not exist", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    process.env.STILLPOINT_CUSTOM_PATH = "/nonexistent/path/that/does/not/exist";
    const sounds = scanCustomSounds();
    assert.deepStrictEqual(sounds, []);
  });

  it("returns AmbientSound entries for .wav files in temp directory", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-"));
    writeFileSync(join(tmpDir, "my-forest.wav"), "");
    writeFileSync(join(tmpDir, "ocean-calm.wav"), "");
    writeFileSync(join(tmpDir, "not-a-wav.mp3"), ""); // should be ignored

    process.env.STILLPOINT_CUSTOM_PATH = tmpDir;
    const sounds = scanCustomSounds();

    assert.strictEqual(sounds.length, 2);
    // Sorted alphabetically
    assert.strictEqual(sounds[0].id, "custom:my-forest");
    assert.strictEqual(sounds[0].name, "My Forest");
    assert.strictEqual(sounds[0].category, "Custom");
    assert.strictEqual(sounds[1].id, "custom:ocean-calm");
    assert.strictEqual(sounds[1].name, "Ocean Calm");
  });

  it("case-insensitive .wav extension detection", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-"));
    writeFileSync(join(tmpDir, "upper.WAV"), "");
    writeFileSync(join(tmpDir, "mixed.Wav"), "");

    process.env.STILLPOINT_CUSTOM_PATH = tmpDir;
    const sounds = scanCustomSounds();
    assert.strictEqual(sounds.length, 2);
  });
});

describe("buildCatalog", () => {
  let tmpDir: string;
  let origCustom: string | undefined;

  beforeEach(() => {
    // Ensure each test starts with a clean catalog cache
    invalidateCatalog();
  });

  afterEach(() => {
    // Invalidate cache after each test to avoid leaking state
    invalidateCatalog();
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    if (origCustom === undefined) {
      delete process.env.STILLPOINT_CUSTOM_PATH;
    } else {
      process.env.STILLPOINT_CUSTOM_PATH = origCustom;
    }
  });

  it("returns correct categories count and sounds array with no custom sounds", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    process.env.STILLPOINT_CUSTOM_PATH = "/nonexistent/path/that/does/not/exist";
    const catalog = buildCatalog();
    assert.strictEqual(catalog.categories.length, CATEGORIES.length);
    assert.ok(catalog.sounds.length >= 50);
    assert.ok(typeof catalog.grouped === "object");
  });

  it("includes Custom category when custom sounds exist", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-"));
    writeFileSync(join(tmpDir, "test-sound.wav"), "");

    process.env.STILLPOINT_CUSTOM_PATH = tmpDir;
    const catalog = buildCatalog();
    assert.ok(catalog.categories.includes("Custom"));
    assert.ok(catalog.sounds.some((s) => s.id === "custom:test-sound"));
    assert.ok(Array.isArray(catalog.grouped["Custom"]));
    assert.strictEqual(catalog.grouped["Custom"].length, 1);
  });

  it("grouped entries match sounds array for each category", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    process.env.STILLPOINT_CUSTOM_PATH = "/nonexistent/path/that/does/not/exist";
    const catalog = buildCatalog();
    let total = 0;
    for (const cat of catalog.categories) {
      total += catalog.grouped[cat].length;
    }
    assert.strictEqual(total, catalog.sounds.length);
  });
});

describe("findSound (custom path)", () => {
  let tmpDir: string;
  let origCustom: string | undefined;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    if (origCustom === undefined) {
      delete process.env.STILLPOINT_CUSTOM_PATH;
    } else {
      process.env.STILLPOINT_CUSTOM_PATH = origCustom;
    }
  });

  it("finds custom sound by custom: id in temp directory", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    tmpDir = mkdtempSync(join(tmpdir(), "stillpoint-test-"));
    writeFileSync(join(tmpDir, "my-custom.wav"), "");

    process.env.STILLPOINT_CUSTOM_PATH = tmpDir;
    const sound = findSound("custom:my-custom");
    assert.ok(sound);
    assert.strictEqual(sound!.id, "custom:my-custom");
    assert.strictEqual(sound!.category, "Custom");
  });

  it("returns undefined for custom: id not in custom directory", () => {
    origCustom = process.env.STILLPOINT_CUSTOM_PATH;
    process.env.STILLPOINT_CUSTOM_PATH = "/nonexistent/path/that/does/not/exist";
    const sound = findSound("custom:ghost-sound");
    assert.strictEqual(sound, undefined);
  });
});
