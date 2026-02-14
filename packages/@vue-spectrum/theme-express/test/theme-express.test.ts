import { describe, expect, it } from "vitest";
import * as themeModule from "../src";
import { theme } from "../src";

describe("@vue-spectrum/theme-express", () => {
  it("exports only the upstream-aligned theme symbol", () => {
    expect(Object.keys(themeModule)).toEqual(["theme"]);
  });

  it("extends the default theme with express classes", () => {
    expect(Object.keys(theme)).toEqual(["global", "light", "dark", "medium", "large"]);
    expect(Object.keys(theme.global ?? {})).toEqual(["spectrum", "express"]);
    expect(Object.keys(theme.light ?? {})).toEqual(["spectrum--light"]);
    expect(Object.keys(theme.dark ?? {})).toEqual(["spectrum--dark"]);
    expect(Object.keys(theme.medium ?? {})).toEqual(["spectrum--medium", "express"]);
    expect(Object.keys(theme.large ?? {})).toEqual(["spectrum--large", "express"]);
    expect(theme.global?.spectrum).toBe("spectrum");
    expect(theme.global?.express).toBe("express");
    expect(theme.medium?.express).toBe("medium");
    expect(theme.large?.express).toBe("large");
    expect(theme.light?.["spectrum--light"]).toBe("spectrum--light");
  });
});
