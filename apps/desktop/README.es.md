<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

Un envoltorio de escritorio Tauri v2 que integra el mezclador Stillpoint en una aplicación nativa de Windows. Conecta la interfaz de usuario de React con el servidor Node.js que se ejecuta en localhost.

## Características

- Ventana nativa (700x500, tamaño mínimo 500x400)
- Opciones de instalación NSIS y MSI
- CSP restringido a conexiones solo a localhost

## Ejecución

```bash
cd apps/desktop
npm run tauri dev
```

Requiere que el servidor se ejecute en el puerto 3456 y el servidor de desarrollo de la interfaz de usuario en el puerto 5177.

## Licencia

MIT — consulte [LICENSE](../../LICENSE).

---

Parte de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Creado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
