<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

Servidor de mezclador de audio basado en Express que gestiona las capas de sonido, la selección de dispositivos y la reproducción a través de sonic-core. Envía actualizaciones de estado en tiempo real a todos los clientes conectados mediante SSE.

## API

| Método | Ruta | Propósito |
|--------|------|---------|
| GET | `/api/sounds` | Catálogo completo con categorías (integradas + personalizadas). |
| GET | `/api/devices` | Dispositivos de salida de audio disponibles. |
| GET | `/api/state` | Estado actual del mezclador. |
| POST | `/api/layers/add` | Añadir una capa de sonido. |
| POST | `/api/layers/remove` | Eliminar una capa. |
| POST | `/api/layers/volume` | Establecer el volumen de una capa (0.0–1.0). |
| POST | `/api/stop-all` | Detener todas las capas. |
| GET | `/api/events` | Flujo SSE de cambios de estado. |

## Sonidos personalizados

Arrastra archivos `.wav` al directorio de sonidos personalizados. Aparecerán automáticamente en una categoría "Personalizada". Define la variable de entorno `STILLPOINT_CUSTOM_PATH` o utiliza la carpeta predeterminada `custom/` junto al directorio de archivos WAV.

## Ejecución

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

El servidor se inicia en el puerto 3456.

## Licencia

MIT — consulta [LICENSE](../../LICENSE).

---

Parte de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Creado por [MCP Tool Shop](https://mcp-tool-shop.github.io/)
