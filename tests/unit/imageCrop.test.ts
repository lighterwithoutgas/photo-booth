import { describe, expect, it } from "vitest";
import { calculateContainPlacement, calculateCoverCrop } from "@/lib/imageCrop";

describe("calculateCoverCrop", () => {
  it("crops wide images from both sides", () => {
    expect(calculateCoverCrop(1600, 900, 400, 300)).toEqual({ sx: 200, sy: 0, sw: 1200, sh: 900 });
  });

  it("crops tall images from top and bottom", () => {
    expect(calculateCoverCrop(900, 1600, 400, 300)).toEqual({ sx: 0, sy: 462.5, sw: 900, sh: 675 });
  });

  it("moves wide crops horizontally", () => {
    expect(calculateCoverCrop(1600, 900, 400, 300, { x: -1, y: 0 }).sx).toBe(0);
    expect(calculateCoverCrop(1600, 900, 400, 300, { x: 1, y: 0 }).sx).toBe(400);
  });

  it("moves tall crops vertically", () => {
    expect(calculateCoverCrop(900, 1600, 400, 300, { x: 0, y: -1 }).sy).toBe(0);
    expect(calculateCoverCrop(900, 1600, 400, 300, { x: 0, y: 1 }).sy).toBe(925);
  });

  it("rejects invalid dimensions", () => {
    expect(() => calculateCoverCrop(0, 100, 20, 20)).toThrow();
  });
});

describe("calculateContainPlacement", () => {
  it("fits wide images inside the target without cropping", () => {
    expect(calculateContainPlacement(1600, 900, 400, 300)).toEqual({ dx: 0, dy: 37.5, dw: 400, dh: 225 });
  });

  it("fits tall images inside the target without cropping", () => {
    expect(calculateContainPlacement(900, 1600, 400, 300)).toEqual({ dx: 115.625, dy: 0, dw: 168.75, dh: 300 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => calculateContainPlacement(100, 0, 20, 20)).toThrow();
  });
});
