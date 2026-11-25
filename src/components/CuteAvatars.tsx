import React, { useEffect, useMemo, useState } from 'react';
import styles from './CuteAvatars.module.css';

interface CuteAvatarsProps {
  /** Custom pool of mini messages; falls back to built-in sweet notes */
  messages?: string[];
}

type AvatarKind = 'puppy' | 'bunny' | 'kitty' | 'mochi';

interface SpawnedAvatar {
  id: number;
  kind: AvatarKind;
  message: string;
  slotIndex: number;
  bubbleSide: 'left' | 'right';
}

const DEFAULT_MESSAGES = [
  'I love you ♡',
  'I miss you, lovee',
  'Always yours',
  'Thinking of you',
  'Gihigugma tika ♡',
  'Stay with me',
  "You're my home",
  'Hugs for you!',
  'Daisuki ♡',
  "You're my moon",
  'Hehe, love you!',
  'Forever & always',
];

const AVATAR_KINDS: AvatarKind[] = ['puppy', 'bunny', 'kitty', 'mochi'];

/** Safe edge/corner positions around the letter so body text stays unobstructed */
const SPAWN_SLOTS: Array<{ top: string; left?: string; right?: string; bubbleSide: 'left' | 'right' }> = [
  { top: '14%', left: '3%', bubbleSide: 'right' },
  { top: '24%', right: '3%', bubbleSide: 'left' },
  { top: '52%', left: '2.5%', bubbleSide: 'right' },
  { top: '62%', right: '2.5%', bubbleSide: 'left' },
  { top: '78%', left: '4%', bubbleSide: 'right' },
  { top: '80%', right: '4%', bubbleSide: 'left' },
];

