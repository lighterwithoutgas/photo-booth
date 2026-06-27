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

const COUPLE_TEMPLATE = {
  source: { x: 203, y: 47, width: 452, height: 1652 },
  outputHeight: Math.round((1652 / 452) * STRIP_WIDTH),
  slots: [
    { left: 93, top: 133, right: 365, bottom: 410 },
    { left: 90, top: 525, right: 359, bottom: 799 },
    { left: 92, top: 875, right: 360, bottom: 1146 },
    { left: 91, top: 1242, right: 360, bottom: 1514 },
  ],
} as const;

const framePalette: Record<FrameId, { background: string; ink: string; accent: string }> = {
  cream: { background: "#e9dfc4", ink: "#232a2e", accent: "#a44d3d" },
  charcoal: { background: "#24282a", ink: "#f4efe3", accent: "#c6a66a" },
  red: { background: "#9c4035", ink: "#fff7e8", accent: "#2c2928" },
  pink: { background: "#e7b8b0", ink: "#332c2a", accent: "#fff5e8" },
  doodle: { background: "#f2ead8", ink: "#20282d", accent: "#6f7f67" },
  white: { background: "#fffdf7", ink: "#22292e", accent: "#d7d1c5" },
  couple: { background: "#e8c9c2", ink: "#74454c", accent: "#a95460" },
  friends: { background: "#d5ddcb", ink: "#3f5b58", accent: "#b7755c" },
  birthday: { background: "#ead8a9", ink: "#594968", accent: "#b95e66" },
};

export function stripDimensions(scale = 1): { width: number; height: number } {
  return { width: STRIP_WIDTH * scale, height: STRIP_HEIGHT * scale };
}

