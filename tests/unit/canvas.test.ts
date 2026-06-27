import { describe, expect, it } from "vitest";
import { coupleStripDimensions, STRIP_HEIGHT, STRIP_WIDTH, stripDimensions } from "@/lib/canvas";

describe("strip dimensions", () => {
  it("exports a high-resolution portrait strip", () => {
    expect(stripDimensions()).toEqual({ width: STRIP_WIDTH, height: STRIP_HEIGHT });
    expect(STRIP_HEIGHT / STRIP_WIDTH).toBeGreaterThan(3);
  });
  it("can report scaled display dimensions", () => expect(stripDimensions(0.5)).toEqual({ width: 600, height: 1950 }));
  it("preserves the artist paper's original aspect ratio", () => {
    expect(coupleStripDimensions()).toEqual({ width: 1200, height: 4386 });
  });
});
