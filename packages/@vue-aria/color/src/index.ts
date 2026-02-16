import { useColorArea, useColorField, useColorSwatch, useColorSlider, useColorWheel, useColorChannelField } from "@vue-stately/color";
export type {
  AriaColorAreaOptions,
  ColorValueLike,
} from "@vue-stately/color";
export type {
  AriaColorChannelFieldProps,
  AriaColorFieldProps,
  AriaColorSliderOptions,
  AriaColorSwatchProps,
  AriaColorWheelOptions,
  ColorAreaAria,
  ColorChannelFieldAria,
  ColorFieldAria,
  ColorSliderAria,
  ColorSwatchAria,
  ColorWheelAria,
} from "@vue-stately/color";

export {
  useColorArea,
  useColorField,
  useColorSwatch,
  useColorSlider,
  useColorWheel,
  useColorChannelField,
};

export type ColorFormat = "css" | "hex" | "rgb" | "rgba" | "hsl" | string;
export type ColorSpace = "rgb" | "hsl" | "hsb";
export type ColorChannel = "hue" | "saturation" | "lightness" | "red" | "green" | "blue" | "alpha";

export interface Color {
  format?: ColorFormat;
  space: ColorSpace;
  alpha: number;
  blue: number;
  red: number;
  green: number;
  toHexInt: () => number;
  toString: (format?: ColorFormat) => string;
  getColorChannels: () => [ColorChannel, ColorChannel, ColorChannel];
  getColorName: (locale: string) => string;
  getHueName: (locale: string) => string;
  getChannelName: (channel: ColorChannel, locale: string) => string;
  getChannelValue: (channel: ColorChannel) => number;
  getChannelRange: (channel: ColorChannel) => { minValue: number; maxValue: number; step?: number };
  formatChannelValue: (channel: ColorChannel, locale: string) => string;
  withChannelValue: (channel: ColorChannel, value: number) => Color;
}

