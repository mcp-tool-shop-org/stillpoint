<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

Um wrapper para desktop Tauri v2 que integra o mixer Stillpoint em uma aplicação nativa para Windows. Conecta a interface React ao servidor Node.js no endereço localhost.

## Características

- Janela nativa (700x500, tamanho mínimo 500x400)
- Suporte para instaladores NSIS e MSI
- CSP (Content Security Policy) restrito a conexões apenas com localhost

## Execução

```bash
cd apps/desktop
npm run tauri dev
```

Requer que o servidor esteja em execução na porta 3456 e o servidor de desenvolvimento da interface na porta 5177.

## Licença

MIT — veja [LICENSE](../../LICENSE).

---

Parte de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Criado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
