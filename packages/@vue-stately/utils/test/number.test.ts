import { describe, expect, it } from "vitest";
import { clamp, roundToStepPrecision, snapValueToStep } from "../src/number";

describe("number utils", () => {
  it("clamps values", () => {
    expect(clamp(5, -1, 1)).toBe(1);
    expect(clamp(-5, -1, 1)).toBe(-1);
  });

  it("rounds to step precision", () => {
    expect(roundToStepPrecision(0.123456789, 1e-7)).toBe(0.12345679);
  });

  it("snaps values to step", () => {
    expect(snapValueToStep(2, -0.5, 100, 3)).toBe(2.5);
  });
});
