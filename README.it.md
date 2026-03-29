<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

Mixer audio ambientale per favorire la concentrazione e la regolazione del sistema nervoso. 50 suoni stratificati suddivisi in 10 categorie, con controllo del volume per ogni strato e gestione dei dispositivi.

Basato su [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) e [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime).

## Architettura

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

## Funzionalità

- **50 suoni ambientali** suddivisi in 10 categorie (pioggia, acqua, oceano, vento, fuoco, notte, rumore, drone, tono, meccanico).
- **Suoni personalizzati** — è possibile inserire i propri file WAV in una cartella e questi appariranno nel mixer.
- **Mixer a strati** — è possibile aggiungere più suoni contemporaneamente con volume indipendente.
- **Browser per categorie** — selettore di suoni organizzato per categorie a tendina.
- **Volume per strato** — cursori con regolazione in tempo reale.
- **Gestione dei dispositivi** — selezione del dispositivo di uscita audio.
- **Sincronizzazione in tempo reale** — aggiornamenti dello stato basati su SSE.
- **Applicazione desktop Tauri** — finestra nativa tramite Tauri v2.

## Configurazione per gli sviluppatori

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

Aprire `http://localhost:5177` — selezionare una categoria, aggiungere suoni, regolare i volumi.

## Suoni personalizzati

È possibile inserire qualsiasi file `.wav` nella cartella dei suoni personalizzati e questo apparirà automaticamente in una categoria "Personalizzati" — non è necessario riavviare il server.

Posizione predefinita: cartella `custom/` accanto alla cartella dei file WAV ambientali. È possibile sovrascrivere questa impostazione utilizzando la variabile `STILLPOINT_CUSTOM_PATH`.

I nomi dei file diventano i nomi visualizzati: `my-rain.wav` → **My Rain**.

## Pacchetti

| Pacchetto | Scopo |
|---------|---------|
| `@stillpoint/server` | API Express + gestione del motore sonic-core. |
| `@stillpoint/ui` | Interfaccia utente del mixer React (Vite). |
| `@stillpoint/desktop` | Shell finestra nativa Tauri v2. |

## Licenza

MIT — vedere [LICENSE](LICENSE).

---

Creato da [MCP Tool Shop](https://mcp-tool-shop.github.io/)
