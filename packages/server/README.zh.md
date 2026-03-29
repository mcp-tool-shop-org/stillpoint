<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

基于 Express 的音频混音服务器，通过 sonic-core 管理声音层、设备选择和播放。它通过 SSE 将实时状态更新推送到所有连接的客户端。

## API

| 方法 | 路径 | 用途 |
|--------|------|---------|
| GET | `/api/sounds` | 包含分类（内置 + 自定义）的完整目录。 |
| GET | `/api/devices` | 可用的音频输出设备。 |
| GET | `/api/state` | 当前的混音器状态。 |
| POST | `/api/layers/add` | 添加一个声音层。 |
| POST | `/api/layers/remove` | 移除一个层。 |
| POST | `/api/layers/volume` | 设置层音量（0.0–1.0）。 |
| POST | `/api/stop-all` | 停止所有层。 |
| GET | `/api/events` | 状态变化的 SSE 流。 |

## 自定义声音

将 `.wav` 文件拖放到自定义声音目录中。它们会自动出现在 "自定义" 分类中。设置 `STILLPOINT_CUSTOM_PATH` 环境变量，或者使用默认的 `custom/` 文件夹，该文件夹位于环境音 WAV 文件所在的目录旁边。

## 运行

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

服务器在 3456 端口启动。

## 许可证

MIT 协议 — 参见 [LICENSE](../../LICENSE)。

---

[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) 的一部分，由 [MCP Tool Shop](https://mcp-tool-shop.github.io/) 构建。
