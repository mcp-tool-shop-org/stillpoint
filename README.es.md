<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

Mezclador de sonidos ambientales para mejorar la concentración y regular el sistema nervioso. 50 sonidos en 10 categorías, con control de volumen individual por capa y enrutamiento del dispositivo.

Impulsado por [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) y [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime).

## Arquitectura

```
┌──────────────────────────────┐
│  Tauri / Browser             │  ← window chrome
│  React + Vite (port 5177)   │
└──────────┬───────────────────┘
           │ REST + SSE
┌──────────▼───────────────────┐
│  Node.js server (port 3456)  │  ← sonic-core integration
│  Express + SidecarBackend    │
└──────────┬───────────────────┘
           │ ndjson-stdio-v1
┌──────────▼───────────────────┐
│  sonic-runtime (C# NativeAOT)│  ← real audio via OpenAL Soft
└──────────────────────────────┘
```

## Características

- **50 sonidos ambientales** en 10 categorías (lluvia, agua, océano, viento, fuego, noche, ruido, zumbido, tono, mecánico).
- **Sonidos personalizados** — simplemente coloque sus propios archivos WAV en una carpeta y aparecerán en el mezclador.
- **Mezclador por capas** — agregue múltiples sonidos simultáneamente con volumen independiente.
- **Explorador de categorías** — selector de sonidos organizado en un menú desplegable.
- **Volumen por capa** — controles deslizantes con ajuste en tiempo real.
- **Enrutamiento de dispositivos** — seleccione el dispositivo de salida de audio.
- **Sincronización en tiempo real** — actualizaciones de estado impulsadas por SSE.
- **Aplicación de escritorio Tauri** — ventana nativa a través de Tauri v2.

## Configuración del entorno de desarrollo

```bash
# Prerequisites: Node 20+, sonic-runtime binary

git clone https://github.com/mcp-tool-shop-org/stillpoint
cd stillpoint
npm install

# Terminal 1: server
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx packages/server/src/bin.ts

# Terminal 2: UI
npm run dev --workspace=@stillpoint/ui
```

Abra `http://localhost:5177` — seleccione una categoría, agregue sonidos, ajuste los volúmenes.

## Sonidos personalizados

Simplemente coloque cualquier archivo `.wav` en el directorio de sonidos personalizados y aparecerá automáticamente en una categoría "Personalizados" — no es necesario reiniciar el servidor.

Ubicación predeterminada: carpeta `custom/` junto al directorio de archivos WAV ambientales. Puede sobrescribir esto con la variable `STILLPOINT_CUSTOM_PATH`.

Los nombres de los archivos se convierten en nombres de visualización: `my-rain.wav` → **My Rain** (Mi Lluvia).

## Paquetes

| Paquete | Propósito |
|---------|---------|
| `@stillpoint/server` | API Express + gestión del motor sonic-core. |
| `@stillpoint/ui` | Interfaz de usuario del mezclador React (Vite). |
| `@stillpoint/desktop` | Capa de ventana nativa Tauri v2. |

## Licencia

MIT — consulte [LICENSE](LICENSE).

---

Desarrollado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
