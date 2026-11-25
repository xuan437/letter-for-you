import React, { useState } from 'react';
import { LetterConfig } from '../config/letter';
import { downloadLetterAsImage } from '../utils/exportLetterImage';
import { FadeInText } from './FadeInText';
import styles from './Letter.module.css';

interface LetterProps {
  config: LetterConfig;
  isFinished: boolean;
  skipReveal: boolean;
  onReadingComplete: () => void;
  onClose: () => void;
}

/**
 * Textured washi paper letter with optional vertical Japanese margin calligraphy,
 * subtle fold creases, a swaying corner cherry blossom branch illustration,
 * and the ending close/download controls.
 */
export const Letter: React.FC<LetterProps> = ({
  config,
  isFinished,
  skipReveal,
  onReadingComplete,
  onClose,
}) => {
  const showVerticalMargin = config.verticalMargin !== false;
  const [downloadState, setDownloadState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 650);
  };

  const handleDownload = async () => {
    if (downloadState === 'saving') return;
    setDownloadState('saving');
    try {
      await downloadLetterAsImage(config);
      setDownloadState('saved');
      window.setTimeout(() => setDownloadState('idle'), 2200);
    } catch (err) {
      console.warn('[sakura-letter] Failed to export letter image:', err);
      setDownloadState('idle');
    }
  };

  return (
    <main className={styles.stage}>
      <article
        className={`${styles.paper} ${isClosing ? styles.paperClosing : ''}`}
        aria-label={`Letter for ${config.recipientName}`}
      >
        {/* Subtle fold lines from when the letter was folded */}
        <div className={styles.foldTop} aria-hidden="true" />
        <div className={styles.foldBottom} aria-hidden="true" />

        {/* Delicate gold-leaf inner frame */}
        <div className={styles.goldFrame} aria-hidden="true" />

        {/* Optional vertical Japanese-style margin decoration */}
        {showVerticalMargin && (
          <aside className={styles.marginCalligraphy} aria-hidden="true" lang="ja">
            <span>{config.marginText || '春風駘蕩'}</span>
            <span className={styles.marginDivider}>・</span>
            <span>{config.japaneseSubtitle || '桜花爛漫'}</span>
          </aside>
        )}

        {/* Letter content */}
        <div className={`${styles.content} ${!showVerticalMargin ? styles.contentWide : ''}`}>
          <FadeInText
            date={config.date}
            greeting={config.greeting}
            paragraphs={config.paragraphs}
            closing={config.closing}
            signature={config.signature}
            postscript={config.postscript}
            skipReveal={skipReveal}
            onComplete={onReadingComplete}
          />
        </div>

        {/* Small cherry blossom branch illustration in the bottom-left corner */}
        <svg
          className={styles.cornerBranch}
          viewBox="0 0 180 120"
          width="150"
          height="100"
          aria-hidden="true"
        >
          <path
            d="M8 106 C38 94, 66 76, 94 68 C114 62, 134 52, 152 38"
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity="0.32"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M64 79 C76 62, 86 48, 102 36"
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity="0.25"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M112 61 C124 68, 136 70, 146 68"
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity="0.22"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {[
            { x: 102, y: 36, scale: 0.78 },
            { x: 149, y: 38, scale: 0.9 },
            { x: 132, y: 66, scale: 0.65 },
          ].map((blossom, idx) => (
            <g
              key={idx}
              transform={`translate(${blossom.x} ${blossom.y}) scale(${blossom.scale})`}
            >
              {[0, 72, 144, 216, 288].map((angle) => (
                <path
                  key={angle}
                  transform={`rotate(${angle})`}
                  d="M0 -2 C2.8 -6.5, 5 -10, 1.6 -12.5 L0 -10.8 L-1.6 -12.5 C-5 -10, -2.8 -6.5, 0 -2 Z"
                  fill="var(--color-primary-soft)"
                  fillOpacity="0.88"
                  stroke="var(--color-primary)"
                  strokeOpacity="0.28"
                  strokeWidth="0.6"
                />
              ))}
              <circle cx="0" cy="0" r="1.6" fill="var(--color-primary)" fillOpacity="0.55" />
            </g>
          ))}
        </svg>
      </article>

      {/* Ending moment: closing quote + close & download actions */}
      <div
        className={`${styles.endingBar} ${isFinished && !isClosing ? styles.endingVisible : ''}`}
        aria-hidden={!isFinished || isClosing}
      >
        <p className={styles.endingNote}>
          &ldquo;I&apos;ll love you the way the moon glows over the earth on its darkest night,
          quiet, steady, and always there to light your way.&rdquo;
        </p>
        <div className={styles.endingActions}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isClosing}
            tabIndex={isFinished ? 0 : -1}
          >
            <span lang="ja">閉じる</span>
            <span className={styles.dot} aria-hidden="true">
              ·
            </span>
            <span>Close the letter</span>
          </button>
          <button
            type="button"
            className={styles.downloadButton}
            onClick={handleDownload}
            disabled={downloadState === 'saving' || isClosing}
            tabIndex={isFinished ? 0 : -1}
          >
            {downloadState === 'saving'
              ? 'Saving…'
              : downloadState === 'saved'
                ? 'Saved image'
                : 'Save as image'}
          </button>
        </div>
      </div>
    </main>
  );
};