export function coupleStripDimensions(scale = 1): { width: number; height: number } {
  return { width: STRIP_WIDTH * scale, height: COUPLE_TEMPLATE.outputHeight * scale };
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

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawVintagePaper(context: CanvasRenderingContext2D, frame: FrameId, ink: string): void {
  if (!(["couple", "friends", "birthday", "doodle"] as FrameId[]).includes(frame)) return;

  context.save();
  const wash = context.createLinearGradient(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  wash.addColorStop(0, "rgba(255,248,225,.12)");
  wash.addColorStop(0.48, "rgba(113,65,48,.025)");
  wash.addColorStop(1, "rgba(255,248,225,.08)");
  context.fillStyle = wash;
  context.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  context.globalAlpha = 0.045;
  context.fillStyle = ink;
  context.fillRect(0, 0, 12, STRIP_HEIGHT);
  context.fillRect(STRIP_WIDTH - 9, 0, 9, STRIP_HEIGHT);
  context.fillRect(0, 0, STRIP_WIDTH, 8);
  context.fillRect(0, STRIP_HEIGHT - 7, STRIP_WIDTH, 7);

  for (let index = 0; index < 280; index += 1) {
    const x = seededUnit(index + 11) * STRIP_WIDTH;
    const y = seededUnit(index + 701) * STRIP_HEIGHT;
    const radius = 0.8 + seededUnit(index + 1401) * 2.8;
    context.globalAlpha = 0.035 + seededUnit(index + 2101) * 0.045;
    context.fillStyle = index % 4 === 0 ? "#fff8e9" : ink;
    context.beginPath();
    context.ellipse(x, y, radius * 1.6, radius, seededUnit(index + 3101) * Math.PI, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 0.075;
  context.strokeStyle = ink;
  context.lineWidth = 2;
  for (let index = 0; index < 18; index += 1) {
    const y = 80 + seededUnit(index + 4001) * (STRIP_HEIGHT - 160);
    const x = seededUnit(index + 5001) * STRIP_WIDTH;
    roughLine(context, x, y, x + 8 + seededUnit(index + 6001) * 24, y + seededUnit(index + 7001) * 5, 2);
  }
  context.restore();
}

function applyHandRotation(context: CanvasRenderingContext2D, x: number, y: number, seed: number): void {
  context.translate(x, y);
  context.rotate((seededUnit(seed) - 0.5) * 0.075);
  context.translate(-x, -y);
}

function handStroke(
  context: CanvasRenderingContext2D,
  drawPath: () => void,
  color: string,
  width: number,
  seed: number,
  jitter = 3,
): void {
  [0, 1].forEach((pass) => {
    context.save();
    context.translate(
      (seededUnit(seed + pass * 17) - 0.5) * jitter,
      (seededUnit(seed + pass * 31) - 0.5) * jitter,
    );
    context.globalAlpha = pass === 0 ? 0.88 : 0.36;
    context.strokeStyle = color;
    context.lineWidth = pass === 0 ? width : Math.max(2, width * 0.62);
    context.lineCap = "round";
    context.lineJoin = "round";
    drawPath();
    context.stroke();
    context.restore();
  });
}

function coupleSlot(index: number): { x: number; y: number; width: number; height: number } {
  const source = COUPLE_TEMPLATE.slots[index];
  const scale = STRIP_WIDTH / COUPLE_TEMPLATE.source.width;
  return {
    x: source.left * scale,
    y: source.top * scale,
    width: (source.right - source.left) * scale,
    height: (source.bottom - source.top) * scale,
  };
}

function traceCoupleSlot(context: CanvasRenderingContext2D, index: number): void {
  const slot = coupleSlot(index);
  const wobble = 3.5;
  context.beginPath();
  context.moveTo(slot.x + wobble, slot.y + 1);
  context.lineTo(slot.x + slot.width - wobble, slot.y);
  context.lineTo(slot.x + slot.width, slot.y + slot.height - wobble);
  context.lineTo(slot.x + wobble, slot.y + slot.height);
  context.closePath();
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
  applyHandRotation(context, 0, 0, x + y);
  context.fillStyle = color;
  context.globalAlpha = 0.72;
  const path = () => {
    context.beginPath();
    context.moveTo(0, size * 0.28);
    context.bezierCurveTo(-size * 0.72, -size * 0.16, -size * 0.48, -size * 0.82, 0, -size * 0.42);
    context.bezierCurveTo(size * 0.48, -size * 0.82, size * 0.72, -size * 0.16, 0, size * 0.28);
    context.closePath();
  };
  path();
  context.fill();
  handStroke(context, path, color, Math.max(2, size * 0.1), x * 3 + y, 1.5);
  context.restore();
}

function drawBow(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  applyHandRotation(context, x + size / 2, y, x + y + size);
  handStroke(context, () => {
    context.beginPath();
    context.ellipse(x, y, size * 0.46, size * 0.25, -0.25, 0, Math.PI * 2);
    context.ellipse(x + size, y, size * 0.46, size * 0.25, 0.25, 0, Math.PI * 2);
    context.moveTo(x + size * 0.68, y);
    context.arc(x + size / 2, y, size * 0.18, 0, Math.PI * 2);
    context.moveTo(x + size * 0.42, y + size * 0.15);
    context.quadraticCurveTo(x + size * 0.15, y + size * 0.72, x + size * 0.03, y + size * 0.52);
    context.moveTo(x + size * 0.58, y + size * 0.15);
    context.quadraticCurveTo(x + size * 0.85, y + size * 0.72, x + size * 0.97, y + size * 0.52);
  }, color, 7, x + y * 5, 4);
  context.restore();
}

function drawBalloon(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  applyHandRotation(context, x, y, x + y + size);
  handStroke(context, () => {
    context.beginPath();
    context.ellipse(x, y, size * 0.62, size, 0, 0, Math.PI * 2);
    context.moveTo(x, y + size);
    context.lineTo(x - 8, y + size + 16);
    context.lineTo(x + 8, y + size + 16);
    context.closePath();
    context.moveTo(x, y + size + 16);
    context.bezierCurveTo(x + 25, y + size + 45, x - 20, y + size + 70, x + 4, y + size + 98);
  }, color, 7, x * 2 + y, 3.5);
  context.restore();
}

function drawSpark(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.save();
  applyHandRotation(context, x, y, x + y + size);
  handStroke(context, () => {
    context.beginPath();
    context.moveTo(x - size, y);
    context.lineTo(x + size, y + 1);
    context.moveTo(x + 1, y - size);
    context.lineTo(x, y + size);
    context.moveTo(x - size * 0.6, y - size * 0.6);
    context.lineTo(x + size * 0.6, y + size * 0.6);
    context.moveTo(x + size * 0.6, y - size * 0.6);
    context.lineTo(x - size * 0.6, y + size * 0.6);
  }, color, 7, x * 11 + y, 3);
  context.restore();
}

function drawPaperDesign(context: CanvasRenderingContext2D, frame: FrameId, accent: string, ink: string): void {
  if (frame === "doodle") {
    drawDoodles(context, accent);
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
  const usesOriginalCoupleArtwork = options.frame === "couple";
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = usesOriginalCoupleArtwork ? COUPLE_TEMPLATE.outputHeight : STRIP_HEIGHT;
  const context = canvas.getContext("2d", { alpha: format === "image/png" });
  if (!context) throw new Error("Canvas is not supported by this browser.");

  const palette = framePalette[options.frame];
  if (usesOriginalCoupleArtwork) {
    const template = await loadImage("/papers/couple-handmade-original.png");
    const source = COUPLE_TEMPLATE.source;
    context.drawImage(template, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);
  } else {
    context.fillStyle = palette.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawVintagePaper(context, options.frame, palette.ink);
  }

  const images = await Promise.all(photos.map((photo) => loadImage(photo.url)));
  images.forEach((image, index) => {
    const slot = usesOriginalCoupleArtwork ? coupleSlot(index) : null;
    const targetWidth = slot ? Math.round(slot.width) : PHOTO_WIDTH;
    const targetHeight = slot ? Math.round(slot.height) : PHOTO_HEIGHT;
    const y = slot ? slot.y : PHOTO_TOP + index * (PHOTO_HEIGHT + PHOTO_GAP);
    const crop = calculateCoverCrop(image.naturalWidth, image.naturalHeight, targetWidth, targetHeight);
    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = targetWidth;
    photoCanvas.height = targetHeight;
    const photoContext = photoCanvas.getContext("2d", { willReadFrequently: options.filter !== "original" });
    if (!photoContext) throw new Error("Canvas is not supported by this browser.");
    photoContext.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, targetWidth, targetHeight);
    if (options.filter !== "original") {
      const pixels = photoContext.getImageData(0, 0, targetWidth, targetHeight);
      photoContext.putImageData(applyFilterToImageData(pixels, options.filter), 0, 0);
    }
    if (usesOriginalCoupleArtwork && slot) {
      context.save();
      traceCoupleSlot(context, index);
      context.clip();
      context.drawImage(photoCanvas, slot.x, slot.y, slot.width, slot.height);
      context.restore();
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

  if (usesOriginalCoupleArtwork) return canvas;

  drawPaperDesign(context, options.frame, palette.accent, palette.ink);

  const footerY = 3435;
  const handmadePaper = options.frame === "couple" || options.frame === "friends" || options.frame === "birthday" || options.frame === "doodle";
  context.save();
  context.fillStyle = palette.ink;
  context.textAlign = "center";
  context.globalAlpha = handmadePaper ? 0.88 : 1;
  context.font = handmadePaper ? "700 58px 'Segoe Print', cursive" : "700 56px 'Trebuchet MS', sans-serif";
  context.fillText(options.footerText || "tiny moments, kept", STRIP_WIDTH / 2, footerY);
  context.font = handmadePaper ? "italic 34px Georgia, serif" : "34px 'Trebuchet MS', sans-serif";
  const date = options.showDate
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date())
    : "";
  context.fillText(date, STRIP_WIDTH / 2, footerY + 68);
  if (handmadePaper) {
    handStroke(context, () => {
      context.beginPath();
      context.moveTo(390, footerY + 115);
      context.quadraticCurveTo(595, footerY + 124, 810, footerY + 112);
    }, palette.accent, 7, 909, 5);
  } else {
    context.strokeStyle = palette.accent;
    context.lineWidth = 8;
    roughLine(context, 390, footerY + 115, 810, footerY + 115, 5);
  }
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
