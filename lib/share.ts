import { brand } from "@/config/brand";
import { stripFilename } from "@/lib/download";

export type ShareResult = "shared" | "copied";

export async function shareStrip(blob: Blob): Promise<ShareResult> {
  const file = new File([blob], stripFilename(), { type: "image/png" });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ title: brand.name, text: brand.shareMessage, files: [file] });
    return "shared";
  }
  await navigator.clipboard.writeText(brand.shareMessage);
  return "copied";
}
