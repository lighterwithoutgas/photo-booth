export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export function validateImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "That image is larger than 12 MB.";
  if (file.size === 0) return "That image appears to be empty.";
  return null;
}
