import { describe, expect, it } from "vitest";
import * as themeModule from "../src";
import { theme } from "../src";

describe("@vue-spectrum/theme-dark", () => {
  it("exports only the upstream-aligned theme symbol", () => {
    expect(Object.keys(themeModule)).toEqual(["theme"]);
  });

  it("exports a dark-leaning provider theme variant", () => {
    expect(Object.keys(theme)).toEqual(["global", "light", "dark", "medium", "large"]);
    expect(Object.keys(theme.global ?? {})).toEqual(["spectrum"]);
    expect(Object.keys(theme.light ?? {})).toEqual(["spectrum--light"]);
    expect(Object.keys(theme.dark ?? {})).toEqual(["spectrum--dark"]);
    expect(Object.keys(theme.medium ?? {})).toEqual(["spectrum--medium"]);
    expect(Object.keys(theme.large ?? {})).toEqual(["spectrum--large"]);
    expect(theme.light?.["spectrum--light"]).toBe("spectrum--dark");
    expect(theme.dark?.["spectrum--dark"]).toBe("spectrum--darkest");
    expect(theme.global?.spectrum).toBe("spectrum");
  });
});
