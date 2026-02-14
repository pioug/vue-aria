import { describe, expect, it } from "vitest";
import { theme } from "../src";

describe("@vue-spectrum/theme-dark", () => {
  it("exports a dark-leaning provider theme variant", () => {
    expect(theme.light?.["spectrum--light"]).toBe("spectrum--dark");
    expect(theme.dark?.["spectrum--dark"]).toBe("spectrum--darkest");
    expect(theme.global?.spectrum).toBe("spectrum");
  });
});