function AvatarSvg({ kind }: { kind: AvatarKind }) {
  switch (kind) {
    case 'puppy':
      return (
        <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
          {/* Floppy ears */}
          <ellipse cx="11" cy="23" rx="5.5" ry="9" transform="rotate(14 11 23)" fill="#d8b494" />
          <ellipse cx="37" cy="23" rx="5.5" ry="9" transform="rotate(-14 37 23)" fill="#d8b494" />
          {/* Head */}
          <circle cx="24" cy="25" r="14" fill="#f7ebd9" stroke="#2e3a59" strokeWidth="1.4" />
          {/* Blush */}
          <ellipse cx="15.5" cy="27.5" rx="2.6" ry="1.5" fill="#f8d7e0" />
          <ellipse cx="32.5" cy="27.5" rx="2.6" ry="1.5" fill="#f8d7e0" />
          {/* Eyes */}
          <circle cx="19" cy="23.5" r="1.7" fill="#2e3a59" />
          <circle cx="29" cy="23.5" r="1.7" fill="#2e3a59" />
          {/* Nose & smile */}
          <ellipse cx="24" cy="26.5" rx="2.1" ry="1.5" fill="#2e3a59" />
          <path d="M21.5 29.2 Q24 31.5 26.5 29.2" fill="none" stroke="#2e3a59" strokeWidth="1.3" strokeLinecap="round" />
          {/* Tiny sakura on ear */}
          <circle cx="33" cy="14" r="2.6" fill="#f8d7e0" stroke="#b5485f" strokeWidth="0.7" />
        </svg>
      );
    case 'bunny':
      return (
        <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
          {/* Long ears */}
          <ellipse cx="18" cy="12" rx="4" ry="10" transform="rotate(-6 18 12)" fill="#fffdf8" stroke="#2e3a59" strokeWidth="1.4" />
          <ellipse cx="30" cy="12" rx="4" ry="10" transform="rotate(6 30 12)" fill="#fffdf8" stroke="#2e3a59" strokeWidth="1.4" />
          <ellipse cx="18" cy="12.5" rx="2" ry="6" transform="rotate(-6 18 12.5)" fill="#f8d7e0" />
          <ellipse cx="30" cy="12.5" rx="2" ry="6" transform="rotate(6 30 12.5)" fill="#f8d7e0" />
          {/* Head */}
          <circle cx="24" cy="28" r="13" fill="#fffdf8" stroke="#2e3a59" strokeWidth="1.4" />
          <ellipse cx="16" cy="30" rx="2.5" ry="1.4" fill="#f8d7e0" />
          <ellipse cx="32" cy="30" rx="2.5" ry="1.4" fill="#f8d7e0" />
          <circle cx="19.5" cy="26.5" r="1.6" fill="#2e3a59" />
          <circle cx="28.5" cy="26.5" r="1.6" fill="#2e3a59" />
          <path d="M22 30 Q24 32 26 30" fill="none" stroke="#b5485f" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'kitty':
      return (
        <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
          {/* Cat ears */}
          <path d="M12 21 L14 10 L21 17 Z" fill="#fdfaf4" stroke="#2e3a59" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M36 21 L34 10 L27 17 Z" fill="#fdfaf4" stroke="#2e3a59" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M14.2 18.5 L15.2 12.5 L19 16.5 Z" fill="#f8d7e0" />
          <path d="M33.8 18.5 L32.8 12.5 L29 16.5 Z" fill="#f8d7e0" />
          {/* Head */}
          <circle cx="24" cy="27" r="13" fill="#fdfaf4" stroke="#2e3a59" strokeWidth="1.4" />
          <ellipse cx="16" cy="29.5" rx="2.4" ry="1.4" fill="#f8d7e0" />
          <ellipse cx="32" cy="29.5" rx="2.4" ry="1.4" fill="#f8d7e0" />
          <circle cx="19.5" cy="26" r="1.6" fill="#2e3a59" />
          <circle cx="28.5" cy="26" r="1.6" fill="#2e3a59" />
          <path d="M22.5 29 L24 30.2 L25.5 29" fill="none" stroke="#2e3a59" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'mochi':
      return (
        <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
          {/* Sakura leaf beret */}
          <ellipse cx="27" cy="14" rx="5.5" ry="3" transform="rotate(-18 27 14)" fill="#b5485f" opacity="0.78" />
          {/* Round mochi body */}
          <ellipse cx="24" cy="28" rx="14.5" ry="12" fill="#fbeaf0" stroke="#2e3a59" strokeWidth="1.4" />
          <ellipse cx="16.5" cy="29.5" rx="2.4" ry="1.4" fill="#f5b8c9" />
          <ellipse cx="31.5" cy="29.5" rx="2.4" ry="1.4" fill="#f5b8c9" />
          <circle cx="19.5" cy="26.5" r="1.6" fill="#2e3a59" />
          <circle cx="28.5" cy="26.5" r="1.6" fill="#2e3a59" />
          <path d="M22 29.5 Q24 31.6 26 29.5" fill="none" stroke="#2e3a59" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
}

/**
 * Periodically spawns cute little hand-drawn-style avatars around the edges
 * of the screen with affectionate mini speech bubbles.
 */
export const CuteAvatars: React.FC<CuteAvatarsProps> = ({
  messages = DEFAULT_MESSAGES,
}) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [avatars, setAvatars] = useState<SpawnedAvatar[]>(() => [
    {
      id: 1,
      kind: 'puppy',
      message: messages[0] ?? 'I love you ♡',
      slotIndex: 0,
      bubbleSide: SPAWN_SLOTS[0].bubbleSide,
    },
    ...(prefersReducedMotion
      ? [
          {
            id: 2,
            kind: 'bunny' as AvatarKind,
            message: messages[1] ?? 'I miss you, lovee',
            slotIndex: 5,
            bubbleSide: SPAWN_SLOTS[5].bubbleSide,
          },
        ]
      : []),
  ]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let nextId = 2;
    const spawnOne = () => {
      setAvatars((prev) => {
        const occupiedSlots = new Set(prev.map((a) => a.slotIndex));
        const availableSlots = SPAWN_SLOTS.map((_, idx) => idx).filter(
          (idx) => !occupiedSlots.has(idx),
        );
        const slotIndex =
          availableSlots.length > 0
            ? availableSlots[Math.floor(Math.random() * availableSlots.length)]
            : Math.floor(Math.random() * SPAWN_SLOTS.length);

        const kind = AVATAR_KINDS[Math.floor(Math.random() * AVATAR_KINDS.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const id = nextId++;

        const nextItem: SpawnedAvatar = {
          id,
          kind,
          message,
          slotIndex,
          bubbleSide: SPAWN_SLOTS[slotIndex].bubbleSide,
        };

        // Keep at most 2 cute avatars visible at once so the screen stays calm
        return [...prev.slice(-1), nextItem];
      });
    };

    const intervalId = window.setInterval(spawnOne, 4200);
    return () => window.clearInterval(intervalId);
  }, [messages, prefersReducedMotion]);

  return (
    <div className={styles.layer} aria-hidden="true">
      {avatars.map((avatar) => {
        const slot = SPAWN_SLOTS[avatar.slotIndex];
        return (
          <div
            key={avatar.id}
            className={`${styles.avatarWrap} ${
              avatar.bubbleSide === 'left' ? styles.bubbleLeft : styles.bubbleRight
            }`}
            style={{
              top: slot.top,
              left: slot.left,
              right: slot.right,
            }}
          >
            <div className={styles.character}>
              <AvatarSvg kind={avatar.kind} />
            </div>
            <div className={styles.bubble}>{avatar.message}</div>
          </div>
        );
      })}
    </div>
  );
};
