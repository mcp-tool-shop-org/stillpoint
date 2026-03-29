<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

Interfaccia React per Stillpoint. Si connette al server tramite REST e SSE, visualizzando un mixer audio a livelli con controllo del volume per ogni livello, navigazione per categoria e selezione del dispositivo.

## Componenti

- **SoundPicker** — due menu a tendina nidificati: categoria, quindi suono.
- **LayerStrip** — barra per ogni livello, con nome, etichetta della categoria, fader del volume e pulsante di rimozione.
- **DeviceSelect** — menu a tendina per la selezione del dispositivo di output audio.
- **ErrorBanner** — visualizza gli errori del server.

## Gestione dello stato

L'hook `useRegulator` gestisce tutto lo stato tramite una singola connessione `EventSource` a `/api/events`. Le modifiche al volume vengono gestite con un ritardo di 50 ms, con aggiornamenti dell'interfaccia utente ottimistici.

## Esecuzione

```bash
npm run dev --workspace=@stillpoint/ui
```

Si apre su `http://localhost:5177`. Richiede che il server sia in esecuzione sulla porta 3456.

## Licenza

MIT — vedere [LICENSE](../../LICENSE).

---

Parte di [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Creato da [MCP Tool Shop](https://mcp-tool-shop.github.io/)
