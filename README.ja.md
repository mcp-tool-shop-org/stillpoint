<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

- **50種類の環境音**を10のカテゴリー（雨、水、海、風、火、夜、ノイズ、ドローン、音、機械）に分類
- **カスタムサウンド**：WAVファイルをフォルダに配置すると、ミキサーに表示されます。
- **レイヤーミキサー**：複数のサウンドを同時に、個別の音量で追加できます。
- **カテゴリーブラウザ**：ドロップダウン形式で整理されたサウンド選択機能。
- **レイヤーごとの音量**：リアルタイムで調整可能なスライダー。
- **レイヤーごとのミュート**：個々のレイヤーをミュートできます（削除はされません）。
- **マスター音量**：すべてのレイヤーをまとめて調整するグローバルコントロール。
- **フェードイン/アウト**：レイヤーを追加または削除する際の滑らかなトランジション。
- **デバイスルーティング**：オーディオ出力デバイスの選択機能。UIまたは`POST /device`で設定。
- **スリープタイマー**：設定可能な時間経過後に自動的に再生を停止します。
- **保存済みプリセット**：名前を付けてミックス（レイヤーと音量）を保存および読み込みできます。
- **システムトレイ**：最小化するとトレイに表示され、バックグラウンドで再生が継続されます。
- **リアルタイム同期**：SSEによる状態更新。
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

Windowsでは、最初に環境変数を設定してください。

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

`http://localhost:5177` を開きます。カテゴリーを選択し、音源を追加し、音量を調整します。

サーバーのデフォルトポートは3456です。`PORT`環境変数で上書きできます。

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

## 環境変数

| 変数 | デフォルト値 | 説明 |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | （代替パス） | sonic-runtimeバイナリへのパス |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | 環境音のWAVファイルが格納されているディレクトリ |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | ユーザーが提供するカスタムWAVファイルが格納されているディレクトリ |
| `PORT` | `3456` | サーバーポート |

## リリースプロセス

1. `package.json`（ルート）、`packages/server/package.json`、`packages/ui/package.json`、および`apps/desktop/package.json`でバージョン番号を更新します。
2. `CHANGELOG.md`を更新します。未リリース項目を日付付きのバージョンヘッダーに移動します。
3. `npm test`を実行して、すべてのテストがパスすることを確認します。
4. コミットし、`vX.Y.Z`というタグを付けてプッシュします。
5. タグからGitHub Releaseを作成します。

## ライセンス

MIT — [LICENSE](LICENSE) を参照してください。

---

[MCP Tool Shop](https://mcp-tool-shop.github.io/) が作成しました。
