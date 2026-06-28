import { describe, expect, it } from "vitest";
import {
  coupleStripDimensions,
  paperStripDimensions,
  STRIP_HEIGHT,
  STRIP_WIDTH,
  stripCutPositions,
  stripDimensions,
  storyDimensions,
} from "@/lib/canvas";

describe("strip dimensions", () => {
  it("exports a high-resolution portrait strip", () => {
    expect(stripDimensions()).toEqual({ width: STRIP_WIDTH, height: STRIP_HEIGHT });
    expect(STRIP_HEIGHT / STRIP_WIDTH).toBeGreaterThan(3);
  });
  it("can report scaled display dimensions", () => expect(stripDimensions(0.5)).toEqual({ width: 600, height: 1950 }));
  it("exports Instagram Stories at 9:16", () => expect(storyDimensions()).toEqual({ width: 1080, height: 1920 }));
  it("preserves the artist paper's original aspect ratio", () => {
    expect(coupleStripDimensions()).toEqual({ width: 1200, height: 4386 });
    expect(paperStripDimensions("moonlit")).toEqual({ width: 1200, height: 3600 });
    expect(paperStripDimensions("botanical", 0.5)).toEqual({ width: 600, height: 1800 });
    expect(paperStripDimensions("birthdaycheers")).toEqual({ width: 1200, height: 3600 });
    expect(paperStripDimensions("weddingforest")).toEqual({ width: 1200, height: 3946 });
  });
  it("places cut guides between artist paper photo slots", () => {
    expect(stripCutPositions("loveletters")).toEqual([
      ((568 + 653) / 2 / 2172) * 100,
      ((1058 + 1147) / 2 / 2172) * 100,
      ((1553 + 1641) / 2 / 2172) * 100,
    ]);
  });
});
