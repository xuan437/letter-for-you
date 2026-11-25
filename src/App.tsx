import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { letterConfig, validateLetterConfig } from './config/letter';
import { SealedLetter } from './components/SealedLetter';
import { Letter } from './components/Letter';
import styles from './App.module.css';

const PetalField = lazy(() => import('./components/PetalField'));

export type LetterStage = 'sealed' | 'opening' | 'reading' | 'finished';

/** Duration of the opening animation before the unfolded letter appears (under 3s) */
const OPENING_DURATION_MS = 2150;

export const App: React.FC = () => {
  const validatedConfig = useMemo(() => validateLetterConfig(letterConfig), []);

  const [stage, setStage] = useState<LetterStage>('sealed');
  const [skipReveal, setSkipReveal] = useState<boolean>(false);
  const [petalsReady, setPetalsReady] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  const openTimerRef = useRef<number | null>(null);
  const appRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Lazy-load the petal layers right after first paint
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setPetalsReady(true);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Subtle ambient light gradient shifting with pointer movement or device orientation
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let frameId: number | null = null;
    let targetX = 50;
    let targetY = 35;

    const commitLight = () => {
      frameId = null;
      if (appRef.current) {
        appRef.current.style.setProperty('--light-x', `${targetX.toFixed(1)}%`);
        appRef.current.style.setProperty('--light-y', `${targetY.toFixed(1)}%`);
      }
    };

    const scheduleUpdate = (x: number, y: number) => {
      targetX = Math.max(15, Math.min(85, x));
      targetY = Math.max(15, Math.min(85, y));
      if (frameId === null) {
        frameId = window.requestAnimationFrame(commitLight);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        scheduleUpdate((e.clientX / window.innerWidth) * 100, (e.clientY / window.innerHeight) * 100);
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = 50 + (e.gamma / 45) * 25;
        const y = 35 + ((e.beta - 30) / 45) * 25;
        scheduleUpdate(x, y);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion]);

  // Cleanup opening timer & optional audio on unmount
  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleOpen = useCallback(() => {
    if (stage !== 'sealed') return;

    if (prefersReducedMotion) {
      setSkipReveal(true);
      setStage('reading');
      return;
    }

    setSkipReveal(false);
    setStage('opening');
    openTimerRef.current = window.setTimeout(() => {
      setStage('reading');
      openTimerRef.current = null;
    }, OPENING_DURATION_MS);
  }, [stage, prefersReducedMotion]);

  const handleReadingComplete = useCallback(() => {
    setStage((current) => (current === 'reading' ? 'finished' : current));
  }, []);

  const handleReplay = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    setSkipReveal(false);
    setStage('sealed');
  }, []);

  const handleToggleMusic = useCallback(() => {
    if (!validatedConfig.musicUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(validatedConfig.musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch((err) => {
          console.warn('[sakura-letter] Unable to play ambient music:', err);
          setIsMusicPlaying(false);
        });
    }
  }, [validatedConfig.musicUrl, isMusicPlaying]);

  // Apply optional theme overrides from src/config/letter.ts
  const themeStyle = useMemo(() => {
    const theme = validatedConfig.theme;
    if (!theme) return undefined;
    return {
      '--color-primary': theme.primary,
      '--color-accent': theme.accent,
      '--color-bg': theme.background,
    } as React.CSSProperties;
  }, [validatedConfig.theme]);

  return (
    <div ref={appRef} className={styles.app} style={themeStyle}>
      {/* Soft afternoon light gradient reacting gently to pointer or device tilt */}
      <div className={styles.ambientLight} aria-hidden="true" />

      {/* Quiet utility controls (music toggle) */}
      {validatedConfig.musicUrl && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={handleToggleMusic}
            aria-pressed={isMusicPlaying}
          >
            {isMusicPlaying ? '♪ Pause music' : '♪ Play music'}
          </button>
        </div>
      )}

      {/* Faint ink-wash cherry blossom branch in the upper-right background */}
      <svg
        className={styles.bgBranch}
        viewBox="0 0 360 260"
        width="360"
        height="260"
        aria-hidden="true"
      >
        <path
          d="M360 22 C300 44, 248 74, 198 98 C156 118, 114 134, 72 162"
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.14"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M258 68 C236 44, 212 30, 184 22"
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.11"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M174 109 C156 128, 146 148, 142 172"
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.11"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {[
          { x: 184, y: 22, s: 0.9 },
          { x: 142, y: 170, s: 0.72 },
          { x: 76, y: 158, s: 0.84 },
          { x: 244, y: 74, s: 0.68 },
        ].map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`} opacity="0.32">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path
                key={angle}
                transform={`rotate(${angle})`}
                d="M0 -2.5 C3.5 -8, 6 -12.5, 2 -15.5 L0 -13.4 L-2 -15.5 C-6 -12.5, -3.5 -8, 0 -2.5 Z"
                fill="var(--color-primary-soft)"
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Layered drifting sakura petals lazy-loaded after first paint */}
      {petalsReady && (
        <Suspense fallback={null}>
          <PetalField
            swirling={stage === 'opening'}
            showFinalBlossom={stage === 'finished'}
          />
        </Suspense>
      )}

      {/* Opening & unfolding sequence */}
      {(stage === 'sealed' || stage === 'opening') && (
        <SealedLetter
          japaneseSubtitle={validatedConfig.japaneseSubtitle}
          isOpening={stage === 'opening'}
          onOpen={handleOpen}
        />
      )}

      {/* Unfolded letter reading & ending moment */}
      {(stage === 'reading' || stage === 'finished') && (
        <Letter
          config={validatedConfig}
          isFinished={stage === 'finished'}
          skipReveal={skipReveal}
          onReadingComplete={handleReadingComplete}
          onClose={handleReplay}
        />
      )}
    </div>
  );
};

export default App;
