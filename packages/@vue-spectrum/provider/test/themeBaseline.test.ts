import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  SPECTRUM_COLOR_SCHEMES,
  SPECTRUM_SCALES,
} from "../src";

describe("theme baseline", () => {
  it("defines supported color schemes and scales", () => {
    expect(SPECTRUM_COLOR_SCHEMES).toEqual(["light", "dark"]);
    expect(SPECTRUM_SCALES).toEqual(["medium", "large"]);
  });

  it("exposes default spectrum class map keys", () => {
    expect(DEFAULT_SPECTRUM_THEME_CLASS_MAP.global).toEqual({
      spectrum: "spectrum",
    });
    expect(DEFAULT_SPECTRUM_THEME_CLASS_MAP.light).toEqual({
      "spectrum--light": "spectrum--light",
    });
    expect(DEFAULT_SPECTRUM_THEME_CLASS_MAP.dark).toEqual({
      "spectrum--dark": "spectrum--dark",
    });
    expect(DEFAULT_SPECTRUM_THEME_CLASS_MAP.medium).toEqual({
      "spectrum--medium": "spectrum--medium",
    });
    expect(DEFAULT_SPECTRUM_THEME_CLASS_MAP.large).toEqual({
      "spectrum--large": "spectrum--large",
    });
  });
});
