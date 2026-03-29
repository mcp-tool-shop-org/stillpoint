<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

Interfaz de mezclador React para Stillpoint. Se conecta al servidor a través de REST y SSE, mostrando un mezclador de audio en capas con control de volumen por capa, navegación por categorías y selección de dispositivos.

## Componentes

- **SoundPicker**: dos menús desplegables en cascada: categoría y luego sonido.
- **LayerStrip**: barra por capa con nombre, etiqueta de categoría, control de volumen y botón de eliminación.
- **DeviceSelect**: menú desplegable para la selección del dispositivo de salida de audio.
- **ErrorBanner**: muestra los errores del servidor.

## Gestión del estado

El hook `useRegulator` gestiona todo el estado a través de una única conexión `EventSource` a `/api/events`. Los cambios de volumen se aplazan durante 50 ms con actualizaciones optimistas de la interfaz de usuario.

## Ejecución

```bash
npm run dev --workspace=@stillpoint/ui
```

Se abre en `http://localhost:5177`. Requiere que el servidor esté en funcionamiento en el puerto 3456.

## Licencia

MIT — consulte [LICENSE](../../LICENSE).

---

Parte de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Creado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
