import { describe, expect, it } from "vitest";
import { classNames } from "../src";

describe("classNames", () => {
  it("joins strings, arrays, and conditional objects", () => {
    expect(classNames("one", ["two", { three: true, four: false }], null)).toBe(
      "one two three"
    );
  });

  it("returns an empty string for falsey-only input", () => {
    expect(classNames(undefined, false, null, "")).toBe("");
  });
});
