<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

एक्सप्रेस-आधारित ऑडियो मिक्सर सर्वर जो sonic-core के माध्यम से ध्वनि परतों, डिवाइस चयन और प्लेबैक का प्रबंधन करता है। यह सभी कनेक्टेड क्लाइंट्स को SSE के माध्यम से वास्तविक समय में स्थिति अपडेट भेजता है।

## एपीआई

| विधि | पथ | उद्देश्य |
|--------|------|---------|
| GET | `/api/sounds` | श्रेणियों के साथ पूरा कैटलॉग (अंतर्निहित + कस्टम) |
| GET | `/api/devices` | उपलब्ध ऑडियो आउटपुट डिवाइस |
| GET | `/api/state` | मिक्सर की वर्तमान स्थिति |
| POST | `/api/layers/add` | एक ध्वनि परत जोड़ें |
| POST | `/api/layers/remove` | एक परत हटाएं |
| POST | `/api/layers/volume` | परत की वॉल्यूम सेट करें (0.0–1.0) |
| POST | `/api/stop-all` | सभी परतों को रोकें |
| GET | `/api/events` | स्थिति परिवर्तनों का SSE स्ट्रीम |

## कस्टम ध्वनियाँ

`.wav` फ़ाइलों को कस्टम ध्वनियों के फ़ोल्डर में डालें। वे स्वचालित रूप से "कस्टम" श्रेणी में दिखाई देंगे। `STILLPOINT_CUSTOM_PATH` सेट करें या डिफ़ॉल्ट `custom/` फ़ोल्डर का उपयोग करें, जो एंबिएंट WAV फ़ाइलों के फ़ोल्डर के बगल में स्थित है।

## चलाएं

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

सर्वर पोर्ट 3456 पर शुरू होता है।

## लाइसेंस

MIT — [LICENSE](../../LICENSE) देखें।

---

[Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) का हिस्सा · [MCP Tool Shop](https://mcp-tool-shop.github.io/) द्वारा बनाया गया।
