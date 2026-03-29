import { existsSync } from "node:fs";
import { SonicEngine, SidecarBackend, NullBackend } from "@sonic-core/engine";
import type { AudioBackend } from "@sonic-core/engine";
import type { RegulatorState } from "./state.js";

const log = (msg: string) => process.stderr.write(`[stillpoint] ${msg}\n`);

function resolveRuntimePath(): string | null {
  const envPath = process.env.SONIC_RUNTIME_PATH;
  if (envPath) {
    if (existsSync(envPath)) return envPath;
    log(`SONIC_RUNTIME_PATH set but not found: ${envPath}`);
    return null;
  }
  log("SONIC_RUNTIME_PATH is not set. Set it to the SonicRuntime executable path to enable audio.");
  return null;
}

export interface EngineManager {
  engine: SonicEngine;
  sidecar: SidecarBackend | null;
  dispose(): void;
}

export async function createEngineManager(
  stateManager: RegulatorState,
): Promise<EngineManager> {
  const runtimePath = resolveRuntimePath();

  let backend: AudioBackend;
  let sidecar: SidecarBackend | null = null;
  let engine!: SonicEngine;
  let disposed = false;

  if (runtimePath) {
    log(`runtime path: ${runtimePath}`);

    sidecar = new SidecarBackend({
      executablePath: runtimePath,
      onStderr: (line) => process.stderr.write(`[runtime] ${line}\n`),
      onExit: (code, signal) => {
        if (disposed) return;
        log(`runtime exited: code=${code} signal=${signal}`);
        stateManager.setError(
          "runtime_exited",
          "Audio engine stopped unexpectedly. Restarting...",
        );
      },
      onRestart: (attempt) => {
        log(`runtime auto-restart #${attempt}`);
        stateManager.clearError();
      },
      onSuspect: (count) =>
        log(`runtime suspect: ${count} consecutive timeouts`),
      onEvent: (evt) => {
        if (evt.event === "playback_ended") {
          const playbackId = sidecar?.resolveAndRemoveHandle(evt.data.handle);
          if (playbackId) {
            engine.handlePlaybackEnded(playbackId, evt.data.reason);
            stateManager.removeLayer(playbackId);
          }
        }
      },
    });

    try {
      await sidecar.start();
      const ver = sidecar.runtimeVersion;
      log(`runtime connected: ${ver?.name} v${ver?.version} (${ver?.protocol})`);
    } catch (err) {
      log(`Failed to start runtime: ${err}`);
      stateManager.setError(
        "runtime_connect_failed",
        `Could not connect to audio engine at ${runtimePath}`,
      );
      // Fall back to NullBackend so the server can still start
      sidecar = null;
      backend = new NullBackend();
      engine = new SonicEngine(backend);
      return { engine, sidecar, dispose: () => engine.dispose() };
    }

    backend = sidecar;
  } else {
    log("No runtime binary found. Using NullBackend (no audio).");
    stateManager.setError(
      "runtime_missing",
      "Audio engine not found. Set SONIC_RUNTIME_PATH.",
    );
    backend = new NullBackend();
  }

  engine = new SonicEngine(backend);

  function dispose() {
    if (disposed) return;
    disposed = true;
    engine.dispose();
    sidecar?.dispose();
  }

  return { engine, sidecar, dispose };
}
