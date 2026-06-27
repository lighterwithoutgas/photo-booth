import { applyFilterToImageData } from "@/lib/filters";
import { calculateCoverCrop } from "@/lib/imageCrop";
import type { FrameId, PhotoItem, StripOptions } from "@/types/photo";

export const STRIP_WIDTH = 1200;
export const STRIP_HEIGHT = 3900;
const PHOTO_X = 105;
const PHOTO_WIDTH = 990;
const PHOTO_HEIGHT = 720;
const PHOTO_GAP = 62;
const PHOTO_TOP = 120;

const framePalette: Record<FrameId, { background: string; ink: string; accent: string }> = {
  cream: { background: "#e9dfc4", ink: "#232a2e", accent: "#a44d3d" },
  charcoal: { background: "#24282a", ink: "#f4efe3", accent: "#c6a66a" },
  red: { background: "#9c4035", ink: "#fff7e8", accent: "#2c2928" },
  pink: { background: "#e7b8b0", ink: "#332c2a", accent: "#fff5e8" },
  doodle: { background: "#f2ead8", ink: "#20282d", accent: "#6f7f67" },
  white: { background: "#fffdf7", ink: "#22292e", accent: "#d7d1c5" },
  couple: { background: "#f6d9d8", ink: "#7e3f4a", accent: "#c76b78" },
  friends: { background: "#dcebdc", ink: "#315d61", accent: "#df8f68" },
  birthday: { background: "#fff0bf", ink: "#543a69", accent: "#e76f79" },
};

export function stripDimensions(scale = 1): { width: number; height: number } {
  return { width: STRIP_WIDTH * scale, height: STRIP_HEIGHT * scale };
}

export async function loadImage(source: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  await image.decode();
  return image;
}

function roughLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  wobble = 3,
): void {
  context.beginPath();
  context.moveTo(x1, y1);
  context.quadraticCurveTo(
    (x1 + x2) / 2 + Math.sin(y1 * 0.03) * wobble,
    (y1 + y2) / 2 + Math.cos(x2 * 0.03) * wobble,
    x2,
    y2,
  );
  context.stroke();
}

function drawDoodles(context: CanvasRenderingContext2D, color: string): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 8;
  context.lineCap = "round";
  const stars = [
    [50, 58],
    [1140, 76],
    [64, 3650],
    [1132, 3580],
  ];
  stars.forEach(([x, y], index) => {
    const size = index % 2 ? 22 : 30;
    context.beginPath();
    context.moveTo(x - size, y);
    context.lineTo(x + size, y);
    context.moveTo(x, y - size);
    context.lineTo(x, y + size);
    context.stroke();
  });
  context.restore();
}

function drawHeart(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, size * 0.28);
  context.bezierCurveTo(-size * 0.72, -size * 0.16, -size * 0.48, -size * 0.82, 0, -size * 0.42);
  context.bezierCurveTo(size * 0.48, -size * 0.82, size * 0.72, -size * 0.16, 0, size * 0.28);
  context.fill();
  context.restore();
}

function traceHeart(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  context.beginPath();
  context.moveTo(x + width / 2, y + height);
  context.bezierCurveTo(x + width * 0.42, y + height * 0.78, x, y + height * 0.55, x, y + height * 0.27);
  context.bezierCurveTo(x, y - height * 0.02, x + width * 0.34, y - height * 0.08, x + width / 2, y + height * 0.2);
  context.bezierCurveTo(x + width * 0.66, y - height * 0.08, x + width, y - height * 0.02, x + width, y + height * 0.27);
  context.bezierCurveTo(x + width, y + height * 0.55, x + width * 0.58, y + height * 0.78, x + width / 2, y + height);
  context.closePath();
}

function drawEnvelope(context: CanvasRenderingContext2D, x: number, y: number, width: number, color: string): void {
  const height = width * 0.68;
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 7;
  context.lineJoin = "round";
  context.strokeRect(x, y, width, height);
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + width / 2, y + height * 0.58);
  context.lineTo(x + width, y);
  context.moveTo(x, y + height);
  context.lineTo(x + width * 0.36, y + height * 0.48);
  context.moveTo(x + width, y + height);
  context.lineTo(x + width * 0.64, y + height * 0.48);
  context.stroke();
  context.restore();
}

