import { LetterConfig } from '../config/letter';

/** Detects whether a string contains Japanese characters */
function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/u.test(text);
}

/** Wraps mixed English/Japanese text to fit within maxWidth on a 2D canvas */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  // For Japanese-only lines without spaces, wrap character by character
  if (hasJapanese(text) && !text.includes(' ')) {
    const lines: string[] = [];
    let current = '';
    for (const char of text) {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Draws a 5-petal sakura blossom onto the canvas */
function drawSakuraBlossom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  primaryColor: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  for (let i = 0; i < 5; i += 1) {
    ctx.save();
    ctx.rotate((i * 72 * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(2.8, -6.5, 5, -10, 1.6, -12.5);
    ctx.lineTo(0, -10.8);
    ctx.lineTo(-1.6, -12.5);
    ctx.bezierCurveTo(-5, -10, -2.8, -6.5, 0, -2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(248, 215, 224, 0.9)';
    ctx.fill();
    ctx.strokeStyle = primaryColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = primaryColor;
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.restore();
}

/**
 * Renders the letter onto an offscreen high-DPI canvas styled like the washi
 * paper sheet and triggers a PNG download.
 */
export async function downloadLetterAsImage(config: LetterConfig): Promise<void> {
  if (typeof document === 'undefined') return;

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const primary = config.theme?.primary ?? '#b5485f';
  const accent = config.theme?.accent ?? '#2e3a59';
  const bgPaper = '#fdfaf4';
  const ink = '#252b3b';
  const inkMuted = '#4a536b';

  const width = 920;
  const paddingX = 96;
  const paddingTop = 92;
  const paddingBottom = 138;
  const contentWidth = width - paddingX * 2 - (config.verticalMargin !== false ? 36 : 0);

  // Measure pass using a scratch canvas to compute exact dynamic height
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  let cursorY = paddingTop;

  if (config.date) {
    cursorY += 38;
  }

  // Greeting
  cursorY += 58;

  // Paragraphs
  const wrappedParagraphs = config.paragraphs.map((p) => {
    const isJp = hasJapanese(p);
    mCtx.font = isJp
      ? '400 22px "Shippori Mincho", "Lora", serif'
      : '400 23px "Lora", "Shippori Mincho", Georgia, serif';
    const lines = wrapText(mCtx, p, contentWidth);
    return { lines, isJp };
  });

  wrappedParagraphs.forEach(({ lines, isJp }) => {
    const lineHeight = isJp ? 42 : 40;
    cursorY += lines.length * lineHeight + 24;
  });

  // Closing & signature
  cursorY += 28; // top margin
  cursorY += 34; // closing
  cursorY += 54; // signature

  let wrappedPostscript: string[] = [];
  if (config.postscript) {
    mCtx.font = 'italic 19px "Lora", "Shippori Mincho", Georgia, serif';
    wrappedPostscript = wrapText(mCtx, config.postscript, 520);
    cursorY += 24 + wrappedPostscript.length * 30;
  }

  const height = Math.max(760, cursorY + paddingBottom);

  // Render pass at 2x DPI for crisp typography
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  ctx.scale(scale, scale);

  // Washi paper base gradient
  const grad = ctx.createLinearGradient(0, 0, width * 0.25, height);
  grad.addColorStop(0, '#fffdf8');
  grad.addColorStop(0.58, bgPaper);
  grad.addColorStop(1, '#f7f0e3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle procedural washi fiber speckles
  ctx.save();
  for (let i = 0; i < 1600; i += 1) {
    const rx = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const ry = ((Math.sin(i * 78.233) * 19341.123) % 1 + 1) % 1;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(138, 114, 88, 0.035)' : 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(rx * width, ry * height, 1.5, 1.5);
  }
  ctx.restore();

  // Subtle horizontal fold creases
  [0.333, 0.666].forEach((ratio) => {
    const foldY = height * ratio;
    const foldGrad = ctx.createLinearGradient(0, foldY, width, foldY);
    foldGrad.addColorStop(0, 'transparent');
    foldGrad.addColorStop(0.2, 'rgba(181, 158, 126, 0.14)');
    foldGrad.addColorStop(0.8, 'rgba(181, 158, 126, 0.14)');
    foldGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = foldGrad;
    ctx.fillRect(0, foldY, width, 1);
  });

  // Gold-leaf inner frame
  ctx.strokeStyle = 'rgba(201, 169, 110, 0.42)';
  ctx.lineWidth = 1.25;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Optional vertical Japanese margin calligraphy
  if (config.verticalMargin !== false) {
    const marginChars = `${config.marginText || '春風駘蕩'}・${config.japaneseSubtitle || '桜花爛漫'}`;
    ctx.save();
    ctx.font = '400 16px "Shippori Mincho", serif';
    ctx.fillStyle = 'rgba(92, 100, 120, 0.58)';
    ctx.textAlign = 'center';
    let my = 66;
    for (const ch of marginChars) {
      ctx.fillText(ch, width - 48, my);
      my += 23;
    }
    ctx.restore();
  }

  // Corner sakura branch illustration (bottom-left)
  ctx.save();
  ctx.translate(22, height - 124);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.3;
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(8, 106);
  ctx.bezierCurveTo(38, 94, 66, 76, 94, 68);
  ctx.bezierCurveTo(114, 62, 134, 52, 152, 38);
  ctx.stroke();

  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(64, 79);
  ctx.bezierCurveTo(76, 62, 86, 48, 102, 36);
  ctx.stroke();

  ctx.globalAlpha = 1;
  drawSakuraBlossom(ctx, 102, 36, 0.85, primary);
  drawSakuraBlossom(ctx, 149, 38, 0.98, primary);
  drawSakuraBlossom(ctx, 132, 66, 0.72, primary);
  ctx.restore();

  // Render letter text
  let y = paddingTop;
  ctx.textBaseline = 'top';

  if (config.date) {
    ctx.font = '400 16px "Lora", "Shippori Mincho", serif';
    ctx.fillStyle = '#5c6478';
    ctx.fillText(config.date.toUpperCase(), paddingX, y);
    y += 38;
  }

  // Greeting
  ctx.font = '400 36px "Yuji Syuku", "Shippori Mincho", serif';
  ctx.fillStyle = accent;
  ctx.fillText(config.greeting, paddingX, y);
  y += 62;

  // Body paragraphs
  wrappedParagraphs.forEach(({ lines, isJp }) => {
    ctx.font = isJp
      ? '400 22px "Shippori Mincho", "Lora", serif'
      : '400 23px "Lora", "Shippori Mincho", Georgia, serif';
    ctx.fillStyle = isJp ? accent : ink;
    const lineHeight = isJp ? 42 : 40;

    lines.forEach((line) => {
      ctx.fillText(line, paddingX, y);
      y += lineHeight;
    });
    y += 24;
  });

  // Closing & signature (right-aligned)
  const rightEdge = width - paddingX - (config.verticalMargin !== false ? 20 : 0);
  y += 20;
  ctx.textAlign = 'right';
  ctx.font = 'italic 400 21px "Lora", "Shippori Mincho", Georgia, serif';
  ctx.fillStyle = inkMuted;
  ctx.fillText(config.closing, rightEdge, y);
  y += 36;

  // Signature + mini hanko stamp
  ctx.font = '400 32px "Yuji Syuku", "Shippori Mincho", serif';
  ctx.fillStyle = primary;
  ctx.fillText(config.signature, rightEdge - 38, y);

  ctx.save();
  ctx.translate(rightEdge - 14, y + 16);
  ctx.rotate((-4 * Math.PI) / 180);
  ctx.strokeStyle = primary;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-13, -13, 26, 26);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '400 15px "Shippori Mincho", serif';
  ctx.fillStyle = primary;
  ctx.fillText('桜', 0, 1);
  ctx.restore();

  y += 54;

  if (wrappedPostscript.length > 0) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.font = 'italic 400 19px "Lora", "Shippori Mincho", Georgia, serif';
    ctx.fillStyle = inkMuted;
    wrappedPostscript.forEach((line) => {
      ctx.fillText(line, rightEdge, y);
      y += 30;
    });
  }

  // Trigger download
  const safeName = config.recipientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = `sakura-letter${safeName ? `-${safeName}` : ''}.png`;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );

  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (blob) {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
