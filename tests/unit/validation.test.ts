import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, validateImageFile } from "@/lib/validation";

describe("validateImageFile", () => {
  it("accepts supported images", () => expect(validateImageFile({ type: "image/webp", size: 512 })).toBeNull());
  it("rejects unsupported files", () => expect(validateImageFile({ type: "image/gif", size: 512 })).toContain("JPEG"));
  it("rejects large files", () => expect(validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES + 1 })).toContain("12 MB"));
});
