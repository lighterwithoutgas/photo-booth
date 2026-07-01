import { applyFilterToImageData } from "@/lib/filters";
import { calculateCoverCrop } from "@/lib/imageCrop";
import type { FrameId, PhotoItem, StripOptions } from "@/types/photo";

export const STRIP_WIDTH = 724;
export const STRIP_HEIGHT = 2172;
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
const SOLID_DESIGN_WIDTH = 1200;
const SOLID_DESIGN_HEIGHT = 3600;
const PHOTO_X = 105;
const PHOTO_WIDTH = 990;
const PHOTO_HEIGHT = 720;
const PHOTO_GAP = 62;
const PHOTO_TOP = 120;

interface PaperTemplate {
  image: string;
  source: { x: number; y: number; width: number; height: number };
  slots: { left: number; top: number; right: number; bottom: number }[];
  radius?: number;
  names?: {
    centerX: number;
    firstY: number;
    ampersandY: number;
    secondY: number;
    maxWidth: number;
    fontSize: number;
    color: string;
  };
}

const PAPER_TEMPLATES: Partial<Record<FrameId, PaperTemplate>> = {
  couple: {
    image: "/papers/couple-handmade-original.png",
    source: { x: 203, y: 47, width: 452, height: 1652 },
    slots: [
      { left: 93, top: 133, right: 365, bottom: 410 },
      { left: 90, top: 525, right: 359, bottom: 799 },
      { left: 92, top: 875, right: 360, bottom: 1146 },
      { left: 91, top: 1242, right: 360, bottom: 1514 },
    ],
  },
  moonlit: {
    image: "/papers/moonlit-dreams.png",
    source: { x: 0, y: 0, width: 724, height: 2172 },
    slots: [
      { left: 139, top: 267, right: 583, bottom: 648 },
      { left: 139, top: 697, right: 583, bottom: 1080 },
      { left: 139, top: 1126, right: 583, bottom: 1509 },
      { left: 139, top: 1557, right: 583, bottom: 1937 },
    ],
    radius: 34,
  },
  botanical: {
    image: "/papers/botanical-garden.png",
    source: { x: 0, y: 0, width: 724, height: 2172 },
    slots: [
      { left: 162, top: 147, right: 564, bottom: 546 },
      { left: 162, top: 578, right: 563, bottom: 975 },
      { left: 162, top: 1009, right: 564, bottom: 1408 },
      { left: 162, top: 1444, right: 564, bottom: 1844 },
    ],
    radius: 34,
  },
  cherry: {
    image: "/papers/cherry-doodles.png",
    source: { x: 0, y: 0, width: 724, height: 2172 },
    slots: [
      { left: 128, top: 165, right: 592, bottom: 560 },
      { left: 130, top: 609, right: 591, bottom: 989 },
      { left: 131, top: 1034, right: 590, bottom: 1411 },
      { left: 133, top: 1455, right: 587, bottom: 1973 },
    ],
    radius: 36,
  },
  loveletters: {
    image: "/papers/love-letters.png",
    source: { x: 0, y: 0, width: 724, height: 2172 },
    slots: [
      { left: 161, top: 159, right: 562, bottom: 568 },
      { left: 161, top: 653, right: 562, bottom: 1058 },
      { left: 161, top: 1147, right: 562, bottom: 1553 },
      { left: 161, top: 1641, right: 562, bottom: 2045 },
    ],
    radius: 35,
  },
  birthdaycheers: {
    image: "/papers/birthday-cheers.png",
    source: { x: 18, y: 5, width: 300, height: 900 },
    slots: [
      { left: 54, top: 147, right: 237, bottom: 265 },
      { left: 54, top: 288, right: 236, bottom: 404 },
      { left: 55, top: 426, right: 236, bottom: 542 },
      { left: 55, top: 567, right: 237, bottom: 689 },
    ],
  },
  birthdaywish: {
    image: "/papers/birthday-wish.png",
    source: { x: 45, y: 17, width: 305, height: 983 },
    slots: [
      { left: 59, top: 147, right: 237, bottom: 271 },
      { left: 59, top: 294, right: 236, bottom: 419 },
      { left: 59, top: 451, right: 236, bottom: 588 },
      { left: 59, top: 621, right: 237, bottom: 765 },
    ],
  },
  weddingivory: {
    image: "/papers/wedding-ivory.png",
    source: { x: 45, y: 5, width: 299, height: 900 },
    slots: [
      { left: 55, top: 147, right: 240, bottom: 266 },
      { left: 56, top: 288, right: 239, bottom: 404 },
      { left: 56, top: 424, right: 240, bottom: 542 },
      { left: 55, top: 565, right: 240, bottom: 686 },
    ],
  },
  weddingforest: {
    image: "/papers/wedding-forest-custom.png",
    source: { x: 60, y: 42, width: 624, height: 2052 },
    slots: [
      { left: 132, top: 326, right: 474, bottom: 589 },
      { left: 132, top: 635, right: 474, bottom: 904 },
      { left: 131, top: 956, right: 473, bottom: 1239 },
      { left: 130, top: 1292, right: 473, bottom: 1592 },
    ],
    radius: 1,
    names: {
      centerX: 312,
      firstY: 145,
      ampersandY: 205,
      secondY: 270,
      maxWidth: 310,
      fontSize: 74,
      color: "#d9ad43",
    },
  },
  graduation: {
    image: "/papers/graduate.png",
    source: { x: 0, y: 0, width: 724, height: 2172 },
    slots: [
      { left: 137, top: 214, right: 568, bottom: 572 },
      { left: 137, top: 622, right: 568, bottom: 978 },
      { left: 137, top: 1029, right: 568, bottom: 1386 },
      { left: 137, top: 1440, right: 568, bottom: 1799 },
    ],
    radius: 26,
  },
  tatreez: {
    image: "/papers/tatreez.png",
    source: { x: 0, y: 0, width: 725, height: 2170 },
    slots: [
      { left: 126, top: 276, right: 595, bottom: 663 },
      { left: 126, top: 756, right: 595, bottom: 1108 },
      { left: 126, top: 1205, right: 595, bottom: 1558 },
      { left: 126, top: 1653, right: 595, bottom: 2006 },
    ],
    radius: 35,
  },
  kuffiah: {
    image: "/papers/kuffiah.png",
    source: { x: 0, y: 0, width: 724, height: 2172 },
    slots: [
      { left: 94, top: 101, right: 629, bottom: 520 },
      { left: 94, top: 552, right: 629, bottom: 998 },
      { left: 94, top: 1030, right: 629, bottom: 1474 },
      { left: 94, top: 1506, right: 629, bottom: 1953 },
    ],
    radius: 27,
  },
};

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
  moonlit: { background: "#e8d4ef", ink: "#7041a0", accent: "#f4c56f" },
  botanical: { background: "#e9e4bd", ink: "#5f6334", accent: "#c66f45" },
  cherry: { background: "#fff1d7", ink: "#932a28", accent: "#ca4943" },
  loveletters: { background: "#f9d7dc", ink: "#b83f59", accent: "#e58fa0" },
  birthdaycheers: { background: "#f6ead7", ink: "#20201d", accent: "#ed719a" },
  birthdaywish: { background: "#d8c0eb", ink: "#201c25", accent: "#ed6f9e" },
  weddingivory: { background: "#f6efe2", ink: "#4d463d", accent: "#b58a39" },
  weddingforest: { background: "#123d2e", ink: "#f5e5b7", accent: "#d9ad43" },
  graduation: { background: "#f7ecd8", ink: "#20201d", accent: "#b48425" },
  tatreez: { background: "#ead6ad", ink: "#191d14", accent: "#a51f12" },
  kuffiah: { background: "#e7dfd0", ink: "#171717", accent: "#9d2018" },
};

