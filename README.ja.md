<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

集中力向上と神経系の調整をサポートする、環境音ミキサーです。10のカテゴリーに分類された50種類の音源があり、各レイヤーごとに音量調整とデバイスのルーティングが可能です。

[sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) および [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime) を使用しています。

## アーキテクチャ

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

## 機能

- **50種類の環境音**を10のカテゴリー（雨、水、海、風、火、夜、ノイズ、ドローン、音階、機械）に分類
- **カスタムサウンド**：WAVファイルをフォルダにドラッグ＆ドロップすると、ミキサーに自動的に表示されます。
- **レイヤーミキサー**：複数のサウンドを同時に、それぞれ独立した音量で追加できます。
- **カテゴリーブラウザ**：ドロップダウンメニューで整理されたサウンド選択機能。
- **レイヤーごとの音量調整**：リアルタイムで調整可能な音量スライダー。
- **デバイスルーティング**：オーディオ出力デバイスを選択可能。
- **リアルタイム同期**：SSE技術による状態更新。
- **Tauriデスクトップ**：Tauri v2によるネイティブウィンドウ。

## 開発環境構築

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

`http://localhost:5177` を開きます。カテゴリーを選択し、音源を追加し、音量を調整します。

## カスタムサウンド

任意の`.wav`ファイルをカスタムサウンドのディレクトリにドラッグ＆ドロップすると、自動的に「カスタム」カテゴリーに表示されます。サーバーの再起動は不要です。

デフォルトの場所：環境音のWAVファイルが保存されているフォルダの隣にある`custom/`フォルダ。`STILLPOINT_CUSTOM_PATH`環境変数で変更できます。

ファイル名が表示名になります。例えば、`my-rain.wav`は**My Rain**と表示されます。

## パッケージ

| パッケージ | 目的 |
|---------|---------|
| `@stillpoint/server` | Express API + sonic-core エンジン管理 |
| `@stillpoint/ui` | React ミキサーUI (Vite) |
| `@stillpoint/desktop` | Tauri v2 ネイティブウィンドウシェル |

## ライセンス

MIT — [LICENSE](LICENSE) を参照してください。

---

[MCP Tool Shop](https://mcp-tool-shop.github.io/) が作成しました。
