import { describe, expect, it } from "vitest";
import { individualPhotosFilename, stripFilename } from "@/lib/download";

describe("stripFilename", () => {
  it("uses a clean dated PNG filename", () => {
    expect(stripFilename("png", new Date("2026-06-27T08:00:00Z"))).toBe("sketchsnap-photo-strip-2026-06-27.png");
  });
  it("uses a clean dated ZIP filename for individual photos", () => {
    expect(individualPhotosFilename(new Date("2026-06-27T08:00:00Z"))).toBe("sketchsnap-4-photos-2026-06-27.zip");
  });
});
