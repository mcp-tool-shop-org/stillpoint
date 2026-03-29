<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

一个使用Tauri v2构建的桌面应用程序，它将Stillpoint混音器打包成一个原生Windows应用程序。它将React前端连接到运行在localhost上的Node.js服务器。

## 特性

- 原生窗口（700x500，最小尺寸500x400）
- 支持NSIS和MSI安装包
- CSP仅允许连接到localhost

## 运行

```bash
cd apps/desktop
npm run tauri dev
```

需要服务器在3456端口运行，以及UI开发服务器在5177端口运行。

## 许可证

MIT协议 — 参见[LICENSE](../../LICENSE)。

---

这是[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint)的一部分，由[MCP Tool Shop](https://mcp-tool-shop.github.io/)构建。
