<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

एम्बिएंट साउंड मिक्सर, जो ध्यान केंद्रित करने और तंत्रिका तंत्र को नियंत्रित करने में मदद करता है। इसमें 10 श्रेणियों में 50 विभिन्न ध्वनियाँ हैं, जिनमें प्रत्येक ध्वनि परत के लिए वॉल्यूम नियंत्रण और डिवाइस रूटिंग की सुविधा है।

यह [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) और [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime) द्वारा संचालित है।

## आर्किटेक्चर

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

## विशेषताएं

- **50 परिवेशीय ध्वनियाँ** 10 श्रेणियों में (बारिश, पानी, समुद्र, हवा, आग, रात, शोर, ड्रोन, टोन, यांत्रिक)
- **कस्टम ध्वनियाँ** — अपनी WAV फाइलें एक फ़ोल्डर में डालें और वे मिक्सर में दिखाई देंगी।
- **लेयर्ड मिक्सर** — एक साथ कई ध्वनियाँ जोड़ें, प्रत्येक की अपनी वॉल्यूम सेटिंग होगी।
- **श्रेणी ब्राउज़र** — ड्रॉप-डाउन मेनू में व्यवस्थित ध्वनि चयनकर्ता।
- **प्रत्येक लेयर के लिए वॉल्यूम** — वास्तविक समय में समायोजन के लिए रेंज स्लाइडर।
- **प्रत्येक लेयर के लिए म्यूट** — व्यक्तिगत लेयर्स को हटाए बिना उन्हें म्यूट करें।
- **मास्टर वॉल्यूम** — सभी लेयर्स को एक साथ नियंत्रित करने वाला वैश्विक नियंत्रण।
- **फेड इन/आउट** — लेयर्स को जोड़ने या हटाने पर सहज बदलाव।
- **डिवाइस रूटिंग** — ऑडियो आउटपुट डिवाइस का चयनकर्ता; यूआई के माध्यम से या `POST /device` के माध्यम से सेट करें।
- **स्लीप टाइमर** — एक निश्चित अवधि के बाद स्वचालित रूप से प्लेबैक बंद करें।
- **सेव किए गए प्रीसेट** — नाम वाले मिक्स (लेयर्स + वॉल्यूम) को सेव और लोड करें।
- **सिस्टम ट्रे** — ट्रे में मिनिमाइज करें; प्लेबैक पृष्ठभूमि में जारी रहेगा।
- **रियल-टाइम सिंक** — SSE-संचालित स्टेट अपडेट।
- **टॉरी डेस्कटॉप** — टॉरी v2 के माध्यम से नेटिव विंडो।

## डेवलपमेंट सेटअप

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

विंडोज पर, पहले एनवायरनमेंट वेरिएबल सेट करें:

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

`http://localhost:5177` खोलें — एक श्रेणी चुनें, ध्वनियाँ जोड़ें, और वॉल्यूम समायोजित करें।

सर्वर डिफ़ॉल्ट रूप से पोर्ट 3456 पर चलता है। `PORT` एनवायरनमेंट वेरिएबल के साथ इसे बदलें।

## कस्टम ध्वनियाँ

कोई भी `.wav` फ़ाइल कस्टम ध्वनियों के फ़ोल्डर में डालें और यह स्वचालित रूप से "कस्टम" श्रेणी में दिखाई देगी — सर्वर को पुनः आरंभ करने की आवश्यकता नहीं है।

डिफ़ॉल्ट स्थान: परिवेशीय WAV फ़ाइलों के फ़ोल्डर के बगल में स्थित `custom/` फ़ोल्डर। `STILLPOINT_CUSTOM_PATH` का उपयोग करके इसे बदला जा सकता है।

फ़ाइल नाम प्रदर्शन नाम बन जाते हैं: `my-rain.wav` → **My Rain** (मेरा बारिश)।

## पैकेज

| पैकेज | उद्देश्य |
|---------|---------|
| `@stillpoint/server` | एक्सप्रेस एपीआई + sonic-core इंजन प्रबंधन। |
| `@stillpoint/ui` | रिएक्ट मिक्सर यूआई (Vite)। |
| `@stillpoint/desktop` | टॉरी v2 नेटिव विंडो शेल। |

## एनवायरनमेंट वेरिएबल

| वेरिएबल | डिफ़ॉल्ट | विवरण |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (बैकअप पथ) | "sonic-runtime" बाइनरी का पथ |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | उन परिवेशीय WAV फाइलों वाला डायरेक्टरी |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | उपयोगकर्ता द्वारा प्रदान की गई कस्टम WAV फाइलों वाला डायरेक्टरी |
| `PORT` | `3456` | सर्वर पोर्ट |

## रिलीज़ प्रक्रिया

1. `package.json` (रूट), `packages/server/package.json`, `packages/ui/package.json`, और `apps/desktop/package.json` में संस्करण बढ़ाएं।
2. `CHANGELOG.md` को अपडेट करें — "Unreleased" आइटम को एक दिनांकित संस्करण हेडर में ले जाएं।
3. सभी परीक्षणों को पास करने के लिए `npm test` चलाएं।
4. कमिट करें, `vX.Y.Z` टैग बनाएं, और पुश करें।
5. टैग से GitHub पर एक रिलीज़ बनाएं।

## लाइसेंस

MIT — देखें [LICENSE](LICENSE)।

---

[MCP Tool Shop](https://mcp-tool-shop.github.io/) द्वारा निर्मित।