const CHANNEL_NAMES: Record<ColorChannel, string> = {
  hue: "Hue",
  saturation: "Saturation",
  lightness: "Lightness",
  red: "Red",
  green: "Green",
  blue: "Blue",
  alpha: "Alpha",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampChannel(channel: ColorChannel, value: number) {
  if (channel === "alpha") {
    return clamp(value, 0, 1);
  }
  if (channel === "hue") {
    return ((value % 360) + 360) % 360;
  }
  if (channel === "lightness" || channel === "saturation") {
    return clamp(value, 0, 100);
  }
  return clamp(Math.round(value), 0, 255);
}

function formatChannel(channel: ColorChannel, value: number) {
  if (channel === "alpha") {
    return value.toFixed(2);
  }
  return String(Math.round(value));
}

class RGBColorValue implements Color {
  constructor(
    public red: number,
    public green: number,
    public blue: number,
    public alpha: number = 1,
    public space: ColorSpace = "rgb",
    public format: ColorFormat = "css"
  ) {
  }

  toHexInt() {
    return (Math.round(this.red) << 16) + (Math.round(this.green) << 8) + Math.round(this.blue);
  }

  toString(format: ColorFormat = this.format) {
    if (format === "rgb" || format === "rgba") {
      const alpha = format === "rgba" && this.alpha !== 1 ? `, ${this.alpha.toFixed(2)}` : "";
      return `rgb(${Math.round(this.red)}, ${Math.round(this.green)}, ${Math.round(this.blue)}${alpha})`;
    }

    if (format === "hex") {
      return this.toHexString();
    }

    return this.toHexString();
  }

  private toHexString() {
    const hex = [
      Math.round(this.red).toString(16).padStart(2, "0"),
      Math.round(this.green).toString(16).padStart(2, "0"),
      Math.round(this.blue).toString(16).padStart(2, "0"),
    ].join("");
    if (this.alpha === 1) {
      return `#${hex}`;
    }

    return `#${hex}${Math.round(clamp(this.alpha, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }

  getColorName(_locale: string): string {
    return this.toString("css");
  }

  getHueName(_locale: string): string {
    return `hue ${Math.round(this.toHslHue())}`;
  }

  getChannelName(channel: ColorChannel, _locale: string) {
    return CHANNEL_NAMES[channel];
  }

  getColorChannels() {
    return ["red", "green", "blue"] as [ColorChannel, ColorChannel, ColorChannel];
  }

  getChannelValue(channel: ColorChannel) {
    if (channel === "red") {
      return this.red;
    }
    if (channel === "green") {
      return this.green;
    }
    if (channel === "blue") {
      return this.blue;
    }
    if (channel === "alpha") {
      return this.alpha;
    }
    if (channel === "hue") {
      return this.toHslHue();
    }
    if (channel === "saturation") {
      return this.toHslSaturation();
    }
    return this.toHslLightness();
  }

  getChannelRange(channel: ColorChannel) {
    if (channel === "alpha") {
      return { minValue: 0, maxValue: 1, step: 0.01 };
    }
    if (channel === "hue") {
      return { minValue: 0, maxValue: 360, step: 1 };
    }
    if (channel === "lightness" || channel === "saturation") {
      return { minValue: 0, maxValue: 100, step: 1 };
    }
    return { minValue: 0, maxValue: 255, step: 1 };
  }

  formatChannelValue(channel: ColorChannel, _locale: string) {
    return formatChannel(channel, this.getChannelValue(channel));
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    const next = { red: this.red, green: this.green, blue: this.blue, alpha: this.alpha };
    switch (channel) {
      case "red":
        next.red = clampChannel(channel, value);
        break;
      case "green":
        next.green = clampChannel(channel, value);
        break;
      case "blue":
        next.blue = clampChannel(channel, value);
        break;
      case "alpha":
        next.alpha = clampChannel(channel, value);
        break;
      default:
        break;
    }
    return new RGBColorValue(next.red, next.green, next.blue, next.alpha, this.space, this.format);
  }

  private toHslHue() {
    const r = this.red / 255;
    const g = this.green / 255;
    const b = this.blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta === 0) {
      return 0;
    }
    let hue = 0;
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
    return clampChannel("hue", Math.round(hue * 60));
  }

  private toHslLightness() {
    const r = this.red / 255;
    const g = this.green / 255;
    const b = this.blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max + min) / 2 * 100;
  }

  private toHslSaturation() {
    const r = this.red / 255;
    const g = this.green / 255;
    const b = this.blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) {
      return 0;
    }
    const l = (max + min) / 2;
    if (l > 0.5) {
      return (max - min) / (2 - max - min) * 100;
    }
    return (max - min) / (max + min) * 100;
  }
}

function parseRgbValue(value: string): RGBColorValue {
  const hex = value.trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hex)) {
    const normalized = hex.length === 4 || hex.length === 5
      ? hex.replace(/^#([\da-f])([\da-f])([\da-f])([\da-f]?)/, (__, r, g, b, a) =>
        `#${r}${r}${g}${g}${b}${b}${a ? `${a}${a}` : ""}`
      )
      : hex;
    const withAlpha = normalized.length === 9 ? normalized : `${normalized}ff`;
    const red = Number.parseInt(withAlpha.slice(1, 3), 16);
    const green = Number.parseInt(withAlpha.slice(3, 5), 16);
    const blue = Number.parseInt(withAlpha.slice(5, 7), 16);
    const alpha = Number.parseInt(withAlpha.slice(7, 9), 16) / 255;
    return new RGBColorValue(red, green, blue, alpha);
  }

  const normalized = /^rgba?\(([^)]+)\)$/.exec(hex)?.[1];
  if (!normalized) {
    throw new Error(`Invalid color value: ${value}`);
  }
  const parts = normalized.split(",").map((part) => part.trim());
  if (parts.length < 3 || parts.length > 4) {
    throw new Error(`Invalid color value: ${value}`);
  }
  const red = Number.parseInt(parts[0], 10);
  const green = Number.parseInt(parts[1], 10);
  const blue = Number.parseInt(parts[2], 10);
  const alpha = parts[3] != null ? Number.parseFloat(parts[3]) : 1;
  if ([red, green, blue, alpha].some(Number.isNaN)) {
    throw new Error(`Invalid color value: ${value}`);
  }
  return new RGBColorValue(red, green, blue, alpha);
}

export function parseColor(value: string): Color {
  if (value.toLowerCase() === "transparent") {
    return new RGBColorValue(0, 0, 0, 0);
  }

  return parseRgbValue(value);
}

export function getColorChannels(colorSpace: ColorSpace): [ColorChannel, ColorChannel, ColorChannel] {
  if (colorSpace === "rgb") {
    return ["red", "green", "blue"] as [ColorChannel, ColorChannel, ColorChannel];
  }
  if (colorSpace === "hsl") {
    return ["hue", "saturation", "lightness"] as [ColorChannel, ColorChannel, ColorChannel];
  }
  return ["hue", "saturation", "brightness"] as [ColorChannel, ColorChannel, ColorChannel];
}
