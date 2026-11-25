/**
 * Theme color overrides for the letter experience.
 * All fields are optional at the config level; when provided, they override
 * the default CSS custom properties at runtime.
 */
export interface LetterTheme {
  /** Deep accent used for the hanko seal, subtle highlights, and borders (default: #b5485f) */
  primary: string;
  /** Muted ink tone used for headings, subtitles, and secondary accents (default: #2e3a59) */
  accent: string;
  /** Washi paper base background color (default: #faf6ef) */
  background: string;
}

/**
 * Typed configuration for the entire romantic letter.
 * Edit this file to personalize the recipient, message, and optional features.
 */
export interface LetterConfig {
  /** Name of the person receiving the letter */
  recipientName: string;
  /** Name of the person sending the letter */
  senderName: string;
  /** Opening salutation rendered in a brush-style Japanese/serif font */
  greeting: string;
  /** Body paragraphs revealed line by line; supports English, Japanese, or bilingual lines */
  paragraphs: string[];
  /** Closing sentiment before the signature */
  closing: string;
  /** Final sign-off name or phrase */
  signature: string;
  /** Optional palette overrides */
  theme?: LetterTheme;
  /** Faint Japanese subtitle shown on the opening screen beneath the prompt */
  japaneseSubtitle?: string;
  /** Optional date line displayed at the top of the letter */
  date?: string;
  /** Optional postscript (P.S.) revealed after the signature */
  postscript?: string;
  /** Optional URL to an ambient audio track (off by default; plays only on user interaction) */
  musicUrl?: string;
  /** Toggle decorative vertical Japanese writing in the right margin (default: true) */
  verticalMargin?: boolean;
  /** Custom decorative text for the vertical margin (defaults to seasonal spring phrase) */
  marginText?: string;
}

export const letterConfig: LetterConfig = {
  recipientName: 'lovee',
  senderName: 'Jong-jong',
  japaneseSubtitle: 'あなたへの手紙',
  greeting: 'Dear lovee,',
  paragraphs: [
    "Hi lovee. I know in the past days ga sige nakog pabuyag nimo ug sorry kung nkabasa kas akong chat ni Kian na makig laag ko nila unya fiesta. I swear na dili ko magpabuyag ana na time and keep updating you, and also all of those promises I made, I'll make sure na mahitabo to tanan in the near future, hehe.",
    "I hope na madawat gihapon ko nimo sag unsa ko ka buluyugan. I know I'm not talented or smart or rich, but I'll do my best to give you a better life in the future. Kanang kada mata nimo naa nay food na ready, dili ka mabalaka ug nakai lakaw kai naa kai taga hatid sundo ug naa kai alalay sa imong problems. I'll make sure that you will see a new view or perspective sa world, dili lang sa unsay atong nakita ron. Let's explore something new, discover new things, and many more, hayss. I'll be the happiest man alive if ikaw jud ako ma asawa.",
    "Love, I know I'm not as great as your first love or as smart as your greatest love, but I'll do things my own way. I'm not gonna try to match them. I'll surpass them, love. I hope that I can still be at your side even if layu ko usahay or buluyagon ko usahay lovee, but trust me when I say you're the only girl that made this heart beat again, you're the only girl that let my eyes see a clear view of my surroundings, and you're the only girl that freed this boy from the chains of life.",
  ],
  closing: 'Yours,',
  signature: 'Imong doggy Jong-jong',
  verticalMargin: true,
  marginText: '春風駘蕩',
  // musicUrl: '/audio/spring-afternoon.mp3',
  theme: {
    primary: '#b5485f',
    accent: '#2e3a59',
    background: '#faf6ef',
  },
};

/**
 * Validates the letter configuration at runtime so missing or malformed fields
 * emit clear console warnings and fall back gracefully instead of crashing.
 */
export function validateLetterConfig(raw: Partial<LetterConfig>): LetterConfig {
  const warn = (field: string, reason: string) => {
    console.warn(`[sakura-letter] Config warning for "${field}": ${reason}`);
  };

  const recipientName =
    typeof raw.recipientName === 'string' && raw.recipientName.trim()
      ? raw.recipientName
      : (warn('recipientName', 'missing or empty; using fallback "Friend".'), 'Friend');

  const senderName =
    typeof raw.senderName === 'string' && raw.senderName.trim()
      ? raw.senderName
      : (warn('senderName', 'missing or empty; using fallback "Someone".'), 'Someone');

  const greeting =
    typeof raw.greeting === 'string' && raw.greeting.trim()
      ? raw.greeting
      : (warn('greeting', 'missing or empty; using fallback.'), `Dear ${recipientName},`);

  const paragraphs =
    Array.isArray(raw.paragraphs) &&
      raw.paragraphs.length > 0 &&
      raw.paragraphs.every((p) => typeof p === 'string' && p.trim().length > 0)
      ? raw.paragraphs
      : (warn('paragraphs', 'must be a non-empty string[]; using fallback message.'),
        ['Thinking of you this spring afternoon.']);

  const closing =
    typeof raw.closing === 'string' && raw.closing.trim()
      ? raw.closing
      : (warn('closing', 'missing or empty; using fallback.'), 'Warmly,');

  const signature =
    typeof raw.signature === 'string' && raw.signature.trim()
      ? raw.signature
      : (warn('signature', 'missing or empty; using senderName.'), senderName);

  return {
    ...raw,
    recipientName,
    senderName,
    greeting,
    paragraphs,
    closing,
    signature,
    verticalMargin: raw.verticalMargin ?? true,
  };
}