function drawBow(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 7;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.ellipse(x, y, size * 0.46, size * 0.25, -0.25, 0, Math.PI * 2);
  context.ellipse(x + size, y, size * 0.46, size * 0.25, 0.25, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(x + size / 2, y, size * 0.18, 0, Math.PI * 2);
  context.moveTo(x + size * 0.42, y + size * 0.15);
  context.quadraticCurveTo(x + size * 0.15, y + size * 0.72, x + size * 0.03, y + size * 0.52);
  context.moveTo(x + size * 0.58, y + size * 0.15);
  context.quadraticCurveTo(x + size * 0.85, y + size * 0.72, x + size * 0.97, y + size * 0.52);
  context.stroke();
  context.restore();
}

function drawBalloon(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 7;
  context.beginPath();
  context.ellipse(x, y, size * 0.62, size, 0, 0, Math.PI * 2);
  context.moveTo(x, y + size);
  context.lineTo(x - 8, y + size + 16);
  context.lineTo(x + 8, y + size + 16);
  context.closePath();
  context.moveTo(x, y + size + 16);
  context.bezierCurveTo(x + 25, y + size + 45, x - 20, y + size + 70, x + 4, y + size + 98);
  context.stroke();
  context.restore();
}

function drawSpark(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 8;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x - size, y);
  context.lineTo(x + size, y);
  context.moveTo(x, y - size);
  context.lineTo(x, y + size);
  context.moveTo(x - size * 0.6, y - size * 0.6);
  context.lineTo(x + size * 0.6, y + size * 0.6);
  context.moveTo(x + size * 0.6, y - size * 0.6);
  context.lineTo(x - size * 0.6, y + size * 0.6);
  context.stroke();
  context.restore();
}

function drawPaperDesign(context: CanvasRenderingContext2D, frame: FrameId, accent: string, ink: string): void {
  if (frame === "doodle") {
    drawDoodles(context, accent);
    return;
  }

  if (frame === "couple") {
    const gapYs = [860, 1642, 2424];
    drawHeart(context, 52, 58, 28, accent);
    drawHeart(context, 92, 88, 15, ink);
    drawEnvelope(context, 1080, 35, 72, ink);
    [470, 1252, 2034, 2816].forEach((y, index) => {
      drawHeart(context, index % 2 ? 1138 : 58, y, 18, index % 2 ? ink : accent);
      drawSpark(context, index % 2 ? 56 : 1142, y + 85, 15, index % 2 ? accent : ink);
    });
    gapYs.forEach((y, index) => {
      drawBow(context, 548, y, 104, index % 2 ? ink : accent);
      drawHeart(context, 410, y + 4, 15, ink);
      drawHeart(context, 790, y + 4, 15, accent);
    });
    drawEnvelope(context, 48, 3262, 78, ink);
    drawHeart(context, 1128, 3298, 28, accent);
    drawSpark(context, 1080, 3330, 18, ink);
    return;
  }

  if (frame === "friends") {
    [70, 520, 980, 1430, 1880, 2330, 2780, 3260].forEach((y, index) => {
      drawSpark(context, index % 2 ? 1140 : 60, y, index % 3 === 0 ? 25 : 16, index % 2 ? ink : accent);
      drawHeart(context, index % 2 ? 54 : 1144, y + 105, 12, index % 2 ? accent : ink);
    });
    [860, 1642, 2424].forEach((y, index) => drawBow(context, 560, y, 80, index % 2 ? accent : ink));
    return;
  }

  if (frame === "birthday") {
    const confetti = Array.from({ length: 24 }, (_, index) => {
      const left = index % 2 === 0;
      return [left ? 45 + (index % 3) * 24 : 1155 - (index % 3) * 24, 55 + index * 138, (index % 5 - 2) * 0.35, index % 3 ? ink : accent] as const;
    });
    context.save();
    context.lineWidth = 11;
    context.lineCap = "round";
    confetti.forEach(([x, y, angle, color]) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.strokeStyle = color;
      context.beginPath();
      context.moveTo(-14, 0);
      context.lineTo(14, 0);
      context.stroke();
      context.restore();
    });
    context.restore();
    drawBalloon(context, 570, 3290, 42, accent);
    drawBalloon(context, 650, 3310, 36, ink);
  }
}

