import React, { useMemo } from 'react';
import styles from './PetalField.module.css';

export interface PetalLayerConfig {
  /** Identifier for the depth layer */
  id: string;
  /** Number of petals in this layer */
  count: number;
  /** Base fall duration in seconds (petals vary slightly around this) */
  durationSec: number;
  /** Size range in pixels [min, max] */
  sizeRange: [number, number];
  /** Opacity range [min, max] */
  opacityRange: [number, number];
  /** Optional static blur in pixels to convey atmospheric depth */
  blurPx?: number;
  /** Render this layer in front of the letter sheet (z-index: 4) */
  foreground?: boolean;
}

export const DEFAULT_PETAL_LAYERS: PetalLayerConfig[] = [
  {
    id: 'far',
    count: 10,
    durationSec: 22,
    sizeRange: [9, 13],
    opacityRange: [0.3, 0.46],
    blurPx: 1.3,
    foreground: false,
  },
  {
    id: 'mid',
    count: 12,
    durationSec: 15,
    sizeRange: [14, 19],
    opacityRange: [0.52, 0.76],
    blurPx: 0,
    foreground: false,
  },
  {
    id: 'near',
    count: 6,
    durationSec: 11,
    sizeRange: [21, 27],
    opacityRange: [0.62, 0.84],
    blurPx: 0.7,
    foreground: true,
  },
];

interface PetalFieldProps {
  /** Triggers a brief swirling breeze when the letter is opening */
  swirling?: boolean;
  /** Triggers a single blossom falling across the screen at the end */
  showFinalBlossom?: boolean;
  /** Customize or add/remove petal depth layers */
  layers?: PetalLayerConfig[];
}

interface GeneratedPetal {
  key: string;
  leftPercent: number;
  delaySec: number;
  durationSec: number;
  flutterDurationSec: number;
  swirlDelaySec: number;
  sizePx: number;
  opacity: number;
  swayPx: number;
  rotateStart: number;
  rotateEnd: number;
  blurPx: number;
  foreground: boolean;
  variant: 0 | 1 | 2;
  easing: string;
}

const DRIFT_EASINGS = [
  'cubic-bezier(0.37, 0, 0.63, 1)',
  'cubic-bezier(0.42, 0.04, 0.58, 0.96)',
  'cubic-bezier(0.32, 0.08, 0.68, 0.92)',
];

/** Deterministic pseudo-random helper so petal layout stays stable across renders */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/**
 * Renders layered cherry blossom petals drifting across the viewport using
 * 3D-composited CSS keyframe animations on lightweight inline SVG shapes.
 * Near-layer petals pass in front of the letter for natural depth.
 */
