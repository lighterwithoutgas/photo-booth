export function stripFilename(extension: "png" | "jpg" = "png", date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `sketchsnap-photo-strip-${stamp}.${extension}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
