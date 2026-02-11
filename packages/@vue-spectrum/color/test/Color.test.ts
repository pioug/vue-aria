import { describe, expect, it } from "vitest";
import { getColorChannels, parseColor } from "../src";

describe("color utilities", () => {
  it("parses supported color formats", () => {
    expect(parseColor("#abc")).toBe("#AABBCC");
    expect(parseColor("#00ff00")).toBe("#00FF00");
    expect(parseColor("rgb(255, 0, 0)")).toBe("#FF0000");
    expect(() => parseColor("bad-value")).toThrowError();
  });

  it("returns expected channel labels", () => {
    expect(getColorChannels("hex")).toEqual(["red", "green", "blue"]);
    expect(getColorChannels("rgb")).toEqual(["red", "green", "blue"]);
    expect(getColorChannels("hsl")).toEqual(["hue", "saturation", "lightness"]);
  });
});
