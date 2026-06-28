import { describe, expect, it } from "vitest";
import { individualPhotosFilename, storyFilename, stripFilename } from "@/lib/download";

describe("stripFilename", () => {
  it("uses a clean dated PNG filename", () => {
    expect(stripFilename("png", new Date("2026-06-27T08:00:00Z"))).toBe("sketchsnap-photo-strip-2026-06-27.png");
  });
  it("uses a clean dated ZIP filename for individual photos", () => {
    expect(individualPhotosFilename(new Date("2026-06-27T08:00:00Z"))).toBe("sketchsnap-4-photos-2026-06-27.zip");
  });
  it("uses a clean dated Instagram Story filename", () => {
    expect(storyFilename(new Date("2026-06-27T08:00:00Z"))).toBe("sketchsnap-instagram-story-2026-06-27.png");
  });
});
