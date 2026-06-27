import { describe, expect, it } from "vitest";
import { FILTERS, getFilter, transformPixel } from "@/lib/filters";

describe("filter configuration", () => {
  it("provides five distinct export filters", () => {
    expect(FILTERS).toHaveLength(5);
    expect(new Set(FILTERS.map((filter) => filter.id)).size).toBe(5);
  });

  it("maps monochrome to a Canvas filter", () => {
    expect(getFilter("mono").canvas).toContain("grayscale");
  });

  it("applies filters without relying on CanvasRenderingContext2D.filter", () => {
    expect(transformPixel("original", 200, 80, 30)).toEqual([200, 80, 30]);
    const monochrome = transformPixel("mono", 200, 80, 30);
    expect(monochrome[0]).toBe(monochrome[1]);
    expect(monochrome[1]).toBe(monochrome[2]);
    expect(transformPixel("warm", 100, 100, 100)).not.toEqual([100, 100, 100]);
  });
});
