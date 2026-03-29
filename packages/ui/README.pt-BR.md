<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

Interface de mixagem React para Stillpoint. Conecta-se ao servidor via REST e SSE, exibindo um mixer de áudio em camadas com controle de volume por camada, navegação por categorias e seleção de dispositivos.

## Componentes

- **SoundPicker** — dois menus suspensos em cascata: categoria e, em seguida, som.
- **LayerStrip** — barra para cada camada, com nome, rótulo da categoria, controle de volume e botão de remoção.
- **DeviceSelect** — menu suspenso para seleção do dispositivo de saída de áudio.
- **ErrorBanner** — exibe erros do servidor.

## Gerenciamento de estado

O hook `useRegulator` gerencia todo o estado através de uma única conexão `EventSource` para `/api/events`. As alterações de volume são "debounced" (atrasadas) em 50ms, com atualizações otimistas da interface do usuário.

## Execução

```bash
npm run dev --workspace=@stillpoint/ui
```

Abre em `http://localhost:5177`. Requer que o servidor esteja em execução na porta 3456.

## Licença

MIT — veja [LICENSE](../../LICENSE).

---

Parte de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Criado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