export async function renderStripCanvas(
  photos: PhotoItem[],
  options: StripOptions,
  format: "image/png" | "image/jpeg" = "image/png",
): Promise<HTMLCanvasElement> {
  if (photos.length !== 4) throw new Error("Exactly four photos are required.");
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = STRIP_HEIGHT;
  const context = canvas.getContext("2d", { alpha: format === "image/png" });
  if (!context) throw new Error("Canvas is not supported by this browser.");

  const palette = framePalette[options.frame];
  context.fillStyle = palette.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const images = await Promise.all(photos.map((photo) => loadImage(photo.url)));
  images.forEach((image, index) => {
    const y = PHOTO_TOP + index * (PHOTO_HEIGHT + PHOTO_GAP);
    const crop = calculateCoverCrop(image.naturalWidth, image.naturalHeight, PHOTO_WIDTH, PHOTO_HEIGHT);
    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = PHOTO_WIDTH;
    photoCanvas.height = PHOTO_HEIGHT;
    const photoContext = photoCanvas.getContext("2d", { willReadFrequently: options.filter !== "original" });
    if (!photoContext) throw new Error("Canvas is not supported by this browser.");
    photoContext.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    if (options.filter !== "original") {
      const pixels = photoContext.getImageData(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      photoContext.putImageData(applyFilterToImageData(pixels, options.filter), 0, 0);
    }
    if (options.frame === "couple") {
      const heartX = 150;
      const heartY = y + 18;
      const heartWidth = 900;
      const heartHeight = 660;
      context.save();
      traceHeart(context, heartX, heartY, heartWidth, heartHeight);
      context.clip();
      context.drawImage(photoCanvas, heartX, heartY, heartWidth, heartHeight);
      context.restore();

      if (options.border !== "none") {
        context.save();
        context.strokeStyle = options.border === "soft" ? `${palette.ink}88` : palette.ink;
        context.lineWidth = options.border === "soft" ? 7 : 12;
        context.lineJoin = "round";
        traceHeart(context, heartX, heartY, heartWidth, heartHeight);
        context.stroke();
        context.strokeStyle = palette.accent;
        context.lineWidth = 5;
        traceHeart(context, heartX + 10, heartY + 9, heartWidth - 20, heartHeight - 18);
        context.stroke();
        context.restore();
      }
    } else {
      context.drawImage(photoCanvas, PHOTO_X, y);
    }

    context.save();
    context.strokeStyle = options.border === "soft" ? `${palette.ink}66` : palette.ink;
    context.lineWidth = options.border === "soft" || options.frame === "white" ? 5 : 10;
    context.lineJoin = "round";
    if (options.border !== "none" && options.frame !== "couple") {
      roughLine(context, PHOTO_X - 5, y - 5, PHOTO_X + PHOTO_WIDTH + 4, y - 2, 4);
      roughLine(context, PHOTO_X + PHOTO_WIDTH + 4, y - 2, PHOTO_X + PHOTO_WIDTH + 6, y + PHOTO_HEIGHT + 5, 4);
      roughLine(context, PHOTO_X + PHOTO_WIDTH + 6, y + PHOTO_HEIGHT + 5, PHOTO_X - 5, y + PHOTO_HEIGHT + 3, 4);
      roughLine(context, PHOTO_X - 5, y + PHOTO_HEIGHT + 3, PHOTO_X - 5, y - 5, 4);
    }
    context.restore();
  });

  drawPaperDesign(context, options.frame, palette.accent, palette.ink);

  const footerY = 3435;
  context.save();
  context.fillStyle = palette.ink;
  context.textAlign = "center";
  context.font = "700 56px 'Trebuchet MS', sans-serif";
  context.fillText(options.footerText || "tiny moments, kept", STRIP_WIDTH / 2, footerY);
  context.font = "34px 'Trebuchet MS', sans-serif";
  const date = options.showDate
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date())
    : "";
  context.fillText(date, STRIP_WIDTH / 2, footerY + 68);
  context.strokeStyle = palette.accent;
  context.lineWidth = 8;
  roughLine(context, 390, footerY + 115, 810, footerY + 115, 5);
  context.restore();

  return canvas;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" = "image/png",
  quality = 0.93,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export the photo strip."))), type, quality);
  });
}

export async function renderIndividualPhoto(photo: PhotoItem, filterId: StripOptions["filter"]): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported by this browser.");
  const image = await loadImage(photo.url);
  const crop = calculateCoverCrop(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height);
  context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
  if (filterId !== "original") {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    context.putImageData(applyFilterToImageData(pixels, filterId), 0, 0);
  }
  return canvasToBlob(canvas);
}
