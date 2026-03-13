import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'Stillpoint',
  description: 'Ambient sound mixer for focus and nervous system regulation — 50 layered sounds, per-layer volume, device routing',
  logoBadge: 'SP',
  brandName: 'Stillpoint',
  repoUrl: 'https://github.com/mcp-tool-shop-org/stillpoint',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: 'Ambient mixer',
    headline: 'Ambient sound',
    headlineAccent: 'for focus.',
    description: 'Layer 50 ambient sounds across 10 categories. Independent volume per layer, device routing, real-time state sync. Powered by sonic-core and sonic-runtime.',
    primaryCta: { href: '#quickstart', label: 'Get started' },
    secondaryCta: { href: 'handbook/', label: 'Read the Handbook' },
    previews: [
      { label: 'Clone', code: 'git clone https://github.com/mcp-tool-shop-org/stillpoint\ncd stillpoint && npm install' },
      { label: 'Server', code: 'SONIC_RUNTIME_PATH=./SonicRuntime.exe \\\n  npx tsx packages/server/src/bin.ts' },
      { label: 'UI', code: 'npm run dev --workspace=@stillpoint/ui\n# → http://localhost:5177' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'Features',
      subtitle: 'Everything you need for ambient sound mixing.',
      features: [
        {
          title: '50 Ambient Sounds',
          desc: '10 categories: rain, water, ocean, wind, fire, night, noise, drone, tone, mechanical. 60-second loop-friendly WAV files.',
        },
        {
          title: 'Layered Mixer',
          desc: 'Add multiple sounds simultaneously. Each layer has independent volume control. Build complex ambient environments.',
        },
        {
          title: 'Per-Layer Volume',
          desc: 'Range sliders with debounced real-time adjustment. Optimistic UI updates for instant feel.',
        },
        {
          title: 'Device Routing',
          desc: 'Select your audio output device. Powered by sonic-core per-playback device routing through OpenAL Soft.',
        },
        {
          title: 'Real-Time SSE',
          desc: 'Server-Sent Events push state changes instantly. The UI stays in sync without polling.',
        },
        {
          title: 'Tauri Desktop',
          desc: 'Native window via Tauri v2. Minimal Rust shell — the real work happens in Node.js and sonic-runtime.',
        },
      ],
    },
    {
      kind: 'code-cards',
      id: 'quickstart',
      title: 'Quick Start',
      cards: [
        {
          title: 'Prerequisites',
          code: '# Node 20+\nnode --version\n\n# sonic-runtime binary\n# Build from:\n# github.com/mcp-tool-shop-org/sonic-runtime\ndotnet publish src/SonicRuntime \\\n  -c Release -r win-x64',
        },
        {
          title: 'Dev Setup',
          code: '# Clone and install\ngit clone https://github.com/mcp-tool-shop-org/stillpoint\ncd stillpoint\nnpm install\n\n# Terminal 1: server\nSONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \\\n  npx tsx packages/server/src/bin.ts\n\n# Terminal 2: UI\nnpm run dev --workspace=@stillpoint/ui',
        },
        {
          title: 'Architecture',
          code: '# Three-process model:\n#\n# Browser/Tauri ──REST+SSE──▶ Node.js server\n#                              │\n#                         ndjson-stdio\n#                              │\n#                         sonic-runtime\n#                         (OpenAL Soft)',
        },
      ],
    },
  ],
};
