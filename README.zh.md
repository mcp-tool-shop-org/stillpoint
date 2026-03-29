<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

- **50种环境音效**，分为10个类别（雨声、水声、海洋声、风声、火焰声、夜景声、噪音、嗡鸣声、音调、机械声）。
- **自定义音效**：将您自己的WAV文件放入一个文件夹，它们就会出现在混音器中。
- **分层混音器**：可以同时添加多个音效，并独立控制每个音效的音量。
- **分类浏览器**：下拉菜单式音效选择器。
- **每层音量**：带有实时调整功能的音量滑块。
- **每层静音**：可以静音单个音效层，而无需删除它们。
- **主音量**：全局控制，一次性调整所有音效层的音量。
- **淡入/淡出**：在添加或删除音效层时，提供平滑的过渡效果。
- **设备路由**：音频输出设备选择器；可通过用户界面或 `POST /device` 设置。
- **睡眠定时器**：在可配置的持续时间后自动停止播放。
- **已保存的预设**：保存和加载命名混音（音效层 + 音量）。
- **系统托盘**：最小化到托盘；播放继续在后台运行。
- **实时同步**：使用SSE技术进行状态更新。
- **Tauri桌面应用**：通过Tauri v2实现的原生窗口。

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

在Windows上，首先设置环境变量。

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

打开 `http://localhost:5177`，选择一个类别，添加声音，调整音量。

服务器默认端口为3456。可以通过`PORT`环境变量进行修改。

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

## 环境变量

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (备用路径) | sonic-runtime二进制文件路径 |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | 包含环境音效WAV文件的目录 |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | 用于存放用户自定义WAV文件的目录 |
| `PORT` | `3456` | 服务器端口 |

## 发布流程

1. 修改`package.json`（根目录）、`packages/server/package.json`、`packages/ui/package.json`和`apps/desktop/package.json`中的版本号。
2. 更新`CHANGELOG.md`——将“未发布”项移动到带有日期的版本标题下。
3. 运行`npm test`以验证所有测试是否通过。
4. 提交、打标签`vX.Y.Z`，然后推送。
5. 从标签创建GitHub发布版本。

## 许可证

MIT 协议 — 参见 [LICENSE](LICENSE)。

---

由 [MCP Tool Shop](https://mcp-tool-shop.github.io/) 构建。
