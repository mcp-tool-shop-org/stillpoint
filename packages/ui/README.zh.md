<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

Stillpoint 的 React 混合器界面。通过 REST 和 SSE 与服务器连接，显示一个分层声音混合器，具有每个层的音量控制、分类浏览和设备选择功能。

## 组件

- **SoundPicker**：两个级联下拉菜单，分别用于选择分类和声音。
- **LayerStrip**：每个层的条目，包含名称、分类标签、音量调节滑块和删除按钮。
- **DeviceSelect**：音频输出设备下拉菜单。
- **ErrorBanner**：显示服务器错误信息。

## 状态管理

`useRegulator` 钩子通过与 `/api/events` 的单个 `EventSource` 连接来管理所有状态。音量变化在 50 毫秒内进行防抖处理，并进行乐观的 UI 更新。

## 运行

```bash
npm run dev --workspace=@stillpoint/ui
```

在 `http://localhost:5177` 上启动。需要运行在 3456 端口上的服务器。

## 许可证

MIT 协议 — 参见 [LICENSE](../../LICENSE)。

---

[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) 的一部分，由 [MCP Tool Shop](https://mcp-tool-shop.github.io/) 构建。
