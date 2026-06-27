import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/workflow";

describe("workflow transitions", () => {
  it("allows the expected upload path", () => {
    expect(canTransition("method", "upload")).toBe(true);
    expect(canTransition("upload", "customize")).toBe(true);
  });

  it("blocks invalid shortcuts", () => {
    expect(canTransition("landing", "result")).toBe(false);
  });
});
