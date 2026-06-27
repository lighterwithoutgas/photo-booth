import { describe, expect, it } from "vitest";
import { NEXT_POSE_DELAY_MS } from "@/lib/camera";

describe("camera timing", () => {
  it("leaves one full second to change pose between photos", () => {
    expect(NEXT_POSE_DELAY_MS).toBe(1_000);
  });
});