export const PetalField: React.FC<PetalFieldProps> = ({
  swirling = false,
  showFinalBlossom = false,
  layers = DEFAULT_PETAL_LAYERS,
}) => {
  const petals = useMemo<GeneratedPetal[]>(() => {
    const items: GeneratedPetal[] = [];
    let seed = 17;

    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i += 1) {
        seed += 1;
        const r1 = seededRandom(seed);
        const r2 = seededRandom(seed + 101);
        const r3 = seededRandom(seed + 211);
        const r4 = seededRandom(seed + 307);

        const [minSize, maxSize] = layer.sizeRange;
        const [minOpacity, maxOpacity] = layer.opacityRange;

        items.push({
          key: `${layer.id}-${i}`,
          leftPercent: r1 * 100,
          delaySec: -(r2 * layer.durationSec),
          durationSec: layer.durationSec * (0.84 + r3 * 0.36),
          flutterDurationSec: 3.4 + r4 * 2.6,
          swirlDelaySec: r3 * 0.32,
          sizePx: minSize + r3 * (maxSize - minSize),
          opacity: minOpacity + r4 * (maxOpacity - minOpacity),
          swayPx: (r1 > 0.5 ? 1 : -1) * (28 + r2 * 48),
          rotateStart: Math.round(r1 * 180),
          rotateEnd: Math.round(200 + r4 * 260),
          blurPx: layer.blurPx ?? 0,
          foreground: Boolean(layer.foreground),
          variant: (i % 3) as 0 | 1 | 2,
          easing: DRIFT_EASINGS[i % DRIFT_EASINGS.length],
        });
      }
    });

    return items;
  }, [layers]);

  const backgroundPetals = petals.filter((p) => !p.foreground);
  const foregroundPetals = petals.filter((p) => p.foreground);

  const renderPetal = (petal: GeneratedPetal) => (
    <div
      key={petal.key}
      className={styles.petalSlot}
      style={
        {
          left: `${petal.leftPercent}%`,
          animationDelay: `${petal.delaySec}s`,
          animationDuration: `${petal.durationSec}s`,
          animationTimingFunction: petal.easing,
          '--sway-x': `${petal.swayPx}px`,
          '--rot-start': `${petal.rotateStart}deg`,
          '--rot-end': `${petal.rotateEnd}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.swirlLayer}
        style={{ animationDelay: `${petal.swirlDelaySec}s` }}
      >
        <svg
          className={styles.petalSvg}
          width={petal.sizePx}
          height={petal.sizePx * 1.15}
          viewBox="0 0 24 28"
          style={{
            opacity: petal.opacity,
            filter: petal.blurPx ? `blur(${petal.blurPx}px)` : undefined,
            animationDuration: `${petal.flutterDurationSec}s`,
          }}
        >
          {petal.variant === 0 && (
            <path
              d="M12 2C15.5 6.5 19.5 11.2 19 17.4C18.6 22 15.6 25.5 12 26C8.4 25.5 5.4 22 5 17.4C4.5 11.2 8.5 6.5 12 2Z"
              fill="var(--color-primary-soft)"
              stroke="rgba(181, 72, 95, 0.18)"
              strokeWidth="0.6"
            />
          )}
          {petal.variant === 1 && (
            <path
              d="M12 3.2L14 5.8L16.2 3.4C19.4 7.8 20.6 13.4 19.2 18.6C18.1 22.8 15.2 25.3 12 25.8C8.8 25.3 5.9 22.8 4.8 18.6C3.4 13.4 4.6 7.8 7.8 3.4L10 5.8L12 3.2Z"
              fill="#fbe6ec"
              stroke="rgba(181, 72, 95, 0.15)"
              strokeWidth="0.6"
            />
          )}
          {petal.variant === 2 && (
            <path
              d="M11.6 2.5C15.8 6.8 19.2 12.1 18.4 18.2C17.8 22.5 14.9 25.4 11.8 25.8C8.5 25.1 5.8 21.8 5.6 17.4C5.4 11.9 8.2 6.8 11.6 2.5Z"
              fill="#f5cad6"
              stroke="rgba(181, 72, 95, 0.16)"
              strokeWidth="0.6"
            />
          )}
        </svg>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`${styles.field} ${styles.backField} ${swirling ? styles.swirling : ''}`}
        aria-hidden="true"
      >
        {backgroundPetals.map(renderPetal)}
      </div>

      <div
        className={`${styles.field} ${styles.frontField} ${swirling ? styles.swirling : ''}`}
        aria-hidden="true"
      >
        {foregroundPetals.map(renderPetal)}

        {showFinalBlossom && (
          <div className={styles.finalBlossom}>
            <svg className={styles.finalBlossomSvg} width="38" height="38" viewBox="0 0 40 40">
              <g transform="translate(20 20)">
                {[0, 72, 144, 216, 288].map((angle) => (
                  <path
                    key={angle}
                    transform={`rotate(${angle})`}
                    d="M0 -3 C4 -9, 7 -14, 2.4 -17.5 L0 -15.2 L-2.4 -17.5 C-7 -14, -4 -9, 0 -3 Z"
                    fill="var(--color-primary-soft)"
                    stroke="rgba(181, 72, 95, 0.32)"
                    strokeWidth="0.7"
                  />
                ))}
                <circle cx="0" cy="0" r="2.4" fill="var(--color-gold)" opacity="0.9" />
              </g>
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

export default PetalField;