export function stripDimensions(scale = 1): { width: number; height: number } {
  return { width: STRIP_WIDTH * scale, height: STRIP_HEIGHT * scale };
}

export function storyDimensions(): { width: number; height: number } {
  return { width: STORY_WIDTH, height: STORY_HEIGHT };
}

export function coupleStripDimensions(scale = 1): { width: number; height: number } {
  return paperStripDimensions("couple", scale);
}

export function paperStripDimensions(_frame: FrameId, scale = 1): { width: number; height: number } {
  return { width: STRIP_WIDTH * scale, height: STRIP_HEIGHT * scale };
}

export function stripCutPositions(frame: FrameId): [number, number, number] {
  const template = PAPER_TEMPLATES[frame];
  if (!template) return [22.6, 42.7, 62.8];
  return [0, 1, 2].map((index) => {
    const gapMiddle = (template.slots[index].bottom + template.slots[index + 1].top) / 2;
    return (gapMiddle / template.source.height) * 100;
  }) as [number, number, number];
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
  const wash = context.createLinearGradient(0, 0, SOLID_DESIGN_WIDTH, SOLID_DESIGN_HEIGHT);
  wash.addColorStop(0, "rgba(255,248,225,.12)");
  wash.addColorStop(0.48, "rgba(113,65,48,.025)");
  wash.addColorStop(1, "rgba(255,248,225,.08)");
  context.fillStyle = wash;
  context.fillRect(0, 0, SOLID_DESIGN_WIDTH, SOLID_DESIGN_HEIGHT);

  context.globalAlpha = 0.045;
  context.fillStyle = ink;
  context.fillRect(0, 0, 12, SOLID_DESIGN_HEIGHT);
  context.fillRect(SOLID_DESIGN_WIDTH - 9, 0, 9, SOLID_DESIGN_HEIGHT);
  context.fillRect(0, 0, SOLID_DESIGN_WIDTH, 8);
  context.fillRect(0, SOLID_DESIGN_HEIGHT - 7, SOLID_DESIGN_WIDTH, 7);

  for (let index = 0; index < 280; index += 1) {
    const x = seededUnit(index + 11) * SOLID_DESIGN_WIDTH;
    const y = seededUnit(index + 701) * SOLID_DESIGN_HEIGHT;
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
    const y = 80 + seededUnit(index + 4001) * (SOLID_DESIGN_HEIGHT - 160);
    const x = seededUnit(index + 5001) * SOLID_DESIGN_WIDTH;
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

function templateSlot(template: PaperTemplate, index: number): { x: number; y: number; width: number; height: number } {
  const source = template.slots[index];
  const scaleX = STRIP_WIDTH / template.source.width;
  const scaleY = STRIP_HEIGHT / template.source.height;
  return {
    x: source.left * scaleX,
    y: source.top * scaleY,
    width: (source.right - source.left) * scaleX,
    height: (source.bottom - source.top) * scaleY,
  };
}

function traceTemplateSlot(context: CanvasRenderingContext2D, template: PaperTemplate, index: number): void {
  const slot = templateSlot(template, index);
  context.beginPath();
  if (!template.radius) {
    const wobble = 3.5;
    context.moveTo(slot.x + wobble, slot.y + 1);
    context.lineTo(slot.x + slot.width - wobble, slot.y);
    context.lineTo(slot.x + slot.width, slot.y + slot.height - wobble);
    context.lineTo(slot.x + wobble, slot.y + slot.height);
    context.closePath();
    return;
  }

  const radius = template.radius * Math.min(STRIP_WIDTH / template.source.width, STRIP_HEIGHT / template.source.height);
  context.moveTo(slot.x + radius, slot.y);
  context.lineTo(slot.x + slot.width - radius, slot.y);
  context.quadraticCurveTo(slot.x + slot.width, slot.y, slot.x + slot.width, slot.y + radius);
  context.lineTo(slot.x + slot.width, slot.y + slot.height - radius);
  context.quadraticCurveTo(slot.x + slot.width, slot.y + slot.height, slot.x + slot.width - radius, slot.y + slot.height);
  context.lineTo(slot.x + radius, slot.y + slot.height);
  context.quadraticCurveTo(slot.x, slot.y + slot.height, slot.x, slot.y + slot.height - radius);
  context.lineTo(slot.x, slot.y + radius);
  context.quadraticCurveTo(slot.x, slot.y, slot.x + radius, slot.y);
  context.closePath();
}

export function photoSlotAspect(frame: FrameId, index: number): number {
  const template = PAPER_TEMPLATES[frame];
  if (!template) return PHOTO_WIDTH / PHOTO_HEIGHT;
  const slot = template.slots[index] ?? template.slots[0];
  return (slot.right - slot.left) / (slot.bottom - slot.top);
}

async function drawTemplateNames(
  context: CanvasRenderingContext2D,
  template: PaperTemplate,
  options: StripOptions,
): Promise<void> {
  if (!template.names) return;
  if (document.fonts) await document.fonts.load("100px 'Great Vibes'");

  const scaleX = STRIP_WIDTH / template.source.width;
  const scaleY = STRIP_HEIGHT / template.source.height;
  const fontScale = Math.min(scaleX, scaleY);
  const names = template.names;
  const firstName = options.weddingNameOne.trim();
  const secondName = options.weddingNameTwo.trim();
  const centerX = names.centerX * scaleX;
  const maxWidth = names.maxWidth * scaleX;
  const baseFontSize = names.fontSize * fontScale;

  const drawFittedText = (text: string, y: number, size = baseFontSize) => {
    if (!text) return;
    let fontSize = size;
    context.font = `${fontSize}px 'Great Vibes', 'Segoe Script', cursive`;
    while (context.measureText(text).width > maxWidth && fontSize > 44 * fontScale) {
      fontSize -= 4;
      context.font = `${fontSize}px 'Great Vibes', 'Segoe Script', cursive`;
    }
    context.fillText(text, centerX, y * scaleY);
  };

  context.save();
  context.fillStyle = names.color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(53, 35, 8, .24)";
  context.shadowBlur = 1.5 * fontScale;
  context.shadowOffsetY = 0.8 * fontScale;
  drawFittedText(firstName, names.firstY);
  if (firstName && secondName) drawFittedText("&", names.ampersandY, baseFontSize * 0.58);
  drawFittedText(secondName, names.secondY);
  context.restore();
}

function drawDoodles(context: CanvasRenderingContext2D, color: string): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 8;
  context.lineCap = "round";
  const stars = [
    [50, 58],
    [1140, 76],
    [64, 3500],
    [1132, 3440],
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
  const template = PAPER_TEMPLATES[options.frame];
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = STRIP_HEIGHT;
  const renderCanvas = template ? canvas : document.createElement("canvas");
  if (!template) {
    renderCanvas.width = SOLID_DESIGN_WIDTH;
    renderCanvas.height = SOLID_DESIGN_HEIGHT;
  }
  const context = renderCanvas.getContext("2d", { alpha: format === "image/png" });
  if (!context) throw new Error("Canvas is not supported by this browser.");

  const palette = framePalette[options.frame];
  if (template) {
    const artwork = await loadImage(template.image);
    const source = template.source;
    context.drawImage(artwork, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);
  } else {
    context.fillStyle = palette.background;
    context.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    drawVintagePaper(context, options.frame, palette.ink);
  }

  const images = await Promise.all(photos.map((photo) => loadImage(photo.url)));
  images.forEach((image, index) => {
    const slot = template ? templateSlot(template, index) : null;
    const targetWidth = slot ? Math.round(slot.width) : PHOTO_WIDTH;
    const targetHeight = slot ? Math.round(slot.height) : PHOTO_HEIGHT;
    const y = slot ? slot.y : PHOTO_TOP + index * (PHOTO_HEIGHT + PHOTO_GAP);
    const crop = calculateCoverCrop(
      image.naturalWidth,
      image.naturalHeight,
      targetWidth,
      targetHeight,
      options.photoPositions[index],
    );
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
    if (template && slot) {
      context.save();
      traceTemplateSlot(context, template, index);
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
    if (options.border !== "none" && !template) {
      roughLine(context, PHOTO_X - 5, y - 5, PHOTO_X + PHOTO_WIDTH + 4, y - 2, 4);
      roughLine(context, PHOTO_X + PHOTO_WIDTH + 4, y - 2, PHOTO_X + PHOTO_WIDTH + 6, y + PHOTO_HEIGHT + 5, 4);
      roughLine(context, PHOTO_X + PHOTO_WIDTH + 6, y + PHOTO_HEIGHT + 5, PHOTO_X - 5, y + PHOTO_HEIGHT + 3, 4);
      roughLine(context, PHOTO_X - 5, y + PHOTO_HEIGHT + 3, PHOTO_X - 5, y - 5, 4);
    }
    context.restore();
  });

  if (template) {
    await drawTemplateNames(context, template, options);
    return canvas;
  }

  drawPaperDesign(context, options.frame, palette.accent, palette.ink);

  const footerY = 3435;
  const handmadePaper = options.frame === "couple" || options.frame === "friends" || options.frame === "birthday" || options.frame === "doodle";
  context.save();
  context.fillStyle = palette.ink;
  context.textAlign = "center";
  context.globalAlpha = handmadePaper ? 0.88 : 1;
  context.font = handmadePaper ? "700 58px 'Segoe Print', cursive" : "700 56px 'Trebuchet MS', sans-serif";
  context.fillText(options.footerText || "tiny moments, kept", SOLID_DESIGN_WIDTH / 2, footerY);
  context.font = handmadePaper ? "italic 34px Georgia, serif" : "34px 'Trebuchet MS', sans-serif";
  const date = options.showDate
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date())
    : "";
  context.fillText(date, SOLID_DESIGN_WIDTH / 2, footerY + 68);
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

  const outputContext = canvas.getContext("2d", { alpha: format === "image/png" });
  if (!outputContext) throw new Error("Canvas is not supported by this browser.");
  outputContext.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function renderStoryCanvas(
  photos: PhotoItem[],
  options: StripOptions,
): Promise<HTMLCanvasElement> {
  const strip = await renderStripCanvas(photos, options);
  const template = PAPER_TEMPLATES[options.frame];
  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported by this browser.");

  const palette = framePalette[options.frame];
  context.fillStyle = palette.background;
  context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  const paper = template ? await loadImage(template.image) : strip;
  const paperSource = template?.source ?? { x: 0, y: 0, width: strip.width, height: strip.height };
  const paperCrop = calculateCoverCrop(
    paperSource.width,
    paperSource.height,
    STORY_WIDTH,
    STORY_HEIGHT,
    { x: 0, y: 0 },
  );
  context.save();
  context.globalAlpha = 0.82;
  context.filter = "blur(18px) saturate(.9)";
  context.drawImage(
    paper,
    paperSource.x + paperCrop.sx,
    paperSource.y + paperCrop.sy,
    paperCrop.sw,
    paperCrop.sh,
    -24,
    -24,
    STORY_WIDTH + 48,
    STORY_HEIGHT + 48,
  );
  context.restore();

  context.save();
  context.globalAlpha = 0.22;
  context.fillStyle = palette.background;
  context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
  context.restore();

  const maxStripWidth = 640;
  const maxStripHeight = 1740;
  const scale = Math.min(maxStripWidth / strip.width, maxStripHeight / strip.height);
  const width = Math.round(strip.width * scale);
  const height = Math.round(strip.height * scale);
  const x = Math.round((STORY_WIDTH - width) / 2);
  const y = Math.round((STORY_HEIGHT - height) / 2);
  const border = 14;

  context.save();
  context.shadowColor = "rgba(18, 20, 21, .3)";
  context.shadowBlur = 34;
  context.shadowOffsetY = 18;
  context.fillStyle = "#fffdf7";
  context.fillRect(x - border, y - border, width + border * 2, height + border * 2);
  context.restore();
  context.drawImage(strip, x, y, width, height);

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

export async function renderIndividualPhoto(
  photo: PhotoItem,
  filterId: StripOptions["filter"],
  position: StripOptions["photoPositions"][number] = { x: 0, y: 0 },
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported by this browser.");
  const image = await loadImage(photo.url);
  const crop = calculateCoverCrop(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height, position);
  context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
  if (filterId !== "original") {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    context.putImageData(applyFilterToImageData(pixels, filterId), 0, 0);
  }
  return canvasToBlob(canvas);
}
