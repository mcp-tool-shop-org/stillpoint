<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

Tauri v2 を使用して、Stillpoint ミキサーを組み込んだネイティブ Windows アプリケーションを作成します。React フロントエンドを、ローカルホストで動作する Node.js サーバーに接続します。

## 特徴

- ネイティブウィンドウ (700x500、最小サイズ: 500x400)
- NSISおよびMSIインストーラーに対応
- CSPはローカル接続のみを許可する設定

## 走る

```bash
cd apps/desktop
npm run tauri dev
```

サーバーがポート3456で稼働しており、UI開発サーバーがポート5177で稼働している必要があります。

## ライセンス

MITライセンスについては、[LICENSE](../../LICENSE) をご参照ください。

---

[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint)の一部。 [MCP Tool Shop](https://mcp-tool-shop.github.io/)によって開発されました。
