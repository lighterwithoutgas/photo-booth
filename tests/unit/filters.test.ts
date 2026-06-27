import { describe, expect, it } from "vitest";
import { FILTERS, getFilter } from "@/lib/filters";

describe("filter configuration", () => {
  it("provides five distinct export filters", () => {
    expect(FILTERS).toHaveLength(5);
    expect(new Set(FILTERS.map((filter) => filter.id)).size).toBe(5);
  });

  it("maps monochrome to a Canvas filter", () => {
    expect(getFilter("mono").canvas).toContain("grayscale");
  });
});
