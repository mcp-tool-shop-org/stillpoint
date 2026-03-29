<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="500" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/pages.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/pages.yml/badge.svg" alt="Site" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

Mixador de sons ambiente para foco e regulação do sistema nervoso. 50 sons em camadas, divididos em 10 categorias, com controle de volume individual para cada camada e roteamento de dispositivo.

Desenvolvido com [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) e [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime).

## Arquitetura

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

- **50 sons ambientes** em 10 categorias (chuva, água, oceano, vento, fogo, noite, ruído, zumbido, tom, mecânico)
- **Sons personalizados** — adicione seus próprios arquivos WAV a uma pasta e eles aparecerão no mixer.
- **Mixer em camadas** — adicione vários sons simultaneamente com volume independente.
- **Navegador de categorias** — seletor de sons organizado por categorias.
- **Volume por camada** — controles deslizantes com ajuste em tempo real.
- **Silenciar por camada** — silencie camadas individuais sem removê-las.
- **Volume mestre** — controle global que ajusta todas as camadas ao mesmo tempo.
- **Fade in/out** — transições suaves ao adicionar ou remover camadas.
- **Roteamento de dispositivos** — seletor de dispositivo de saída de áudio; configure via interface ou `POST /device`.
- **Temporizador de suspensão** — interrompe automaticamente a reprodução após um período configurável.
- **Predefinições salvas** — salve e carregue mixagens nomeadas (camadas + volumes).
- **Barra de sistema** — minimize para a bandeja do sistema; a reprodução continua em segundo plano.
- **Sincronização em tempo real** — atualizações de estado com tecnologia SSE.
- **Aplicativo desktop Tauri** — janela nativa via Tauri v2.

## Configuração do ambiente de desenvolvimento

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

No Windows, defina a variável de ambiente primeiro:

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

Abra `http://localhost:5177` — selecione uma categoria, adicione sons, ajuste os volumes.

O servidor usa a porta 3456 por padrão. Substitua com a variável de ambiente `PORT`.

## Sons Personalizados

Arraste qualquer arquivo `.wav` para o diretório de sons personalizados e ele aparecerá automaticamente em uma categoria "Personalizados" — não é necessário reiniciar o programa.

Localização padrão: pasta `custom/` ao lado do diretório de arquivos WAV de sons ambientes. Substitua com a variável `STILLPOINT_CUSTOM_PATH`.

Os nomes dos arquivos se tornam os nomes de exibição: `my-rain.wav` → **Minha Chuva**.

## Pacotes

| Pacote | Propósito |
|---------|---------|
| `@stillpoint/server` | API Express + gerenciamento do motor sonic-core |
| `@stillpoint/ui` | Interface de usuário do mixador React (Vite) |
| `@stillpoint/desktop` | Shell de janela nativa Tauri v2 |

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (caminhos alternativos) | Caminho para o executável do sonic-runtime. |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | Diretório contendo arquivos WAV de sons ambientes. |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | Diretório para arquivos WAV personalizados fornecidos pelo usuário. |
| `PORT` | `3456` | Porta do servidor. |

## Processo de Lançamento

1. Atualize a versão em `package.json` (raiz), `packages/server/package.json`, `packages/ui/package.json` e `apps/desktop/package.json`.
2. Atualize o arquivo `CHANGELOG.md` — mova os itens "Não Lançados" para um cabeçalho de versão com data.
3. Execute `npm test` para verificar se todos os testes passam.
4. Faça o commit, crie uma tag `vX.Y.Z`, envie.
5. Crie uma versão no GitHub a partir da tag.

## Licença

MIT — veja [LICENSE](LICENSE).

---

Desenvolvido por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
