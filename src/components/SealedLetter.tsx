import React from 'react';
import styles from './SealedLetter.module.css';

interface SealedLetterProps {
  /** Subtle Japanese subtitle displayed beneath the opening prompt */
  japaneseSubtitle?: string;
  /** True while the opening animation is playing */
  isOpening: boolean;
  /** Callback triggered when the user clicks or taps the seal */
  onOpen: () => void;
}

const SEAL_BURST_PETALS = [
  { angle: -65, dist: 76, delay: 0.04, size: 12 },
  { angle: -25, dist: 92, delay: 0.08, size: 14 },
  { angle: 20, dist: 84, delay: 0.03, size: 11 },
  { angle: 70, dist: 78, delay: 0.1, size: 13 },
  { angle: 125, dist: 86, delay: 0.06, size: 12 },
  { angle: 175, dist: 74, delay: 0.09, size: 10 },
  { angle: -135, dist: 88, delay: 0.05, size: 13 },
];

/**
 * Opening screen: a folded washi letter bound with a thin silk ribbon
 * and a red hanko-style sakura wax seal.
 */
export const SealedLetter: React.FC<SealedLetterProps> = ({
  japaneseSubtitle = 'あなたへの手紙',
  isOpening,
  onOpen,
}) => {
  return (
    <section
      className={`${styles.container} ${isOpening ? styles.opening : ''}`}
      aria-label="Sealed letter"
    >
      <header className={styles.promptGroup}>
        <p className={styles.prompt}>Someone has written something for you</p>
        {japaneseSubtitle && (
          <p className={styles.subtitle} lang="ja">
            {japaneseSubtitle}
          </p>
        )}
      </header>

      <div className={styles.envelopeStage}>
        <div className={styles.envelope}>
          {/* Paper fold lines & rising inner sheet hint */}
          <div className={styles.paperBase} />
          <div className={styles.innerSheetPeek} aria-hidden="true" />
          <div className={styles.foldCreaseHorizontal} />
          <div className={styles.topFlap} />

          {/* Faint gold-leaf corner hairline with subtle shimmer */}
          <span className={styles.goldAccent} aria-hidden="true" />

          {/* Thin silk ribbon */}
          <div className={styles.ribbonHorizontal} aria-hidden="true" />
          <div className={styles.ribbonVertical} aria-hidden="true" />

          {/* Burst of sakura petals when the seal is broken */}
          {isOpening && (
            <div className={styles.burstLayer} aria-hidden="true">
              {SEAL_BURST_PETALS.map((p, idx) => {
                const rad = (p.angle * Math.PI) / 180;
                const tx = Math.round(Math.cos(rad) * p.dist);
                const ty = Math.round(Math.sin(rad) * p.dist);
                return (
                  <svg
                    key={idx}
                    className={styles.burstPetal}
                    width={p.size}
                    height={p.size * 1.15}
                    viewBox="0 0 24 28"
                    style={
                      {
                        '--tx': `${tx}px`,
                        '--ty': `${ty}px`,
                        '--rot': `${p.angle * 1.4}deg`,
                        animationDelay: `${p.delay}s`,
                      } as React.CSSProperties
                    }
                  >
                    <path
                      d="M12 2C15.5 6.5 19.5 11.2 19 17.4C18.6 22 15.6 25.5 12 26C8.4 25.5 5.4 22 5 17.4C4.5 11.2 8.5 6.5 12 2Z"
                      fill="var(--color-primary-soft)"
                      stroke="rgba(181, 72, 95, 0.28)"
                      strokeWidth="0.7"
                    />
                  </svg>
                );
              })}
            </div>
          )}

          {/* Interactive Hanko-style wax seal */}
          <button
            type="button"
            className={styles.sealButton}
            onClick={onOpen}
            disabled={isOpening}
            aria-label="Open the letter"
          >
            <span className={styles.sealHalo} aria-hidden="true" />
            <span className={styles.sealDisc}>
              <svg
                className={styles.sealEmblem}
                viewBox="0 0 48 48"
                width="38"
                height="38"
                aria-hidden="true"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  fill="none"
                  stroke="rgba(250, 246, 239, 0.48)"
                  strokeWidth="1"
                />
                <g transform="translate(24 24)">
                  {[0, 72, 144, 216, 288].map((angle) => (
                    <path
                      key={angle}
                      transform={`rotate(${angle})`}
                      d="M0 -2.6 C2.8 -6.6, 5.2 -10.5, 1.8 -13 L0 -11.2 L-1.8 -13 C-5.2 -10.5, -2.8 -6.6, 0 -2.6 Z"
                      fill="#faf6ef"
                      fillOpacity="0.92"
                    />
                  ))}
                  <circle cx="0" cy="0" r="1.7" fill="#c9a96e" />
                </g>
              </svg>
            </span>
          </button>
        </div>

        <p className={styles.hint}>Tap the seal to break it</p>
      </div>
    </section>
  );
};
