import type { Color, ColorSpace } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function channelToHex(channel: number): string {
  return clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0");
}

function normalizeHex(input: string): string | null {
  let trimmed = input.trim();
  if (/^[0-9a-fA-F]{3}$/.test(trimmed) || /^[0-9a-fA-F]{6}$/.test(trimmed)) {
    trimmed = `#${trimmed}`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const red = trimmed[1];
    const green = trimmed[2];
    const blue = trimmed[3];
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return null;
}

function parseRgbFunction(input: string): string | null {
  const match =
    /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i.exec(
      input.trim()
    );

  if (!match) {
    return null;
  }

  const red = Number(match[1]);
  const green = Number(match[2]);
  const blue = Number(match[3]);

  if ([red, green, blue].some((channel) => Number.isNaN(channel) || channel < 0 || channel > 255)) {
    return null;
  }

  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`.toUpperCase();
}

export function parseColor(input: string): Color {
  const fromHex = normalizeHex(input);
  if (fromHex) {
    return fromHex;
  }

  const fromRgb = parseRgbFunction(input);
  if (fromRgb) {
    return fromRgb;
  }

  throw new Error(`Invalid color value: ${input}`);
}

export function tryParseColor(input: string | null | undefined): Color | null {
  if (!input || input.trim().length === 0) {
    return null;
  }

  try {
    return parseColor(input);
  } catch {
    return null;
  }
}

export function getColorChannels(colorSpace: ColorSpace): string[] {
  if (colorSpace === "hex") {
    return ["red", "green", "blue"];
  }

  if (colorSpace === "rgb") {
    return ["red", "green", "blue"];
  }

  return ["hue", "saturation", "lightness"];
}

export function hexToRgb(color: Color): { red: number; green: number; blue: number } {
  const normalized = parseColor(color);
  return {
    red: Number.parseInt(normalized.slice(1, 3), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    blue: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex(red: number, green: number, blue: number): Color {
  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`.toUpperCase();
}

export function hexToHsl(color: Color): { hue: number; saturation: number; lightness: number } {
  const { red, green, blue } = hexToRgb(color);
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }

    hue = Math.round(hue * 60);
    if (hue < 0) {
      hue += 360;
    }
  }

  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    hue,
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100),
  };
}

export function hslToHex(hue: number, saturation: number, lightness: number): Color {
  const safeHue = ((hue % 360) + 360) % 360;
  const safeSaturation = clamp(saturation, 0, 100) / 100;
  const safeLightness = clamp(lightness, 0, 100) / 100;

  const chroma = (1 - Math.abs(2 * safeLightness - 1)) * safeSaturation;
  const secondary = chroma * (1 - Math.abs(((safeHue / 60) % 2) - 1));
  const match = safeLightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (safeHue < 60) {
    r = chroma;
    g = secondary;
  } else if (safeHue < 120) {
    r = secondary;
    g = chroma;
  } else if (safeHue < 180) {
    g = chroma;
    b = secondary;
  } else if (safeHue < 240) {
    g = secondary;
    b = chroma;
  } else if (safeHue < 300) {
    r = secondary;
    b = chroma;
  } else {
    r = chroma;
    b = secondary;
  }

  return rgbToHex((r + match) * 255, (g + match) * 255, (b + match) * 255);
}

export function toColorLabel(color: Color): string {
  return `Color ${parseColor(color)}`;
}
