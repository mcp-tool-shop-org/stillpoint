<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

Servidor de mixagem de áudio baseado em Express que gerencia camadas de som, seleção de dispositivos e reprodução através do sonic-core. Envia atualizações de estado em tempo real para todos os clientes conectados via SSE.

## API

| Método | Caminho | Propósito |
|--------|------|---------|
| GET | `/api/sounds` | Catálogo completo com categorias (integradas + personalizadas) |
| GET | `/api/devices` | Dispositivos de saída de áudio disponíveis |
| GET | `/api/state` | Estado atual do mixer |
| POST | `/api/layers/add` | Adicionar uma camada de som |
| POST | `/api/layers/remove` | Remover uma camada |
| POST | `/api/layers/volume` | Definir o volume da camada (0.0–1.0) |
| POST | `/api/stop-all` | Parar todas as camadas |
| GET | `/api/events` | Fluxo SSE de alterações de estado |

## Sons personalizados

Arraste arquivos `.wav` para o diretório de sons personalizados. Eles aparecerão automaticamente em uma categoria "Personalizados". Defina a variável de ambiente `STILLPOINT_CUSTOM_PATH` ou use a pasta padrão `custom/` ao lado do diretório de arquivos WAV padrão.

## Executar

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

O servidor inicia na porta 3456.

## Licença

MIT — veja [LICENSE](../../LICENSE).

---

Parte de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Criado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
