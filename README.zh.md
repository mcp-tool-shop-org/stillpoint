<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

用于专注和神经系统调节的环境声音混音器。包含10个类别，共50种声音，每个声音层级可独立控制音量，并支持设备路由。

基于[sonic-core](https://github.com/mcp-tool-shop-org/sonic-core)和[sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime)。

## 架构

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

## 功能

- **50种环境声音**，分为10个类别（雨、水、海洋、风、火、夜晚、噪音、嗡鸣、音调、机械）。
- **自定义声音**：将您自己的WAV文件放入一个文件夹，它们将自动出现在混音器中。
- **分层混音器**：可以同时添加多个声音，并独立控制每个声音的音量。
- **类别浏览器**：下拉菜单式声音选择器。
- **每层音量控制**：带有实时调整功能的滑块。
- **设备路由**：选择音频输出设备。
- **实时同步**：基于SSE技术的状态更新。
- **Tauri桌面应用**：通过Tauri v2实现原生窗口。

## 开发环境配置

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

打开 `http://localhost:5177`，选择一个类别，添加声音，调整音量。

## 自定义声音

将任何`.wav`文件放入自定义声音目录，它们将自动出现在一个名为“自定义”的类别中——无需重启服务器。

默认位置：位于环境WAV文件目录旁边的`custom/`文件夹。可以通过设置`STILLPOINT_CUSTOM_PATH`来修改。

文件名将作为显示名称：`my-rain.wav` → **My Rain**。

## 软件包

| 软件包 | 用途 |
|---------|---------|
| `@stillpoint/server` | Express API + sonic-core 引擎管理 |
| `@stillpoint/ui` | React 混音器 UI (Vite) |
| `@stillpoint/desktop` | Tauri v2 原生窗口壳 |

## 许可证

MIT 协议 — 参见 [LICENSE](LICENSE)。

---

由 [MCP Tool Shop](https://mcp-tool-shop.github.io/) 构建。
