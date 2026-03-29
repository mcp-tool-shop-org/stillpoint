<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

Stillpoint用のReactベースのインターフェース。RESTとSSEを通じてサーバーに接続し、レイヤーごとの音量調整、カテゴリの閲覧、デバイス選択が可能な、階層構造のサウンドミキサーを表示します。

## コンポーネント

- **SoundPicker**: カテゴリとサウンドを選択するための、2つのドロップダウンメニュー。
- **LayerStrip**: レイヤーごとに、名前、カテゴリラベル、音量調整スライダー、および削除ボタンを表示するストリップ。
- **DeviceSelect**: オーディオ出力デバイスを選択するためのドロップダウンメニュー。
- **ErrorBanner**: サーバーエラーを表示します。

## 状態管理

`useRegulator`というフックが、`/api/events`への単一の`EventSource`接続を通じて、すべての状態を管理します。音量変更は50msのディバウンス処理を行い、UIは楽観的に更新されます。

## 実行方法

```bash
npm run dev --workspace=@stillpoint/ui
```

`http://localhost:5177`で起動します。ポート3456で動作しているサーバーが必要です。

## ライセンス

MIT — [LICENSE](../../LICENSE) を参照してください。

---

[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint)の一部。 [MCP Tool Shop](https://mcp-tool-shop.github.io/)によって開発されました。
