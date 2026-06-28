export interface CoverCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface CropPosition {
  x: number;
  y: number;
}

export function calculateCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  position: CropPosition = { x: 0, y: 0 },
): CoverCrop {
  if ([sourceWidth, sourceHeight, targetWidth, targetHeight].some((value) => value <= 0)) {
    throw new Error("Image and target dimensions must be positive.");
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  const positionX = Math.max(-1, Math.min(1, position.x));
  const positionY = Math.max(-1, Math.min(1, position.y));

  if (sourceRatio > targetRatio) {
    const sw = sourceHeight * targetRatio;
    return { sx: ((sourceWidth - sw) * (positionX + 1)) / 2, sy: 0, sw, sh: sourceHeight };
  }

  const sh = sourceWidth / targetRatio;
  return { sx: 0, sy: ((sourceHeight - sh) * (positionY + 1)) / 2, sw: sourceWidth, sh };
}
