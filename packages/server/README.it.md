<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

Server per mixer audio basato su Express, che gestisce i livelli audio, la selezione dei dispositivi e la riproduzione tramite sonic-core. Invia aggiornamenti dello stato in tempo reale a tutti i client connessi tramite SSE.

## API

| Metodo | Percorso | Scopo |
|--------|------|---------|
| GET | `/api/sounds` | Catalogo completo con categorie (integrate + personalizzate) |
| GET | `/api/devices` | Dispositivi di uscita audio disponibili |
| GET | `/api/state` | Stato attuale del mixer |
| POST | `/api/layers/add` | Aggiunge un livello audio |
| POST | `/api/layers/remove` | Rimuove un livello |
| POST | `/api/layers/volume` | Imposta il volume di un livello (0.0–1.0) |
| POST | `/api/stop-all` | Ferma tutti i livelli |
| GET | `/api/events` | Flusso SSE degli aggiornamenti di stato |

## Suoni personalizzati

Trascina i file `.wav` nella directory dei suoni personalizzati. Questi appariranno automaticamente in una categoria "Personalizzati". Imposta la variabile `STILLPOINT_CUSTOM_PATH` oppure utilizza la cartella predefinita `custom/` accanto alla directory dei file WAV ambientali.

## Avvio

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

Il server si avvia sulla porta 3456.

## Licenza

MIT — vedi [LICENSE](../../LICENSE).

---

Parte di [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Creato da [MCP Tool Shop](https://mcp-tool-shop.github.io/)
