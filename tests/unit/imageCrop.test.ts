import { describe, expect, it } from "vitest";
import { calculateCoverCrop } from "@/lib/imageCrop";

describe("calculateCoverCrop", () => {
  it("crops wide images from both sides", () => {
    expect(calculateCoverCrop(1600, 900, 400, 300)).toEqual({ sx: 200, sy: 0, sw: 1200, sh: 900 });
  });

  it("crops tall images from top and bottom", () => {
    expect(calculateCoverCrop(900, 1600, 400, 300)).toEqual({ sx: 0, sy: 462.5, sw: 900, sh: 675 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => calculateCoverCrop(0, 100, 20, 20)).toThrow();
  });
});
