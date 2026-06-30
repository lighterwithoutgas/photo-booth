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
    expect(stripDimensions()).toEqual({ width: 724, height: 2172 });
    expect(STRIP_HEIGHT / STRIP_WIDTH).toBe(3);
  });
  it("can report scaled display dimensions", () => expect(stripDimensions(0.5)).toEqual({ width: 362, height: 1086 }));
  it("exports Instagram Stories at 9:16", () => expect(storyDimensions()).toEqual({ width: 1080, height: 1920 }));
  it("normalizes every paper to the same output size", () => {
    expect(coupleStripDimensions()).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("cream")).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("moonlit")).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("botanical", 0.5)).toEqual({ width: 362, height: 1086 });
    expect(paperStripDimensions("birthdaycheers")).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("weddingforest")).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("graduation")).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("tatreez")).toEqual({ width: 724, height: 2172 });
    expect(paperStripDimensions("kuffiah")).toEqual({ width: 724, height: 2172 });
  });
  it("places cut guides between artist paper photo slots", () => {
    expect(stripCutPositions("loveletters")).toEqual([
      ((568 + 653) / 2 / 2172) * 100,
      ((1058 + 1147) / 2 / 2172) * 100,
      ((1553 + 1641) / 2 / 2172) * 100,
    ]);
  });
});
