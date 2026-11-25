# Sakura Letter — あなたへの手紙

A lightweight, single-page romantic letter built with React, TypeScript, and Vite. Designed to feel like breaking a hanko wax seal on textured washi paper during a quiet spring afternoon under blooming cherry trees.

## Setup

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
npm run preview
```

## Project Structure

```text
├── index.html                        # Font preloads, Open Graph tags, favicon, & <noscript> fallback
├── public/
│   └── og-sakura.svg                 # Generated sakura wax-seal Open Graph preview image
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── index.css                     # Design tokens, WCAG AA ink palette, washi fiber texture
    ├── App.tsx                       # Stage state machine, lazy PetalField, light shift, & audio toggle
    ├── App.module.css
    ├── config/
    │   └── letter.ts                 # Personalizable letter content + runtime config validation
    └── components/
        ├── SealedLetter.tsx          # Opening screen with silk ribbon, petal burst & hanko seal
        ├── SealedLetter.module.css
        ├── Letter.tsx                # Washi paper sheet, margin calligraphy, corner branch & replay
        ├── Letter.module.css
        ├── FadeInText.tsx            # Punctuation-aware reveal, brush greeting, & keyboard advance
        ├── FadeInText.module.css
        ├── PetalField.tsx            # 3-layer drifting sakura petals (far, mid, near foreground)
        └── PetalField.module.css
```

## Customizing the Letter

All personal content lives in `src/config/letter.ts`. Edit `letterConfig` to personalize:

- `recipientName` & `senderName`
- `japaneseSubtitle`: Faint subtitle shown beneath the opening prompt (e.g. `"あなたへの手紙"`).
- `date` *(optional)*: Date or occasion line displayed above the greeting.
- `greeting`: Opening salutation revealed with a brush-stroke wipe in `Yuji Syuku`.
- `paragraphs`: Array of paragraphs revealed with natural pauses at punctuation and paragraph breaks. Japanese lines are automatically styled with `Shippori Mincho` and `lang="ja"`.
- `closing` & `signature`: Closing sentiment and sign-off.
- `postscript` *(optional)*: A quiet `P.S.` line revealed after the signature.
- `verticalMargin` *(optional, default `true`)* & `marginText`: Toggle or customize the decorative `writing-mode: vertical-rl` Japanese calligraphy in the right margin.
- `musicUrl` *(optional)*: Path or URL to an ambient audio file. Audio is **off by default** and only starts when the reader clicks the `♪ Play music` button.

`validateLetterConfig` validates `letterConfig` at runtime—if a required field is missing or empty, it logs a clear console warning and falls back safely instead of rendering a blank screen.

## Swapping the Sakura Color Theme

In `src/config/letter.ts`, adjust the `theme` object (`primary`, `accent`, `background`). `App.tsx` applies these as CSS custom properties at runtime:

```ts
theme: {
  primary: '#b5485f',    // Deep cherry red (hanko seal, signature, highlights)
  accent: '#2e3a59',     // Muted indigo (headings, Japanese lines, ink-wash branches)
  background: '#faf6ef', // Washi cream paper background
}
```

## Tuning Petal Density, Speed & Depth Layers

Petal depth layers are configured in `DEFAULT_PETAL_LAYERS` inside `src/components/PetalField.tsx`:

```ts
export const DEFAULT_PETAL_LAYERS: PetalLayerConfig[] = [
  { id: 'far', count: 10, durationSec: 22, sizeRange: [9, 13], opacityRange: [0.3, 0.46], blurPx: 1.3, foreground: false },
  { id: 'mid', count: 12, durationSec: 15, sizeRange: [14, 19], opacityRange: [0.52, 0.76], blurPx: 0, foreground: false },
  { id: 'near', count: 6, durationSec: 11, sizeRange: [21, 27], opacityRange: [0.62, 0.84], blurPx: 0.7, foreground: true },
];
```

- **Density**: Adjust `count` per layer, or add/remove layer objects.
- **Speed**: Lower `durationSec` for faster drift, or raise it for a slower afternoon breeze.
- **Foreground pass-over**: Set `foreground: true` to render a layer in front of the letter (`z-index: 4`).
- **Lazy loading & Bundle**: `PetalField` is lazy-loaded via `React.lazy` right after first paint. Zero extra runtime packages were added beyond `react` and `react-dom`.

### Why CSS Keyframes + Inline SVGs Instead of `<canvas>`?

`PetalField` uses eased CSS `@keyframes` (`transform` and `opacity` with `will-change`) on inline SVG petals:

1. **Zero JS frame loop**: Animations stay GPU-composited at 60fps on mid-range phones.
2. **Crisp vector edges at any DPI**: Inline SVGs remain sharp with negligible DOM weight (~28 nodes).
3. **Native `prefers-reduced-motion` support**: A single CSS media query freezes the petals into a calm still composition.

## Accessibility

- **Keyboard navigation**: Press `Enter` or `Space` to break the seal. While reading, press `ArrowRight`, `ArrowDown`, `Enter`, `Space`, or click the letter to advance line by line (`ArrowLeft` / `ArrowUp` steps back).
- **Skip animation**: A subtle `Skip animation` button appears during opening and reading to jump directly to the complete letter.
- **Reduced motion**: Respects `prefers-reduced-motion: reduce` by skipping transitions and displaying the still composition.
- **Contrast & Fallback**: All ink tones meet WCAG AA contrast over the washi background, and `index.html` includes a `<noscript>` fallback displaying the full letter.
