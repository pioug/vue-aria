import { describe, expect, it } from "vitest";
import { baseColor, focusRing, keyframes, lightDark, raw, style } from "../src";

describe("s2", () => {
  it("supports style helper utilities", () => {
    expect(style("token", "color: red;")).toBe("token { color: red; }");
    expect(baseColor("#fff")).toBe("#fff");
    expect(lightDark("light", "dark")).toEqual({ light: "light", dark: "dark" });
    expect(focusRing(true)).toEqual({ outline: "2px solid currentColor" });
    expect(raw`a-${1}`.startsWith("a-1")).toBe(true);
    expect(keyframes("fade", {})).toContain("fade");
  });
});
