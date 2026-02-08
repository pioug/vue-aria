import { describe, expect, it } from "vitest";
import { isSetEqual } from "../src/utils";

describe("isSetEqual", () => {
  it("returns true for equal sets", () => {
    expect(isSetEqual(new Set(["a", "b"]), new Set(["b", "a"]))).toBe(true);
  });

  it("returns false for non-equal sets", () => {
    expect(isSetEqual(new Set(["a"]), new Set(["a", "b"]))).toBe(false);
    expect(isSetEqual(new Set(["a", "c"]), new Set(["a", "b"]))).toBe(false);
  });
});
