import { describe, expect, it } from "vitest";
import { getColorChannels, parseColor } from "../src";

describe("Vue Spectrum Color", () => {
  it("parses short and long hex color values", () => {
    const short = parseColor("#f0a");
    const long = parseColor("#ff00aa");
    const withAlpha = parseColor("#0f0f");

    expect(short.toString()).toBe("#ff00aa");
    expect(long.toString()).toBe("#ff00aa");
    expect(withAlpha.toHexInt()).toBe(0x00ff00);
    expect(withAlpha.toString()).toBe("#00ff00ff");
  });

  it("parses function syntax with alpha", () => {
    const color = parseColor("rgba(10, 20, 30, 0.5)");
    expect(color.toString("rgba")).toBe("rgb(10, 20, 30, 0.50)");
    expect(color.getChannelValue("alpha")).toBe(0.5);
  });

  it("supports transparent keyword", () => {
    const color = parseColor("transparent");
    expect(color.toString()).toBe("#00000000");
  });

  it("reports color channels by color space", () => {
    expect(getColorChannels("rgb")).toEqual(["red", "green", "blue"]);
    expect(getColorChannels("hsl")).toEqual(["hue", "saturation", "lightness"]);
    expect(getColorChannels("hsb")).toEqual(["hue", "saturation", "brightness"]);
  });

  it("throws for invalid input", () => {
    expect(() => parseColor("not-a-color")).toThrowError("Invalid color value: not-a-color");
  });
});
