<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

sonic-core を利用した、Express ベースのオーディオミキサーサーバー。サウンドレイヤーの管理、デバイスの選択、および再生を行います。リアルタイムの状態更新を、SSE (Server-Sent Events) を介して接続されているすべてのクライアントに送信します。

## API

| メソッド | パス | 目的 |
|--------|------|---------|
| GET | `/api/sounds` | カテゴリー付きの完全なカタログ（組み込み + カスタム） |
| GET | `/api/devices` | 利用可能なオーディオ出力デバイス |
| GET | `/api/state` | 現在のミキサーの状態 |
| POST | `/api/layers/add` | サウンドレイヤーの追加 |
| POST | `/api/layers/remove` | レイヤーの削除 |
| POST | `/api/layers/volume` | レイヤーの音量設定（0.0～1.0） |
| POST | `/api/stop-all` | すべてのレイヤーの停止 |
| GET | `/api/events` | 状態変化の SSE ストリーム |

## カスタムサウンド

`.wav` ファイルをカスタムサウンドのディレクトリにドラッグ＆ドロップします。自動的に「カスタム」カテゴリーに表示されます。`STILLPOINT_CUSTOM_PATH` 環境変数を設定するか、デフォルトの `custom/` フォルダ（アンビエント WAV ファイルのディレクトリの隣）を使用します。

## 実行

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

サーバーはポート 3456 で起動します。

## ライセンス

MIT — [LICENSE](../../LICENSE) を参照してください。

---

[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) の一部。 [MCP Tool Shop](https://mcp-tool-shop.github.io/) が作成しました。
