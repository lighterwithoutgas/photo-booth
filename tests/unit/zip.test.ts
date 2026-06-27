import { describe, expect, it } from "vitest";
import { createZip } from "@/lib/zip";

describe("createZip", () => {
  it("stores every photo in a valid ZIP container", async () => {
    const files = [
      new File([new Uint8Array([1, 2, 3])], "photo-1.png", { type: "image/png", lastModified: 1_782_537_600_000 }),
      new File([new Uint8Array([4, 5, 6])], "photo-2.png", { type: "image/png", lastModified: 1_782_537_600_000 }),
    ];
    const zip = await createZip(files);
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => reader.result instanceof ArrayBuffer
        ? resolve(new Uint8Array(reader.result))
        : reject(new Error("Expected an ArrayBuffer"));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(zip);
    });
    const text = new TextDecoder().decode(bytes);

    expect(zip.type).toBe("application/zip");
    expect(new DataView(bytes.buffer).getUint32(0, true)).toBe(0x04034b50);
    expect(text).toContain("photo-1.png");
    expect(text).toContain("photo-2.png");
    expect(new DataView(bytes.buffer).getUint32(bytes.length - 22, true)).toBe(0x06054b50);
  });
});
