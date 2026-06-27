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
    context.drawImage(photoCanvas, PHOTO_X, y);

    context.save();
    context.strokeStyle = options.border === "soft" ? `${palette.ink}66` : palette.ink;
    context.lineWidth = options.border === "soft" || options.frame === "white" ? 5 : 10;
    context.lineJoin = "round";
    if (options.border !== "none") {
      roughLine(context, PHOTO_X - 5, y - 5, PHOTO_X + PHOTO_WIDTH + 4, y - 2, 4);
      roughLine(context, PHOTO_X + PHOTO_WIDTH + 4, y - 2, PHOTO_X + PHOTO_WIDTH + 6, y + PHOTO_HEIGHT + 5, 4);
      roughLine(context, PHOTO_X + PHOTO_WIDTH + 6, y + PHOTO_HEIGHT + 5, PHOTO_X - 5, y + PHOTO_HEIGHT + 3, 4);
      roughLine(context, PHOTO_X - 5, y + PHOTO_HEIGHT + 3, PHOTO_X - 5, y - 5, 4);
    }
    context.restore();
  });

  if (options.frame === "doodle") drawDoodles(context, palette.accent);

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
