import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './FadeInText.module.css';

interface FadeInTextProps {
  date?: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  postscript?: string;
  /** Immediately reveal all lines when true */
  skipReveal?: boolean;
  /** Called once the full letter has been revealed */
  onComplete: () => void;
}

/** Splits a paragraph into natural reading clauses/lines while preserving punctuation */
function splitIntoLines(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?。！？])\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

/** Detects whether a string contains Japanese characters for font & lang attributes */
function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/u.test(text);
}

/** Computes a natural reading pause (ms) based on punctuation, length, and paragraph breaks */
function computeStepDelay(text: string, isParagraphEnd: boolean): number {
  const base = 400 + Math.min(text.length * 9, 440);
  const endsSentence = /[.!?。！？]$/u.test(text);
  const hasClausePause = /[,—、]$/u.test(text);

  let delay = base;
  if (endsSentence) delay += 240;
  else if (hasClausePause) delay += 120;

  if (isParagraphEnd) delay += 420;
  return delay;
}

/**
 * Reveals the letter's date, greeting, body lines, closing, signature, and optional postscript
 * with natural punctuation/paragraph pacing, brush-stroke greeting reveal, and keyboard/click advance.
 */
export const FadeInText: React.FC<FadeInTextProps> = ({
  date,
  greeting,
  paragraphs,
  closing,
  signature,
  postscript,
  skipReveal = false,
  onComplete,
}) => {
  const paragraphLines = useMemo(
    () => paragraphs.map((p) => splitIntoLines(p)),
    [paragraphs],
  );

  // Build per-step delay schedule
  const stepDelays = useMemo<number[]>(() => {
    const delays: number[] = [];
    if (date) delays.push(480);
    delays.push(820); // greeting

    paragraphLines.forEach((lines) => {
      lines.forEach((line, lIdx) => {
        delays.push(computeStepDelay(line, lIdx === lines.length - 1));
      });
    });

    delays.push(720); // closing
    delays.push(postscript ? 640 : 750); // signature
    if (postscript) delays.push(750); // postscript
    return delays;
  }, [date, paragraphLines, postscript]);

  const totalSteps = stepDelays.length;

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [visibleSteps, setVisibleSteps] = useState<number>(
    prefersReducedMotion || skipReveal ? totalSteps : 1,
  );

  useEffect(() => {
    if (skipReveal || prefersReducedMotion) {
      setVisibleSteps(totalSteps);
      onComplete();
    }
  }, [skipReveal, prefersReducedMotion, totalSteps, onComplete]);

  useEffect(() => {
    if (prefersReducedMotion || skipReveal) return undefined;

    if (visibleSteps >= totalSteps) {
      const doneTimer = window.setTimeout(onComplete, stepDelays[totalSteps - 1] ?? 700);
      return () => window.clearTimeout(doneTimer);
    }

    const delay = stepDelays[Math.max(0, visibleSteps - 1)] ?? 650;
    const timer = window.setTimeout(() => {
      setVisibleSteps((prev) => Math.min(prev + 1, totalSteps));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [visibleSteps, totalSteps, stepDelays, prefersReducedMotion, skipReveal, onComplete]);

  const advanceStep = useCallback(() => {
    setVisibleSteps((prev) => (prev < totalSteps ? prev + 1 : prev));
  }, [totalSteps]);

  const stepBack = useCallback(() => {
    setVisibleSteps((prev) => (prev > 1 && prev < totalSteps ? prev - 1 : prev));
  }, [totalSteps]);

  // Keyboard navigation during reading: ArrowRight / ArrowDown / Space / Enter advance
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.tagName === 'BUTTON') return;

      if (
        event.key === 'ArrowRight' ||
        event.key === 'ArrowDown' ||
        event.key === ' ' ||
        event.key === 'Enter'
      ) {
        if (visibleSteps < totalSteps) {
          event.preventDefault();
          advanceStep();
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        if (visibleSteps > 1 && visibleSteps < totalSteps) {
          event.preventDefault();
          stepBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleSteps, totalSteps, advanceStep, stepBack]);

  let runningIndex = 0;
  const dateIndex = date ? runningIndex++ : -1;
  const greetingIndex = runningIndex++;

  return (
    <div
      className={styles.wrapper}
      onClick={visibleSteps < totalSteps ? advanceStep : undefined}
    >
      {date && (
        <p
          className={`${styles.date} ${
            visibleSteps > dateIndex ? styles.visible : ''
          }`}
          lang={hasJapanese(date) ? 'ja' : 'en'}
        >
          {date}
        </p>
      )}

      <h1
        className={`${styles.greeting} ${
          visibleSteps > greetingIndex ? styles.greetingVisible : ''
        }`}
        lang={hasJapanese(greeting) ? 'ja' : 'en'}
      >
        {greeting}
      </h1>

      <div className={styles.body}>
        {paragraphLines.map((lines, pIdx) => {
          const isJpParagraph = lines.some(hasJapanese);
          return (
            <p
              key={pIdx}
              className={`${styles.paragraph} ${isJpParagraph ? styles.jpParagraph : ''}`}
              lang={isJpParagraph ? 'ja' : 'en'}
            >
              {lines.map((line, lIdx) => {
                const stepIdx = runningIndex++;
                const isVisible = visibleSteps > stepIdx;
                return (
                  <span
                    key={lIdx}
                    className={`${styles.line} ${isVisible ? styles.lineVisible : ''}`}
                  >
                    {line}
                    {lIdx < lines.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      {(() => {
        const closingIndex = runningIndex++;
        const signatureIndex = runningIndex++;
        const postscriptIndex = postscript ? runningIndex++ : -1;
        const signatureVisible = visibleSteps > signatureIndex;

        return (
          <footer className={styles.footer}>
            <p
              className={`${styles.closing} ${
                visibleSteps > closingIndex ? styles.visible : ''
              }`}
              lang={hasJapanese(closing) ? 'ja' : 'en'}
            >
              {closing}
            </p>
            <div className={styles.signatureRow}>
              <p
                className={`${styles.signature} ${
                  signatureVisible ? styles.signatureVisible : ''
                }`}
                lang={hasJapanese(signature) ? 'ja' : 'en'}
              >
                {signature}
              </p>
              <span
                className={`${styles.miniHanko} ${
                  signatureVisible ? styles.miniHankoVisible : ''
                }`}
                aria-hidden="true"
              >
                桜
              </span>
            </div>
            {postscript && (
              <p
                className={`${styles.postscript} ${
                  visibleSteps > postscriptIndex ? styles.visible : ''
                }`}
                lang={hasJapanese(postscript) ? 'ja' : 'en'}
              >
                {postscript}
              </p>
            )}
          </footer>
        );
      })()}
    </div>
  );
};
