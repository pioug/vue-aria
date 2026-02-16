import { describe, expect, it } from "vitest";
import { baseColor, focusRing, keyframes, lightDark, raw, style } from "../src";

describe("style-macro-s1", () => {
  it("re-exports style helpers", () => {
    expect(style("token", "padding: 0;")).toBe("token { padding: 0; }");
    expect(baseColor("value")).toBe("value");
    expect(lightDark("light", "dark")).toEqual({ light: "light", dark: "dark" });
    expect(focusRing(false)).toEqual({});
    expect(raw`x-${2}`).toBe("x-2");
    expect(keyframes("slide", {})).toContain("slide");
  });
});
