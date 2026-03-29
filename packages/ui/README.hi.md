<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

स्टिलपॉइंट के लिए रिएक्ट मिक्सर इंटरफ़ेस। यह रेस्ट और एसएसई के माध्यम से सर्वर से जुड़ता है, और एक लेयर्ड साउंड मिक्सर प्रदर्शित करता है जिसमें प्रत्येक लेयर के लिए वॉल्यूम नियंत्रण, श्रेणी ब्राउज़िंग और डिवाइस चयन की सुविधा है।

## घटक

- **SoundPicker** — दो कैस्केडिंग ड्रॉपडाउन: पहले श्रेणी, फिर ध्वनि।
- **LayerStrip** — प्रत्येक लेयर के लिए स्ट्रिप जिसमें नाम, श्रेणी लेबल, वॉल्यूम फ़ेडर और हटाने का बटन शामिल है।
- **DeviceSelect** — ऑडियो आउटपुट डिवाइस के लिए ड्रॉपडाउन।
- **ErrorBanner** — सर्वर त्रुटियों को प्रदर्शित करता है।

## स्टेट प्रबंधन

`useRegulator` हुक `/api/events` से एक सिंगल `EventSource` कनेक्शन के माध्यम से सभी स्टेट को प्रबंधित करता है। वॉल्यूम में बदलाव 50 मिलीसेकंड के डिबाउंस के साथ किए जाते हैं, और यूआई अपडेट आशावादी रूप से किए जाते हैं।

## चलाएं

```bash
npm run dev --workspace=@stillpoint/ui
```

यह `http://localhost:5177` पर खुलता है। इसके लिए पोर्ट 3456 पर चल रहे सर्वर की आवश्यकता होती है।

## लाइसेंस

एमआईटी — [LICENSE](../../LICENSE) देखें।

---

[स्टिलपॉइंट](https://github.com/mcp-tool-shop-org/stillpoint) का हिस्सा · [MCP Tool Shop](https://mcp-tool-shop.github.io/) द्वारा बनाया गया।
